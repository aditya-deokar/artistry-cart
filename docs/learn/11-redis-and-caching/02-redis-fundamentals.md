# Redis Fundamentals

## What Redis Is

Redis is an in-memory data store.

It is commonly used for:

- caching
- sessions
- rate limiting
- counters
- queues
- pub/sub
- distributed locks
- short-lived state

Redis is fast because it primarily works in memory.

## Redis Versus Database

Redis:

- very fast
- in-memory
- often temporary
- simple data structures
- useful for caching and coordination

Database:

- durable source of truth
- richer persistence model
- query capabilities
- long-term business data

Mental model:

```text
MongoDB stores truth.
Redis stores fast temporary access or coordination data.
```

## Redis Data Structures

Redis is not only key-value strings. It supports several data structures.

## String

Simple key-value.

Example:

```text
SET product:p1 "{...json...}"
GET product:p1
```

Use cases:

- cached JSON
- tokens
- counters
- small config values

## Hash

Stores fields under one key.

Example:

```text
HSET user:u1 name "Asha" role "seller"
HGET user:u1 role
```

Use cases:

- object-like data
- user/session metadata
- partial field updates

## List

Ordered list of values.

Use cases:

- simple queues
- recent activity
- logs/small streams

## Set

Unordered unique values.

Use cases:

- unique user ids
- feature membership
- tags
- deduplication

## Sorted Set

Unique values with scores.

Use cases:

- leaderboards
- ranked feeds
- expiring priority patterns
- top products by score

## Pub/Sub

Redis pub/sub sends messages to subscribers.

Use cases:

- lightweight notifications
- cache invalidation signals
- real-time events at small scale

For durable event streaming, Kafka is usually stronger.

## TTL

TTL means time to live.

Example:

```text
SET session:u1 "...data..." EX 3600
```

The key expires after 3600 seconds.

TTL is important for:

- sessions
- rate limits
- temporary tokens
- cached query results

## Redis Is Single-Threaded For Commands

Redis traditionally processes commands very quickly in a mostly single-threaded command execution model.

That is fine because operations are usually simple and memory-based.

Avoid:

- huge values
- slow commands on large keyspaces
- unbounded keys
- blocking operations in hot paths

## Interview Explanation

If asked "What is Redis?", say:

> Redis is a fast in-memory data store commonly used for caching, sessions, rate limiting, counters, queues, pub/sub, and short-lived coordination state. It supports data structures like strings, hashes, lists, sets, and sorted sets. It is usually not the durable source of truth for core business data.

## Connection To Artistry Cart

Artistry Cart has Redis helper code under:

```text
packages/libs/redis
```

Redis can support auth and order flows, but MongoDB/Prisma remains the durable data layer.

