# Artistry Cart System Design Walkthrough

## Opening Pitch

Use this as your first 60 seconds:

> Artistry Cart is a service-oriented artisan commerce platform built as an Nx monorepo. It has separate buyer and seller Next.js frontends, an Express API gateway, backend services for auth, products, orders, recommendations, AI Vision, and Kafka analytics ingestion, plus shared packages for Prisma, Redis, Kafka, middleware, error handling, and tests. The system uses MongoDB through Prisma, Redis for selected fast paths, Kafka for async analytics, Stripe for payments, and Kubernetes for deployment.

Then add the honest framing:

> I would describe it as a practical service-oriented monorepo rather than pure microservices because the services share a MongoDB/Prisma persistence layer.

## Whiteboard Order

Use this order:

1. User surfaces
2. API gateway
3. Core services
4. Data layer
5. Async analytics
6. Payments and webhooks
7. AI Vision boundary
8. Operations and tradeoffs

## User Surfaces

Buyers use:

```text
user-ui
```

Sellers use:

```text
seller-ui
```

Why separate:

- buyer and seller workflows differ
- buyer UX focuses on discovery and commerce
- seller UX focuses on product, shop, offer, and order management

## Gateway

`api-gateway` gives the frontends one backend entry point.

It handles:

- routing
- CORS
- body parsing
- cookie parsing
- rate limiting
- proxying to backend services

Strong explanation:

```text
The gateway keeps backend topology out of the frontends and gives the platform a future place for cross-cutting policy and tracing.
```

## Services

Main services:

- `auth-service`: identity, OAuth, tokens, account flows
- `product-service`: catalog, shops, search, pricing, offers, events
- `order-service`: checkout, Stripe sessions, webhooks, orders, payouts
- `recommendation-service`: recommendation serving
- `kafka-service`: analytics materialization worker
- `aivision-service`: AI generation, visual search, concepts, embeddings, jobs

## Data Layer

The system uses:

```text
MongoDB + Prisma
```

Strong explanation:

```text
MongoDB fits flexible product, analytics, and AI-oriented documents. Prisma gives typed access and a shared schema. The tradeoff is that service data ownership is softer than in database-per-service microservices.
```

## Async Analytics

Flow:

```text
user activity -> Kafka -> kafka-service -> UserAnalytics -> recommendation-service
```

Why:

```text
analytics and personalization signals should not slow down browse, cart, or checkout requests
```

Tradeoff:

```text
eventual consistency and more operational complexity
```

## Payments

Flow:

```text
buyer checkout -> order-service -> Stripe
Stripe webhook -> order-service -> order/payment state
```

Design concerns:

- webhook signature verification
- idempotency
- durable state
- retry safety
- not trusting only frontend redirects

## AI Vision

AI Vision is separate because it has:

- external model providers
- media handling
- embeddings
- background jobs
- higher latency
- higher cost
- different failure modes

Strong explanation:

```text
AI Vision is not just a utility function. It has a different runtime profile from transactional commerce APIs, so it deserves its own boundary.
```

## Operations

Artistry Cart has:

- Dockerfiles and Compose
- Kubernetes manifests and overlays
- HPA and probes
- GitHub Actions CI/CD
- `/healthz`, `/readyz`, and `/metrics`
- optional Prometheus monitoring addon

## Close With Maturity

Strong close:

> The architecture is intentionally pragmatic. It already has meaningful domain and runtime boundaries, but the next maturity step is operational hardening: stronger contracts, deeper observability, clearer data ownership, more offline recommendation processing, and better load testing.

## One-Minute Version

> Artistry Cart is a service-oriented Nx monorepo with two Next.js frontends and backend services for auth, catalog, orders, recommendations, analytics, and AI Vision. Client traffic enters through an API gateway. MongoDB and Prisma provide the shared data layer, Redis supports fast paths, Kafka decouples analytics from foreground requests, and Stripe handles payment workflows through webhooks. The strongest design decisions are the separate buyer/seller surfaces, async analytics pipeline, and dedicated AI boundary. The biggest tradeoff is shared persistence, so I would describe it as service-oriented with shared data rather than textbook microservices.
