# Kafka Senior Prep Pack

This folder is a focused Kafka interview-preparation pack for senior backend, platform, and distributed-systems roles.

It is designed to help you do four things well:

1. explain Kafka clearly from basics to advanced topics
2. answer deep-dive interview questions with strong tradeoff language
3. discuss production concerns such as ordering, retries, lag, rebalance, and durability
4. present the Artistry Cart Kafka implementation like a senior engineer who owns design decisions

## Study Order

Read these in order:

1. [Kafka Fundamentals To Advanced](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/09-interview-prep/kafka-senior-prep/kafka-fundamentals-to-advanced.md>)
2. [Kafka Round By Round Practice](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/09-interview-prep/kafka-senior-prep/kafka-round-by-round-practice.md>)
3. [Kafka Interview Question Bank](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/09-interview-prep/kafka-senior-prep/kafka-interview-question-bank.md>)
4. [Artistry Cart Kafka Service System Design](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/09-interview-prep/kafka-senior-prep/artistry-cart-kafka-service-system-design.md>)

## What Each File Does

### `kafka-fundamentals-to-advanced.md`

Use this as the main handbook.

It covers:

- Kafka architecture
- topics, partitions, offsets, brokers, leaders, ISR
- producer and consumer internals
- delivery guarantees
- retention, compaction, rebalances, transactions
- outbox pattern, DLQ, observability, scaling, and tuning

### `kafka-round-by-round-practice.md`

Use this to practice the actual interview flow.

It covers:

- recruiter and hiring-manager round
- fundamentals round
- low-level design round
- system design round
- production incident and troubleshooting round
- senior leadership and tradeoff round

### `kafka-interview-question-bank.md`

Use this as your drill sheet.

It includes:

- rapid-fire fundamentals
- advanced design questions
- failure and incident scenarios
- tuning and performance questions
- behavioral and ownership prompts

### `artistry-cart-kafka-service-system-design.md`

Use this to turn this repo into a strong project story.

It covers:

- why Kafka exists in this project
- how producers publish events
- how `order-service` uses the outbox pattern
- how `kafka-service` consumes safely
- how to explain tradeoffs and future improvements in a senior interview

## Best Way To Practice

### Session 1

- read the fundamentals guide once end to end
- explain each diagram out loud without looking at the page

### Session 2

- answer 20 questions from the question bank
- focus on short, clean answers in under 90 seconds each

### Session 3

- practice the round-by-round guide
- rehearse a 2-minute and 5-minute Kafka explanation

### Session 4

- present the Artistry Cart Kafka system design as if it were a real interview
- answer likely follow-up questions on ordering, idempotency, lag, retries, and data consistency

## Senior-Level Answer Pattern

For most Kafka questions, answer in this order:

1. define the concept
2. explain why it matters in production
3. describe the failure mode or tradeoff
4. connect it to a real system you built

Example:

> "Kafka partitions are the unit of parallelism and ordering. Ordering is only guaranteed within a partition, so key choice matters a lot. In production that directly affects how I preserve per-user or per-order sequencing. In this project, I key analytics events by `userId` so related user actions stay ordered within the same partition."

## Core Senior Talking Points

If you sound strong on these topics, you will usually come across as senior:

- ordering is partition-scoped, not topic-wide
- Kafka gives at-least-once by default, so consumers must be idempotent
- exactly-once is narrow and expensive, not magic
- rebalance behavior affects latency, duplication, and throughput
- retries without DLQ or idempotency are dangerous
- event schemas are long-term contracts, not casual payloads
- observability must include lag, commit health, retries, and poison-message visibility
- business consistency often needs outbox or transactional boundaries around producers

## Goal

By the time you finish this pack, you should be able to:

- explain Kafka to junior, peer, and principal-level interviewers
- design a production Kafka pipeline on a whiteboard
- discuss real tradeoffs instead of textbook-only answers
- defend the Artistry Cart Kafka design with confidence
