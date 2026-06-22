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

- event-driven analytics path
- dedicated Kafka worker service
- shared Kafka utilities
- local Kafka tooling
- clear separation from request path

Maturity areas:

- event schema versioning
- dead-letter topic strategy
- retry policy
- lag monitoring and alerts
- event id deduplication
- contract tests for producer/consumer event shape

## Example Event Contract

Possible analytics event shape:

```json
{
  "eventId": "evt_123",
  "eventType": "ProductViewed",
  "version": 1,
  "occurredAt": "2026-06-10T10:00:00.000Z",
  "userId": "u1",
  "productId": "p1",
  "metadata": {
    "device": "desktop",
    "source": "product-page"
  }
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

> Kafka is used for analytics ingestion. User activity events are produced from the frontend side and written to a Kafka topic. `kafka-service` consumes those events, validates them, and materializes user/product analytics into MongoDB. `recommendation-service` can later read that prepared analytics data. This keeps analytics writes off the main user request path.

