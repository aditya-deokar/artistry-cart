# Resume, Portfolio, And Proof-Based Storytelling

## What Proof-Based Storytelling Means

Proof-based storytelling means every claim can point to evidence.

Evidence can be:

- code
- docs
- tests
- workflows
- diagrams
- ADRs
- manifests
- scripts
- schemas

This matters because interviewers may ask:

```text
Can you show me where that is?
```

## Avoid Fabricated Metrics

Do not invent:

- user counts
- revenue
- uptime
- performance improvements
- cost savings
- production scale

If the repo does not prove it, avoid claiming it.

Better:

```text
I designed the architecture to support these production concerns.
```

Instead of:

```text
It served millions of users.
```

## Strong Claims You Can Support

You can support:

- Nx monorepo with multiple deployable apps
- two Next.js frontends
- Express backend services
- shared packages
- Prisma/MongoDB data layer
- Redis integration
- Kafka analytics flow
- Stripe payment/webhook architecture
- AI Vision service boundary
- Dockerfiles and Compose
- Kubernetes manifests and overlays
- GitHub Actions CI/CD
- observability baseline
- ADR documentation

## Claim-To-Proof Examples

Claim:

```text
The repo uses service-oriented backend boundaries.
```

Proof:

```text
apps/api-gateway, auth-service, product-service, order-service, recommendation-service, aivision-service, kafka-service
```

Claim:

```text
Kafka is used for async analytics.
```

Proof:

```text
docs/08-decisions/adr-004-kafka-analytics-pipeline.md
apps/kafka-service
packages/utils/kafka
```

Claim:

```text
AI Vision is isolated as its own service.
```

Proof:

```text
apps/aivision-service
docs/08-decisions/adr-005-ai-vision-service-boundary.md
```

Claim:

```text
The platform has Kubernetes deployment assets.
```

Proof:

```text
k8s/base
k8s/overlays/dev
k8s/overlays/staging
k8s/overlays/production
```

## Resume Bullet Pattern

Use:

```text
Built/Designed/Implemented X to achieve Y, using Z, with tradeoff/impact W.
```

Example:

```text
Designed a service-oriented Nx monorepo for a multi-vendor commerce platform, separating buyer/seller frontends, domain backend services, shared infrastructure packages, and Kubernetes deployment assets.
```

## Portfolio Walkthrough Pattern

Use:

1. Product problem
2. Architecture diagram
3. Core flows
4. One deep technical decision
5. One tradeoff
6. One production-hardening layer
7. What you would improve next

## Strong Interview Answer

If asked "How can you prove this work?", say:

> I can point to the repo structure, service code, Prisma schema, ADRs, Kubernetes manifests, GitHub Actions workflows, CI scripts, and learning docs. I avoid fabricated metrics, so I frame the project around implemented architecture and documented tradeoffs rather than unsupported production claims.

## Artistry Cart Connection

The repo already has strong proof artifacts. Use them. The safest and strongest story is evidence-backed architecture, not inflated numbers.
