# Delivery Semantics, Idempotency, Retries, And Dead Letters

## Delivery Semantics

Kafka systems often discuss delivery guarantees:

- at-most-once
- at-least-once
- exactly-once

These terms describe how messages may be delivered and processed.

## At-Most-Once

Message is processed zero or one time.

Risk:

```text
message can be lost
```

Usually not acceptable for important events.

## At-Least-Once

Message is processed one or more times.

Risk:

```text
duplicates can happen
```

This is common and practical if consumers are idempotent.

## Exactly-Once

Exactly-once means the system is designed so final processing effect happens once.

This is difficult and depends on producer, broker, consumer, and storage design.

Interview-safe phrase:

> In practice, I design consumers to be idempotent because duplicates can happen.

## Idempotency

Idempotency means processing the same event multiple times has the same final effect.

Example:

```text
ProductViewed event processed twice should not corrupt analytics.
```

Strategies:

- use event id deduplication
- upsert instead of blind insert
- increment carefully based on unique event tracking
- make updates deterministic
- store processed event ids for critical flows

## Retries

Retries handle temporary failures.

Examples:

- database timeout
- transient network issue
- temporary downstream error

Retry rules:

- limit retry count
- use backoff
- add jitter
- avoid retry storms
- only retry retryable failures

## Poison Message

A poison message always fails.

Examples:

- invalid schema
- missing required field
- impossible enum
- data violates business rules

If not handled, one poison message can block processing.

## Dead-Letter Topic

A dead-letter topic stores messages that could not be processed.

Flow:

```text
consumer fails message repeatedly
  -> write message to dead-letter topic
  -> commit/skip original
  -> alert/inspect later
```

Dead-letter topics help keep the pipeline moving while preserving failed messages.

## Retry Topic

Some systems use retry topics.

Example:

```text
user-events.retry.1m
user-events.retry.10m
user-events.dlq
```

This allows delayed retries before dead-lettering.

## Offset Commit And Failure

Important rule:

> Commit offset only after the event's side effect is safely handled or intentionally dead-lettered.

Commit too early:

- can lose event processing

Commit too late:

- can duplicate processing

## Interview Explanation

If asked "How do you handle Kafka failures?", say:

> I assume at-least-once delivery and design consumers to be idempotent. For transient failures, I retry with limits and backoff. For invalid or repeatedly failing messages, I send them to a dead-letter topic with enough metadata for debugging. I commit offsets only after processing succeeds or the message is safely handled.

## Connection To Artistry Cart

For Artistry Cart analytics:

- duplicate user events should not corrupt analytics
- invalid analytics events should be rejected or dead-lettered
- consumer lag and failures should be monitored
- event id/version would improve reliability and debugging

