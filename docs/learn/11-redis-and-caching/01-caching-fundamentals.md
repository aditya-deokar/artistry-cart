# Caching Fundamentals

## What Is Caching

Caching means storing a copy of data in a faster place so future reads are quicker or cheaper.

Without cache:

```text
request -> database/external API -> response
```

With cache:

```text
request -> cache
  if hit -> response
  if miss -> database/external API -> cache -> response
```

## Why Caching Exists

Caching helps reduce:

- latency
- database load
- external API calls
- repeated computation
- infrastructure cost
- user-perceived slowness

Example:

```text
Product category list changes rarely.
Cache it so every request does not hit MongoDB.
```

## Cache Hit And Cache Miss

Cache hit:

```text
requested data exists in cache
```

Cache miss:

```text
requested data is not in cache
```

Good cache design aims for high hit rate without serving dangerously stale data.

## Source Of Truth

The source of truth is the system that owns correct durable state.

Usually:

```text
MongoDB = source of truth
Redis = cache/helper
```

If Redis data disappears, the system should usually be able to rebuild it from the source of truth.

## What To Cache

Good candidates:

- frequently read data
- expensive computed results
- data that changes slowly
- public configuration
- product/category lists
- session lookups
- rate limit counters
- short-lived tokens

Poor candidates:

- highly sensitive data without strict controls
- rapidly changing payment state
- data where stale reads cause serious harm
- huge values that waste memory
- data with unclear invalidation rules

## Stale Data

Stale data means cached data is older than the source of truth.

Example:

```text
product price changed in database
cache still has old price
```

This may be acceptable for:

- product recommendations
- analytics counters
- public category metadata

This is risky for:

- checkout totals
- payment state
- inventory correctness
- auth permissions

## Cache Granularity

You can cache:

- one field
- one object
- one query result
- one page response
- one computed aggregate

Example keys:

```text
product:p1
seller:s1:orders:page:1
recommendations:user:u1
rate-limit:login:ip:127.0.0.1
```

## Caching Is A Tradeoff

Benefits:

- faster reads
- less database load
- smoother spikes

Costs:

- invalidation complexity
- stale data risk
- extra infrastructure
- memory limits
- cache stampede risk
- operational monitoring

## Interview Explanation

If asked "What is caching?", say:

> Caching stores frequently used or expensive-to-compute data in a faster layer so future requests avoid repeated database or external API work. The tradeoff is consistency: cached data can become stale, so we need TTLs, invalidation, and careful decisions about what is safe to cache.

## Connection To Artistry Cart

Caching can help Artistry Cart with:

- category/product metadata
- recommendation results
- auth/session-adjacent lookups
- rate limiting counters
- AI Vision rate/usage support
- seller dashboard summaries

But checkout totals, payment state, and authorization must stay strongly correct.

