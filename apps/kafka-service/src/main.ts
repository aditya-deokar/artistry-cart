import dotenv from "dotenv";

import { kafka } from "../../../packages/utils/kafka";
import {
  AnalyticsEvent,
  UserAction,
  updateUserAnalytics,
} from "./services/analytics";

dotenv.config();

const groupId = process.env.KAFKA_CONSUMER_GROUP_ID ?? "user-events-group";
const topic = process.env.KAFKA_USER_EVENTS_TOPIC ?? "users-events";
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
const batchIntervalMs = Number.isFinite(parsedInterval) && parsedInterval > 0 ? parsedInterval : 3000;

const processQueue = async () => {
  if (eventQueue.length === 0) return;

  const events = [...eventQueue];
  eventQueue.length = 0;

  for (const event of events) {
    if (!event.action || !validActions.includes(event.action)) {
      continue;
    }

    if (event.action === "shop_visit") {
      // TODO: expand shop analytics once the write model is ready
      continue;
    }

    try {
      await updateUserAnalytics(event);
    } catch (error) {
      console.log("Error processing event", error);
    }
  }
};

setInterval(processQueue, batchIntervalMs);

// Kafka Consumer for user events
export const consumeKafkaMessages = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      try {
        const event = JSON.parse(message.value.toString()) as AnalyticsEvent;
        eventQueue.push(event);
      } catch (error) {
        console.error("Unable to parse kafka message", error);
      }
    },
  });
};

consumeKafkaMessages().catch((error) => {
  console.error("Kafka consumer failed", error);
  process.exitCode = 1;
});