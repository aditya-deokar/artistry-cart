# Event-Driven Architecture Fundamentals

## What Is Event-Driven Architecture

Event-driven architecture is a design style where systems communicate by producing and consuming events.

An event means:

```text
Something happened.
```

Examples:

- `UserSignedUp`
- `ProductViewed`
- `ProductAddedToCart`
- `OrderCreated`
- `PaymentSucceeded`
- `AiConceptGenerated`

The producer records that something happened. Consumers react to it.

## Why Events Exist

Events help decouple work that does not need to happen inside the main request.

Without events:

```text
user action -> write analytics -> update recommendation data -> return response
```

With events:

```text
user action -> publish event -> return response
Kafka consumer processes analytics later
```

This protects user-facing latency.

## Synchronous Versus Event-Driven

Synchronous:

```text
caller waits for response
```

Example:

```text
user-ui -> api-gateway -> product-service -> response
```

Event-driven:

```text
producer publishes event and does not wait for all consumers
```

Example:

```text
user-ui -> Kafka -> kafka-service processes later
```

## Event Versus Command

Event:

```text
Something happened.
```

Example:

```text
ProductViewed
OrderPaid
```

Command:

```text
Please do something.
```

Example:

```text
SendOrderEmail
GenerateRecommendations
```

Events are facts. Commands are requests.

## Benefits Of Event-Driven Architecture

Benefits:

- decouples producers and consumers
- protects request latency
- supports multiple consumers
- buffers traffic spikes
- enables background processing
- improves audit/history possibilities
- supports eventual consistency and read models

## Costs Of Event-Driven Architecture

Costs:

- eventual consistency
- harder debugging
- duplicate event handling
- ordering issues
- schema evolution
- retry strategy
- monitoring consumer lag
- dead-letter handling

Events are powerful, but they add operational responsibility.

## Eventual Consistency

Event-driven systems often use eventual consistency.

Example:

```text
User views product at 10:00:00.
Analytics updates at 10:00:02.
Recommendation model uses it later.
```

This is fine for analytics and recommendations.

It may be risky for:

- payment state
- inventory correctness
- auth permissions

## When To Use Events

Use events when:

- work can happen later
- multiple consumers may need the same fact
- producer should not know all consumers
- traffic spikes need buffering
- audit/history matters
- background processing is useful

Avoid events when:

- caller needs immediate result
- strong transaction is required
- ordering is strict and hard to guarantee
- operations team cannot monitor the pipeline
- simple synchronous call is enough

## Interview Explanation

If asked "What is event-driven architecture?", say:

> Event-driven architecture is a style where services publish facts about things that happened, and other services consume those events asynchronously. It decouples producers from consumers and keeps non-critical work off the request path, but introduces eventual consistency, retries, ordering, schema versioning, and observability challenges.

## Connection To Artistry Cart

Artistry Cart uses event-driven architecture mainly for analytics:

- buyer interaction occurs
- event is produced to Kafka
- `kafka-service` consumes it
- analytics are materialized into MongoDB
- recommendation service uses analytics later

