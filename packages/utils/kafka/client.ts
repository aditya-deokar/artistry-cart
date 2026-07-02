import { Kafka, KafkaConfig, logLevel as KafkaLogLevel } from "kafkajs";

import { createLogger } from "../runtime";

const logger = createLogger("kafka-client");

// ---------------------------------------------------------------------------
// Log-level mapping
// ---------------------------------------------------------------------------

const LOG_LEVEL_MAP: Record<string, number> = {
  nothing: KafkaLogLevel.NOTHING,
  error: KafkaLogLevel.ERROR,
  warn: KafkaLogLevel.WARN,
  info: KafkaLogLevel.INFO,
  debug: KafkaLogLevel.DEBUG,
};

function resolveLogLevel(): number {
  const envLevel = (process.env.KAFKA_LOG_LEVEL ?? "warn").toLowerCase().trim();
  return LOG_LEVEL_MAP[envLevel] ?? KafkaLogLevel.WARN;
}

// ---------------------------------------------------------------------------
// SASL mechanism resolver
// ---------------------------------------------------------------------------

const resolveMechanism = (
  value: string,
): "plain" | "scram-sha-256" | "scram-sha-512" => {
  switch (value.toLowerCase()) {
    case "scram-sha-256":
      return "scram-sha-256";
    case "scram-sha-512":
      return "scram-sha-512";
    default:
      return "plain";
  }
};

// ---------------------------------------------------------------------------
// Broker list parser
// ---------------------------------------------------------------------------

function parseBrokers(raw?: string): string[] {
  return (raw ?? "localhost:9092")
    .split(",")
    .map((broker) => broker.trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Connection & retry config from environment
// ---------------------------------------------------------------------------

function readEnvInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

// ---------------------------------------------------------------------------
// KafkaJS custom log creator — routes KafkaJS internal logs through our
// structured logger so they appear in the same format as application logs.
// ---------------------------------------------------------------------------

function createKafkaLogCreator() {
  return () =>
    ({ level, log }: { level: number; log: { message: string; [key: string]: unknown } }) => {
      const { message, ...extra } = log;
      switch (level) {
        case KafkaLogLevel.ERROR:
          logger.error(`[KafkaJS] ${message}`, extra);
          break;
        case KafkaLogLevel.WARN:
          logger.warn(`[KafkaJS] ${message}`, extra);
          break;
        case KafkaLogLevel.INFO:
          logger.info(`[KafkaJS] ${message}`, extra);
          break;
        case KafkaLogLevel.DEBUG:
          logger.info(`[KafkaJS:debug] ${message}`, extra);
          break;
        default:
          break;
      }
    };
}

// ---------------------------------------------------------------------------
// Factory: createKafkaClient
// ---------------------------------------------------------------------------

/**
 * Creates a configured KafkaJS client instance.
 *
 * Each service should call this with its own `serviceName` so that the Kafka
 * broker can distinguish clients in its logs (via `clientId`).
 *
 * Environment variables:
 * - `KAFKA_BROKERS` — comma-separated broker list (default: `localhost:9092`)
 * - `KAFKA_CLIENT_ID` — overrides `serviceName` if set
 * - `KAFKA_LOG_LEVEL` — `nothing | error | warn | info | debug` (default: `warn`)
 * - `KAFKA_SSL` — `true` to enable TLS
 * - `KAFKA_SASL_USERNAME`, `KAFKA_SASL_PASSWORD`, `KAFKA_SASL_MECHANISM`
 * - `KAFKA_CONNECTION_TIMEOUT_MS` — default `3000`
 * - `KAFKA_REQUEST_TIMEOUT_MS` — default `30000`
 * - `KAFKA_RETRY_INITIAL_TIME_MS` — default `300`
 * - `KAFKA_RETRY_MAX_RETRIES` — default `10`
 */
export function createKafkaClient(serviceName = "kafka-service"): Kafka {
  const clientId = process.env.KAFKA_CLIENT_ID?.trim() || serviceName;
  const brokers = parseBrokers(process.env.KAFKA_BROKERS);

  const config: KafkaConfig = {
    clientId,
    brokers,
    logLevel: resolveLogLevel(),
    logCreator: createKafkaLogCreator(),
    connectionTimeout: readEnvInt("KAFKA_CONNECTION_TIMEOUT_MS", 3_000),
    requestTimeout: readEnvInt("KAFKA_REQUEST_TIMEOUT_MS", 30_000),
    retry: {
      initialRetryTime: readEnvInt("KAFKA_RETRY_INITIAL_TIME_MS", 300),
      retries: readEnvInt("KAFKA_RETRY_MAX_RETRIES", 10),
    },
  };

  // SSL
  const shouldUseSsl =
    (process.env.KAFKA_SSL ?? "false").toLowerCase() === "true";
  if (shouldUseSsl) {
    config.ssl = true;
  }

  // SASL
  const kafkaUsername = process.env.KAFKA_SASL_USERNAME;
  const kafkaPassword = process.env.KAFKA_SASL_PASSWORD;
  const kafkaMechanism = process.env.KAFKA_SASL_MECHANISM ?? "plain";

  if (kafkaUsername && kafkaPassword) {
    const mechanism = resolveMechanism(kafkaMechanism);

    if (mechanism === "scram-sha-256") {
      config.sasl = {
        mechanism: "scram-sha-256",
        username: kafkaUsername,
        password: kafkaPassword,
      };
    } else if (mechanism === "scram-sha-512") {
      config.sasl = {
        mechanism: "scram-sha-512",
        username: kafkaUsername,
        password: kafkaPassword,
      };
    } else {
      config.sasl = {
        mechanism: "plain",
        username: kafkaUsername,
        password: kafkaPassword,
      };
    }
  }

  return new Kafka(config);
}

// ---------------------------------------------------------------------------
// Default singleton — backward-compatible export
// ---------------------------------------------------------------------------

/**
 * Default Kafka client singleton. Uses `KAFKA_CLIENT_ID` env var or falls
 * back to `"kafka-service"`.
 *
 * @deprecated Prefer `createKafkaClient(serviceName)` for per-service client IDs.
 */
export const kafka = createKafkaClient();
