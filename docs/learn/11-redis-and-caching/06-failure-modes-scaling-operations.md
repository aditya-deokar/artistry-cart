# Failure Modes, Scaling, And Operations

## Redis Can Fail

Redis is fast, but it is still infrastructure.

Failure modes:

- Redis unavailable
- network timeout
- memory full
- eviction removes keys
- connection leak
- hot key overload
- bad key pattern
- persistence misconfiguration
- replica lag/failover issues

## Graceful Fallback

For cache use cases, fallback should often be:

```text
Redis miss/failure -> query database
```

If Redis is down, the app may be slower but still functional.

For sessions/rate limits, fallback is harder.

Decide:

- fail open?
- fail closed?
- degraded mode?

Example:

```text
login rate limiter unavailable
fail closed for high-risk admin login
fail open with warning for low-risk public read
```

## Memory Management

Redis stores data in memory.

Watch:

- memory usage
- key count
- average value size
- eviction policy
- TTL coverage

Avoid:

- storing huge JSON blobs
- keys without TTL for temporary data
- unbounded user-specific caches
- caching every unique query

## Eviction

When memory is full, Redis may evict keys depending on policy.

If your app assumes keys never disappear, eviction can cause bugs.

Design cache logic to handle missing keys.

## Hot Keys

A hot key receives too much traffic.

Example:

```text
homepage:featured-products
```

Problems:

- single key becomes bottleneck
- cache stampede if it expires

Mitigations:

- refresh ahead
- jitter TTL
- local in-process cache for extremely hot safe data
- split keys if possible

## Connection Management

Backend services should not create a new Redis connection per request.

Better:

```text
create shared Redis client at startup
reuse it
close on shutdown
```

## Monitoring

Monitor:

- uptime
- memory usage
- evictions
- keyspace hits/misses
- command latency
- connected clients
- blocked clients
- replication status
- CPU usage

Application metrics:

- cache hit rate
- cache miss rate
- fallback count
- rate limit blocks
- Redis errors

## Security

Redis security basics:

- do not expose Redis publicly
- use authentication where supported
- use TLS in production where needed
- restrict network access
- do not store secrets without need
- avoid logging Redis values containing sensitive data

## Interview Explanation

If asked "What happens if Redis goes down?", say:

> It depends on the use case. If Redis is only a cache, the service should fall back to the database and run slower. If Redis stores sessions, rate limits, locks, or idempotency keys, failure affects correctness or security decisions, so we need an explicit fail-open, fail-closed, or degraded-mode policy. Redis should be monitored for memory, evictions, latency, and hit rate.

## Connection To Artistry Cart

Artistry Cart should treat Redis as optional or gracefully disabled in some environments, especially tests. Core durable state should remain in MongoDB/Prisma, while Redis supports selected fast-path or temporary behaviors.

