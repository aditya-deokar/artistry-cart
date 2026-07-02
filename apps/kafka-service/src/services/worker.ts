import type { EachBatchPayload, Producer } from "kafkajs";

import type {
  AppLogger,
  MetricsRegistry,
} from "@artistry-cart/utils/runtime";
import type { KafkaServiceConfig } from "../config";
import type { AnalyticsEvent } from "./events";
import {
  PermanentEventError,
  buildKafkaEventKey,
  parseAnalyticsEvent,
} from "./events";
import { processAnalyticsEvent } from "./analytics";

type MetricLabels = Record<string, string | number>;
type CounterMetric = {
  inc: (labels?: MetricLabels, value?: number) => void;
};
type GaugeMetric = {
  inc: (labels?: MetricLabels, value?: number) => void;
  set: (labels: MetricLabels, value: number) => void;
};
type HistogramMetric = {
  observe: (labels: MetricLabels, value: number) => void;
};

export type KafkaWorkerState = {
  connected: boolean;
  running: boolean;
  shuttingDown: boolean;
  lastError?: string;
  lastProcessedAt?: string;
};

export type KafkaWorkerMetrics = {
  batchesTotal: CounterMetric;
  batchDurationMsTotal: CounterMetric;
  eventsProcessedTotal: CounterMetric;
  eventsRetriedTotal: CounterMetric;
  eventsDeadLetteredTotal: CounterMetric;
  eventsInvalidTotal: CounterMetric;
  inflightBatches: GaugeMetric;
  currentBatchSize: GaugeMetric;
  readinessGauge: GaugeMetric;
  consumerLag: GaugeMetric;
  batchDurationHistogram: HistogramMetric;
  eventProcessingDuration: HistogramMetric;
};

type BatchProcessorDependencies = {
  config: KafkaServiceConfig;
  deadLetterProducer?: Pick<Producer, "send">;
  handleEvent?: (event: AnalyticsEvent, eventKey: string) => Promise<void>;
  logger: AppLogger;
  metrics: KafkaWorkerMetrics;
  parseEvent?: (rawMessageValue: Buffer | string, fallbackTimestamp?: string) => AnalyticsEvent;
  state: KafkaWorkerState;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalizeKafkaTimestamp(timestamp?: string): string | undefined {
  if (!timestamp) {
    return undefined;
  }

  const parsedEpochMs = Number(timestamp);

  if (Number.isFinite(parsedEpochMs) && parsedEpochMs > 0) {
    return new Date(parsedEpochMs).toISOString();
  }

  const parsedDate = Date.parse(timestamp);

  if (!Number.isNaN(parsedDate)) {
    return new Date(parsedDate).toISOString();
  }

  return undefined;
}

function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return { message: String(error) };
}

function getRetryDelayMs(
  baseDelayMs: number,
  maxDelayMs: number,
  attempt: number,
): number {
  const exponentialDelay = baseDelayMs * 2 ** Math.max(0, attempt - 1);
  const jitterMultiplier = 1 + Math.random() * 0.25;

  return Math.min(maxDelayMs, Math.round(exponentialDelay * jitterMultiplier));
}

export function createKafkaWorkerMetrics(registry: MetricsRegistry): KafkaWorkerMetrics {
  return {
    batchesTotal: registry.counter(
      "kafka_batches_total",
      "Total Kafka batches handled",
      ["status"],
    ),
    batchDurationMsTotal: registry.counter(
      "kafka_batch_duration_ms_total",
      "Cumulative Kafka batch processing time in milliseconds",
      ["status"],
    ),
    eventsProcessedTotal: registry.counter(
      "kafka_events_processed_total",
      "Total Kafka events processed successfully",
      ["action"],
    ),
    eventsRetriedTotal: registry.counter(
      "kafka_events_retried_total",
      "Total Kafka event retries",
      ["action"],
    ),
    eventsDeadLetteredTotal: registry.counter(
      "kafka_events_dead_lettered_total",
      "Total Kafka events published to the dead-letter topic",
      ["reason"],
    ),
    eventsInvalidTotal: registry.counter(
      "kafka_events_invalid_total",
      "Total Kafka events rejected before processing",
      ["reason"],
    ),
    inflightBatches: registry.gauge(
      "kafka_inflight_batches",
      "Current Kafka batches being processed",
    ),
    currentBatchSize: registry.gauge(
      "kafka_current_batch_size",
      "Number of messages in the current Kafka batch",
    ),
    readinessGauge: registry.gauge(
      "kafka_consumer_ready",
      "Kafka consumer readiness state",
    ),
    consumerLag: registry.gauge(
      "kafka_consumer_lag",
      "Difference between partition high watermark and last committed offset",
      ["topic", "partition"],
    ),
    batchDurationHistogram: registry.histogram(
      "kafka_batch_duration_seconds",
      "Kafka batch processing duration in seconds",
      ["status"],
      [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    ),
    eventProcessingDuration: registry.histogram(
      "kafka_event_processing_duration_seconds",
      "Individual Kafka event processing duration in seconds",
      ["action"],
      [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
    ),
  };
}

export function syncKafkaWorkerReadiness(
  state: KafkaWorkerState,
  metrics: KafkaWorkerMetrics,
): void {
  metrics.readinessGauge.set(
    {},
    state.connected && state.running && !state.shuttingDown ? 1 : 0,
  );
}

async function publishToDeadLetterTopic(
  message: EachBatchPayload["batch"]["messages"][number],
  reason: string,
  error: unknown,
  dependencies: BatchProcessorDependencies,
  eventKey: string,
  payload?: Record<string, unknown>,
): Promise<boolean> {
  if (!dependencies.deadLetterProducer || !dependencies.config.deadLetterTopic) {
    return false;
  }

  const sourcePayload = message.value?.toString() ?? null;

  await dependencies.deadLetterProducer.send({
    topic: dependencies.config.deadLetterTopic,
    messages: [
      {
        key: message.key?.toString() ?? eventKey,
        value: JSON.stringify({
          source: {
            topic: payload?.topic,
            partition: payload?.partition,
            offset: payload?.offset,
            timestamp: payload?.timestamp,
          },
          eventKey,
          reason,
          error: serializeError(error),
          payload: sourcePayload,
          ...(payload?.event ? { event: payload.event } : {}),
        }),
        headers: {
          "x-dead-letter-reason": reason,
          "x-source-event-key": eventKey,
        },
      },
    ],
  });

  dependencies.metrics.eventsDeadLetteredTotal.inc({ reason });

  return true;
}

async function processEventWithRetry(
  event: AnalyticsEvent,
  eventKey: string,
  dependencies: BatchProcessorDependencies,
): Promise<void> {
  const handleEvent = dependencies.handleEvent ?? processAnalyticsEvent;

  for (let attempt = 0; attempt <= dependencies.config.maxRetries; attempt += 1) {
    try {
      await handleEvent(event, eventKey);
      return;
    } catch (error) {
      if (error instanceof PermanentEventError) {
        throw error;
      }

      if (attempt >= dependencies.config.maxRetries) {
        throw error;
      }

      const retryAttempt = attempt + 1;
      const delayMs = getRetryDelayMs(
        dependencies.config.retryBaseDelayMs,
        dependencies.config.retryMaxDelayMs,
        retryAttempt,
      );

      dependencies.metrics.eventsRetriedTotal.inc({ action: event.action });
      dependencies.logger.warn("Retrying Kafka analytics event", {
        eventKey,
        action: event.action,
        attempt: retryAttempt,
        delayMs,
        error,
      });

      await sleep(delayMs);
    }
  }
}

export async function processKafkaBatch(
  payload: EachBatchPayload,
  dependencies: BatchProcessorDependencies,
): Promise<void> {
  const {
    batch,
    commitOffsetsIfNecessary,
    heartbeat,
    isRunning,
    isStale,
    resolveOffset,
  } = payload;

  const parseEvent = dependencies.parseEvent ?? parseAnalyticsEvent;
  let batchStatus = "success";
  const batchStartedAt = Date.now();
  let processedMessages = 0;

  dependencies.metrics.inflightBatches.inc({}, 1);
  dependencies.metrics.currentBatchSize.set({}, batch.messages.length);

  // Track consumer lag: difference between high watermark and last message offset
  const highWatermark = Number(batch.highWatermark);
  const lastMessageOffset = batch.messages.length > 0
    ? Number(batch.messages[batch.messages.length - 1].offset)
    : 0;
  if (Number.isFinite(highWatermark) && Number.isFinite(lastMessageOffset)) {
    dependencies.metrics.consumerLag.set(
      { topic: batch.topic, partition: String(batch.partition) },
      Math.max(0, highWatermark - lastMessageOffset - 1),
    );
  }

  try {
    for (
      let startIndex = 0;
      startIndex < batch.messages.length;
      startIndex += dependencies.config.batchSize
    ) {
      const messageChunk = batch.messages.slice(
        startIndex,
        startIndex + dependencies.config.batchSize,
      );

      for (const message of messageChunk) {
        if (!isRunning() || isStale() || dependencies.state.shuttingDown) {
          batchStatus = "interrupted";
          return;
        }

        const eventKey = buildKafkaEventKey(batch.topic, batch.partition, message.offset);
        const fallbackTimestamp = normalizeKafkaTimestamp(message.timestamp);

        try {
          if (!message.value) {
            throw new PermanentEventError("Kafka message did not include a value");
          }

          const event = parseEvent(message.value, fallbackTimestamp);

          const eventStartedAt = Date.now();
          await processEventWithRetry(event, eventKey, dependencies);
          const eventDurationMs = Date.now() - eventStartedAt;

          dependencies.metrics.eventsProcessedTotal.inc({ action: event.action });
          dependencies.metrics.eventProcessingDuration.observe(
            { action: event.action },
            eventDurationMs / 1_000,
          );
          dependencies.state.lastProcessedAt = new Date().toISOString();
          dependencies.state.lastError = undefined;

          resolveOffset(message.offset);
        } catch (error) {
          const isPermanentError = error instanceof PermanentEventError;
          const reason = isPermanentError ? "invalid_event" : "processing_failed";

          dependencies.logger[isPermanentError ? "warn" : "error"](
            isPermanentError
              ? "Kafka event was rejected"
              : "Kafka event processing failed",
            {
              eventKey,
              topic: batch.topic,
              partition: batch.partition,
              offset: message.offset,
              error,
            },
          );

          if (isPermanentError) {
            dependencies.metrics.eventsInvalidTotal.inc({ reason });
          }

          const publishedToDeadLetter = await publishToDeadLetterTopic(
            message,
            reason,
            error,
            dependencies,
            eventKey,
            {
              topic: batch.topic,
              partition: batch.partition,
              offset: message.offset,
              timestamp: fallbackTimestamp,
              ...(isPermanentError && "metadata" in error && error.metadata
                ? { event: error.metadata }
                : {}),
            },
          );

          if (isPermanentError || publishedToDeadLetter) {
            resolveOffset(message.offset);
            continue;
          }

          batchStatus = "failed";
          dependencies.state.lastError =
            error instanceof Error ? error.message : String(error);

          await commitOffsetsIfNecessary();
          throw error;
        } finally {
          processedMessages += 1;

          if (processedMessages % 5 === 0) {
            await heartbeat();
          }
        }
      }

      await commitOffsetsIfNecessary();
      await heartbeat();
    }
  } finally {
    const durationMs = Date.now() - batchStartedAt;

    dependencies.metrics.inflightBatches.inc({}, -1);
    dependencies.metrics.currentBatchSize.set({}, 0);
    dependencies.metrics.batchesTotal.inc({ status: batchStatus });
    dependencies.metrics.batchDurationMsTotal.inc({ status: batchStatus }, durationMs);
    dependencies.metrics.batchDurationHistogram.observe(
      { status: batchStatus },
      durationMs / 1_000,
    );
    syncKafkaWorkerReadiness(dependencies.state, dependencies.metrics);
  }
}
