# Interview Questions And Answer Patterns

This file gives interview-ready answers for Redis and caching.

## Question: What Is Caching?

Strong answer:

> Caching stores frequently used or expensive-to-compute data in a faster layer so future requests can avoid repeated database, computation, or external API work. The tradeoff is consistency, because cached data can become stale.

## Question: What Is Redis?

Strong answer:

> Redis is a fast in-memory data store commonly used for caching, sessions, rate limiting, counters, queues, pub/sub, locks, and short-lived state. It supports data structures like strings, hashes, lists, sets, and sorted sets.

## Question: Redis Versus Database?

Strong answer:

> A database is usually the durable source of truth for business data. Redis is usually a fast temporary or derived data layer. Redis can improve performance and coordination, but core data like orders, payments, products, and users should generally remain in durable storage.

## Question: What Is TTL?

Strong answer:

> TTL means time to live. It defines how long a cached key should exist before Redis expires it automatically. TTL helps bound stale data and cleans up temporary values such as sessions, rate limit counters, and cached query results.

## Question: What Is Cache-Aside?

Strong answer:

> Cache-aside means the application checks the cache first. If data is present, it returns it. If missing, the application reads from the database, stores the result in cache with a TTL, and returns it. It is simple and common, but the app must handle invalidation and misses.

## Question: What Is Cache Invalidation?

Strong answer:

> Cache invalidation is how we prevent serving old cached data after source data changes. Strategies include TTL, deleting cache on write, updating cache on write, event-based invalidation, versioned keys, and stale-while-revalidate depending on consistency needs.

## Question: What Is A Cache Stampede?

Strong answer:

> A cache stampede happens when a popular key expires and many requests miss at the same time, causing all of them to hit the database. Mitigations include jittered TTLs, locks, request coalescing, refresh-ahead, and stale-while-revalidate.

## Question: What Would You Cache?

Strong answer:

> I would cache frequently read, expensive, or slow-changing data where short-term staleness is acceptable, such as category metadata, product detail snapshots, recommendations, dashboard summaries, or rate limit counters. I would be cautious caching payment state, checkout totals, or authorization decisions.

## Question: How Do You Handle Redis Failure?

Strong answer:

> If Redis is used as a cache, the service should fall back to the database and run slower. If Redis is used for sessions, locks, rate limits, or idempotency, failure affects correctness or security, so we need an explicit fail-open, fail-closed, or degraded-mode policy.

## Question: What Are Common Redis Use Cases?

Strong answer:

> Common Redis use cases include cache-aside reads, sessions, rate limiting, counters, temporary tokens, idempotency keys, distributed locks, lightweight queues, and pub/sub notifications.

## Question: What Are Redis Operational Concerns?

Strong answer:

> Redis needs monitoring for memory usage, evictions, hit/miss rate, command latency, connected clients, persistence, and failover. Applications should avoid huge values, unbounded keys, missing TTLs for temporary data, and creating new connections per request.

## Question: How Does This Apply To Artistry Cart?

Strong answer:

> Artistry Cart has Redis support through a shared package under `packages/libs/redis`. Redis can support auth/session-adjacent behavior, login or AI rate limiting, temporary checkout/idempotency state, and cached reads. MongoDB through Prisma remains the durable source of truth.

## Best Short Project Pitch For This Topic

> Redis in Artistry Cart is best viewed as shared infrastructure for fast temporary data and coordination, not as the main database. It can improve performance and protect services with caching and rate limits, but the design must include TTLs, invalidation, fallback behavior, and clear rules for what data is safe to cache.

