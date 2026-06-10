# Failure Handling, Resilience, And Observability

## Distributed Systems Fail Differently

In a monolith, many calls are in-process function calls.

In microservices, calls cross:

- network
- containers
- services
- databases
- queues
- external providers

Each boundary can fail.

## Common Failure Modes

Failures include:

- service is down
- network timeout
- DNS issue
- database unavailable
- queue unavailable
- message duplicated
- message delayed
- downstream returns bad response
- provider rate limit
- deployment mismatch
- schema mismatch

## Timeout

A timeout prevents waiting forever.

Example:

```text
gateway waits 3 seconds for product-service
if no response, return timeout error
```

Without timeouts, requests can hang and exhaust resources.

## Retry

A retry attempts the operation again after failure.

Useful for:

- temporary network errors
- transient provider errors
- queue publishing failures

Danger:

Retries can make problems worse if:

- downstream is overloaded
- operation is not idempotent
- retries happen too aggressively

Use:

- retry limit
- backoff
- jitter
- idempotency keys

## Circuit Breaker

A circuit breaker stops calling a failing dependency temporarily.

States:

- closed: calls allowed
- open: calls blocked
- half-open: test if dependency recovered

This protects the system from repeatedly calling a broken dependency.

## Bulkhead

Bulkhead pattern isolates resources.

Example:

```text
AI requests cannot consume all worker capacity needed for checkout.
```

This prevents one failing area from taking down everything.

## Idempotency

Idempotency means repeated processing has the same final result.

Important for:

- webhooks
- retries
- queue consumers
- payment operations

Example:

```text
same Stripe webhook arrives twice
order-service handles it once logically
```

## Graceful Degradation

Graceful degradation means the system still works partially when a dependency fails.

Example:

```text
recommendations fail
product page still loads default products
```

Not every dependency should block the whole user experience.

## Observability

Observability means understanding what the system is doing from outside signals.

Core signals:

- logs
- metrics
- traces

## Logs

Logs tell what happened.

Useful fields:

- timestamp
- service name
- request id
- route
- status code
- duration
- user id if safe
- error code

## Metrics

Metrics show trends and health.

Examples:

- request count
- error rate
- latency
- CPU/memory
- queue lag
- database query time
- external provider failures

## Traces

Traces follow one request across services.

Example:

```text
user-ui request
  -> api-gateway span
  -> order-service span
  -> Stripe span
  -> database span
```

Tracing is very useful in microservices because one user request may touch multiple services.

## Interview Explanation

If asked "What makes microservices hard to operate?", say:

> Microservices introduce partial failure. Network calls, downstream services, queues, databases, and providers can fail independently. Production systems need timeouts, retries with backoff, idempotency, circuit breakers, graceful degradation, health checks, logs, metrics, and traces to stay reliable and debuggable.

## Connection To Artistry Cart

Failure cases in Artistry Cart:

- gateway cannot reach a service
- MongoDB unavailable
- Redis unavailable
- Kafka consumer lag
- Stripe webhook duplicated
- AI provider slow or rate limited
- recommendation logic slow
- service readiness fails in CI or Kubernetes

