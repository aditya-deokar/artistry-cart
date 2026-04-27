# Kafka Topics And Events

## Overview

Kafka is currently used for asynchronous user-activity ingestion that feeds analytics and recommendation workflows.

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
- default fallback: `users-events`

### Hardcoded producer topic

The inspected producer sends to:

- `user-events`

## Important Note

There is a naming discrepancy between:

- producer topic: `user-events`
- consumer/config default topic: `users-events`

This should be treated as a real contract risk and cleaned up or documented clearly in operational setup.

## Event Shape

The event payload currently supports:

- `userId`
- `productId`
- `shopId`
- `action`
- `device`
- `country`
- `city`
- optional `timestamp`

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

The consumer:

- buffers events in memory
- processes them on a timer
- ignores invalid actions
- skips `shop_visit` expansion for now
- updates:
  - `UserAnalytics`
  - `productAnalytics`

## Read-Side Impact

This event stream ultimately supports:

- recommendation inputs
- product engagement metrics
- user behavior history

## Design Strengths

- async capture protects buyer-facing latency
- event payload shape is compact and domain-relevant
- materialized analytics records are directly useful downstream

## Design Constraints

- event schema governance is code-driven rather than formalized
- topic naming inconsistency is a real contract hazard
- in-memory batching means crash-before-flush is a possible data-loss scenario

## Recommended Future Contract Hardening

- normalize topic naming
- version or formalize event schemas
- document replay and failure-handling expectations
- add lag and delivery monitoring
