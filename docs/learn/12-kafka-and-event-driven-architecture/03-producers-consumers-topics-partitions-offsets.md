# Producers, Consumers, Topics, Partitions, And Offsets

## Producer Flow

A producer creates and sends an event.

Example:

```text
ProductViewed event
  -> topic: user-events
  -> key: userId or productId
  -> payload: event details
```

Producer flow:

```text
build event
validate payload
send to Kafka
handle success/failure
```

## Event Key

The event key helps Kafka choose a partition.

If events with the same key go to the same partition, their order is preserved within that key.

Examples:

```text
key by userId -> preserve per-user activity order
key by productId -> preserve per-product event order
```

Choose based on the ordering/scaling need.

## Topic Design

Topics should represent event streams.

Example topic names:

```text
user-events
order-events
payment-events
```

Avoid topics that are too vague:

```text
events
data
messages
```

Good topic names help operations and debugging.

## Partition Design

Partitions provide parallelism.

More partitions can support more consumers, but they also add operational overhead.

Consider:

- throughput
- ordering requirements
- consumer count
- future growth
- key distribution

## Consumer Flow

A consumer reads messages and performs side effects.

Example:

```text
kafka-service reads ProductViewed
  -> validate event
  -> update UserAnalytics
  -> update ProductAnalytics
  -> commit offset
```

## Offset Commit

Offset commit means:

```text
consumer records that it processed messages up to this offset
```

Commit too early:

```text
message marked processed before DB write succeeds -> data loss risk
```

Commit too late:

```text
message processed successfully but offset not committed -> duplicate processing risk
```

This is why idempotency matters.

## Batch Processing

Consumers can process messages one at a time or in batches.

Batch benefits:

- fewer database writes
- better throughput
- efficient aggregation

Batch risks:

- one bad message can affect batch
- offset handling is more complex
- longer processing time

## Backpressure

Backpressure happens when producers send faster than consumers process.

Result:

```text
consumer lag grows
```

Solutions:

- scale consumers
- optimize processing
- increase partitions if needed
- batch writes
- reduce event volume
- add monitoring and alerts

## Interview Explanation

If asked "How do Kafka producers and consumers work?", say:

> Producers send events to topics, often with a key that controls partitioning. Kafka stores events in partitions with offsets. Consumers read from partitions, process events, and commit offsets to record progress. Consumer groups let multiple consumers share partitions for parallel processing.

## Connection To Artistry Cart

In Artistry Cart:

- producer logic belongs around user activity tracking
- Kafka topic carries analytics events
- `kafka-service` consumes events
- offsets represent what analytics messages have been processed
- idempotent updates are important because duplicates can happen

