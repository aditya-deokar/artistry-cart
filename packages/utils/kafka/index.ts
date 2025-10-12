import { Kafka, KafkaConfig, logLevel } from "kafkajs";

const brokers = (process.env.KAFKA_BROKERS ?? "localhost:9092")
    .split(",")
    .map((broker) => broker.trim())
    .filter(Boolean);

const kafkaConfig: KafkaConfig = {
    clientId: process.env.KAFKA_CLIENT_ID ?? "kafka-service",
    brokers,
    logLevel: logLevel.NOTHING,
};

const resolveMechanism = (value: string): "plain" | "scram-sha-256" | "scram-sha-512" => {
    switch (value.toLowerCase()) {
        case "scram-sha-256":
            return "scram-sha-256";
        case "scram-sha-512":
            return "scram-sha-512";
        default:
            return "plain";
    }
};

const shouldUseSsl = (process.env.KAFKA_SSL ?? "false").toLowerCase() === "true";
const kafkaUsername = process.env.KAFKA_SASL_USERNAME;
const kafkaPassword = process.env.KAFKA_SASL_PASSWORD;
const kafkaMechanism = process.env.KAFKA_SASL_MECHANISM ?? "plain";

if (shouldUseSsl) {
    kafkaConfig.ssl = true;
}

if (kafkaUsername && kafkaPassword) {
    const mechanism = resolveMechanism(kafkaMechanism);

    if (mechanism === "scram-sha-256") {
        kafkaConfig.sasl = {
            mechanism: "scram-sha-256",
            username: kafkaUsername,
            password: kafkaPassword,
        };
    } else if (mechanism === "scram-sha-512") {
        kafkaConfig.sasl = {
            mechanism: "scram-sha-512",
            username: kafkaUsername,
            password: kafkaPassword,
        };
    } else {
        kafkaConfig.sasl = {
            mechanism: "plain",
            username: kafkaUsername,
            password: kafkaPassword,
        };
    }
}

export const kafka = new Kafka(kafkaConfig);
