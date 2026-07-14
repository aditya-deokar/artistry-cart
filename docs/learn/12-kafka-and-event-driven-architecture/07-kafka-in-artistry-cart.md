# Kafka In Artistry Cart

## Where Kafka Fits

Artistry Cart uses Kafka mainly for user activity analytics.

High-level flow:

```text
user-ui
  -> Kafka
  -> kafka-service
  -> MongoDB analytics
  -> recommendation-service
```

Kafka keeps analytics processing out of the foreground user request path.

## Main Components

### Producer Side

Producer behavior lives around user activity tracking.

It sends events such as:

- product view
- add to cart
- wishlist action
- purchase behavior
- location/device metadata when relevant

Shared Kafka utilities live under:

```text
packages/utils/kafka
```

### Kafka Broker

Kafka broker stores events in topics.

Local infrastructure includes Kafka-related Compose assets and Kafka UI for inspection.

### Consumer Side

`apps/kafka-service` consumes analytics events.

It materializes:

- user analytics
- product analytics
- action history
- counters used by recommendations and dashboards

## Why This Design Makes Sense

Analytics should not block the buyer experience.

Example:

```text
buyer views product
  -> UI should stay fast
  -> analytics can update later
```

Kafka provides buffering and decoupling between event producers and analytics consumers.

## Recommendation Connection

Recommendation service can read materialized analytics from MongoDB.

This means:

```text
event capture is async
recommendation response is sync
```

The recommendation API can use already-prepared behavior data instead of making the UI wait for analytics writes.

## Current Maturity Level

Strong parts:

- event-driven analytics path with exactly-once production semantics
- dedicated Kafka worker service with manual offset commits
- shared Kafka utilities (idempotent producer, analytics contract, admin, health probes)
- KRaft-native broker (no ZooKeeper)
- Redpanda Console for local Kafka inspection
- clear separation from request path
- Zod schema contracts with versioning (`SUPPORTED_SCHEMA_VERSIONS`)
- dead-letter queue (DLQ) for malformed or exhausted events
- exponential backoff retry with jitter for producer and consumer
- correlation ID propagation for distributed tracing
- Prometheus-compatible consumer metrics (`/metrics`)

Maturity areas:

- schema registry integration (currently code-driven Zod contracts)
- consumer lag alerting rules
- event replay tooling

## Actual Event Contract

The analytics event shape is defined by Zod in `packages/utils/kafka/analytics-contract.ts`:

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "action": "product_view",
  "schemaVersion": 1,
  "timestamp": "2026-06-10T10:00:00.000Z",
  "userId": "u1",
  "productId": "p1",
  "source": "user-ui",
  "quantity": 1,
  "correlationId": "req-abc-123",
  "device": "desktop",
  "city": "Mumbai",
  "country": "IN"
}
```

## Operational Questions To Be Ready For

Be ready to answer:

- What happens if Kafka is down?
- What happens if consumer is behind?
- How do you avoid duplicate analytics?
- How do you validate event shape?
- How do you evolve event schema?
- How do you inspect events locally?
- How do you replay events?

## Interview Explanation

If asked "How does Kafka work in Artistry Cart?", say:

> Kafka is used for analytics ingestion with production-grade reliability. User activity events are produced from the frontend using an idempotent KafkaJS producer and written to a `user-events` topic. `kafka-service` consumes events in batches with manual offset commits, validates them with Zod schema contracts, and materializes user/product/shop analytics into MongoDB. Failed events are routed to a dead-letter queue. `recommendation-service` reads the prepared analytics data. This keeps analytics writes off the main user request path while maintaining exactly-once production semantics and at-least-once consumption.

