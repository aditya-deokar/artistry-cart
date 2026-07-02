import { randomUUID } from "node:crypto";

import type { Producer, ProducerRecord } from "kafkajs";

import { createLogger } from "../runtime";
import { analyticsEventSchema, type AnalyticsEvent } from "./analytics-contract";
import { kafka } from "./client";

const logger = createLogger("kafka-producer");

// ---------------------------------------------------------------------------
// Producer with idempotent writes enabled
// ---------------------------------------------------------------------------

const analyticsProducer = kafka.producer({
  idempotent: true,
  maxInFlightRequests: 5,
  allowAutoTopicCreation: false,
});

let producerConnectPromise: Promise<void> | null = null;
let producerConnected = false;

// ---------------------------------------------------------------------------
// Topic & source helpers
// ---------------------------------------------------------------------------

function getAnalyticsTopic(): string {
  return process.env.KAFKA_USER_EVENTS_TOPIC?.trim() || "user-events";
}

function getDefaultAnalyticsSource(): string {
  return process.env.KAFKA_ANALYTICS_SOURCE?.trim() || "unknown";
}

// ---------------------------------------------------------------------------
// Connection with exponential backoff retry
// ---------------------------------------------------------------------------

const MAX_CONNECT_RETRIES = 5;
const CONNECT_BASE_DELAY_MS = 1_000;

function getConnectRetryDelay(attempt: number): number {
  const delay = CONNECT_BASE_DELAY_MS * 2 ** Math.max(0, attempt - 1);
  const jitter = 1 + Math.random() * 0.25;
  return Math.min(30_000, Math.round(delay * jitter));
}

async function connectWithRetry(): Promise<void> {
  for (let attempt = 1; attempt <= MAX_CONNECT_RETRIES; attempt += 1) {
    try {
      await analyticsProducer.connect();
      producerConnected = true;
      logger.info("Kafka analytics producer connected", {
        topic: getAnalyticsTopic(),
        idempotent: true,
        attempt,
      });
      return;
    } catch (error) {
      if (attempt >= MAX_CONNECT_RETRIES) {
        producerConnectPromise = null;
        producerConnected = false;
        logger.error("Kafka analytics producer failed to connect after all retries", {
          error,
          attempts: attempt,
        });
        throw error;
      }

      const delayMs = getConnectRetryDelay(attempt);
      logger.warn("Kafka analytics producer connect failed, retrying", {
        error,
        attempt,
        maxRetries: MAX_CONNECT_RETRIES,
        nextRetryMs: delayMs,
      });

      await new Promise((resolve) => {
        setTimeout(resolve, delayMs);
      });
    }
  }
}

async function ensureAnalyticsProducerConnected(): Promise<void> {
  if (producerConnected) {
    return;
  }

  if (!producerConnectPromise) {
    producerConnectPromise = connectWithRetry().catch((error) => {
      producerConnectPromise = null;
      producerConnected = false;
      throw error;
    });
  }

  await producerConnectPromise;
}

// ---------------------------------------------------------------------------
// Event creation
// ---------------------------------------------------------------------------

export function createAnalyticsEvent(
  input: Omit<AnalyticsEvent, "eventId" | "schemaVersion" | "timestamp" | "source"> &
    Partial<Pick<AnalyticsEvent, "eventId" | "schemaVersion" | "timestamp" | "source">>,
): AnalyticsEvent {
  return analyticsEventSchema.parse({
    ...input,
    eventId: input.eventId ?? randomUUID(),
    quantity: input.quantity ?? 1,
    schemaVersion: input.schemaVersion ?? 1,
    source: input.source ?? getDefaultAnalyticsSource(),
    timestamp: input.timestamp ?? new Date().toISOString(),
  });
}

// ---------------------------------------------------------------------------
// Producer record builder
// ---------------------------------------------------------------------------

function createProducerRecord(event: AnalyticsEvent): ProducerRecord {
  return {
    topic: getAnalyticsTopic(),
    messages: [
      {
        key: event.userId,
        value: JSON.stringify(event),
        headers: {
          "x-event-id": event.eventId,
          "x-event-action": event.action,
          "x-event-source": event.source,
          "x-schema-version": String(event.schemaVersion),
          ...(event.correlationId
            ? { "x-correlation-id": event.correlationId }
            : {}),
        },
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Publish
// ---------------------------------------------------------------------------

export async function publishAnalyticsEvent(
  input: Omit<AnalyticsEvent, "eventId" | "schemaVersion" | "timestamp" | "source"> &
    Partial<Pick<AnalyticsEvent, "eventId" | "schemaVersion" | "timestamp" | "source">>,
  producer: Pick<Producer, "send" | "connect"> = analyticsProducer,
): Promise<AnalyticsEvent> {
  const event = createAnalyticsEvent(input);

  if (producer === analyticsProducer) {
    await ensureAnalyticsProducerConnected();
  } else {
    await producer.connect();
  }

  await producer.send(createProducerRecord(event));

  logger.info("Published analytics event", {
    eventId: event.eventId,
    action: event.action,
    source: event.source,
    topic: getAnalyticsTopic(),
    ...(event.correlationId ? { correlationId: event.correlationId } : {}),
  });

  return event;
}

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

/**
 * Returns `true` if the default analytics producer is connected and healthy.
 */
export function isProducerHealthy(): boolean {
  return producerConnected;
}

// ---------------------------------------------------------------------------
// Disconnect
// ---------------------------------------------------------------------------

export async function disconnectAnalyticsProducer(): Promise<void> {
  if (!producerConnected) {
    return;
  }

  await analyticsProducer.disconnect();
  producerConnectPromise = null;
  producerConnected = false;
  logger.info("Kafka analytics producer disconnected");
}

export { analyticsProducer, getAnalyticsTopic };
