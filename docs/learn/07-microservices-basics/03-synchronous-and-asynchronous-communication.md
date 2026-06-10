# Synchronous And Asynchronous Communication

## Why Services Communicate

Services rarely work alone.

Examples:

- frontend needs product data
- gateway routes traffic to services
- order service may need payment provider calls
- recommendation service reads analytics data
- Kafka worker consumes events

Communication style affects latency, reliability, and complexity.

## Synchronous Communication

Synchronous communication means the caller waits for the response.

Example:

```text
user-ui -> api-gateway -> product-service -> response
```

Common protocols:

- HTTP REST
- GraphQL
- gRPC

## When Synchronous Communication Fits

Use synchronous calls when:

- user needs an immediate answer
- request is simple and fast enough
- caller cannot continue without response
- read operation needs current data

Examples:

- get product details
- login
- create checkout session
- load order history

## Synchronous Communication Risks

Risks:

- caller waits for downstream latency
- downstream failure fails the request
- service call chains become fragile
- timeouts need to be configured
- retries can duplicate work

Example chain:

```text
frontend -> gateway -> order-service -> Stripe
```

If Stripe is slow, the user request is slow.

## Asynchronous Communication

Asynchronous communication means work is sent and processed later.

Example:

```text
user-ui -> Kafka -> kafka-service -> MongoDB analytics
```

The user interaction does not wait for analytics materialization.

Common tools:

- Kafka
- RabbitMQ
- SQS
- Pub/Sub
- background job queues

## When Asynchronous Communication Fits

Use async for:

- analytics
- notifications
- audit logs
- background processing
- search indexing
- email sending
- event-driven workflows
- tasks that can complete later

## Async Communication Risks

Risks:

- eventual consistency
- harder debugging
- duplicate messages
- ordering issues
- consumer lag
- retry handling
- dead-letter handling
- schema evolution

Async systems need operational maturity.

## Events Versus Commands

Event:

```text
Something happened.
```

Example:

```text
ProductViewed
OrderPaid
UserSignedUp
```

Command:

```text
Please do something.
```

Example:

```text
SendWelcomeEmail
GenerateRecommendations
CreateInvoice
```

Events are facts. Commands are requests.

## Idempotency

Idempotency means processing the same message more than once has the same final result.

This matters because distributed systems may retry messages or webhooks.

Example:

```text
Stripe sends webhook twice.
order-service should not create duplicate paid order records.
```

## Choosing Communication Style

Ask:

- Does the user need an immediate answer?
- Can this happen later?
- What if the receiver is down?
- Can the operation be retried safely?
- Is ordering important?
- How will we observe failures?

## Interview Explanation

If asked "Synchronous versus asynchronous communication?", say:

> Synchronous communication means the caller waits for the result, which is simple and useful for immediate user-facing operations but couples latency and failure. Asynchronous communication sends work through a queue or event stream, which decouples services and protects request latency but introduces eventual consistency, retries, ordering, and observability challenges.

## Connection To Artistry Cart

Synchronous examples:

- `user-ui -> api-gateway -> product-service`
- `seller-ui -> api-gateway -> order-service`
- `api-gateway -> auth-service`

Asynchronous examples:

- `user-ui -> Kafka -> kafka-service -> MongoDB analytics`
- Stripe webhook callbacks to `order-service`
- AI Vision background jobs through Agenda

