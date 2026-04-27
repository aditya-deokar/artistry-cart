# Repository Map

## Monorepo Overview

This repository is an Nx workspace organized around applications, shared packages, infrastructure definitions, and documentation.

## Top-Level Layout

```text
apps/       Frontend apps, backend services, and e2e projects
packages/   Shared libraries for runtime and tests
prisma/     MongoDB schema and seed data
libs/       Local infrastructure assets such as Docker Compose
docs/       Canonical documentation and legacy docs
.github/    CI workflows
```

## Applications

### Frontend applications

- `apps/user-ui`
  - Next.js buyer storefront
  - contains routes, UI components, hooks, state, and API client utilities

- `apps/seller-ui`
  - Next.js seller dashboard
  - contains dashboard routes, forms, operational components, and seller-focused state management

### Backend services

- `apps/api-gateway`
  - Express gateway that proxies requests to backend services
  - contains gateway bootstrap logic and site configuration initialization

- `apps/auth-service`
  - Express service for auth, user and seller registration, token flows, OAuth, and shop-related onboarding
  - notable folders: `controller/`, `oauth/`, `routes/`, `utils/`, `__tests__/`

- `apps/product-service`
  - Express service for catalog, search, shops, offers, events, discounts, and scheduled pricing jobs
  - notable folders: `controllers/`, `routes/`, `lib/`, `jobs/`

- `apps/order-service`
  - Express service for orders, Stripe checkout flows, webhooks, email notifications, and seller-order views
  - notable folders: `controllers/`, `routes/`, `services/`, `utils/`, `__tests__/`

- `apps/recommendation-service`
  - Express service for recommendation APIs and supporting recommendation logic
  - notable folders: `controllers/`, `routes/`, `services/`, `utils/`

- `apps/kafka-service`
  - Kafka consumer for user-activity analytics processing
  - notable folders: `services/`

- `apps/aivision-service`
  - Express service for AI generation, gallery, search, artisan-matching, session flows, validation, and jobs
  - notable folders: `agents/`, `config/`, `controllers/`, `jobs/`, `routes/`, `services/`, `validators/`

### E2E projects

The repo also includes Nx e2e projects for several backend services:

- `apps/auth-service-e2e`
- `apps/api-gateway-e2e`
- `apps/product-service-e2e`
- `apps/order-service-e2e`
- `apps/recommendation-service-e2e`
- `apps/kafka-service-e2e`
- `apps/aivision-service-e2e`

## Shared Packages

### Runtime and infrastructure packages

- `packages/error-handler`
  - shared error classes and Express error middleware

- `packages/middleware`
  - shared authorization and authentication middleware helpers

- `packages/libs/prisma`
  - shared Prisma client entry point

- `packages/libs/redis`
  - shared Redis initialization logic with feature toggle support

- `packages/libs/imageKit`
  - ImageKit client initialization

- `packages/utils/kafka`
  - KafkaJS configuration and client factory logic

### Testing support

- `packages/test-utils`
  - shared mocks, auth helpers, request helpers, data factories, and test setup

## Data Layer

- `prisma/schema.prisma`
  - MongoDB schema for users, sellers, shops, products, orders, analytics, discounts, events, AI Vision concepts, and related entities

- `prisma/seed/`
  - seed fixtures and scripts

## Infrastructure and Workflow Definitions

- `libs/docker-compose.yml`
  - local Kafka, Zookeeper, and Kafka UI setup

- `.github/workflows/test.yml`
  - CI workflow for unit, integration, coverage, build, and e2e execution

## Documentation Layout

- `docs/00-overview`
- `docs/01-getting-started`
- `docs/11-reference`
- `docs/legacy`

The rest of the planned sections are defined in [docs-implemenataion.md](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/docs-implemenataion.md>).

## How To Read The Codebase

A practical reading order for engineers is:

1. root [README.md](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/README.md>)
2. [Local Development](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/01-getting-started/local-development.md>)
3. `apps/api-gateway/src/main.ts`
4. the service entrypoints in `apps/*/src/main.ts`
5. `prisma/schema.prisma`
6. the shared packages under `packages/`

This sequence gives you the system boundary first, then service boundaries, then the data model, then the shared abstractions.
