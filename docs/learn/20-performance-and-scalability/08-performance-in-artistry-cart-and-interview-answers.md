# Performance In Artistry Cart And Interview Answers

This file gives interview-ready answers for performance and scalability.

## Current Performance Strengths

Artistry Cart already has practical performance choices:

- Kafka keeps analytics work out of foreground user requests
- Redis provides shared caching/fast-path support with graceful degradation
- product pricing stores effective values such as `current_price` and `is_on_discount`
- recommendation outputs are reused with a freshness window
- React Query reduces repeated frontend fetch pressure
- API gateway rate limiting protects backend services
- Kubernetes HPA supports horizontal scaling for main stateless services
- `/metrics` exposes request and worker signals for measurement

## Current Scale Constraints

Honest constraints:

- shared MongoDB can become a cross-service bottleneck
- recommendation scoring still happens in request paths in some cases
- AI Vision flows are naturally high-latency and provider-dependent
- in-memory Kafka buffering is simple but limited for precise throughput control
- worker scaling needs lag-aware thinking, not only CPU scaling
- cache strategy needs explicit ownership and invalidation rules at scale
- dashboards, load tests, and performance budgets are still future maturity work

## Question: What Is Performance?

Strong answer:

> Performance is how quickly and efficiently a system handles work under current conditions. For web apps, I care about user-facing latency, API latency percentiles, throughput, resource use, and whether the system stays responsive under normal load.

## Question: What Is Scalability?

Strong answer:

> Scalability is the ability to handle growth in users, traffic, data, or background jobs. A scalable system can add capacity or change architecture without collapsing under increased load.

## Question: Vertical Versus Horizontal Scaling?

Strong answer:

> Vertical scaling means making one instance bigger with more CPU or memory. Horizontal scaling means adding more instances behind a load balancer. Horizontal scaling works best for stateless services, but it can expose shared bottlenecks like the database.

## Question: How Do You Find A Bottleneck?

Strong answer:

> I measure the full request path: frontend timing, gateway latency, route p95 and p99, database query time, cache hit rate, external dependency latency, CPU, memory, queue lag, and error rate. Then I optimize the constrained layer first.

## Question: How Does Caching Improve Performance?

Strong answer:

> Caching stores frequently used or expensive-to-compute data closer to the caller. It improves latency and reduces database or service load, but it introduces stale data and invalidation problems. I choose TTLs and invalidation based on business correctness.

## Question: How Does Kafka Help Scalability?

Strong answer:

> Kafka decouples producers from consumers and moves non-critical work off the request path. In Artistry Cart, user behavior analytics can be published and processed asynchronously by `kafka-service`, so browsing or checkout does not wait on analytics materialization.

## Question: Why Can Async Processing Be Risky?

Strong answer:

> Async processing introduces eventual consistency, retries, duplicate handling, queue lag, poison messages, and harder debugging. Consumers must be idempotent, observable, and able to handle backpressure.

## Question: How Would You Scale Recommendations?

Strong answer:

> I would reduce request-time scoring by precomputing recommendations, caching outputs with freshness rules, tracking cold-start and retrain rates, and moving heavier model work to background jobs. I would also measure recommendation latency and separate online serving from offline training as traffic grows.

## Question: How Would You Scale AI Vision?

Strong answer:

> I would treat AI Vision as a high-latency, cost-sensitive boundary. I would rate limit expensive routes, queue long-running jobs, cache reusable outputs where safe, track provider latency and failure rate, isolate workers, and expose progress rather than blocking every request synchronously.

## Question: How Does Kubernetes Help Scaling?

Strong answer:

> Kubernetes lets us run multiple replicas, route only to ready pods, define resource requests and limits, and use HPA to scale replicas based on metrics. But autoscaling only helps if the actual bottleneck is the service pods rather than the database, cache, queue, or external provider.

## Question: What Would You Improve Next In Artistry Cart?

Strong answer:

> I would add performance dashboards, route-level latency percentiles, database slow-query analysis, cache hit-rate metrics, load testing, CDN/image strategy, explicit performance budgets, offline recommendation generation, and lag-aware worker scaling for Kafka paths.

## Best Short Project Pitch For This Topic

> Artistry Cart uses several real performance patterns: Redis for fast paths, Kafka for async analytics, cached recommendation outputs, derived product pricing fields, frontend server-state caching, gateway rate limits, and Kubernetes HPA for stateless services. The honest next scale step is measurement-driven hardening: load tests, dashboards, slow-query/index work, offline recommendation processing, CDN optimization, and queue-aware autoscaling.
