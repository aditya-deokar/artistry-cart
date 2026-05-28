# Kafka Service

## Overview

`kafka-service` is the asynchronous analytics ingestion worker. It consumes user-activity events from Kafka, batches them in memory, materializes analytics records into MongoDB, and now exposes a small HTTP management surface for health and metrics.

This service is a key bridge between user interaction telemetry and recommendation/analytics reads.

## Responsibilities

- subscribe to the user-events topic
- parse incoming analytics messages
- batch-process events on an interval
- update `UserAnalytics`
- update `productAnalytics`

## Inbound Interfaces

This service has two inbound interfaces:

- Kafka topic subscription for analytics events
- HTTP management endpoints for health and observability

Primary topic:

- `user-events` or the configured `KAFKA_USER_EVENTS_TOPIC`

Management endpoints:

- `/healthz`
- `/readyz`
- `/metrics`

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
- exposes readiness based on Kafka consumer connection state
- exposes Prometheus-compatible worker metrics

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
- the worker now has better platform visibility, but still lacks true lag-aware autoscaling

## Future Hardening

- add stronger event schema governance
- add monitoring for lag, failures, and dropped events
- consider durable retry or dead-letter handling
- add KEDA or another lag-aware scaling strategy
