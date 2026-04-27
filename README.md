# Artistry Cart

Artistry Cart is an Nx monorepo for a multi-surface commerce platform focused on artisan products. The repository contains:

- a buyer-facing storefront in `user-ui`
- a seller-facing dashboard in `seller-ui`
- backend services for auth, catalog, orders, recommendations, AI Vision, analytics ingestion, and gateway routing
- shared infrastructure packages for Prisma, Redis, Kafka, middleware, error handling, and test utilities

The platform combines conventional ecommerce capabilities with AI-assisted discovery flows, seller operations, pricing and event management, and event-driven analytics.

## What Is In This Repo

### Frontend apps

- `apps/user-ui`: Next.js storefront for shoppers
- `apps/seller-ui`: Next.js dashboard for sellers and shop management

### Backend services

- `apps/api-gateway`: request entry point and service proxy layer
- `apps/auth-service`: authentication, registration, OAuth, shop creation, and identity flows
- `apps/product-service`: products, shops, search, discounts, events, and offers
- `apps/order-service`: checkout, orders, Stripe payments, webhook handling, and seller payout-related flows
- `apps/recommendation-service`: recommendation APIs and recommendation logic
- `apps/kafka-service`: background consumer for analytics events
- `apps/aivision-service`: AI-assisted generation, concept workflows, gallery, artisans, and visual search

### Shared packages

- `packages/error-handler`
- `packages/middleware`
- `packages/test-utils`
- `packages/libs/prisma`
- `packages/libs/redis`
- `packages/libs/imageKit`
- `packages/utils/kafka`

### Supporting assets

- `prisma/`: MongoDB schema and seed data
- `libs/docker-compose.yml`: local Kafka and Kafka UI setup
- `.github/workflows/test.yml`: CI test pipeline
- `docs/`: canonical project documentation and legacy documentation sets

## Architecture Snapshot

At a high level:

- both frontends communicate through the API gateway or rewrites to backend APIs
- the gateway proxies traffic to the appropriate service
- Prisma connects services to MongoDB
- Redis is used for cache/session-adjacent flows in parts of the system
- Stripe powers payment and webhook flows
- Kafka captures asynchronous user activity for analytics and recommendations
- the AI Vision service isolates AI-heavy workflows from the main commerce APIs

The system is documented in more detail under [docs/README.md](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/README.md>).

## Core Stack

- Monorepo tooling: Nx, pnpm
- Frontend: Next.js 15, React 19, Tailwind CSS 4, Radix UI
- Backend: Express, TypeScript
- Database: MongoDB via Prisma
- Async/eventing: Kafka
- Cache/integration infra: Redis, ImageKit
- Payments: Stripe
- AI integrations: Google Gemini, Hugging Face, LangChain, TensorFlow
- Testing: Vitest, Supertest, Nx e2e projects
- CI: GitHub Actions

## Quick Start

### Prerequisites

- Node.js 20
- pnpm 9
- MongoDB
- Redis
- Docker, if you want to run Kafka locally via Compose

### Install dependencies

```bash
pnpm install
```

### Prepare environment

Use `.env.example` as the starting point, then add the additional variables required by Stripe, SMTP, ImageKit, and AI integrations. The complete env inventory is documented in [docs/01-getting-started/environment-variables.md](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/01-getting-started/environment-variables.md>).

### Start local infrastructure

Kafka tooling is defined in `libs/docker-compose.yml`:

```bash
docker compose -f libs/docker-compose.yml up -d
```

MongoDB and Redis are expected separately in local development.

### Run apps

Examples:

```bash
pnpm exec nx serve auth-service
pnpm exec nx serve product-service
pnpm exec nx serve order-service
pnpm exec nx serve recommendation-service
pnpm exec nx serve api-gateway
pnpm exec nx serve aivision-service
pnpm exec nx dev user-ui
pnpm exec nx dev seller-ui
```

Helpful root scripts:

```bash
pnpm test
pnpm test:coverage
pnpm user-ui
pnpm seller-ui
```

## Default Local Ports

- `3000`: `user-ui`
- `3001`: `seller-ui`
- `6001`: `auth-service`
- `6002`: `product-service`
- `6004`: `order-service`
- `6005`: `recommendation-service`
- `6006`: `aivision-service`
- `8080`: `api-gateway`
- `8089`: Kafka UI
- `9092`: Kafka broker
- `6379`: Redis
- `27017`: MongoDB

The complete mapping lives in [docs/11-reference/port-map.md](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/11-reference/port-map.md>).

## Testing

The repository uses Vitest for unit and integration testing and Nx e2e projects for service-level end-to-end coverage.

Common commands:

```bash
pnpm test
pnpm test:coverage
pnpm test:auth
pnpm test:product
pnpm test:order
pnpm test:gateway
pnpm test:recommendation
```

CI builds and tests are defined in `.github/workflows/test.yml`.

## Documentation

Start here:

- [Documentation Index](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/README.md>)
- [Documentation Implementation Plan](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/docs-implemenataion.md>)
- [Project Overview](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/00-overview/product-overview.md>)
- [Local Development Guide](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/01-getting-started/local-development.md>)

## Current Documentation Status

The repo already contains useful design and feature notes, especially for brand and AI Vision work, but the old documentation is fragmented. The new `docs/` structure is the canonical path going forward, with legacy material being indexed and migrated over time.
