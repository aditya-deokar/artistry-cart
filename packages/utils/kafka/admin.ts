import type { Admin, ITopicConfig, Kafka } from "kafkajs";

import { createLogger } from "../runtime";

const logger = createLogger("kafka-admin");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TopicDefinition = {
  /** Topic name */
  topic: string;
  /** Number of partitions (default: 6) */
  numPartitions?: number;
  /** Replication factor (default: 1 for dev, should be 3 for production) */
  replicationFactor?: number;
  /** Optional topic-level config overrides (e.g. retention.ms) */
  configEntries?: Array<{ name: string; value: string }>;
};

// ---------------------------------------------------------------------------
// ensureTopicsExist
// ---------------------------------------------------------------------------

/**
 * Idempotently ensures that the specified topics exist on the Kafka cluster.
 *
 * - Topics that already exist are skipped (no error).
 * - Topics that don't exist are created with the provided configuration.
 * - Logs which topics were created vs. already existed.
 *
 * @example
 * ```ts
 * await ensureTopicsExist(kafka, [
 *   { topic: "user-events", numPartitions: 6 },
 *   { topic: "user-events.dlq", numPartitions: 3 },
 * ]);
 * ```
 */
export async function ensureTopicsExist(
  kafka: Kafka,
  topics: TopicDefinition[],
): Promise<void> {
  if (topics.length === 0) {
    return;
  }

  let admin: Admin | null = null;

  try {
    admin = kafka.admin();
    await admin.connect();

    const existingTopics = await admin.listTopics();
    const existingSet = new Set(existingTopics);

    const toCreate: ITopicConfig[] = [];
    const alreadyExist: string[] = [];

    for (const def of topics) {
      if (existingSet.has(def.topic)) {
        alreadyExist.push(def.topic);
        continue;
      }

      toCreate.push({
        topic: def.topic,
        numPartitions: def.numPartitions ?? 6,
        replicationFactor: def.replicationFactor ?? 1,
        configEntries: def.configEntries,
      });
    }

    if (alreadyExist.length > 0) {
      logger.info("Kafka topics already exist", {
        topics: alreadyExist,
      });
    }

    if (toCreate.length > 0) {
      await admin.createTopics({
        waitForLeaders: true,
        topics: toCreate,
      });

      logger.info("Kafka topics created", {
        topics: toCreate.map((t) => ({
          topic: t.topic,
          partitions: t.numPartitions,
          replicationFactor: t.replicationFactor,
        })),
      });
    }
  } finally {
    if (admin) {
      await admin.disconnect().catch((error) => {
        logger.warn("Kafka admin disconnect error", { error });
      });
    }
  }
}

// ---------------------------------------------------------------------------
// listTopics
// ---------------------------------------------------------------------------

/**
 * Lists all topics on the Kafka cluster.
 */
export async function listTopics(kafka: Kafka): Promise<string[]> {
  let admin: Admin | null = null;

  try {
    admin = kafka.admin();
    await admin.connect();
    return await admin.listTopics();
  } finally {
    if (admin) {
      await admin.disconnect().catch(() => {});
    }
  }
}
