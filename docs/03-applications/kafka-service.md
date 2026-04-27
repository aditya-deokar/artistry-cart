# Kafka Service

## Overview

`kafka-service` is the asynchronous analytics ingestion worker. It consumes user-activity events from Kafka, batches them in memory, and materializes analytics records into MongoDB.

This service is a key bridge between user interaction telemetry and recommendation/analytics reads.

## Responsibilities

- subscribe to the user-events topic
- parse incoming analytics messages
- batch-process events on an interval
- update `UserAnalytics`
- update `productAnalytics`

## Inbound Interfaces

This service does not expose HTTP endpoints. Its interface is the Kafka topic subscription.

Primary topic:

- `users-events` or the configured `KAFKA_USER_EVENTS_TOPIC`

The frontend producer currently sends to `user-events`, which is an implementation detail worth documenting carefully because topic naming consistency matters here.

## Outbound Dependencies

- Kafka via the shared Kafka client package
- MongoDB via Prisma
- analytics service logic in `src/services/analytics.ts`

## Internal Structure

Key files:

- `src/main.ts`
- `src/services/analytics.ts`

The service keeps its design intentionally small: boot consumer, buffer events, process buffer on a timer.

## Runtime Behavior

- creates a Kafka consumer with configured group id
- subscribes to the configured topic
- stores incoming events in an in-memory queue
- drains the queue every configured interval, default `3000ms`
- ignores invalid or unsupported actions
- currently skips `shop_visit` expansion until the write model is ready

## Data Touch Points

Primary write targets:

- `UserAnalytics`
- `productAnalytics`

It also enriches analytics state with optional country, city, and device metadata where present.

## Strengths

- keeps analytics writes off the synchronous request path
- small code surface makes the worker easy to reason about
- materialized analytics records are directly useful to recommendation reads

## Tradeoffs

- in-memory queueing is simple but fragile if the process crashes before the batch flush
- there is no documented dead-letter or retry strategy beyond basic error logging
- topic naming consistency should be tightened between config defaults and frontend producer behavior

## Future Hardening

- add stronger event schema governance
- add monitoring for lag, failures, and dropped events
- consider durable retry or dead-letter handling
- align topic naming conventions across producers and consumers
