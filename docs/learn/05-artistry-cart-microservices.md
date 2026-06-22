# Artistry Cart Microservices Architecture

## Runtime Overview

Artistry Cart is a service-oriented commerce platform.

The main runtime components are:

- `user-ui`: buyer storefront
- `seller-ui`: seller dashboard
- `api-gateway`: client-facing backend entry point
- `auth-service`: identity and authentication
- `product-service`: catalog, shops, search, pricing, events, discounts, and offers
- `order-service`: checkout, orders, Stripe payments, webhooks, and seller-order flows
- `recommendation-service`: recommendation APIs
- `aivision-service`: AI generation, visual search, gallery, concepts, artisans, and background jobs
- `kafka-service`: analytics event consumer
- MongoDB via Prisma: primary persistence
- Redis: auxiliary runtime support for selected flows
- Kafka: analytics event transport

## High-Level Request Flow

Most user-facing backend requests follow this shape:

```text
Browser -> Next.js app -> api-gateway -> backend service -> MongoDB/Redis/external API
```

Example product browsing flow:

```text
Buyer browser -> user-ui -> api-gateway -> product-service -> MongoDB
```

Example checkout flow:

```text
Buyer browser -> user-ui -> api-gateway -> order-service -> Stripe/MongoDB
```

Example seller workflow:

```text
Seller browser -> seller-ui -> api-gateway -> product-service/order-service -> MongoDB
```

## Gateway Role

The gateway simplifies client access by giving the frontends one backend entry point.

It routes:

| Path prefix | Upstream service |
| --- | --- |
| `/auth` | `auth-service` |
| `/product` | `product-service` |
| `/order` | `order-service` |
| `/recommendation` | `recommendation-service` |
| `/ai-vision` | `aivision-service` |

The gateway should stay thin. If business logic moves into the gateway, it can become a distributed monolith bottleneck.

## Service Responsibilities

### Auth Service

Owns:

- registration
- login
- token flows
- OAuth providers
- cookies
- user and seller identity
- activation and email flows
- shop onboarding touchpoints

Why separate:

- identity is security-sensitive
- auth changes affect many clients
- OAuth, tokens, and cookies are complex enough to isolate

### Product Service

Owns:

- products
- shops
- search
- pricing
- offers
- discounts
- events
- product cleanup jobs

Why separate:

- catalog is a core business domain
- search and pricing evolve independently
- seller dashboard features often touch this service

### Order Service

Owns:

- checkout
- order creation
- seller order views
- payment sessions
- Stripe webhooks
- order emails

Why separate:

- payments are operationally sensitive
- webhook correctness matters
- order state has different consistency and reliability concerns than product browsing

### Recommendation Service

Owns:

- recommendation API responses
- recommendation scoring logic
- user activity based suggestions

Why separate:

- recommendations can become compute-heavy
- recommendation logic evolves differently from transactional CRUD APIs
- later it can move toward offline model generation or specialized serving

### Kafka Service

Owns:

- consuming user activity events
- validating analytics messages
- updating user analytics
- updating product analytics

Why separate:

- analytics ingestion should not slow down the buyer UI
- event consumption has different scaling and failure behavior than request handling

### AI Vision Service

Owns:

- AI generation workflows
- concepts
- gallery
- visual search
- artisan matching
- sessions
- embeddings
- AI usage aggregation
- background jobs through Agenda

Why separate:

- AI dependencies are heavy and specialized
- AI APIs have different latency, cost, and failure characteristics
- background embedding and cleanup jobs do not belong in product or order services

## Event-Driven Analytics Flow

The clearest event-driven flow is user activity analytics.

```text
user-ui -> Kafka topic user-events -> kafka-service -> MongoDB analytics -> recommendation-service
```

Why this is useful:

- buyer interactions do not wait for analytics writes
- Kafka buffers bursts
- analytics materialization is centralized
- recommendations can consume prepared behavior data later

This is not yet a full event-sourced system. Kafka is focused mainly on analytics, not every domain change.

## Shared Packages

Shared packages are the glue of the monorepo.

| Package | Role |
| --- | --- |
| `packages/error-handler` | shared error classes and Express error middleware |
| `packages/middleware` | auth and role middleware |
| `packages/libs/prisma` | shared Prisma client entry point |
| `packages/libs/redis` | Redis initialization and fallback support |
| `packages/libs/imageKit` | ImageKit client initialization |
| `packages/utils/kafka` | Kafka client and analytics event helpers |
| `packages/test-utils` | shared mocks, factories, request helpers, and test setup |

Shared packages should stay infrastructure-focused. If they start containing too much domain behavior, service boundaries become blurry.

## Data Architecture Reality

All major backend services use MongoDB through Prisma.

This is convenient because:

- one schema is easier to inspect
- local development is simpler
- cross-service data is easy to query
- shared Prisma types improve developer speed

But it creates tradeoffs:

- services are coupled through database models
- schema migrations require coordination
- one service can accidentally depend on another service's data internals
- database-level ownership is weaker

The honest architecture statement:

> Artistry Cart has clear service boundaries at the application layer, but shared persistence means it is not fully autonomous microservices yet.

## Deployment Shape

The repository includes:

- Dockerfiles for frontend and backend services
- Docker Compose files for local/full/test environments
- Kubernetes base manifests and overlays
- CI workflows that build and test services

This supports service-by-service deployment, even though the source is in one repository.

## What Makes This A Good Learning Project

It contains real architecture tensions:

- shared code versus independent services
- synchronous APIs versus asynchronous analytics
- gateway simplicity versus gateway centralization
- fast monorepo development versus strict service autonomy
- AI-heavy workflows separated from core commerce
- e2e tests against multiple running services

Those tensions are exactly what interviewers want to hear you reason about.

