# Redis And Caching

This folder is the eleventh learning block for preparing for a bigger engineering role. It explains Redis and caching from first principles, then connects those ideas to service-oriented backend architecture and Artistry Cart.

The goal is to understand when caching improves a system, when it makes correctness harder, and how to explain Redis confidently in interviews.

## Learning Outcome

After completing this topic, you should be able to explain:

- what caching is and why it exists
- what Redis is and where it fits
- common Redis data structures
- TTL and expiration
- cache-aside, write-through, write-behind, and read-through patterns
- cache invalidation strategies
- Redis use cases such as sessions, rate limiting, locks, counters, queues, and pub/sub
- cache failure modes and consistency risks
- how to design graceful fallback when Redis is down
- how Redis fits into Artistry Cart

## Files In This Topic

1. [Caching Fundamentals](./01-caching-fundamentals.md)
2. [Redis Fundamentals](./02-redis-fundamentals.md)
3. [Cache Patterns](./03-cache-patterns.md)
4. [TTL, Invalidation, And Consistency](./04-ttl-invalidation-and-consistency.md)
5. [Redis Use Cases In Backend Systems](./05-redis-use-cases-in-backend-systems.md)
6. [Failure Modes, Scaling, And Operations](./06-failure-modes-scaling-operations.md)
7. [Redis In Artistry Cart](./07-redis-in-artistry-cart.md)
8. [Interview Questions And Answer Patterns](./08-interview-questions-and-answer-patterns.md)

## Core Mental Model

```text
database = durable source of truth
cache = faster temporary copy or coordination helper
```

Redis can make systems faster and more resilient under load, but it should not casually become the only place important business state lives.

## Connection To Artistry Cart

Artistry Cart has Redis support through shared infrastructure under:

```text
packages/libs/redis
```

Redis is relevant to flows such as:

- auth/session-adjacent behavior
- order/payment support flows
- rate limiting
- short-lived state
- cache-like fast reads
- graceful fallback in tests or local environments

