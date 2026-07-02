import type { Admin, Kafka } from "kafkajs";

import { createLogger } from "../runtime";

const logger = createLogger("kafka-health");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type KafkaHealthResult = {
  /** Whether the Kafka cluster is reachable */
  healthy: boolean;
  /** Time taken to perform the health check in milliseconds */
  latencyMs: number;
  /** Number of topics found (only when healthy) */
  topicCount?: number;
  /** Error message (only when unhealthy) */
  error?: string;
};

// ---------------------------------------------------------------------------
// checkKafkaHealth
// ---------------------------------------------------------------------------

/**
 * Performs a lightweight health check against the Kafka cluster.
 *
 * Connects an admin client, lists topics (to confirm the cluster is
 * responsive), and disconnects. Returns a result object indicating whether
 * the cluster is healthy along with latency information.
 *
 * This function never throws — it always returns a result.
 *
 * @example
 * ```ts
 * const result = await checkKafkaHealth(kafka);
 * if (!result.healthy) {
 *   logger.warn("Kafka is unhealthy", { error: result.error });
 * }
 * ```
 */
export async function checkKafkaHealth(kafka: Kafka): Promise<KafkaHealthResult> {
  const startTime = Date.now();
  let admin: Admin | null = null;

  try {
    admin = kafka.admin();
    await admin.connect();

    const topics = await admin.listTopics();
    const latencyMs = Date.now() - startTime;

    return {
      healthy: true,
      latencyMs,
      topicCount: topics.length,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.warn("Kafka health check failed", {
      latencyMs,
      error: errorMessage,
    });

    return {
      healthy: false,
      latencyMs,
      error: errorMessage,
    };
  } finally {
    if (admin) {
      await admin.disconnect().catch(() => {});
    }
  }
}

// ---------------------------------------------------------------------------
// waitForKafka
// ---------------------------------------------------------------------------

/**
 * Waits until Kafka is reachable, retrying with exponential backoff.
 *
 * @param kafka - KafkaJS client instance
 * @param maxAttempts - Maximum number of connection attempts (default: 10)
 * @param baseDelayMs - Base delay between retries in milliseconds (default: 1000)
 * @throws {Error} If Kafka is not reachable after all attempts
 */
export async function waitForKafka(
  kafka: Kafka,
  maxAttempts = 10,
  baseDelayMs = 1_000,
): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const result = await checkKafkaHealth(kafka);

    if (result.healthy) {
      logger.info("Kafka is reachable", {
        attempt,
        latencyMs: result.latencyMs,
        topicCount: result.topicCount,
      });
      return;
    }

    if (attempt >= maxAttempts) {
      throw new Error(
        `Kafka is not reachable after ${maxAttempts} attempts: ${result.error}`,
      );
    }

    const delayMs = Math.min(
      baseDelayMs * 2 ** (attempt - 1),
      30_000,
    );

    logger.warn("Kafka not yet reachable, retrying", {
      attempt,
      maxAttempts,
      nextRetryMs: delayMs,
      error: result.error,
    });

    await new Promise((resolve) => {
      setTimeout(resolve, delayMs);
    });
  }
}
