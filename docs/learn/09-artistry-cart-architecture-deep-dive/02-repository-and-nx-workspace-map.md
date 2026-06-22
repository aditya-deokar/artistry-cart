# Repository And Nx Workspace Map

## Top-Level Layout

The repo is organized like this:

```text
apps/        frontend apps, backend services, and e2e projects
packages/    shared runtime and testing packages
prisma/      MongoDB schema and seed data
docker/      Dockerfiles and compose assets
k8s/         Kubernetes manifests and overlays
docs/        architecture, operations, interview, and learning docs
tools/       local tooling scripts
scripts/     CI and automation scripts
```

## Nx And pnpm Workspace

The repo uses:

- Nx for project graph, targets, caching, affected builds/tests
- pnpm workspaces for local package linking

Workspace package patterns:

```text
apps/*
packages/*
```

This means apps and packages can be treated as workspace projects.

## Frontend Apps

### `apps/user-ui`

Buyer-facing storefront.

Responsibilities:

- landing and product browsing
- search
- cart/wishlist
- checkout UI
- profile/order history
- support pages
- AI Vision buyer flows
- recommendation display

### `apps/seller-ui`

Seller-facing dashboard.

Responsibilities:

- seller auth flows
- shop/product management
- orders dashboard
- discounts
- offers
- events
- seller operational workflows

## Backend Services

### `apps/api-gateway`

Client-facing backend entry point and proxy layer.

### `apps/auth-service`

Authentication, registration, OAuth, identity, cookies/tokens, and onboarding flows.

### `apps/product-service`

Products, shops, search, pricing, discounts, offers, events, and catalog domain behavior.

### `apps/order-service`

Checkout, orders, Stripe sessions, webhooks, email notifications, and seller order views.

### `apps/recommendation-service`

Recommendation APIs and recommendation logic using analytics and product data.

### `apps/aivision-service`

AI-assisted visual workflows, concepts, visual search, gallery, artisans, embeddings, and background jobs.

### `apps/kafka-service`

Kafka consumer/worker for analytics events and materialized analytics updates.

## E2E Projects

The repo includes service-level e2e projects:

- `auth-service-e2e`
- `api-gateway-e2e`
- `product-service-e2e`
- `order-service-e2e`
- `recommendation-service-e2e`
- `kafka-service-e2e`
- `aivision-service-e2e`

These support testing across real service boundaries.

## Shared Packages

### `packages/error-handler`

Shared error classes and Express error middleware.

### `packages/middleware`

Shared authentication and role middleware.

### `packages/libs`

Infrastructure helpers such as Prisma, Redis, and ImageKit.

### `packages/utils`

Runtime utilities including Kafka-related helpers and contracts.

### `packages/test-utils`

Shared testing helpers, factories, request helpers, and setup utilities.

## Infrastructure Folders

### `prisma/`

Database schema and seed data.

### `docker/`

Backend/frontend Dockerfile patterns and Compose assets.

### `k8s/`

Kubernetes base resources and environment overlays.

### `.github/workflows/`

CI workflows for tests, builds, publishing, deployment, and security.

## Interview Explanation

If asked "How is the repo organized?", say:

> The repo is an Nx monorepo. Runnable projects live under `apps/`: two Next.js frontends, backend Express services, and e2e projects. Shared workspace packages live under `packages/`, including middleware, error handling, Prisma/Redis/ImageKit helpers, Kafka utilities, and test utilities. Infrastructure lives under `docker/`, `k8s/`, and CI scripts, while `docs/` explains the platform and learning path.

