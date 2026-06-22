# Kafka And Event-Driven Architecture

This folder is the twelfth learning block for preparing for a bigger engineering role. It explains Kafka and event-driven architecture from first principles, then connects those ideas to Artistry Cart's analytics and recommendation pipeline.

The goal is to understand when events help, what Kafka provides, what operational complexity it introduces, and how to explain event-driven systems in interviews.

## Learning Outcome

After completing this topic, you should be able to explain:

- what event-driven architecture is
- what Kafka is and why teams use it
- producer, consumer, broker, topic, partition, offset, and consumer group
- synchronous versus asynchronous design
- event versus command
- how Kafka helps analytics and background processing
- event schema design and versioning
- retries, idempotency, and dead-letter topics
- ordering and partitioning tradeoffs
- Kafka observability and lag monitoring
- how Kafka fits into Artistry Cart

## Files In This Topic

1. [Event-Driven Architecture Fundamentals](./01-event-driven-architecture-fundamentals.md)
2. [Kafka Core Concepts](./02-kafka-core-concepts.md)
3. [Producers, Consumers, Topics, Partitions, And Offsets](./03-producers-consumers-topics-partitions-offsets.md)
4. [Event Design, Schemas, And Versioning](./04-event-design-schemas-versioning.md)
5. [Delivery Semantics, Idempotency, Retries, And Dead Letters](./05-delivery-semantics-idempotency-retries-dead-letters.md)
6. [Ordering, Scaling, Consumer Groups, And Lag](./06-ordering-scaling-consumer-groups-lag.md)
7. [Kafka In Artistry Cart](./07-kafka-in-artistry-cart.md)
8. [Interview Questions And Answer Patterns](./08-interview-questions-and-answer-patterns.md)

## Core Mental Model

```text
producer writes event -> Kafka stores event in topic -> consumer reads event -> consumer updates its own state
```

Kafka does not remove the need for good design. You still need event contracts, idempotent consumers, monitoring, retry strategy, and a clear reason for using async processing.

## Connection To Artistry Cart

Artistry Cart uses Kafka mainly for user activity analytics:

```text
user-ui
  -> Kafka user-events topic
  -> kafka-service
  -> MongoDB analytics
  -> recommendation-service reads analytics later
```

This keeps analytics materialization away from the foreground user request path.

