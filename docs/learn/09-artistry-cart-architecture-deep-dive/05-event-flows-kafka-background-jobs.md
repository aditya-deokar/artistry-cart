# Event Flows, Kafka, And Background Jobs

## Why Event Flows Exist

Not every action should block a user request.

Good async candidates:

- analytics
- product behavior tracking
- recommendation input generation
- background cleanup
- embedding sync
- usage aggregation
- webhook processing

Artistry Cart uses event/background flows to keep some work off the critical request path.

## Main Kafka Analytics Flow

The clearest event-driven path is user activity analytics.

```text
user-ui
  -> Kafka topic
  -> kafka-service
  -> MongoDB analytics
  -> recommendation-service reads later
```

## Step-By-Step Analytics Flow

1. buyer interacts with product/search/cart/wishlist flow
2. frontend/server action emits analytics event
3. event is sent to Kafka
4. Kafka stores the message in a topic
5. `kafka-service` consumes messages
6. worker validates event type and payload
7. worker updates user analytics and product analytics in MongoDB
8. recommendation service later reads analytics state

## Why Kafka Is Useful Here

Kafka helps because:

- analytics should not slow down the user interaction
- bursts of events can be buffered
- producer and consumer are decoupled
- future consumers can be added
- event history can support analytics evolution

## Eventual Consistency

Analytics data does not need to update immediately.

Example:

```text
User views product at 10:00:00
Analytics materializes at 10:00:02
Recommendations use it later
```

That is acceptable.

For payments, this kind of delay needs much more care.

## Kafka Risks

Kafka adds operational concerns:

- duplicate messages
- consumer lag
- schema changes
- retry behavior
- dead-letter handling
- ordering concerns
- broker availability
- observability

Interview point:

> Kafka is powerful, but it is not free. It needs monitoring, idempotent consumers, and event schema discipline.

## Stripe Webhooks

Stripe webhooks are also asynchronous events, but from an external provider.

Flow:

```text
Stripe
  -> order-service webhook endpoint
  -> verify signature
  -> update order/payment state
```

Why important:

> Payment state should be finalized from trusted webhook events, not only from frontend redirects or checkout request responses.

## AI Vision Background Jobs

AI Vision uses background job patterns for maintenance and enrichment work.

Examples:

- cleanup expired sessions
- cleanup rate limit entries
- backfill missing embeddings
- sync product embeddings
- aggregate API usage

Flow:

```text
aivision-service startup
  -> scheduler/job runner
  -> periodic jobs
  -> MongoDB/AI provider updates
```

## Synchronous Versus Async In This Repo

Synchronous:

- product page request
- login
- checkout session creation
- recommendation response
- AI generation request when user waits for result

Asynchronous:

- analytics ingestion through Kafka
- Stripe webhook callbacks
- AI Vision cleanup/embedding jobs
- usage aggregation

## Interview Explanation

If asked "Where do events fit in your project?", say:

> The main internal event flow is analytics. User activity events are produced from the frontend side, written to Kafka, consumed by `kafka-service`, and materialized into MongoDB for product analytics and recommendation inputs. The system also uses external asynchronous events through Stripe webhooks and background jobs in AI Vision for cleanup, embedding backfills, and usage aggregation.

