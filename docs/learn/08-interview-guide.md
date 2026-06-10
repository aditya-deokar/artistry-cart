# Interview Guide

## One-Minute Project Explanation

Artistry Cart is a full-stack commerce platform built as an Nx monorepo. It contains two Next.js frontends, multiple Express backend services, shared TypeScript packages, Prisma/MongoDB persistence, Redis support, Kafka analytics ingestion, Docker/Kubernetes infrastructure, and CI workflows. The backend is split by domain into auth, product, order, recommendation, AI Vision, gateway, and Kafka worker services. The architecture uses a monorepo for developer velocity and cross-service consistency, while using service boundaries for domain clarity and future independent deployment.

## Two-Minute Architecture Explanation

The source architecture is an Nx monorepo managed with pnpm workspaces. Applications live under `apps/`, shared packages live under `packages/`, and Nx models them as projects with targets such as build, serve, test, e2e, and docker-build. Nx gives us dependency-aware builds, caching, affected commands, and a consistent command model.

At runtime, the user and seller frontends communicate with an Express API gateway. The gateway proxies traffic to backend services: auth for identity, product for catalog and seller product workflows, order for checkout and Stripe webhooks, recommendation for personalized suggestions, and AI Vision for AI-heavy visual workflows. Kafka is used for asynchronous analytics ingestion, where user activity events are consumed by `kafka-service` and materialized into MongoDB for later recommendation use.

The honest tradeoff is that services share MongoDB through Prisma, so data ownership is not fully microservice-pure. This is intentional for a base project because it keeps development and cross-domain changes practical while preserving service boundaries where they matter most.

## Architecture Diagram To Explain Verbally

```text
Buyer/Seller browser
  -> user-ui or seller-ui
  -> api-gateway
  -> auth-service/product-service/order-service/recommendation-service/aivision-service
  -> MongoDB/Redis/Stripe/AI providers

user-ui
  -> Kafka
  -> kafka-service
  -> MongoDB analytics
  -> recommendation-service
```

## Strong Talking Points

### Why Nx?

> Nx lets us treat every app, service, package, and e2e suite as a project in one graph. That gives us consistent commands, dependency-aware builds, caching, and affected test/build execution in CI.

### Why Monorepo?

> The platform has many cross-cutting changes: auth contracts, shared middleware, Prisma schema, Kafka event contracts, and frontend API clients. A monorepo lets those changes happen atomically while keeping shared tooling consistent.

### Why Microservices?

> The backend domains have different responsibilities and failure modes. Auth, orders, catalog, recommendations, analytics ingestion, and AI workflows change for different reasons, so separating them keeps the system easier to reason about and creates a path to independent scaling and deployment.

### Why API Gateway?

> The gateway gives frontends one backend entry point and centralizes routing to downstream services. In this project it stays mostly thin, which avoids turning it into a business-logic bottleneck.

### Why Kafka?

> Kafka is used where asynchronous processing makes sense: user activity analytics. The UI should not block on analytics materialization, so events are produced to Kafka and consumed by a worker that updates analytics state.

### Why Shared Prisma?

> Shared Prisma and MongoDB reduce operational overhead and speed up development, but they reduce service autonomy. It is a pragmatic choice for this project stage, with a future path toward stronger data ownership if needed.

## Common Interview Questions

### Is this a monolith or microservices?

Answer:

> It is not a single backend monolith because the backend is split into multiple runnable services. It is also not fully autonomous microservices because services share a Prisma/MongoDB data layer. I would describe it as a service-oriented Nx monorepo with clear application boundaries and shared infrastructure.

### What problem does Nx solve here?

Answer:

> Nx solves monorepo orchestration. It models projects and dependencies, runs targets like build and test, caches repeatable work, and lets CI run only affected tasks for pull requests.

### What are the biggest risks?

Answer:

> The biggest risks are shared database coupling, shared packages becoming too broad, gateway logic growing too much, and distributed system observability gaps. Kafka also needs production-grade retry, dead-letter, and lag monitoring as usage grows.

### How would you improve this architecture?

Answer:

> I would add stricter module boundary rules, formal API contracts, clearer Prisma model ownership, event schema versioning, distributed tracing, Kafka dead-letter handling, and more mature deployment automation around service-level releases.

### Why not use separate repos?

Answer:

> Separate repos make sense when teams and service contracts are mature enough to release independently. In this project, many changes still cross frontend, backend, shared packages, and docs. A monorepo reduces coordination overhead while the architecture is still evolving.

### Why not build one backend?

Answer:

> A single backend would be simpler operationally, but it would mix domains with very different concerns: auth, payments, AI, recommendations, analytics ingestion, and catalog. Splitting services gives clearer ownership and isolates heavier or riskier workflows.

### What does affected CI mean?

Answer:

> Affected CI means comparing a branch against a base branch, using the project graph to find impacted projects, and running only the necessary targets. For example, changing a shared middleware package should test services that depend on it, while changing isolated docs should not rebuild every app.

## Whiteboard Flow: Checkout

Explain:

1. Buyer uses `user-ui`.
2. Frontend sends checkout request through `api-gateway`.
3. Gateway routes to `order-service`.
4. `order-service` creates payment/session state with Stripe.
5. Order state is persisted in MongoDB through Prisma.
6. Stripe later sends webhook callbacks to `order-service`.
7. Webhook handler verifies signature and updates final payment/order state.

Key point:

> Payment state should not rely only on the foreground request. Webhooks are the external source of truth for final payment events.

## Whiteboard Flow: Analytics And Recommendations

Explain:

1. User action happens in `user-ui`.
2. A Kafka event is published to the `user-events` topic.
3. `kafka-service` consumes the event.
4. Worker updates user and product analytics in MongoDB.
5. `recommendation-service` reads materialized analytics when serving recommendations.

Key point:

> This removes analytics writes from the main user interaction latency path.

## Red Flags To Avoid Saying

Avoid:

- "Monorepo means microservices."
- "Microservices are always better."
- "Shared database is fine forever."
- "Kafka guarantees everything automatically."
- "Nx prevents bad architecture."
- "The gateway should contain all business logic."

Say instead:

- "Monorepo is source organization; microservices are runtime architecture."
- "Microservices trade simplicity for independence."
- "Shared persistence is practical now but needs ownership rules as the system matures."
- "Kafka needs idempotent consumers, retries, monitoring, and schema discipline."
- "Nx supports good boundaries, but teams still need to enforce them."

## Senior-Level Closing Statement

> The strength of this project is that it chooses pragmatic boundaries. It uses a monorepo because the product still benefits from shared tooling and atomic changes, and it uses services because several domains have different runtime and ownership concerns. The main maturity path is to keep the developer experience benefits while tightening contracts, data ownership, observability, and deployment independence.

