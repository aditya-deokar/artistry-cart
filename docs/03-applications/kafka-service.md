# Kafka Service

## Overview

`kafka-service` is the analytics ingestion worker for the platform. It consumes user-behavior events from Kafka, validates them, updates analytics read models in MongoDB, and exposes a small HTTP management surface for health and metrics.

This service is the bridge between asynchronous product activity capture and recommendation-ready analytics.

## Responsibilities

- subscribe to the configured user events topic
- validate and normalize analytics event payloads
- update `UserAnalytics`
- update `productAnalytics`
- update `shopAnalytics` and `uniqueShopVisitor` for shop visits
- retry transient write failures with backoff
- dead-letter invalid or exhausted events when a DLQ topic is configured

## Inbound Interfaces

This service has two inbound interfaces:

- Kafka topic subscription for analytics events
- HTTP management endpoints for health and observability

Primary topic:

- `user-events` or the configured `KAFKA_USER_EVENTS_TOPIC`

Management endpoints:

- `GET /`
- `GET /healthz`
- `GET /readyz`
- `GET /metrics`

## Outbound Dependencies

- Kafka via the shared Kafka client package
- MongoDB via Prisma
- analytics logic in `src/services/analytics.ts`

## Internal Structure

Key files:

- `src/main.ts`
- `src/config.ts`
- `src/services/events.ts`
- `src/services/analytics.ts`
- `src/services/worker.ts`

## Runtime Behavior

- creates a Kafka consumer with validated config
- subscribes to the configured topic
- processes Kafka batches with manual offset commits
- only advances offsets after events are persisted or explicitly dead-lettered
- retries transient failures with bounded exponential backoff
- validates message shape before any database write
- tracks per-document processed event keys so retries stay idempotent
- exposes Prometheus-compatible worker metrics

## Data Touch Points

Primary write targets:

- `UserAnalytics`
- `productAnalytics`
- `shopAnalytics`
- `uniqueShopVisitor`

The worker also stores the latest known user country, city, and device on `UserAnalytics`, and it records those values inside action history entries for traceability.

## Strengths

- avoids acknowledging Kafka offsets before analytics work is complete
- has explicit schema validation and dead-letter support
- keeps retry semantics inside the worker instead of hiding write failures
- materializes user, product, and shop analytics from one event pipeline

## Tradeoffs

- producer consistency now depends on the frontend and `order-service` staying aligned with the shared event contract
- purchase delivery durability now relies on the `order-service` analytics outbox staying healthy and draining promptly
- lag-aware autoscaling is still a platform concern rather than something this service solves alone

## Future Hardening

- add KEDA or another lag-aware autoscaling strategy
- move topic creation and contract governance into platform automation
- add contract-version rollout checks between producers and the worker
