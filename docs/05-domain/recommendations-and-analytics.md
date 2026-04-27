# Recommendations And Analytics

## Domain Summary

This domain captures user behavior, materializes analytics records, and serves product recommendations based on that behavioral data.

It is intentionally split between asynchronous ingestion and synchronous serving.

## Owning Components

- `user-ui` event emission
- `packages/utils/kafka`
- `kafka-service`
- `recommendation-service`

## Core Data Models

- `UserAnalytics`
- `productAnalytics`

## Main Flows

### Event capture

- user actions in `user-ui` are published to Kafka
- events include actions such as:
  - `product_view`
  - `add_to_cart`
  - `add_to_wishlist`
  - `remove_from_cart`
  - `remove_from_wishlist`
  - `purchase`
  - `shop_visit`

### Analytics materialization

- kafka-service consumes events
- it updates user-level and product-level analytics documents
- action history is capped and normalized into a reusable read model

### Recommendation serving

- recommendation-service reads user action history
- falls back when history is too thin
- computes or reuses recommendation results
- returns recommended products to `user-ui`

## Domain Strengths

- behavior capture is asynchronous, which protects interactive latency
- analytics records are shaped for downstream reuse
- recommendations have a cold-start fallback strategy

## Tradeoffs

- eventual consistency between user action and recommendation freshness
- recommendation scoring still runs in request time
- topic naming and event-governance maturity still need tightening

## Interview Framing

This domain is a strong example of pragmatic event-driven architecture: asynchronous write-side capture with synchronous read-side personalization.
