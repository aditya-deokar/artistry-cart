# Async Processing, Kafka, Queues, And Backpressure

## Why Async Processing Exists

Not all work must happen before the user gets a response.

Foreground work:

```text
must complete before responding
```

Background work:

```text
can happen after responding
```

Moving non-critical work async improves user-facing latency and protects critical paths.

## Good Async Candidates

Good candidates:

- analytics events
- email sending
- image processing
- recommendation training
- AI embedding maintenance
- cleanup jobs
- reporting
- webhook fanout

Bad candidates:

- core payment correctness unless carefully designed
- inventory decisions that must be synchronous
- auth decisions needed immediately

## Kafka

Kafka is an event streaming platform.

It is useful when you need:

- durable event log
- high throughput
- multiple consumers
- replay
- decoupled producers and consumers
- ordered processing within partitions

Artistry Cart uses Kafka for analytics ingestion.

## Foreground Latency Benefit

The design in Artistry Cart:

```text
user action -> publish analytics event -> kafka-service processes later
```

This avoids forcing user-facing requests to synchronously update every analytics or recommendation record.

The ADR says this keeps foreground commerce latency cleaner.

## Eventual Consistency

Async processing introduces eventual consistency.

That means:

```text
the user action happens now, but derived analytics or recommendations update later
```

This is acceptable for analytics and personalization, but not always acceptable for payments or inventory correctness.

## Queue Growth

If producers publish faster than consumers process, queue size or lag grows.

Causes:

- consumer too slow
- database sink too slow
- bad event causing retries
- hot partition
- external dependency latency
- insufficient consumer replicas

Queue growth is a performance and reliability signal.

## Backpressure

Backpressure prevents overload.

Patterns:

- rate limit producers
- batch consumer writes
- retry with backoff
- dead-letter invalid messages
- pause consumers when sink is overloaded
- scale consumers when safe
- shed non-critical load

## Worker Scaling

Scaling workers depends on the bottleneck.

Adding consumers helps if:

- topic has enough partitions
- work is parallelizable
- downstream database can handle more writes

Adding consumers may not help if:

- one partition is hot
- database is saturated
- all workers are stuck on same external API

## Cron Jobs And Background Maintenance

Artistry Cart also uses background work outside Kafka:

- product cleanup CronJob in Kubernetes
- AI Vision background maintenance jobs

This keeps maintenance work out of foreground user flows.

## Strong Interview Answer

If asked "How does async processing improve performance?", say:

> Async processing removes non-critical work from the user-facing request path. The request can finish after durable handoff, while a worker processes analytics, emails, recommendations, or media later. The tradeoff is eventual consistency and more operational complexity around retries, idempotency, lag, backpressure, and observability.

## Artistry Cart Connection

Artistry Cart uses Kafka to decouple user-behavior analytics from browsing, shopping, and checkout paths. The `kafka-service` materializes analytics for recommendations, while monitoring rules watch queue growth and parse errors.
