# Performance

## Overview

The platform shows several practical performance-minded decisions, but it is still optimized more for delivery speed and feature richness than for rigorous high-scale tuning.

## Current Performance Strengths

### Async analytics ingestion

User activity is captured asynchronously through Kafka and processed by `kafka-service`. This keeps recommendation and analytics writes off the buyer's foreground request path.

### Cached effective pricing

Products store:

- `current_price`
- `is_on_discount`

This avoids recomputing every merchandising rule on every read and improves browse-path performance.

### Recommendation reuse window

`recommendation-service` stores cached recommendation ids and retraining timestamps in `UserAnalytics`. That reduces repeated compute for recently trained users.

### Redis graceful path

Redis-backed support behavior can provide faster paths where available, while degraded mode avoids total platform failure.

### Frontend server-state caching

`user-ui` uses React Query with a 5-minute default stale time in the provider, and recommendation queries use a 15-minute stale time. That lowers repeated fetch pressure in common client flows.

## Current Performance Constraints

### Recommendation compute in request path

The recommendation service still performs TensorFlow-based scoring during request handling in some paths. This is workable at current scope, but it does not represent a high-scale serving architecture.

### Shared database for many services

One MongoDB schema backs many backend services. This simplifies development, but it can create contention and make scaling bottlenecks less isolated.

### Heavy AI Vision paths

AI Vision routes involve:

- model calls
- media handling
- embeddings
- background maintenance

These are naturally higher-latency and higher-cost paths than ordinary catalog reads.

### In-memory Kafka buffering

The analytics worker batches in memory, which is cheap and simple, but not optimal for durability or precise throughput control.

## Useful Existing Design Choices

- product-service soft-delete cleanup runs asynchronously on a cron rather than in foreground user flows
- AI Vision embedding and cleanup jobs run in Agenda instead of being forced into request handlers
- frontend API rewrites reduce some client complexity, even if they add a gateway hop

## Areas Most Likely To Matter At Scale

- recommendation latency
- AI Vision generation and search latency
- payment webhook throughput and reliability
- cross-service reliance on the same database
- large catalog query efficiency

## Recommended Next Steps

- move more recommendation training/scoring off the request path
- add query and route latency measurements
- standardize performance budgets for AI routes
- revisit shared-database boundaries if traffic grows significantly
- add explicit cache strategy docs for high-read catalog paths

## Interview Framing

The strongest framing is:

- the codebase already contains practical performance optimizations where they matter most
- the next scale step would be operational specialization, not just micro-optimizing individual functions
