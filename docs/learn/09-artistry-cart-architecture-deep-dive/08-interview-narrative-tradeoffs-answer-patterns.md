# Interview Narrative, Tradeoffs, And Answer Patterns

## One-Minute Architecture Pitch

> Artistry Cart is a full-stack artisan commerce platform built as an Nx monorepo. It has two Next.js frontends, buyer and seller, and multiple Express backend services for gateway routing, auth, products, orders, recommendations, AI Vision, and Kafka analytics ingestion. Shared TypeScript packages provide middleware, error handling, Prisma/Redis/ImageKit helpers, Kafka utilities, and test utilities. The system uses MongoDB through Prisma, Redis, Kafka, Stripe, AI providers, Docker, Kubernetes, and GitHub Actions. I would describe it as a practical service-oriented monorepo rather than fully autonomous microservices because persistence is shared.

## Two-Minute Architecture Pitch

> The source architecture is an Nx and pnpm monorepo. Runnable projects live under `apps/`, shared packages under `packages/`, data schema under `prisma/`, and deployment assets under `docker/` and `k8s/`. Nx gives project-level targets, dependency-aware builds, caching, and affected CI.
>
> Runtime traffic starts from `user-ui` or `seller-ui`, goes through `api-gateway`, and then routes to backend services. `auth-service` owns identity, OAuth, tokens, and cookies. `product-service` owns catalog, shops, pricing, discounts, events, and search. `order-service` owns checkout, orders, Stripe sessions, and webhooks. `recommendation-service` reads analytics/product data for recommendations. `aivision-service` owns AI-heavy workflows and background jobs. `kafka-service` consumes analytics events from Kafka and materializes them in MongoDB.
>
> The main tradeoff is shared persistence. It keeps development fast and the schema visible, but it means service autonomy is weaker than textbook microservices. Future improvements would include stronger data ownership, formal API/event contracts, better observability, and more mature deployment automation.

## What The Architecture Does Well

- separates buyer and seller frontends
- separates major backend domains
- isolates AI-heavy workloads
- isolates Kafka analytics ingestion
- uses shared packages for repeated infrastructure
- uses Nx for monorepo orchestration
- supports Docker/Kubernetes deployment shape
- includes CI and e2e testing strategy
- documents architecture and tradeoffs

## Main Tradeoffs

### Shared Database

Good:

- simpler development
- one schema
- easier cross-domain queries

Risk:

- weaker service autonomy
- schema coupling
- unclear data ownership

### Shared Packages

Good:

- less duplication
- consistent behavior
- faster cross-service updates

Risk:

- hidden coupling
- utility dumping ground
- large blast radius

### Gateway

Good:

- one backend entry point
- simpler frontend config
- centralized routing

Risk:

- can become too smart
- can become bottleneck
- downstream failure handling needed

### Kafka

Good:

- async analytics
- decoupled producer/consumer
- protects user request latency

Risk:

- duplicate messages
- schema evolution
- lag monitoring
- retry/dead-letter needs

## Common Interview Questions

### Is This Microservices?

Answer:

> It has multiple runnable backend services with clear responsibilities, so it is service-oriented. But because services share Prisma/MongoDB, it is not fully autonomous microservices. I would call it a practical service-oriented Nx monorepo.

### Why Nx?

Answer:

> Nx helps manage many apps, services, and packages in one workspace. It gives a project graph, targets, dependency-aware builds, caching, affected commands, and CI optimization.

### Why Separate AI Vision?

Answer:

> AI workflows have different latency, cost, dependencies, provider failure modes, and background job needs. Separating AI Vision keeps those concerns out of core catalog/order/auth services.

### Why Kafka?

Answer:

> Kafka is used for analytics events because user behavior tracking should not block foreground requests. Events can be produced, buffered, consumed by a worker, and materialized for recommendations later.

### What Would You Improve Next?

Answer:

> I would formalize API contracts, add event schema versioning, define Prisma model ownership, strengthen observability with traces/metrics, add dead-letter handling for Kafka, and mature service-level deployment automation.

## Best Senior-Level Closing

> The architecture is intentionally pragmatic. It uses a monorepo where shared tooling and atomic changes help, and service boundaries where runtime responsibility and domain complexity justify separation. The main maturity path is to keep the development speed benefits while tightening contracts, observability, deployment independence, and data ownership.

