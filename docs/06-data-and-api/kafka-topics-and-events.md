# Kafka Topics And Events

## Overview

Kafka is used for asynchronous user-activity ingestion that feeds analytics and recommendation workflows.

## Current Producer And Consumer Roles

### Producer

Visible producer:

- `user-ui` server action in `src/actions/track-user.ts`

### Consumer

Visible consumer:

- `kafka-service`

## Topic Contract

### Configured consumer topic

The Kafka consumer uses:

- `KAFKA_USER_EVENTS_TOPIC`
- default fallback: `user-events`

### Optional dead-letter topic

The worker can publish rejected or exhausted events to:

- `KAFKA_DLQ_TOPIC`
- recommended default: `user-events.dlq`

## Event Shape

The current analytics payload supports:

- `eventId` optional
- `userId`
- `productId` for all non-shop events
- `shopId` optional when it can be derived from `productId`
- `action`
- `device`
- `country`
- `city`
- `timestamp` optional

## Action Vocabulary

Recognized actions include:

- `add_to_wishlist`
- `add_to_cart`
- `product_view`
- `remove_from_wishlist`
- `remove_from_cart`
- `purchase`
- `shop_visit`

## Consumer Semantics

The consumer now:

- validates event payloads before persistence
- processes Kafka batches with manual offset commits
- retries transient failures with bounded backoff
- dead-letters invalid events when configured
- dead-letters exhausted transient failures when configured
- stores recent processed event keys on analytics documents so retries stay idempotent
- updates:
  - `UserAnalytics`
  - `productAnalytics`
  - `shopAnalytics`
  - `uniqueShopVisitor`

## Read-Side Impact

This event stream supports:

- recommendation inputs
- product engagement metrics
- shop visit analytics
- user behavior history

## Design Strengths

- async capture protects buyer-facing latency
- the consumer no longer acknowledges offsets before persistence
- event payload validation is explicit instead of best-effort
- DLQ support gives operators a place to inspect poison messages

## Design Constraints

- some producer paths in the repo still do not emit the full action set
- purchase analytics are not yet fully standardized on the Kafka path across services
- topic governance still lives in code and docs rather than a dedicated schema registry

## Recommended Future Contract Hardening

- standardize all producers on the same event contract module
- add a versioned event envelope once multiple producers are active
- add lag dashboards and autoscaling around consumer group lag
