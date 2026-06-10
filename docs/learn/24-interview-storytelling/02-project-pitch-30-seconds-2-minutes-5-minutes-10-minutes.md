# Project Pitch: 30 Seconds, 2 Minutes, 5 Minutes, 10 Minutes

## Why Multiple Versions Matter

Interviewers give different amounts of time.

You need versions for:

- quick intro
- recruiter screen
- technical phone screen
- system design deep dive
- final round discussion

Do not use the same answer everywhere.

## 30-Second Version

Use this when asked:

```text
Tell me briefly about Artistry Cart.
```

Answer:

> Artistry Cart is a service-oriented artisan commerce platform built as an Nx monorepo. It has separate buyer and seller Next.js apps, Express backend services for auth, catalog, orders, recommendations, AI Vision, and analytics ingestion, plus MongoDB/Prisma, Redis, Kafka, Stripe, Docker, Kubernetes, and GitHub Actions. The strongest architecture story is that I separated normal commerce flows from AI-heavy and analytics-heavy workflows while keeping the repo practical through shared tooling and shared packages.

## 2-Minute Version

Use this for:

```text
Tell me about a project you built.
```

Answer:

> Artistry Cart is an artisan-commerce platform that combines marketplace workflows with AI-assisted discovery. Buyers use a storefront for browsing, checkout, recommendations, and AI concept exploration. Sellers use a separate dashboard for shop, product, offer, event, and order management.
>
> On the backend, I split responsibilities across services: auth for identity and OAuth, product-service for catalog and merchandising, order-service for Stripe checkout and webhooks, recommendation-service for personalized product suggestions, kafka-service for analytics materialization, and aivision-service for AI generation, visual search, embeddings, and artisan matching. The frontends call through an API gateway.
>
> The main tradeoff is that services are separate at the application/runtime level, but they share MongoDB through Prisma. That kept development fast while preserving meaningful boundaries. Kafka is used where async processing helps, so user behavior analytics do not slow down foreground browsing or checkout. AI Vision is separate because AI has different latency, cost, provider, and background-job concerns.

## 5-Minute Version

Use this for:

```text
Walk me through the architecture.
```

Answer shape:

1. Product context:

```text
Artisan marketplace with buyer and seller workflows, plus AI-assisted discovery.
```

2. User surfaces:

```text
user-ui for buyers, seller-ui for sellers.
```

3. Gateway:

```text
api-gateway centralizes frontend backend entry and proxies route groups.
```

4. Backend services:

```text
auth, product, order, recommendation, kafka, AI Vision.
```

5. Data and integrations:

```text
MongoDB/Prisma, Redis, Kafka, Stripe, OAuth, SMTP, Gemini/Hugging Face, ImageKit.
```

6. Tradeoffs:

```text
shared persistence for speed; service boundaries for clarity; Kafka for async analytics; AI Vision isolated for runtime difference.
```

7. Maturity path:

```text
stronger contracts, data ownership, tracing, dashboards, backup/restore, broader CI.
```

## 10-Minute Version

Use this for:

```text
Full system design or senior architecture conversation.
```

Order:

1. Product and user personas
2. Functional requirements
3. High-level diagram
4. Request flows
5. Event flows
6. Data ownership
7. Performance/scaling
8. Security/payments
9. Observability/DevOps
10. Tradeoffs and future improvements

## What To Avoid

Avoid:

- starting with package names
- listing every dependency
- claiming internet-scale production readiness
- hiding the shared database tradeoff
- sounding defensive about pragmatic choices

## Strong Closing Line

Use:

> The project is intentionally pragmatic: it uses service boundaries where the domain or runtime behavior deserves separation, and shared monorepo infrastructure where moving quickly and keeping contracts visible matters.
