# Local Kafka Development Guide

This guide explains how to start, monitor, and troubleshoot the Kafka infrastructure used by the Artistry Cart monorepo.

## 🚀 Quick Start

To spin up the local Kafka cluster, you have three options:

1. **Using NPM/PNPM (Recommended)**
   ```bash
   pnpm run infra:up
   ```

2. **Using the PowerShell Helper Script (Windows)**
   ```powershell
   .\scripts\kafka-dev.ps1 start
   ```

3. **Using Docker Compose directly**
   ```bash
   docker compose -f docker/compose/docker-compose.infra.yml up -d
   ```

## 🛠 Features of the Local Setup

- **KRaft Mode**: We run Apache Kafka in KRaft mode. ZooKeeper is no longer required or used!
- **Auto-Provisioning**: Topics (`user-events` and `user-events.dlq`) are created automatically at startup.
- **Dual Listeners**:
  - `kafka:29092`: Internal port for Docker containers (e.g. `kafka-service`, `order-service`)
  - `localhost:9092`: External port for host machine (your local `node` scripts)

## 📊 Redpanda Console (Kafka UI)

We use [Redpanda Console](https://github.com/redpanda-data/console) instead of Provectus Kafka UI for a modern, lightweight experience.

- **URL**: [http://localhost:8089](http://localhost:8089)
- **Use it to**:
  - Browse topics and view messages in real-time.
  - Monitor consumer group lag (e.g. `user-events-group`).
  - Read Dead Letter Queue (`user-events.dlq`) payloads.

## 🧪 Testing the Pipeline

You can produce a test event using the helper script:

```powershell
.\scripts\kafka-dev.ps1 produce user-events '{"userId": "test-123", "action": "product_view", "eventId": "evt-001"}'
```

To tail the consumer output:
```powershell
.\scripts\kafka-dev.ps1 consume user-events
```

## 🧹 Cleaning Up

To stop the infrastructure without losing your Kafka topics/data:
```bash
pnpm run infra:down
# OR
.\scripts\kafka-dev.ps1 stop
```

To completely **wipe** all Kafka data and reset topics:
```bash
pnpm run infra:reset
# OR
.\scripts\kafka-dev.ps1 reset
```

## 🐛 Troubleshooting

1. **"Failed to connect to broker" in Node.js**
   Check that `KAFKA_BROKERS="localhost:9092"` is set in your `.env`. If a Docker container is failing to connect, ensure its `docker-compose.yml` sets `KAFKA_BROKERS: kafka:29092` and joins the `data` network.

2. **"Unknown topic or partition"**
   Ensure you're using the standard topic name (`user-events`) and not the plural `users-events`. If the topic was deleted, run `pnpm run infra:reset` followed by `pnpm run infra:up` to trigger the auto-provisioning container.

3. **Silent message drops**
   If local events aren't appearing in the DB, check the DLQ topic via Redpanda Console. The message might have failed Zod schema validation (missing `eventId`, `timestamp`, etc).
