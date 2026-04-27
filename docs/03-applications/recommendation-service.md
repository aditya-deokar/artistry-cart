# Recommendation Service

## Overview

`recommendation-service` exposes recommendation APIs backed by user behavior captured elsewhere in the system. It relies on previously materialized analytics data and applies TensorFlow-based scoring logic to produce recommended products.

## Responsibilities

- serve product recommendations for authenticated users
- read behavioral history from `UserAnalytics`
- train or score recommendation outputs in-process
- cache recommendation outputs back into analytics records with a retraining window

## Inbound Interfaces

Mounted under `/api` in the service and proxied through `/recommendation/api`-style gateway paths.

Current route surface:

- `GET /api/recommendations/:userId`

This route requires authentication.

## Outbound Dependencies

- MongoDB via Prisma
- shared auth middleware
- TensorFlow.js
- preprocessing and fetch-user-activity helper modules

## Internal Structure

Key folders:

- `controllers/`
- `routes/`
- `services/`
- `utils/`

Key files:

- `src/controllers/recommendation-controller.ts`
- `src/services/recommendation-service.ts`
- `src/services/fetch-user-activity.ts`

## Data Touch Points

Primary records read or written:

- `products`
- `UserAnalytics.actions`
- `UserAnalytics.recommendations`
- `UserAnalytics.lastTrained`

## Runtime Behavior

- listens on `6005` by default
- exposes a simple root health-style endpoint
- performs recommendation compute in the request path
- uses a simple reuse window: if recommendations were trained recently and cached, it reuses them
- falls back to the most recent products when user activity is insufficient

## Recommendation Strategy

Current high-level behavior:

- fetch all products
- fetch the user’s analytics record
- if no analytics exists or action history is too small, return a basic fallback set
- if cached recommendations are fresh enough, reuse them
- otherwise compute recommendations and write them back

## Tests

The service includes:

- controller spec
- recommendation service spec
- fetch-user-activity spec
- route integration spec
- dedicated e2e project in `apps/recommendation-service-e2e`

## Strengths

- clear separation between analytics ingestion and recommendation serving
- fallback behavior exists for cold-start users
- recommendation outputs are cached back into the analytics model

## Tradeoffs

- request-time model scoring is simple to implement but increases latency and limits scalability
- behavior is tightly coupled to the structure and freshness of `UserAnalytics`
- current public surface is narrow, which is good for focus but may require expansion later

## Future Hardening

- move more recommendation generation work off the request path
- formalize model training cadence and freshness strategy
- add better observability for cold-start rate, retrain rate, and response latency
