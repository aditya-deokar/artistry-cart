import { z } from "zod";

function readStringEnv(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  return value || fallback;
}

function readOptionalStringEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function readIntegerEnv(
  name: string,
  fallback: number,
  options: { min?: number; max?: number } = {},
): number {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue)) {
    return fallback;
  }

  if (options.min !== undefined && parsedValue < options.min) {
    return fallback;
  }

  if (options.max !== undefined && parsedValue > options.max) {
    return fallback;
  }

  return parsedValue;
}

const kafkaServiceConfigSchema = z.object({
  consumerGroupId: z.string().trim().min(1),
  topic: z.string().trim().min(1),
  deadLetterTopic: z.string().trim().min(1).optional(),
  batchSize: z.number().int().min(1).max(500),
  maxRetries: z.number().int().min(0).max(10),
  retryBaseDelayMs: z.number().int().min(25).max(30_000),
  retryMaxDelayMs: z.number().int().min(50).max(120_000),
  partitionsConsumedConcurrently: z.number().int().min(1).max(16),
  minBytes: z.number().int().min(1).max(10 * 1024 * 1024),
  maxBytesPerPartition: z.number().int().min(1024).max(10 * 1024 * 1024),
  maxWaitTimeInMs: z.number().int().min(100).max(60_000),
});

export type KafkaServiceConfig = z.infer<typeof kafkaServiceConfigSchema>;

export const kafkaServiceConfig = kafkaServiceConfigSchema.parse({
  consumerGroupId: readStringEnv("KAFKA_CONSUMER_GROUP_ID", "user-events-group"),
  topic: readStringEnv("KAFKA_USER_EVENTS_TOPIC", "user-events"),
  deadLetterTopic: readOptionalStringEnv("KAFKA_DLQ_TOPIC"),
  batchSize: readIntegerEnv("KAFKA_BATCH_SIZE", 100, { min: 1, max: 500 }),
  maxRetries: readIntegerEnv("KAFKA_MAX_RETRIES", 3, { min: 0, max: 10 }),
  retryBaseDelayMs: readIntegerEnv("KAFKA_RETRY_BASE_DELAY_MS", 250, {
    min: 25,
    max: 30_000,
  }),
  retryMaxDelayMs: readIntegerEnv("KAFKA_RETRY_MAX_DELAY_MS", 5_000, {
    min: 50,
    max: 120_000,
  }),
  partitionsConsumedConcurrently: readIntegerEnv(
    "KAFKA_PARTITIONS_CONCURRENCY",
    1,
    { min: 1, max: 16 },
  ),
  minBytes: readIntegerEnv("KAFKA_FETCH_MIN_BYTES", 1, {
    min: 1,
    max: 10 * 1024 * 1024,
  }),
  maxBytesPerPartition: readIntegerEnv(
    "KAFKA_FETCH_MAX_BYTES_PER_PARTITION",
    1024 * 1024,
    { min: 1024, max: 10 * 1024 * 1024 },
  ),
  maxWaitTimeInMs: readIntegerEnv("KAFKA_FETCH_MAX_WAIT_MS", 5_000, {
    min: 100,
    max: 60_000,
  }),
});
