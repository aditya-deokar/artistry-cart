import express from "express";
import dotenv from "dotenv";

import {
  closeServer,
  createLogger,
  getHost,
  getPort,
  registerGracefulShutdown,
  registerHealthEndpoints,
  setupHttpObservability,
} from "../../../packages/utils/runtime";
import { kafka } from "../../../packages/utils/kafka";
import {
  AnalyticsEvent,
  UserAction,
  updateUserAnalytics,
} from "./services/analytics";

dotenv.config();

const host = getHost();
const port = getPort(3000);
const logger = createLogger("kafka-service");
const managementApp = express();
const { metrics } = setupHttpObservability(managementApp, {
  serviceName: "kafka-service",
  logger,
});

const processedEventsTotal = metrics.counter(
  "kafka_events_processed_total",
  "Total Kafka events processed successfully",
  ["action"],
);
const parseErrorsTotal = metrics.counter(
  "kafka_events_parse_errors_total",
  "Total Kafka event parsing errors",
);
const queueSizeGauge = metrics.gauge(
  "kafka_event_queue_size",
  "Current queued Kafka events awaiting processing",
);

const groupId = process.env.KAFKA_CONSUMER_GROUP_ID ?? "user-events-group";
const topic = process.env.KAFKA_USER_EVENTS_TOPIC ?? "user-events";
const consumer = kafka.consumer({ groupId });
const eventQueue: AnalyticsEvent[] = [];

const validActions: ReadonlyArray<UserAction> = [
  "add_to_wishlist",
  "add_to_cart",
  "product_view",
  "remove_from_wishlist",
  "remove_from_cart",
  "purchase",
  "shop_visit",
];

const parsedInterval = Number(process.env.KAFKA_CONSUMER_BATCH_INTERVAL_MS ?? "3000");
const batchIntervalMs =
  Number.isFinite(parsedInterval) && parsedInterval > 0 ? parsedInterval : 3000;

let consumerReady = false;

const { liveness, readiness } = registerHealthEndpoints(managementApp, {
  serviceName: "kafka-service",
  readinessCheck: () => {
    if (!consumerReady) {
      throw new Error("Kafka consumer is not ready");
    }
  },
});

managementApp.get("/health", liveness);
managementApp.get("/ready", readiness);

const managementServer = managementApp.listen(port, host, () => {
  logger.info("Kafka management server listening", { host, port, topic, groupId });
});

managementServer.on("error", (error) => {
  logger.error("Kafka management server error", { error });
});

const processQueue = async () => {
  queueSizeGauge.set({}, eventQueue.length);

  if (eventQueue.length === 0) {
    return;
  }

  const events = [...eventQueue];
  eventQueue.length = 0;
  queueSizeGauge.set({}, eventQueue.length);

  for (const event of events) {
    if (!event.action || !validActions.includes(event.action)) {
      continue;
    }

    if (event.action === "shop_visit") {
      continue;
    }

    try {
      await updateUserAnalytics(event);
      processedEventsTotal.inc({ action: event.action });
    } catch (error) {
      logger.error("Error processing event", { error, action: event.action });
    }
  }
};

const queueProcessor = setInterval(() => {
  void processQueue();
}, batchIntervalMs);

export const consumeKafkaMessages = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });
  consumerReady = true;
  logger.info("Kafka consumer connected", { topic, groupId });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) {
        return;
      }

      try {
        const event = JSON.parse(message.value.toString()) as AnalyticsEvent;
        eventQueue.push(event);
        queueSizeGauge.set({}, eventQueue.length);
      } catch (error) {
        parseErrorsTotal.inc();
        logger.error("Unable to parse Kafka message", { error });
      }
    },
  });
};

consumeKafkaMessages().catch((error) => {
  consumerReady = false;
  logger.error("Kafka consumer failed", { error });
  process.exitCode = 1;
});

registerGracefulShutdown({
  name: "kafka-service",
  logger,
  onShutdown: async () => {
    consumerReady = false;
    clearInterval(queueProcessor);
    await processQueue();
    await consumer.disconnect();
  },
  close: () => closeServer(managementServer),
});
