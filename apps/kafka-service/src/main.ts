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

async function startKafkaWorker(): Promise<void> {
  if (deadLetterProducer) {
    await deadLetterProducer.connect();
  }

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

void startKafkaWorker().catch((error) => {
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
