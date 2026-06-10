# Artistry Cart Story Bank

This file gives ready-to-practice story prompts for Artistry Cart.

## Story 1: Product And Platform

Prompt:

```text
Tell me about Artistry Cart.
```

Answer:

> Artistry Cart is a service-oriented artisan commerce platform. It has separate buyer and seller frontends, backend services for auth, catalog, orders, recommendations, analytics ingestion, and AI Vision, and shared infrastructure packages for Prisma, Redis, Kafka, middleware, error handling, ImageKit, and tests. The project is interesting because it combines standard marketplace flows with AI-assisted discovery while documenting real architecture tradeoffs.

## Story 2: Architecture Judgment

Prompt:

```text
What part shows senior judgment?
```

Answer:

> The strongest signal is knowing where complexity is justified. Kafka is used where async analytics improves foreground latency. AI Vision is isolated because AI has different runtime behavior. At the same time, the system stays pragmatic with an Nx monorepo and shared MongoDB/Prisma because strict microservice purity would add too much coordination cost at this stage.

## Story 3: Tradeoff

Prompt:

```text
What tradeoff did you make?
```

Answer:

> The biggest tradeoff is shared persistence. Services are split by domain and runtime responsibility, but they share MongoDB through Prisma. That made development faster and kept the schema visible, but it weakens data ownership. The future maturity path is documenting model ownership and gradually enforcing service-level boundaries.

## Story 4: Async Architecture

Prompt:

```text
Why did you use Kafka?
```

Answer:

> User activity is valuable for recommendations and analytics, but it should not slow down product browsing or checkout. Kafka lets the system capture those events asynchronously, and kafka-service materializes them into analytics records. The tradeoff is eventual consistency and more operational complexity.

## Story 5: AI Integration

Prompt:

```text
How did you integrate AI?
```

Answer:

> I treated AI as a product capability, not a side demo. AI Vision has its own service for generation, visual search, embeddings, concepts, collections, artisan matching, and background jobs. That boundary keeps AI latency, provider failures, media handling, and cost concerns away from core transactional services.

## Story 6: Payments

Prompt:

```text
How do you handle payment correctness?
```

Answer:

> Payment correctness belongs in the order service. The frontend can start checkout, but trusted payment state should come from Stripe webhooks. Webhooks need signature verification, idempotency, durable order updates, and retry-safe handling because frontend redirects alone are not reliable enough.

## Story 7: DevOps

Prompt:

```text
What is the deployment story?
```

Answer:

> The repo has Dockerfiles, Compose for local infrastructure, Kubernetes base manifests and environment overlays, GitHub Actions for tests, image build/publish, staging deploy, production deploy, and security scans. Images are published with release manifests, and deploy workflows apply Kustomize overlays, wait for rollouts, and run smoke checks.

## Story 8: Observability

Prompt:

```text
How do you operate or debug it?
```

Answer:

> The backend services share runtime observability patterns: structured logs, request IDs, `/healthz`, `/readyz`, and `/metrics`. Kubernetes uses probes, and the monitoring addon has PodMonitor and PrometheusRule resources. The next step would be central logs, dashboards, tracing, and formal SLOs.

## Story 9: What You Would Improve

Prompt:

```text
What would you improve next?
```

Answer:

> I would improve operational maturity first: stronger service contracts, clearer data ownership, distributed tracing, central dashboards, backup/restore runbooks, broader CI coverage for AI and Kafka paths, and more offline recommendation generation.

## Story 10: Not Pure Microservices

Prompt:

```text
Is this really microservices?
```

Answer:

> I would describe it as a service-oriented monorepo rather than pure microservices. It has real application and runtime boundaries, but persistence is shared. That is intentional for this stage, and the maturity path is stronger data ownership and service contracts.
