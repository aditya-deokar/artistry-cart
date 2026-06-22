# Redis Use Cases In Backend Systems

## Use Case 1: Cache-Aside Reads

Cache frequently read data.

Example:

```text
GET product:p1
if not found -> query MongoDB -> set Redis with TTL
```

Good for:

- product detail
- category metadata
- public config
- recommendation responses

## Use Case 2: Sessions

Redis can store session data.

Flow:

```text
login -> create session in Redis -> send session id cookie
request -> read session id -> lookup Redis session
```

Benefits:

- fast lookup
- easy expiry with TTL
- central revocation

Risks:

- Redis outage affects login/session checks
- needs persistence/replication strategy for production

## Use Case 3: Rate Limiting

Rate limiting tracks request counts.

Example:

```text
rate-limit:login:ip:1.2.3.4 -> count
TTL -> 60 seconds
```

Use for:

- login attempts
- password reset
- AI generation endpoints
- checkout abuse protection
- public search APIs

## Use Case 4: Counters

Redis can increment counters quickly.

Examples:

- page views
- attempts
- temporary analytics
- usage limits

Important:

> If counters are important long-term, flush or materialize them to durable storage.

## Use Case 5: Distributed Locks

Redis can support locks for coordination.

Example:

```text
only one worker processes product embedding sync at a time
```

Risks:

- lock expiration must be safe
- worker crash handling matters
- distributed locking is easy to misuse

Use carefully.

## Use Case 6: Queues

Redis lists or streams can support simple queues.

Use cases:

- small background jobs
- lightweight task processing

For heavier event streaming, Kafka is usually more appropriate.

## Use Case 7: Pub/Sub

Redis pub/sub can broadcast messages to subscribers.

Use cases:

- real-time notifications
- cache invalidation signals
- local coordination

Limitation:

> Redis pub/sub is not durable like Kafka. If subscriber is offline, message may be missed.

## Use Case 8: Temporary Tokens

Redis can store short-lived values:

- OTPs
- password reset tokens
- email verification state
- temporary checkout state

TTL makes cleanup natural.

## Use Case 9: Idempotency Keys

Redis can track recent idempotency keys.

Example:

```text
idempotency:checkout:abc123 -> processed
TTL -> 24 hours
```

Useful for preventing duplicate processing on retries.

For critical payment state, durable database records may still be safer.

## Interview Explanation

If asked "Where would you use Redis?", say:

> I would use Redis for fast temporary or derived data: caching, sessions, rate limiting, counters, locks, short-lived tokens, and lightweight coordination. I would be careful not to make Redis the only source of truth for critical business data unless the system is designed for that durability and failure model.

## Connection To Artistry Cart

Redis can support:

- auth/session-adjacent flows
- login rate limiting
- AI generation rate limiting
- temporary checkout/idempotency support
- cached recommendations
- dashboard summary caching
- background job coordination

