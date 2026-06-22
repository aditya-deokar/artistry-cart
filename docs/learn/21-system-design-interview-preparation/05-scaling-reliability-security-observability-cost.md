# Scaling, Reliability, Security, Observability, And Cost

## Why Non-Functional Design Matters

A system can satisfy features and still fail in production.

Senior system design answers discuss:

- scale
- reliability
- security
- observability
- cost
- operability

This is where your answer moves beyond CRUD.

## Scaling

Scaling questions:

- which paths are read-heavy?
- which paths are write-critical?
- which services can scale horizontally?
- what is the database bottleneck?
- what can be cached?
- what can be async?
- what needs a queue?
- what needs offline processing?

Artistry Cart examples:

- product browsing is read-heavy
- payments are correctness-heavy
- analytics can be async
- AI Vision is latency/cost-heavy
- recommendation scoring should move more offline at scale

## Reliability

Reliability questions:

- what happens if a service fails?
- what happens if Redis is down?
- what happens if Kafka is delayed?
- what happens if Stripe retries a webhook?
- what happens if an AI provider times out?
- can we roll back?
- can we degrade gracefully?

Reliability is about expected failure, not surprise failure.

## Consistency

Different workflows need different consistency.

Strong consistency:

- payment state
- order state
- inventory decisions where overselling matters

Eventual consistency:

- analytics
- recommendations
- search index updates
- notification delivery

Good phrase:

```text
I would not use the same consistency model for checkout and recommendations.
```

## Security

Security questions:

- how are users authenticated?
- how is authorization enforced?
- where are tokens stored?
- how are secrets managed?
- how are payment webhooks verified?
- how are rate limits applied?
- how is PII protected?
- what gets logged?

For ecommerce, auth and payments deserve special attention.

## Observability

Observability questions:

- can we see request latency by route?
- can we trace across gateway and services?
- can we detect 5xx spikes?
- can we see Kafka lag or queue growth?
- can we debug webhook failures?
- can we tell if Redis is degraded?

Artistry Cart has shared logs, request IDs, health/readiness, metrics, and starter Prometheus resources. The next step is central dashboards and tracing.

## Cost

Cost questions:

- which components are expensive?
- can we cache expensive calls?
- can we rate limit high-cost APIs?
- can we batch background work?
- do we need this infrastructure at current scale?

AI providers, image storage, database size, and always-on clusters are common cost drivers.

## Graceful Degradation

Graceful degradation means the system keeps core behavior working when optional components fail.

Examples:

- Redis down: bypass cache and log degraded mode
- Kafka delayed: checkout continues but analytics lag
- recommendation unavailable: show popular products
- AI provider timeout: return retryable error or queued job status

## Strong Interview Answer

If asked "How do you design for reliability and scale?", say:

> I separate paths by their requirements. Read-heavy paths get caching, pagination, and horizontal scaling. Correctness-heavy paths like payments get idempotency, durable state, and stronger validation. Non-critical work like analytics moves async. I add observability, rate limits, retries with backoff, graceful degradation, and clear rollback paths.

## Artistry Cart Connection

Artistry Cart already demonstrates different requirement levels: payment webhooks need correctness, Kafka analytics can be eventually consistent, Redis can degrade, recommendations can be cached or fallback-based, and AI Vision needs cost and latency controls.
