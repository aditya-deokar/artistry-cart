import {
  analyticsEventSchema,
  type AnalyticsEvent,
  type AnalyticsUserAction,
} from "../../../../packages/utils/kafka";

export type UserAction = AnalyticsUserAction;
export { ANALYTICS_USER_ACTIONS as USER_ACTIONS } from "../../../../packages/utils/kafka";
export type { AnalyticsEvent };

export class PermanentEventError extends Error {
  constructor(
    message: string,
    readonly metadata?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "PermanentEventError";
  }
}

export function buildKafkaEventKey(topic: string, partition: number, offset: string): string {
  return `${topic}:${partition}:${offset}`;
}

export function parseAnalyticsEvent(
  rawMessageValue: Buffer | string,
  fallbackTimestamp?: string,
): AnalyticsEvent {
  const rawValue = rawMessageValue.toString().trim();

  if (!rawValue) {
    throw new PermanentEventError("Kafka message value was empty");
  }

  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(rawValue);
  } catch (error) {
    throw new PermanentEventError("Kafka message was not valid JSON", {
      error: error instanceof Error ? error.message : String(error),
      rawValue,
    });
  }

  const result = analyticsEventSchema.safeParse(parsedValue);

  if (!result.success) {
    throw new PermanentEventError("Kafka message failed schema validation", {
      issues: result.error.issues,
      rawValue,
    });
  }

  if (result.data.timestamp) {
    return result.data;
  }

  return {
    ...result.data,
    timestamp: fallbackTimestamp ?? new Date().toISOString(),
  };
}
