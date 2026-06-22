# Webhooks Fundamentals

## What Is A Webhook

A webhook is an HTTP callback from one system to another when something happens.

Example:

```text
Stripe -> order-service
```

Stripe calls your backend to say:

```text
payment succeeded
payment failed
refund created
dispute opened
```

## Why Webhooks Exist

Payment events can happen asynchronously.

Examples:

- payment succeeds after redirect
- payment fails after extra checks
- bank confirms later
- refund is processed later
- dispute is opened days later

Your backend needs to know even if the user closes the browser.

## Webhook Flow

```text
1. Provider sends HTTP POST to webhook endpoint.
2. Backend reads raw request body.
3. Backend verifies signature.
4. Backend parses event.
5. Backend checks event type.
6. Backend updates internal state idempotently.
7. Backend returns 2xx if handled.
```

## Webhook Endpoint

Example endpoint:

```text
POST /order/webhooks/stripe
```

This endpoint should:

- be public enough for Stripe to call
- verify signatures
- avoid normal auth middleware if provider cannot use it
- use raw body if required by provider signature verification
- return quickly

## Raw Body Requirement

Some providers require the exact raw request body to verify signatures.

If JSON middleware modifies body first, signature verification may fail.

This is a common webhook bug.

## Webhook Delivery Is Retried

Providers retry webhooks if your endpoint fails or times out.

This means:

```text
same event can arrive more than once
```

Your handler must be idempotent.

## Webhook Ordering Is Not Always Guaranteed

Events may arrive out of order.

Example:

```text
payment_intent.succeeded arrives before checkout.session.completed
```

Design state transitions to handle this safely.

## Webhook Response

Return `2xx` only when event is safely handled or intentionally ignored.

Return non-2xx for retryable failure only if you want provider to retry.

Be careful:

- returning `200` too early can lose processing
- returning `500` repeatedly can cause retry storms

## Interview Explanation

If asked "What is a webhook?", say:

> A webhook is an HTTP callback from an external system to our backend when an event happens. In payments, webhooks are essential because final payment state may happen asynchronously, even if the user closes the browser. The backend must verify the webhook signature, process the event idempotently, and update internal order/payment state safely.

## Connection To Artistry Cart

In Artistry Cart:

- Stripe sends webhooks to `order-service`
- `order-service` verifies and handles payment events
- MongoDB/Prisma stores the updated order/payment state
- frontend success pages should read backend state rather than assume payment truth

