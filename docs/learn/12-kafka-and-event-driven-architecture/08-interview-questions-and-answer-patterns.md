# Interview Questions And Answer Patterns

This file gives interview-ready answers for Kafka and event-driven architecture.

## Question: What Is Event-Driven Architecture?

Strong answer:

> Event-driven architecture is a design style where services publish facts about things that happened, and other services consume those events asynchronously. It decouples producers from consumers and keeps non-critical work off the request path, but introduces eventual consistency, retries, ordering, schema versioning, and observability challenges.

## Question: What Is Kafka?

Strong answer:

> Kafka is a distributed event streaming platform. Producers write events to topics, topics are split into partitions, Kafka stores events as ordered logs within partitions, and consumers read events while tracking offsets. Consumer groups allow horizontal scaling by distributing partitions across consumers.

## Question: Kafka Versus Queue?

Strong answer:

> In a traditional queue, a message is usually removed after one consumer processes it. Kafka stores events in a durable log for a retention period, and each consumer group tracks its own offsets. That lets multiple consumer groups independently read the same topic and replay events if retention allows.

## Question: What Is A Topic?

Strong answer:

> A topic is a named stream of events in Kafka. Producers write events to a topic, and consumers subscribe to topics to process those events.

## Question: What Is A Partition?

Strong answer:

> A partition is an ordered log inside a topic. Kafka preserves order within a partition. Partitions allow parallelism because different consumers in a group can process different partitions.

## Question: What Is An Offset?

Strong answer:

> An offset is the position of a message inside a partition. Consumers commit offsets to record how far they have processed.

## Question: What Is A Consumer Group?

Strong answer:

> A consumer group is a set of consumers sharing work for a topic. Kafka assigns partitions to consumers in the group, so each partition is processed by one consumer in that group at a time. Different groups can read the same topic independently.

## Question: How Does Kafka Ordering Work?

Strong answer:

> Kafka guarantees ordering only within a partition, not globally across all partitions. If we need ordering for a user or order, we choose a partition key like userId or orderId so related events go to the same partition.

## Question: What Is Consumer Lag?

Strong answer:

> Consumer lag is the difference between the latest offset in a partition and the offset a consumer group has processed. High lag means consumers are behind producers, which can make analytics or read models stale.

## Question: What Is Idempotency In Kafka Consumers?

Strong answer:

> Idempotency means processing the same event more than once has the same final effect. Kafka systems often use at-least-once delivery, so duplicates can happen. Consumers should handle duplicates with event ids, upserts, deterministic updates, or processed-event tracking.

## Question: What Is A Dead-Letter Topic?

Strong answer:

> A dead-letter topic stores messages that cannot be processed after validation failure or repeated retry failure. It keeps the main consumer moving while preserving failed messages for debugging and replay.

## Question: How Do You Design Event Schemas?

Strong answer:

> I treat events as contracts. I use past-tense names, include metadata like event id, event type, version, timestamp, producer, and correlation id, validate payloads at the consumer boundary, and evolve schemas backward-compatibly. Mature systems often use a schema registry.

## Question: When Should You Not Use Kafka?

Strong answer:

> I would avoid Kafka when a simple synchronous API call is enough, when the caller needs an immediate result, when the team cannot operate and monitor Kafka, or when the workflow requires strong immediate consistency and no async delay.

## Question: How Does This Apply To Artistry Cart?

Strong answer:

> Artistry Cart uses Kafka for user activity analytics. Events are produced from the frontend side, stored in Kafka, consumed by `kafka-service`, and materialized into MongoDB as user/product analytics. `recommendation-service` later reads that prepared analytics data. This decouples analytics writes from the buyer request path.

## Best Short Project Pitch For This Topic

> Kafka in Artistry Cart is used where async processing makes sense: analytics. User interactions become events, Kafka buffers them, a worker consumes and materializes analytics, and recommendations use that data later. The next maturity steps would be event schema versioning, dead-letter topics, idempotent deduplication, retry policy, and lag monitoring.

