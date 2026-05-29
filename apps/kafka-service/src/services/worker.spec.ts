import { beforeEach, describe, expect, it, vi } from "vitest";

import { processKafkaBatch, type KafkaWorkerMetrics, type KafkaWorkerState } from "./worker";

function createMetricsStub(): KafkaWorkerMetrics {
  return {
    batchesTotal: { inc: vi.fn() },
    batchDurationMsTotal: { inc: vi.fn() },
    eventsProcessedTotal: { inc: vi.fn() },
    eventsRetriedTotal: { inc: vi.fn() },
    eventsDeadLetteredTotal: { inc: vi.fn() },
    eventsInvalidTotal: { inc: vi.fn() },
    inflightBatches: { inc: vi.fn(), set: vi.fn() },
    currentBatchSize: { inc: vi.fn(), set: vi.fn() },
    readinessGauge: { inc: vi.fn(), set: vi.fn() },
  };
}

function createBatchPayload(messages: Array<Record<string, unknown>>) {
  return {
    batch: {
      topic: "user-events",
      partition: 0,
      highWatermark: "10",
      messages,
      isEmpty: () => messages.length === 0,
      firstOffset: () => messages[0]?.offset ?? "0",
      lastOffset: () => messages[messages.length - 1]?.offset ?? "0",
      offsetLag: () => "0",
      offsetLagLow: () => "0",
    },
    resolveOffset: vi.fn(),
    heartbeat: vi.fn().mockResolvedValue(undefined),
    commitOffsetsIfNecessary: vi.fn().mockResolvedValue(undefined),
    uncommittedOffsets: vi.fn(),
    isRunning: vi.fn().mockReturnValue(true),
    isStale: vi.fn().mockReturnValue(false),
    pause: vi.fn(),
  } as any;
}

describe("processKafkaBatch", () => {
  let logger: {
    error: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
  };
  let metrics: KafkaWorkerMetrics;
  let state: KafkaWorkerState;

  beforeEach(() => {
    logger = {
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    };
    metrics = createMetricsStub();
    state = {
      connected: true,
      running: true,
      shuttingDown: false,
    };
  });

  it("processes a valid batch and commits offsets", async () => {
    const payload = createBatchPayload([
      {
        offset: "1",
        timestamp: String(Date.parse("2026-05-29T00:00:00.000Z")),
        value: Buffer.from(
          JSON.stringify({
            userId: "user-1",
            productId: "product-1",
            action: "product_view",
          }),
        ),
      },
    ]);
    const handleEvent = vi.fn().mockResolvedValue(undefined);

    await processKafkaBatch(payload, {
      config: {
        consumerGroupId: "user-events-group",
        topic: "user-events",
        batchSize: 100,
        maxRetries: 0,
        retryBaseDelayMs: 25,
        retryMaxDelayMs: 100,
        partitionsConsumedConcurrently: 1,
        minBytes: 1,
        maxBytesPerPartition: 1024 * 1024,
        maxWaitTimeInMs: 5000,
      },
      handleEvent,
      logger: logger as any,
      metrics,
      state,
    });

    expect(handleEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        productId: "product-1",
        action: "product_view",
      }),
      "user-events:0:1",
    );
    expect(payload.resolveOffset).toHaveBeenCalledWith("1");
    expect(payload.commitOffsetsIfNecessary).toHaveBeenCalled();
    expect(metrics.eventsProcessedTotal.inc).toHaveBeenCalledWith({
      action: "product_view",
    });
  });

  it("dead-letters invalid events and continues processing", async () => {
    const payload = createBatchPayload([
      {
        offset: "2",
        timestamp: String(Date.parse("2026-05-29T00:00:00.000Z")),
        value: Buffer.from(
          JSON.stringify({
            userId: "user-1",
            action: "add_to_cart",
          }),
        ),
      },
    ]);
    const deadLetterProducer = {
      send: vi.fn().mockResolvedValue(undefined),
    };

    await processKafkaBatch(payload, {
      config: {
        consumerGroupId: "user-events-group",
        topic: "user-events",
        deadLetterTopic: "user-events.dlq",
        batchSize: 100,
        maxRetries: 0,
        retryBaseDelayMs: 25,
        retryMaxDelayMs: 100,
        partitionsConsumedConcurrently: 1,
        minBytes: 1,
        maxBytesPerPartition: 1024 * 1024,
        maxWaitTimeInMs: 5000,
      },
      deadLetterProducer,
      logger: logger as any,
      metrics,
      state,
    });

    expect(deadLetterProducer.send).toHaveBeenCalled();
    expect(payload.resolveOffset).toHaveBeenCalledWith("2");
    expect(metrics.eventsInvalidTotal.inc).toHaveBeenCalledWith({
      reason: "invalid_event",
    });
  });

  it("fails the batch when a transient error exhausts retries and no dead-letter topic exists", async () => {
    const payload = createBatchPayload([
      {
        offset: "3",
        timestamp: String(Date.parse("2026-05-29T00:00:00.000Z")),
        value: Buffer.from(
          JSON.stringify({
            userId: "user-1",
            productId: "product-1",
            action: "product_view",
          }),
        ),
      },
    ]);
    const handleEvent = vi.fn().mockRejectedValue(new Error("database unavailable"));

    await expect(
      processKafkaBatch(payload, {
        config: {
          consumerGroupId: "user-events-group",
          topic: "user-events",
          batchSize: 100,
          maxRetries: 1,
          retryBaseDelayMs: 25,
          retryMaxDelayMs: 50,
          partitionsConsumedConcurrently: 1,
          minBytes: 1,
          maxBytesPerPartition: 1024 * 1024,
          maxWaitTimeInMs: 5000,
        },
        handleEvent,
        logger: logger as any,
        metrics,
        state,
      }),
    ).rejects.toThrow("database unavailable");

    expect(payload.resolveOffset).not.toHaveBeenCalled();
    expect(payload.commitOffsetsIfNecessary).toHaveBeenCalled();
    expect(state.lastError).toBe("database unavailable");
    expect(metrics.eventsRetriedTotal.inc).toHaveBeenCalledWith({
      action: "product_view",
    });
  });

  it("dead-letters exhausted transient failures when a dead-letter topic is configured", async () => {
    const payload = createBatchPayload([
      {
        offset: "4",
        timestamp: String(Date.parse("2026-05-29T00:00:00.000Z")),
        value: Buffer.from(
          JSON.stringify({
            userId: "user-1",
            productId: "product-1",
            action: "product_view",
          }),
        ),
      },
    ]);
    const handleEvent = vi.fn().mockRejectedValue(new Error("database unavailable"));
    const deadLetterProducer = {
      send: vi.fn().mockResolvedValue(undefined),
    };

    await processKafkaBatch(payload, {
      config: {
        consumerGroupId: "user-events-group",
        topic: "user-events",
        deadLetterTopic: "user-events.dlq",
        batchSize: 100,
        maxRetries: 1,
        retryBaseDelayMs: 25,
        retryMaxDelayMs: 50,
        partitionsConsumedConcurrently: 1,
        minBytes: 1,
        maxBytesPerPartition: 1024 * 1024,
        maxWaitTimeInMs: 5000,
      },
      deadLetterProducer,
      handleEvent,
      logger: logger as any,
      metrics,
      state,
    });

    expect(deadLetterProducer.send).toHaveBeenCalled();
    expect(payload.resolveOffset).toHaveBeenCalledWith("4");
    expect(metrics.eventsDeadLetteredTotal.inc).toHaveBeenCalledWith({
      reason: "processing_failed",
    });
  });
});
