import type { Prisma } from "@prisma/client";

import prisma from "../../../../packages/libs/prisma";
import {
  analyticsEventSchema,
  createAnalyticsEvent,
  disconnectAnalyticsProducer,
  getAnalyticsTopic,
  publishAnalyticsEvent,
  type AnalyticsEvent,
} from "../../../../packages/utils/kafka";
import { createLogger } from "../../../../packages/utils/runtime";

const logger = createLogger("order-analytics-outbox");

const OUTBOX_STATUS_PENDING = "PENDING";
const OUTBOX_STATUS_RETRY = "RETRY";
const OUTBOX_STATUS_PROCESSING = "PROCESSING";
const OUTBOX_STATUS_PUBLISHED = "PUBLISHED";
const OUTBOX_STATUS_FAILED = "FAILED";

type AnalyticsOutboxRecord = {
  id: string;
  eventId: string;
  topic: string;
  payload: unknown;
  status: string;
  attempts: number;
  availableAt: Date;
  lockedAt: Date | null;
};

type AnalyticsOutboxRepository = {
  analyticsOutbox: {
    create(args: any): Promise<unknown>;
    findMany(args: any): Promise<AnalyticsOutboxRecord[]>;
    update(args: any): Promise<unknown>;
    updateMany(args: any): Promise<{ count: number }>;
  };
};

type PurchaseAnalyticsItem = {
  productId: string;
  shopId: string;
  quantity: number;
};

type AnalyticsOutboxConfig = {
  enabled: boolean;
  batchSize: number;
  pollIntervalMs: number;
  maxAttempts: number;
  lockTimeoutMs: number;
};

let outboxInterval: NodeJS.Timeout | null = null;
let activeDrain: Promise<void> | null = null;

function getEnvNumber(name: string, fallback: number, min = 1): number {
  const value = Number(process.env[name]);

  if (!Number.isFinite(value) || value < min) {
    return fallback;
  }

  return Math.floor(value);
}

function getAnalyticsOutboxConfig(): AnalyticsOutboxConfig {
  return {
    enabled: (process.env.ORDER_ANALYTICS_OUTBOX_ENABLED ?? "true").toLowerCase() !== "false",
    batchSize: getEnvNumber("ORDER_ANALYTICS_OUTBOX_BATCH_SIZE", 25),
    pollIntervalMs: getEnvNumber("ORDER_ANALYTICS_OUTBOX_INTERVAL_MS", 5_000),
    maxAttempts: getEnvNumber("ORDER_ANALYTICS_OUTBOX_MAX_ATTEMPTS", 8),
    lockTimeoutMs: getEnvNumber("ORDER_ANALYTICS_OUTBOX_LOCK_TIMEOUT_MS", 60_000),
  };
}

function shouldSkipAutoDrain(): boolean {
  return process.env.NODE_ENV === "test";
}

function getRetryDelayMs(attemptNumber: number): number {
  return Math.min(300_000, 1_000 * 2 ** Math.max(0, attemptNumber - 1));
}

function isPermanentPublishError(error: unknown): boolean {
  return error instanceof Error && error.name === "ZodError";
}

async function releaseStaleOutboxLocks(
  repository: AnalyticsOutboxRepository,
  config: AnalyticsOutboxConfig,
): Promise<void> {
  const staleBefore = new Date(Date.now() - config.lockTimeoutMs);

  const result = await repository.analyticsOutbox.updateMany({
    where: {
      status: OUTBOX_STATUS_PROCESSING,
      lockedAt: {
        lt: staleBefore,
      },
    },
    data: {
      status: OUTBOX_STATUS_RETRY,
      availableAt: new Date(),
      lockedAt: null,
      lastError: "Processing lock expired before publish completed",
    },
  });

  if (result.count > 0) {
    logger.warn("Released stale analytics outbox locks", {
      count: result.count,
    });
  }
}

async function claimOutboxRecord(
  repository: AnalyticsOutboxRepository,
  record: AnalyticsOutboxRecord,
  now: Date,
): Promise<boolean> {
  const result = await repository.analyticsOutbox.updateMany({
    where: {
      id: record.id,
      status: record.status,
      availableAt: {
        lte: now,
      },
    },
    data: {
      status: OUTBOX_STATUS_PROCESSING,
      lockedAt: now,
      lastAttemptAt: now,
      attempts: {
        increment: 1,
      },
    },
  });

  return result.count === 1;
}

async function markOutboxPublished(
  repository: AnalyticsOutboxRepository,
  recordId: string,
): Promise<void> {
  await repository.analyticsOutbox.update({
    where: {
      id: recordId,
    },
    data: {
      status: OUTBOX_STATUS_PUBLISHED,
      publishedAt: new Date(),
      lockedAt: null,
      lastError: null,
    },
  });
}

async function markOutboxRetry(
  repository: AnalyticsOutboxRepository,
  record: AnalyticsOutboxRecord,
  attempts: number,
  error: unknown,
  config: AnalyticsOutboxConfig,
): Promise<void> {
  const isPermanent = isPermanentPublishError(error);
  const shouldFailPermanently = isPermanent || attempts >= config.maxAttempts;

  await repository.analyticsOutbox.update({
    where: {
      id: record.id,
    },
    data: {
      status: shouldFailPermanently ? OUTBOX_STATUS_FAILED : OUTBOX_STATUS_RETRY,
      availableAt: shouldFailPermanently
        ? record.availableAt
        : new Date(Date.now() + getRetryDelayMs(attempts)),
      lockedAt: null,
      lastError: error instanceof Error ? error.message : String(error),
    },
  });

  logger.warn("Analytics outbox publish attempt failed", {
    eventId: record.eventId,
    attempts,
    status: shouldFailPermanently ? OUTBOX_STATUS_FAILED : OUTBOX_STATUS_RETRY,
    error,
  });
}

async function processOutboxRecord(
  repository: AnalyticsOutboxRepository,
  record: AnalyticsOutboxRecord,
  config: AnalyticsOutboxConfig,
): Promise<void> {
  const now = new Date();
  const claimed = await claimOutboxRecord(repository, record, now);

  if (!claimed) {
    return;
  }

  const attemptNumber = record.attempts + 1;
  const parsedPayload = analyticsEventSchema.safeParse(record.payload);

  if (!parsedPayload.success) {
    await markOutboxRetry(
      repository,
      record,
      attemptNumber,
      parsedPayload.error,
      config,
    );
    return;
  }

  try {
    await publishAnalyticsEvent(parsedPayload.data);
    await markOutboxPublished(repository, record.id);
  } catch (error) {
    await markOutboxRetry(repository, record, attemptNumber, error, config);
  }
}

async function drainAnalyticsOutbox(
  reason: string,
  repository: AnalyticsOutboxRepository = prisma,
): Promise<void> {
  const config = getAnalyticsOutboxConfig();

  if (!config.enabled) {
    return;
  }

  await releaseStaleOutboxLocks(repository, config);

  const pendingRecords = await repository.analyticsOutbox.findMany({
    where: {
      status: {
        in: [OUTBOX_STATUS_PENDING, OUTBOX_STATUS_RETRY],
      },
      availableAt: {
        lte: new Date(),
      },
    },
    orderBy: [
      {
        availableAt: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
    take: config.batchSize,
  });

  if (pendingRecords.length === 0) {
    return;
  }

  logger.info("Draining analytics outbox batch", {
    reason,
    count: pendingRecords.length,
  });

  for (const record of pendingRecords) {
    await processOutboxRecord(repository, record, config);
  }
}

export async function enqueuePurchaseAnalyticsEvents(
  input: {
    userId: string;
    items: PurchaseAnalyticsItem[];
    source?: string;
  },
  repository: AnalyticsOutboxRepository = prisma,
): Promise<AnalyticsEvent[]> {
  const events = input.items.map((item) =>
    createAnalyticsEvent({
      action: "purchase",
      userId: input.userId,
      productId: item.productId,
      shopId: item.shopId,
      quantity: item.quantity,
      source: input.source ?? "order-service.payment-webhook",
    }),
  );

  if (events.length === 0) {
    return [];
  }

  for (const event of events) {
    await repository.analyticsOutbox.create({
      data: {
        eventId: event.eventId,
        topic: getAnalyticsTopic(),
        payload: event as Prisma.InputJsonValue,
        status: OUTBOX_STATUS_PENDING,
        availableAt: new Date(event.timestamp),
      },
    });
  }

  return events;
}

export function scheduleAnalyticsOutboxDrain(reason = "manual"): Promise<void> {
  const config = getAnalyticsOutboxConfig();

  if (!config.enabled || shouldSkipAutoDrain()) {
    return Promise.resolve();
  }

  if (activeDrain) {
    return activeDrain;
  }

  activeDrain = drainAnalyticsOutbox(reason).finally(() => {
    activeDrain = null;
  });

  return activeDrain;
}

export async function startAnalyticsOutboxPublisher(): Promise<void> {
  const config = getAnalyticsOutboxConfig();

  if (!config.enabled || outboxInterval) {
    return;
  }

  logger.info("Starting analytics outbox publisher", {
    batchSize: config.batchSize,
    pollIntervalMs: config.pollIntervalMs,
    maxAttempts: config.maxAttempts,
  });

  if (!shouldSkipAutoDrain()) {
    outboxInterval = setInterval(() => {
      void scheduleAnalyticsOutboxDrain("interval");
    }, config.pollIntervalMs);
    outboxInterval.unref?.();
    void scheduleAnalyticsOutboxDrain("startup");
  }
}

export async function stopAnalyticsOutboxPublisher(): Promise<void> {
  if (outboxInterval) {
    clearInterval(outboxInterval);
    outboxInterval = null;
  }

  if (activeDrain) {
    await activeDrain.catch((error) => {
      logger.warn("Analytics outbox drain ended with an error during shutdown", {
        error,
      });
    });
  }

  await disconnectAnalyticsProducer();
}
