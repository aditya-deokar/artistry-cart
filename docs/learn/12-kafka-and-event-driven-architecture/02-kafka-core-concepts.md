# Kafka Core Concepts

## What Kafka Is

Kafka is a distributed event streaming platform.

It is used to:

- publish events
- store events durably for a retention period
- let consumers read events
- scale event processing
- decouple producers and consumers

Kafka is not just a queue. It is a durable log of events organized by topics and partitions.

## Broker

A broker is a Kafka server.

Kafka clusters usually have multiple brokers for scale and availability.

In local development, you may run one broker through Docker Compose.

## Topic

A topic is a named stream of events.

Example:

```text
user-events
order-events
payment-events
```

Producers write to topics. Consumers read from topics.

## Partition

A topic is split into partitions.

Partitions allow:

- parallelism
- scaling
- ordered log per partition

Within one partition, Kafka preserves event order.

Across different partitions, global order is not guaranteed.

## Offset

An offset is the position of an event inside a partition.

Example:

```text
topic user-events
partition 0
offset 42
```

Consumers track offsets to know what they have processed.

## Producer

A producer writes events to Kafka topics.

Example:

```text
user-ui publishes ProductViewed event
```

Producer responsibilities:

- choose topic
- create event payload
- optionally choose event key
- handle publish errors

## Consumer

A consumer reads events from Kafka topics.

Example:

```text
kafka-service consumes user-events
```

Consumer responsibilities:

- process messages
- handle failures
- commit offsets safely
- avoid duplicate side effects
- monitor lag

## Consumer Group

A consumer group is a set of consumers sharing work for a topic.

Kafka assigns partitions to consumers in the group.

Example:

```text
consumer group: analytics-workers
topic: user-events
```

If there are more partitions, more consumers can process in parallel.

## Retention

Kafka keeps events for a configured retention period.

Example:

```text
keep events for 7 days
```

Consumers can replay events if offsets are reset and retention still contains the data.

## Kafka Versus Traditional Queue

Traditional queue:

```text
message consumed -> removed
```

Kafka:

```text
event stored in log -> consumers track offsets
```

This allows multiple consumer groups to read the same topic independently.

## Interview Explanation

If asked "What is Kafka?", say:

> Kafka is a distributed event streaming platform. Producers write events to topics, topics are split into partitions, Kafka stores events as ordered logs within partitions, and consumers read events while tracking offsets. Consumer groups allow horizontal scaling by distributing partitions across consumers.

## Connection To Artistry Cart

Artistry Cart uses Kafka for the `user-events` style analytics flow:

```text
producer -> Kafka topic -> kafka-service consumer -> MongoDB analytics
```

