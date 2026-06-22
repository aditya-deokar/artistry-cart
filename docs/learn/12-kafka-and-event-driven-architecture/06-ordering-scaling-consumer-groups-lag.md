# Ordering, Scaling, Consumer Groups, And Lag

## Ordering In Kafka

Kafka preserves order within a partition.

Kafka does not guarantee global order across all partitions.

This means:

```text
events in partition 0 are ordered
events in partition 1 are ordered
events across partition 0 and 1 are not globally ordered
```

## Partition Key And Ordering

If events need order for a specific entity, use a stable key.

Example:

```text
key by userId -> all events for one user go to same partition
key by orderId -> all events for one order go to same partition
```

Tradeoff:

- good per-entity ordering
- bad key distribution can create hot partitions

## Consumer Groups

A consumer group shares work across consumers.

Example:

```text
topic has 6 partitions
consumer group has 3 consumers
each consumer gets about 2 partitions
```

More consumers than partitions does not improve parallelism for that topic.

## Scaling Consumers

To scale processing:

1. increase partitions if needed
2. add consumers in the same group
3. optimize processing logic
4. batch database writes
5. reduce slow downstream calls

Do not add consumers blindly if partitions are the bottleneck.

## Rebalancing

Rebalancing happens when Kafka changes partition assignments.

Triggers:

- consumer joins
- consumer leaves
- consumer crashes
- partitions change

During rebalancing, processing may pause briefly.

## Consumer Lag

Consumer lag means consumers are behind producers.

Example:

```text
latest offset: 10000
consumer offset: 8500
lag: 1500 messages
```

Lag means messages are waiting to be processed.

## Why Lag Matters

Lag can indicate:

- consumer is too slow
- database writes are slow
- too few partitions/consumers
- poison messages
- downstream dependency failure
- traffic spike

For analytics, lag means recommendations may use older behavior data.

## Monitoring Lag

Monitor:

- lag per topic
- lag per partition
- consumer error rate
- processing duration
- retry/dead-letter count
- throughput in/out

Alert when lag stays high for too long.

## Hot Partitions

Hot partition happens when too many events use the same key.

Example:

```text
all anonymous events use key "anonymous"
```

One partition becomes overloaded.

Fix:

- better key strategy
- random key when ordering not needed
- split event streams
- add partitions if distribution supports it

## Interview Explanation

If asked "How does Kafka scale consumers?", say:

> Kafka scales consumption through partitions and consumer groups. Each partition is consumed by only one consumer in a group at a time, so maximum parallelism is limited by partition count. Ordering is guaranteed only within a partition, so partition key choice controls per-entity ordering and affects load distribution.

## Connection To Artistry Cart

For Artistry Cart:

- keying analytics by user id can preserve per-user behavior order
- keying by product id can support product analytics ordering
- consumer lag affects freshness of analytics and recommendations
- Kafka UI/local monitoring helps inspect topics and consumer state

