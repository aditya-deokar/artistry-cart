# Glossary And Cheat Sheet

## Core Terms

### Monorepo

One repository containing multiple projects.

In this repo:

```text
apps/*
packages/*
docs/*
```

### Monolith

One application deployed as one unit.

### Modular Monolith

One deployable application with strict internal modules.

### Microservices

Multiple independently runnable services split around business capabilities.

### Service-Oriented Architecture

An architecture where capabilities are exposed as services. It may be less strict than textbook microservices.

Artistry Cart fits this phrase well because services are split, but persistence is shared.

### Nx

A monorepo build system that manages projects, targets, dependency graphs, caching, and affected commands.

### Project

A unit Nx can run tasks for.

Examples:

- `auth-service`
- `product-service`
- `user-ui`
- `@artistry-cart/utils`

### Target

A command for a project.

Examples:

- `build`
- `serve`
- `dev`
- `test`
- `e2e`

### Executor

The implementation used to run a target.

Examples:

- `@nx/js:tsc`
- `@nx/js:node`
- `nx:run-commands`

### Project Graph

Nx's dependency map between projects.

### Affected

The set of projects impacted by a code change.

### API Gateway

A single backend entry point that routes client requests to services.

### Kafka

A distributed event streaming platform used here for user activity analytics.

### Eventual Consistency

A state where different parts of the system become consistent over time rather than immediately.

### Idempotency

The property that running the same operation more than once produces the same final result.

Important for:

- webhooks
- Kafka consumers
- retries

### Bounded Context

A domain boundary where terms and rules have a specific meaning.

Examples:

- auth context
- catalog context
- order context
- recommendation context

## Artistry Cart Service Map

| Component | Responsibility |
| --- | --- |
| `user-ui` | buyer storefront |
| `seller-ui` | seller dashboard |
| `api-gateway` | backend routing entry point |
| `auth-service` | identity, auth, OAuth, onboarding |
| `product-service` | products, shops, search, pricing, discounts, events |
| `order-service` | checkout, orders, Stripe, webhooks |
| `recommendation-service` | recommendation APIs |
| `aivision-service` | AI generation, visual search, concepts, background jobs |
| `kafka-service` | analytics event consumption |
| `packages/error-handler` | shared Express error handling |
| `packages/middleware` | auth and role middleware |
| `packages/libs` | Prisma, Redis, ImageKit helpers |
| `packages/utils` | Kafka and runtime utilities |
| `packages/test-utils` | test helpers and fixtures |

## Command Cheat Sheet

Install:

```bash
pnpm install
```

Build one project:

```bash
pnpm exec nx build auth-service
```

Serve one backend:

```bash
pnpm exec nx serve auth-service
```

Run a frontend:

```bash
pnpm exec nx dev user-ui
```

Run affected tests:

```bash
pnpm exec nx affected --target=test --base=origin/master --head=HEAD
```

Run many builds:

```bash
pnpm exec nx run-many --target=build --projects=auth-service,product-service,order-service --parallel=3
```

Run root tests:

```bash
pnpm test
```

Start Kafka locally:

```bash
docker compose -f docker/compose/docker-compose.infra.yml up -d
```

## Interview One-Liners

Monorepo:

> One repository for many projects, optimized for shared tooling and atomic changes.

Nx:

> A graph-aware build system for monorepos.

Microservices:

> Independently runnable services split around business capabilities.

API gateway:

> A client-facing routing and policy layer in front of backend services.

Kafka:

> An event backbone used to decouple producers from consumers.

Shared database tradeoff:

> It speeds development but weakens service autonomy.

Best description of this repo:

> A service-oriented Nx monorepo for a commerce platform, with multiple deployable apps and services plus shared infrastructure packages.

## Quick Mental Models

### Source Code Model

```text
Nx workspace
  -> apps
  -> packages
  -> docs
  -> tools
```

### Runtime Model

```text
frontends
  -> gateway
  -> services
  -> database/cache/events/external APIs
```

### Change Impact Model

```text
changed file
  -> owning project
  -> dependent projects
  -> affected tests/builds
```

### Event Model

```text
producer
  -> topic
  -> consumer
  -> materialized read model
```

