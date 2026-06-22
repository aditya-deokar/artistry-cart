# Webhook Verification, Idempotency, And Retries

## Why Verification Matters

Webhook endpoints are public HTTP endpoints.

Without verification, an attacker could send fake requests:

```text
POST /order/webhooks/stripe
{ "type": "payment.succeeded" }
```

If your backend trusts it, unpaid orders could be marked paid.

## Signature Verification

Payment providers sign webhook payloads.

Backend verifies:

- payload body
- signature header
- webhook secret
- timestamp tolerance when applicable

Only verified events should affect payment state.

## Do Not Trust Event Payload Alone

Even after signature verification, validate:

- event type
- expected object
- internal order id metadata
- payment amount/currency if relevant
- current order state

For high-risk flows, fetch provider object from Stripe API if needed.

## Idempotency

Idempotency means processing the same event more than once has the same final effect.

Why needed:

- providers retry webhooks
- network failures happen
- your endpoint may process but fail before response
- duplicate events may arrive

## Idempotency Strategies

### Store Processed Event ID

```text
stripe_event_id -> processed
```

If event id already processed, return success without repeating side effects.

### State-Based Idempotency

Check current order state.

Example:

```text
if order is already paid, do not mark paid again or send duplicate email
```

### Unique Constraints

Use unique indexes where possible.

Example:

```text
payment provider event id unique
```

## Idempotency Key For Client Requests

For checkout creation, client/backend can use an idempotency key.

Example:

```text
same checkout button clicked twice
same idempotency key prevents duplicate payment session/order
```

## Retry Behavior

Webhook retries should handle:

- temporary database failure
- provider API timeout
- network issue

Use:

- safe idempotency
- short processing time
- background processing if heavy
- clear retry/non-retry classification

## Dead-Letter Thinking

For internal event systems, bad messages can go to a dead-letter queue/topic.

For external webhooks, store failed events for inspection if possible:

- event id
- payload summary
- failure reason
- retry count
- last attempted time

## Common Bugs

- JSON parser runs before raw signature verification
- webhook secret missing/wrong
- handler sends confirmation email twice
- duplicate webhook creates duplicate order
- event processed before order record exists
- amount/currency not checked
- frontend success page marks order paid
- handler ignores out-of-order events

## Interview Explanation

If asked "How do you make webhooks safe?", say:

> I verify the provider signature using the raw body and webhook secret, validate the event type and internal metadata, process the event idempotently using event ids and current state checks, and handle retries safely. I avoid trusting frontend redirects or unsigned payloads for payment state.

## Connection To Artistry Cart

For Artistry Cart `order-service`, webhook maturity should include:

- Stripe signature verification
- processed event tracking
- safe order state transitions
- duplicate email prevention
- payment amount/currency checks
- failure logging and retry visibility

