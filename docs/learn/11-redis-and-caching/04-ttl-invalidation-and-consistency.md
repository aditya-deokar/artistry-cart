# TTL, Invalidation, And Consistency

## Why Invalidation Is Hard

Caching is easy when data never changes.

Real data changes:

- product price changes
- discount starts/ends
- order status changes
- user role changes
- AI usage limits update

Invalidation answers:

> How do we stop serving old cached data?

## TTL

TTL means time to live.

It tells Redis when to expire a key.

Example:

```text
cache product:p1 for 300 seconds
```

Benefits:

- simple
- automatic cleanup
- bounds staleness

Cost:

- data can be stale until TTL expires

## Choosing TTL

Short TTL:

- fresher data
- more database load

Long TTL:

- faster reads
- less database load
- more stale data risk

Choose TTL based on business tolerance.

Examples:

```text
rate limit counter: seconds/minutes
session metadata: minutes/hours
product detail: seconds/minutes
static category metadata: minutes/hours
checkout totals: avoid or very short with revalidation
```

## Manual Invalidation

Manual invalidation deletes or updates cache when data changes.

Example:

```text
product updated -> DEL product:p1
```

This keeps cache fresher than TTL alone.

## Event-Based Invalidation

When a change happens, publish an event.

Example:

```text
ProductUpdated event -> cache invalidator deletes product:p1
```

Useful in larger systems, but adds complexity.

## Versioned Keys

Versioned keys include a version or timestamp.

Example:

```text
product:p1:v3
```

When product changes, version changes and old cache is ignored.

Useful when deleting old keys is hard, but old keys need expiration to avoid memory growth.

## Consistency Models

### Strong Consistency

Every read must reflect latest write.

Use for:

- payment state
- order correctness
- auth permissions

### Eventual Consistency

Reads may be stale briefly.

Use for:

- recommendations
- analytics
- public metadata
- non-critical dashboard summaries

## Cache Invalidation Strategies

Common strategies:

- TTL only
- delete on write
- update on write
- event-based invalidation
- versioned keys
- stale-while-revalidate

No single strategy fits all data.

## Common Mistakes

- caching data with no invalidation plan
- caching permissions too long
- caching checkout totals incorrectly
- using same TTL for every data type
- forgetting to invalidate list caches
- deleting item cache but not search/list cache
- no key naming convention
- no monitoring for hit rate or memory

## Interview Explanation

If asked "How do you handle cache invalidation?", say:

> I choose invalidation based on the data's consistency needs. TTL is simple and bounds staleness, but for important updates I delete or update cache on write. For larger systems, event-based invalidation or versioned keys can help. I avoid caching data where stale reads would break correctness, such as payment state or critical authorization decisions.

## Connection To Artistry Cart

High caution:

- order/payment state
- seller ownership authorization
- checkout totals

More cache-friendly:

- category metadata
- product detail snapshots with short TTL
- recommendation results
- dashboard summaries
- AI rate-limit support with expiry

