# Mock Questions And Answer Patterns

This file gives interview-ready system design answer patterns.

## Question: Design An Ecommerce Marketplace

Answer shape:

> I would start by clarifying buyers, sellers, catalog browsing, checkout, payment, seller management, search, and recommendations. The high-level design would have buyer and seller clients, an API gateway, auth, catalog, order/payment, recommendation, and analytics services, a primary database, cache, event stream, and external payment provider. Product browsing is read-heavy and cacheable, while checkout and payment webhooks need stronger correctness and idempotency.

## Question: How Would You Design Product Search?

Answer shape:

> I would clarify search requirements first: filters, sorting, text search, personalization, and scale. For a simple version, product-service can query MongoDB with indexes and pagination. At higher scale or richer search, I would introduce a search index such as Elasticsearch or OpenSearch, update it asynchronously from product changes, and treat MongoDB as the source of truth.

## Question: How Would You Design Checkout?

Answer shape:

> Checkout should prioritize correctness. I would create a checkout session through the order service, use a payment provider like Stripe, store pending order state, verify payment updates through signed webhooks, make webhook handling idempotent, and update order status only after trusted provider confirmation. Frontend redirects are useful for UX but should not be the source of truth.

## Question: How Would You Design Recommendations?

Answer shape:

> I would capture user events asynchronously, materialize analytics state, and serve recommendations from precomputed or cached outputs. For a simple stage, some scoring can happen in the recommendation service, but at scale I would move training and heavy scoring offline and keep online serving fast and predictable.

## Question: How Would You Use Kafka?

Answer shape:

> I would use Kafka for durable async event streams where replay, decoupling, or multiple consumers matter. In an ecommerce system, user behavior events can feed analytics and recommendations without slowing foreground requests. I would design idempotent consumers, monitor lag, handle retries and DLQs, and avoid using Kafka for every synchronous request.

## Question: How Would You Use Redis?

Answer shape:

> I would use Redis for cacheable reads, rate-limit counters, short-lived tokens or OTP support, and fast-path state where losing Redis does not corrupt the source of truth. I would define TTLs and invalidation rules, measure hit rates, and make sure Redis failure degrades safely where possible.

## Question: How Would You Scale The System?

Answer shape:

> I would first measure bottlenecks. Then I would horizontally scale stateless services, cache read-heavy paths, add database indexes and pagination, move non-critical work async, tune queues and workers, use CDN for media/static assets, and add HPA in Kubernetes. I would not assume adding pods fixes database, external provider, or queue bottlenecks.

## Question: How Would You Make The System Reliable?

Answer shape:

> I would design for expected failures: retries with backoff, idempotency, timeouts, circuit breakers where useful, graceful degradation, health/readiness checks, rollback paths, and observability. Payment and order state need stronger durability than recommendations or analytics.

## Question: How Would You Secure The System?

Answer shape:

> I would use secure auth flows, role-based authorization, HTTP-only cookies where appropriate, token rotation, CORS and CSRF controls, rate limits, input validation, webhook signature verification, secret management, least-privilege CI/CD, and careful logging that avoids secrets and PII.

## Question: How Would You Observe The System?

Answer shape:

> I would collect structured logs with request IDs, metrics for latency, traffic, errors, saturation, health/readiness checks, traces across gateway and services, Kafka lag, payment webhook failures, and AI provider latency. Dashboards and alerts should map to user impact and operational risk.

## Question: Why Not Pure Microservices?

Answer shape:

> Pure microservices are useful when independent deployment, ownership, scaling, and failure isolation justify the complexity. They also add distributed transactions, network failure, observability overhead, and deployment coordination. I would start with clear modular or service-oriented boundaries and split further when scale or team structure demands it.

## Question: Explain Artistry Cart In A System Design Interview

Answer shape:

> Artistry Cart is a service-oriented Nx monorepo for artisan commerce. It has buyer and seller Next.js frontends, an API gateway, backend services for auth, products, orders, recommendations, Kafka analytics, and AI Vision, plus MongoDB/Prisma, Redis, Kafka, Stripe, Docker, Kubernetes, and CI/CD. The strongest choices are separating buyer/seller workflows, using Kafka for async analytics, and isolating AI Vision. The honest tradeoff is shared persistence, so I describe it as service-oriented with shared data rather than fully autonomous microservices.

## Question: What Would You Improve First?

Answer shape:

> I would improve operational maturity first: stronger service contracts, clearer data ownership, distributed tracing, tuned dashboards and alerts, load tests, slow-query/index analysis, more offline recommendation generation, and deeper CI coverage for AI and Kafka paths.

## Best Closing Line

> The design is intentionally pragmatic: simple where simplicity helps, distributed where boundaries buy real value, and honest about the next maturity steps.
