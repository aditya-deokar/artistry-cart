# Latency, Throughput, Bottlenecks, And Capacity

## Latency

Latency is how long one operation takes.

Examples:

- product search returns in 180 ms
- checkout API returns in 600 ms
- AI generation returns in 12 seconds
- recommendation endpoint returns in 900 ms

Users usually feel latency directly.

## Throughput

Throughput is how much work the system completes over time.

Examples:

- requests per second
- orders per minute
- Kafka events per second
- images processed per hour

Throughput is about volume.

## Latency Versus Throughput

Low latency means one request is fast.

High throughput means many requests can be handled.

They are related, but not identical.

Example:

```text
one API may respond quickly under low traffic but become slow when many users hit it together
```

## Percentiles

Average latency can hide pain.

Use percentiles:

- p50: typical request
- p95: slowest 5 percent boundary
- p99: slowest 1 percent boundary

If p99 is bad, some users are having a bad experience even if the average looks fine.

## Bottleneck

A bottleneck is the constrained part of the system.

Common bottlenecks:

- database query
- missing index
- external API
- CPU-heavy computation
- large response payload
- image processing
- Kafka consumer sink
- network hop
- memory pressure
- lock or contention

Optimization should target the bottleneck, not random code.

## Capacity

Capacity is how much load a system can handle while staying within acceptable reliability and latency targets.

Capacity depends on:

- hardware resources
- number of replicas
- database limits
- cache hit rate
- queue throughput
- external API limits
- code efficiency
- traffic shape

## Saturation

Saturation means a resource is near its limit.

Examples:

- CPU at 95 percent
- memory near limit
- DB connection pool exhausted
- Kafka queue growing
- thread pool or event loop blocked

Saturation usually causes latency to rise before the system fully fails.

## Little's Law Intuition

A simple systems intuition:

```text
more arrival rate + same processing speed = more waiting
```

If requests arrive faster than they are completed, queues form and latency grows.

This applies to:

- HTTP requests
- database connections
- Kafka events
- background jobs
- AI tasks

## Backpressure

Backpressure means slowing or rejecting incoming work when downstream systems cannot keep up.

Examples:

- rate limiting
- queue size limit
- circuit breaker
- retry with backoff
- returning 429 or 503
- pausing consumers

Backpressure prevents overload from turning into total failure.

## Strong Interview Answer

If asked "How do you find a performance bottleneck?", say:

> I start with measurements across the full request path: route latency percentiles, error rate, CPU, memory, database query time, cache hit rate, queue lag, and external dependency latency. Then I identify the constrained layer and optimize there first, because improving non-bottleneck code usually does not improve user experience.

## Artistry Cart Connection

For Artistry Cart, likely bottlenecks at scale include recommendation scoring, AI Vision provider latency, large catalog queries, payment webhook throughput, Kafka worker sink speed, and shared MongoDB contention across services.
