# Data, Integrations, DevOps, And Deployment Shape

## Data Layer

Artistry Cart uses MongoDB through Prisma.

The `prisma/` folder contains:

- schema
- seed data
- seed scripts

Multiple backend services use the shared data layer.

## Shared Data Tradeoff

Benefits:

- simpler local development
- one schema to inspect
- faster feature iteration
- easier cross-domain queries

Costs:

- weaker service autonomy
- schema changes affect many services
- data ownership can blur
- services can accidentally bypass each other's rules

Interview phrase:

> The service boundaries are clear at the application layer, but persistence is shared, so data ownership is a maturity area.

## Redis

Redis supports selected runtime behavior.

Possible use cases:

- cache-like fast access
- session-adjacent support
- temporary order/payment state
- graceful fallback when disabled in tests

Important:

> Redis should improve speed or coordination, but core correctness should be designed carefully if Redis is unavailable.

## Kafka

Kafka is used for analytics ingestion.

Main flow:

```text
frontend event -> Kafka -> kafka-service -> MongoDB analytics
```

Kafka supports decoupling and buffering for user activity events.

## Stripe

Stripe supports payment and webhook flows in `order-service`.

Important design points:

- verify webhook signatures
- handle duplicate webhooks idempotently
- do not trust frontend redirect alone
- persist payment/order state carefully

## OAuth And SMTP

`auth-service` integrates with:

- OAuth providers
- SMTP/email delivery

Use cases:

- social login
- activation emails
- password/reset-style flows
- seller activation

## AI Providers And ImageKit

`aivision-service` integrates with:

- Google Gemini
- Hugging Face
- LangChain/LangGraph-style AI tooling
- TensorFlow-related tooling
- ImageKit

Why isolated:

- cost
- latency
- rate limits
- specialized dependencies
- background embedding workflows

## Docker

Docker assets support:

- backend images
- frontend images
- local/full/test compose setups
- consistent runtime packaging

Docker helps services run similarly across environments.

## Kubernetes

Kubernetes assets support:

- deployments
- services
- HPAs
- config maps
- secrets examples
- ingress
- overlays for environments
- monitoring add-ons

This shows a path toward production-grade deployment.

## CI/CD

CI uses:

- pnpm install
- Prisma generate
- Nx affected tests/builds on pull requests
- broader validation on pushes
- service e2e startup and readiness checks
- selected service builds

Why important:

> In a monorepo, CI must be graph-aware or it becomes too slow.

## Interview Explanation

If asked "What infrastructure supports the project?", say:

> The platform uses MongoDB via Prisma for persistence, Redis for selected fast-path support, Kafka for analytics ingestion, Stripe for payments, OAuth/SMTP for identity flows, and AI/ImageKit integrations for AI Vision. Docker and Kubernetes assets define container and deployment shape, while GitHub Actions and Nx affected commands support CI validation.

