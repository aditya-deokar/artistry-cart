import "dotenv/config";

import express from "express";

import {
  closeServer,
  createLogger,
  getHost,
  getPort,
  registerGracefulShutdown,
  registerHealthEndpoints,
  setupHttpObservability,
} from "@artistry-cart/utils/runtime";
import { kafka } from "@artistry-cart/utils/kafka";
import { ensureTopicsExist } from "@artistry-cart/utils/kafka";
import { checkKafkaHealth } from "@artistry-cart/utils/kafka";
import { kafkaServiceConfig } from "./config";
import {
  createKafkaWorkerMetrics,
  processKafkaBatch,
  syncKafkaWorkerReadiness,
  type KafkaWorkerState,
} from "./services/worker";

const host = getHost();
const port = getPort(3000);
const logger = createLogger("kafka-service");
const managementApp = express();
const config = kafkaServiceConfig;
const consumer = kafka.consumer({
  groupId: config.consumerGroupId,
  minBytes: config.minBytes,
  maxBytesPerPartition: config.maxBytesPerPartition,
  maxWaitTimeInMs: config.maxWaitTimeInMs,
  allowAutoTopicCreation: false,
});
const deadLetterProducer = config.deadLetterTopic ? kafka.producer() : undefined;
const state: KafkaWorkerState = {
  connected: false,
  running: false,
  shuttingDown: false,
};

const { metrics } = setupHttpObservability(managementApp, {
  serviceName: "kafka-service",
  logger,
});
const workerMetrics = createKafkaWorkerMetrics(metrics);

syncKafkaWorkerReadiness(state, workerMetrics);

const { liveness, readiness } = registerHealthEndpoints(managementApp, {
  serviceName: "kafka-service",
  readinessCheck: () => {
    if (state.shuttingDown) {
      throw new Error("Kafka worker is shutting down");
    }

    if (!state.connected || !state.running) {
      throw new Error(state.lastError ?? "Kafka consumer is not ready");
    }
  },
  metadata: {
    topic: config.topic,
    groupId: config.consumerGroupId,
    deadLetterTopic: config.deadLetterTopic ?? null,
  },
});

managementApp.get("/", (_req, res) => {
  res.status(200).json({
    service: "kafka-service",
    status: state.connected && state.running && !state.shuttingDown ? "ready" : "starting",
    topic: config.topic,
    groupId: config.consumerGroupId,
    deadLetterTopic: config.deadLetterTopic ?? null,
    lastProcessedAt: state.lastProcessedAt ?? null,
    lastError: state.lastError ?? null,
  });
});

// Kafka health probe endpoint
managementApp.get("/kafka-health", async (_req, res) => {
  const result = await checkKafkaHealth(kafka);
  res.status(result.healthy ? 200 : 503).json(result);
});

managementApp.get("/health", liveness);
managementApp.get("/ready", readiness);

const managementServer = managementApp.listen(port, host, () => {
  logger.info("Kafka management server listening", {
    host,
    port,
    topic: config.topic,
    groupId: config.consumerGroupId,
    deadLetterTopic: config.deadLetterTopic ?? null,
  });
});

managementServer.on("error", (error) => {
  logger.error("Kafka management server error", { error });
});

// ---------------------------------------------------------------------------
// Startup with retry loop & topic verification
// ---------------------------------------------------------------------------

function getStartupRetryDelay(attempt: number): number {
  const delay = config.startupRetryDelayMs * 2 ** Math.max(0, attempt - 1);
  const jitter = 1 + Math.random() * 0.2;
  return Math.min(60_000, Math.round(delay * jitter));
}

async function startKafkaWorker(): Promise<void> {
  // Step 1: Ensure topics exist (self-healing — creates if missing)
  logger.info("Verifying Kafka topics exist", {
    topic: config.topic,
    deadLetterTopic: config.deadLetterTopic ?? null,
  });

  const topicDefinitions = [
    {
      topic: config.topic,
      numPartitions: config.topicPartitions,
      replicationFactor: config.topicReplicationFactor,
    },
  ];

  if (config.deadLetterTopic) {
    topicDefinitions.push({
      topic: config.deadLetterTopic,
      numPartitions: config.dlqPartitions,
      replicationFactor: config.topicReplicationFactor,
    });
  }

  await ensureTopicsExist(kafka, topicDefinitions);

  // Step 2: Connect DLQ producer
  if (deadLetterProducer) {
    await deadLetterProducer.connect();
  }

  // Step 3: Connect consumer & subscribe
  await consumer.connect();
  state.connected = true;
  syncKafkaWorkerReadiness(state, workerMetrics);

  await consumer.subscribe({ topic: config.topic, fromBeginning: false });

  state.running = true;
  state.lastError = undefined;
  syncKafkaWorkerReadiness(state, workerMetrics);

  logger.info("Kafka consumer connected", {
    topic: config.topic,
    groupId: config.consumerGroupId,
    deadLetterTopic: config.deadLetterTopic ?? null,
    batchSize: config.batchSize,
    partitionsConsumedConcurrently: config.partitionsConsumedConcurrently,
  });

  // Step 4: Start consuming
  await consumer.run({
    autoCommit: false,
    eachBatchAutoResolve: false,
    partitionsConsumedConcurrently: config.partitionsConsumedConcurrently,
    eachBatch: async (payload) =>
      processKafkaBatch(payload, {
        config,
        deadLetterProducer,
        logger,
        metrics: workerMetrics,
        state,
      }),
  });
}

async function startWithRetry(): Promise<void> {
  for (let attempt = 1; attempt <= config.startupMaxRetries; attempt += 1) {
    try {
      await startKafkaWorker();
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      state.connected = false;
      state.running = false;
      state.lastError = errorMessage;
      syncKafkaWorkerReadiness(state, workerMetrics);

      if (attempt >= config.startupMaxRetries) {
        logger.error("Kafka consumer startup failed after all retries", {
          error,
          attempts: attempt,
        });
        throw error;
      }

      const delayMs = getStartupRetryDelay(attempt);
      logger.warn("Kafka consumer startup failed, retrying", {
        error: errorMessage,
        attempt,
        maxRetries: config.startupMaxRetries,
        nextRetryMs: delayMs,
      });

      await new Promise((resolve) => {
        setTimeout(resolve, delayMs);
      });
    }
  }
}

void startWithRetry().catch((error) => {
  state.connected = false;
  state.running = false;
  state.lastError = error instanceof Error ? error.message : String(error);
  syncKafkaWorkerReadiness(state, workerMetrics);
  logger.error("Kafka consumer failed", { error });
  process.exitCode = 1;
});

registerGracefulShutdown({
  name: "kafka-service",
  logger,
  timeoutMs: 30_000,
  onShutdown: async () => {
    state.shuttingDown = true;
    state.running = false;
    syncKafkaWorkerReadiness(state, workerMetrics);

    try {
      await consumer.stop();
    } catch (error) {
      logger.warn("Kafka consumer stop reported an error", { error });
    }

    try {
      await consumer.disconnect();
    } finally {
      state.connected = false;
      syncKafkaWorkerReadiness(state, workerMetrics);
    }

    if (deadLetterProducer) {
      await deadLetterProducer.disconnect();
    }
  },
  close: () => closeServer(managementServer),
});
