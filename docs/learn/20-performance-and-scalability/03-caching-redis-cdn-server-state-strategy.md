# Caching, Redis, CDN, And Server-State Strategy

## What Caching Is

Caching stores data closer to where it is needed so repeated work is faster.

Instead of recomputing or refetching every time:

```text
first request does work
later request reuses cached result
```

Caching improves latency and reduces load, but it introduces freshness and invalidation problems.

## What To Cache

Good cache candidates:

- frequently read data
- expensive computed results
- stable public content
- product lists
- category metadata
- recommendation results
- session or OTP support data
- rate-limit counters

Bad cache candidates:

- highly sensitive data without care
- rapidly changing critical state
- payment correctness decisions
- inventory updates without invalidation strategy

## Cache Hit And Cache Miss

Cache hit:

```text
requested data exists in cache
```

Cache miss:

```text
requested data is not in cache, so the system must fetch or compute it
```

Cache hit rate is a key performance metric.

## TTL

TTL means time to live.

It controls how long cached data remains valid.

Short TTL:

- fresher data
- lower cache efficiency

Long TTL:

- better cache efficiency
- more stale data risk

## Invalidation

Invalidation means removing or updating cached data when source data changes.

This is one of the hardest parts of caching.

Common strategies:

- TTL-based expiry
- write-through cache
- cache-aside
- explicit delete on write
- versioned keys
- event-driven invalidation

## Redis

Redis is an in-memory data store commonly used for caching, counters, locks, sessions, queues, and rate limits.

Artistry Cart has a shared Redis integration in:

```text
packages/libs/redis
```

It supports:

- `get`
- `set`
- `del`
- `keys`
- `setex`
- `isAvailable`

It also supports graceful degraded mode when Redis is disabled or unavailable.

## Graceful Cache Degradation

If Redis fails, the system should decide whether the feature is:

- critical and must fail safely
- best-effort and can bypass cache

Artistry Cart's Redis wrapper returns safe fallbacks such as `null`, `0`, or `[]`.

That improves availability, but it requires observability so teams notice degraded performance.

## CDN

A CDN caches static or public assets close to users.

Good CDN candidates:

- images
- CSS
- JavaScript bundles
- public product media
- static pages

For an ecommerce platform, media delivery can be a major performance factor.

## Browser And Frontend Server-State Cache

Frontend applications can avoid repeated network calls with server-state caching.

Artistry Cart uses React Query patterns in the frontend, including stale-time behavior for repeated fetches.

This reduces API pressure and makes repeated navigation feel faster.

## Cache Tradeoffs

Caching improves:

- latency
- throughput
- database load
- external API cost

Caching risks:

- stale data
- invalidation bugs
- memory pressure
- hidden dependency failure
- inconsistent behavior between cache hit and miss

## Strong Interview Answer

If asked "How do you use caching safely?", say:

> I cache data that is read frequently or expensive to compute, choose TTLs based on freshness needs, define invalidation rules, measure hit rate, and make sure cache failure degrades safely. I avoid using cache as the source of truth for critical business correctness unless the architecture is explicitly designed for that.

## Artistry Cart Connection

Artistry Cart uses Redis as a shared fast-path layer with graceful fallback, caches effective product pricing fields, reuses recommendation results for recently trained users, and uses frontend server-state caching to reduce repeated API calls.
