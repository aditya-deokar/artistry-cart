# ADR-004: Kafka Analytics Pipeline

## Status

Accepted

## Decision Summary

User-behavior analytics travel through Kafka, and `kafka-service` materializes those events into MongoDB-backed analytics records that recommendation flows can consume.

## Context

The platform wants to capture actions such as:

- product views
- cart interactions
- wishlist activity
- purchases and post-purchase signals

Those actions are valuable for analytics and personalization, but they are not equally critical to the foreground user request that triggered them.

## Problem

We needed analytics capture that would not slow down browsing, shopping, or checkout, while still creating a reusable signal stream for recommendation work.

## Decision

Use Kafka as the asynchronous event transport and keep analytics materialization in a dedicated `kafka-service` instead of writing all analytics synchronously in request handlers.

## Why This Fits The Current Repo

- Foreground commerce latency stays cleaner.
- Recommendation logic can read from accumulated behavioral state instead of tightly coupling itself to every user request.
- The event pipeline creates a foundation for future analytics consumers beyond recommendations.
- It matches the platform's real need for asynchronous processing rather than adding event infrastructure only for architecture theater.

## Consequences

### Positive

- Lower latency pressure on transactional flows
- Cleaner separation between event producers and analytics consumers
- Better long-term extensibility for personalization and reporting
- A durable boundary for user activity data

### Negative

- Eventual consistency
- More operational complexity than direct writes
- Harder debugging when topics, consumers, or schemas drift
- Topic naming and consumer defaults become production-critical details

## Alternatives Considered

### Direct synchronous analytics writes

Rejected because it would place non-critical persistence work directly in user-facing request paths.

### Recommendation service owning analytics capture directly

Rejected because it would mix event ingestion responsibilities with recommendation serving and make the system harder to evolve.

## Follow-Up Work

- standardize topic naming and event schema conventions
- add better lag, retry, and failure visibility
- decide which recommendation computations should move farther offline

## Related Docs

- [Event Flows](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/02-architecture/event-flows.md>)
- [Kafka Service](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/03-applications/kafka-service.md>)
- [Kafka Topics And Events](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/06-data-and-api/kafka-topics-and-events.md>)
