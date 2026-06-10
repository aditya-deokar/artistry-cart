# Cache Patterns

## Why Patterns Matter

Caching is not only "put data in Redis."

You need a pattern for:

- how data gets into cache
- how data is read
- how data is refreshed
- how data is invalidated
- what happens when cache fails

## Cache-Aside

Cache-aside is the most common pattern.

Flow:

```text
1. App checks cache.
2. If cache hit, return cached data.
3. If cache miss, read database.
4. Store result in cache with TTL.
5. Return result.
```

Example:

```text
GET product:p1
if missing -> query MongoDB -> SET product:p1
```

Benefits:

- simple
- app controls caching
- cache can be rebuilt from database

Costs:

- first request after miss is slower
- stale data possible
- invalidation is app responsibility

## Read-Through Cache

In read-through, the cache layer knows how to load missing data.

Flow:

```text
app -> cache
cache miss -> cache loads from database
```

This is less common with plain Redis because application code usually controls loading.

## Write-Through Cache

Write-through writes to cache and database together.

Flow:

```text
app writes data
  -> cache updated
  -> database updated
```

Benefit:

- cache stays warm and more consistent

Cost:

- writes are slower
- failure handling is more complex

## Write-Behind Cache

Write-behind writes to cache first and database later.

Flow:

```text
app writes cache
background process writes database later
```

Benefit:

- fast writes

Risk:

- data loss if cache fails before database write
- more complex consistency

Usually risky for important business state like orders/payments.

## Refresh-Ahead

Refresh-ahead updates cache before it expires.

Useful for:

- hot keys
- expensive queries
- predictable access patterns

Example:

```text
popular homepage products refreshed every minute
```

## Negative Caching

Negative caching stores "not found" results briefly.

Example:

```text
product:p999:not-found -> TTL 30 seconds
```

Prevents repeated database hits for missing data.

Be careful with short TTLs so newly created data is not hidden too long.

## Cache Stampede

Cache stampede happens when many requests miss the cache at the same time and all hit the database.

Example:

```text
popular key expires
1000 requests arrive
all query MongoDB
```

Mitigations:

- jittered TTL
- locking
- request coalescing
- refresh-ahead
- stale-while-revalidate

## Stale-While-Revalidate

Serve stale cached data briefly while refreshing in background.

Good for:

- non-critical reads
- product recommendations
- homepage content

Bad for:

- payment status
- checkout totals
- authorization decisions

## Interview Explanation

If asked "What cache pattern would you use?", say:

> Cache-aside is a common default. The app checks Redis first, falls back to the database on miss, stores the result with a TTL, and returns it. For frequently accessed data, I would also think about invalidation, cache stampede protection, and whether stale data is acceptable.

## Connection To Artistry Cart

Good cache-aside candidates:

- product detail reads
- category metadata
- recommendation results
- seller dashboard summaries

Poor cache candidates without careful design:

- checkout final totals
- payment state
- authorization ownership checks

