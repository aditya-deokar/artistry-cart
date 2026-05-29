import { randomUUID } from "node:crypto";

import type { Producer, ProducerRecord } from "kafkajs";

import { createLogger } from "../runtime";
import { analyticsEventSchema, type AnalyticsEvent } from "./analytics-contract";
import { kafka } from "./client";

const logger = createLogger("kafka-producer");
const analyticsProducer = kafka.producer();
let producerConnectPromise: Promise<void> | null = null;
let producerConnected = false;

function getAnalyticsTopic(): string {
  return process.env.KAFKA_USER_EVENTS_TOPIC?.trim() || "user-events";
}

function getDefaultAnalyticsSource(): string {
  return process.env.KAFKA_ANALYTICS_SOURCE?.trim() || "unknown";
}

async function ensureAnalyticsProducerConnected(): Promise<void> {
  if (producerConnected) {
    return;
  }

  if (!producerConnectPromise) {
    producerConnectPromise = analyticsProducer
      .connect()
      .then(() => {
        producerConnected = true;
        logger.info("Kafka analytics producer connected", {
          topic: getAnalyticsTopic(),
        });
      })
      .catch((error) => {
        producerConnectPromise = null;
        producerConnected = false;
        logger.error("Kafka analytics producer failed to connect", { error });
        throw error;
      });
  }

  await producerConnectPromise;
}

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
        },
      },
    ],
  };
}

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
  });

  return event;
}

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
