# Redis In Artistry Cart

## Where Redis Fits

Artistry Cart has Redis support through:

```text
packages/libs/redis
```

This shared package centralizes Redis initialization and fallback behavior.

Services that may use Redis include:

- `auth-service`
- `order-service`
- AI/rate-limit related flows if extended
- other backend services needing cache-like fast access

## Why Redis Belongs In A Shared Package

Redis setup is infrastructure code.

Shared package benefits:

- consistent connection setup
- consistent environment config handling
- graceful disabled mode
- fewer duplicate Redis clients
- easier testing
- one place to improve fallback behavior

## Likely Artistry Cart Use Cases

### Auth Support

Potential uses:

- session lookup
- refresh-token/session metadata
- login rate limiting
- activation/reset temporary tokens

### Order Support

Potential uses:

- temporary checkout state
- idempotency keys
- payment attempt tracking
- short-lived locks for duplicate submission prevention

### AI Vision Support

Potential uses:

- rate limit counters
- temporary session counters
- expensive result caching
- background job coordination

### Recommendation Support

Potential uses:

- cached recommendation results
- short-lived computed scores
- popular product lists

## What Should Not Depend Only On Redis

Do not make Redis the only source of truth for:

- final order state
- payment status
- product ownership
- user identity record
- seller shop data
- durable analytics history

These should live in MongoDB/Prisma or another durable source.

## Environment Behavior

In tests and local development, Redis may be disabled.

That means code should handle:

```text
REDIS_ENABLED=false
```

Good design:

- service still starts
- cache paths become no-ops or fallback
- tests do not require Redis unless testing Redis behavior specifically

## Example Cache-Aside Flow For Products

```text
GET product:p1
  -> check Redis
  -> if hit, return product
  -> if miss, query MongoDB through Prisma
  -> set Redis key with TTL
  -> return product
```

Invalidation:

```text
product update -> delete product:p1 and related list/search caches
```

## Example Rate Limit Flow

```text
login attempt
  -> INCR rate-limit:login:ip
  -> set TTL if first attempt
  -> if count > limit, return 429
```

## Architecture Tradeoff

Redis improves speed and coordination, but adds:

- infrastructure dependency
- failure modes
- stale data risk
- memory constraints
- monitoring needs

## Interview Explanation

If asked "How is Redis used in your project?", say:

> Artistry Cart has Redis support as shared infrastructure under `packages/libs/redis`. Redis is useful for cache-like reads, auth/session-adjacent behavior, rate limiting, temporary checkout or idempotency state, and expensive result caching. The durable source of truth remains MongoDB through Prisma, and Redis should have graceful fallback where possible.

