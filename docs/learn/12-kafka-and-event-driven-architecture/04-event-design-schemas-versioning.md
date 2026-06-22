# Event Design, Schemas, And Versioning

## Why Event Design Matters

Events are contracts between producers and consumers.

If producers change event shape without care, consumers can break.

Good event design makes async systems safer.

## Event Naming

Use past-tense facts.

Good:

```text
ProductViewed
ProductAddedToCart
OrderCreated
PaymentSucceeded
```

Less ideal:

```text
ViewProduct
DoAnalytics
ProcessOrder
```

Events should say what happened, not what a consumer should do.

## Event Envelope

An event envelope contains metadata plus payload.

Example:

```json
{
  "eventId": "evt_123",
  "eventType": "ProductViewed",
  "version": 1,
  "occurredAt": "2026-06-10T10:00:00.000Z",
  "producer": "user-ui",
  "payload": {
    "userId": "u1",
    "productId": "p1"
  }
}
```

Useful metadata:

- event id
- event type
- version
- timestamp
- producer
- correlation/request id
- payload

## Event Id

Event id helps with:

- deduplication
- tracing
- debugging
- idempotency

Consumers can store processed event ids for critical workflows.

## Event Version

Version helps schema evolution.

Example:

```json
{
  "eventType": "ProductViewed",
  "version": 2
}
```

Consumers can handle multiple versions during migration.

## Backward-Compatible Changes

Usually safe:

- add optional field
- add new event type
- add metadata field

Risky:

- remove required field
- rename field
- change field type
- change meaning of field

## Schema Registry

Mature Kafka systems often use a schema registry.

Schema registry helps:

- validate event payloads
- enforce compatibility
- document contracts
- generate types

Common schema formats:

- JSON Schema
- Avro
- Protobuf

## Runtime Validation

Even with TypeScript, Kafka messages are runtime data.

Consumers should validate:

- event type
- version
- required fields
- field types
- allowed enum values

Do not assume every message is valid.

## Event Granularity

Too coarse:

```text
UserDidSomething
```

Too fine:

```text
MouseMovedOnePixel
```

Good event granularity reflects useful business facts.

Example:

```text
ProductViewed
WishlistAdded
CheckoutStarted
OrderPaid
```

## Interview Explanation

If asked "How do you design Kafka events?", say:

> I treat events as contracts. I use past-tense names for facts, include metadata like event id, type, version, timestamp, and producer, validate payloads at the consumer boundary, and evolve schemas backward-compatibly. For mature systems, I would use a schema registry and compatibility rules.

## Connection To Artistry Cart

Artistry Cart analytics events should define:

- event type
- user id when available
- product id when relevant
- timestamp
- location/device metadata when useful
- event id for deduplication
- version for future evolution

