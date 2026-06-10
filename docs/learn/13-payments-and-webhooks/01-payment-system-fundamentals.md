# Payment System Fundamentals

## What A Payment System Does

A payment system moves money-related state safely between:

- buyer
- seller/platform
- application backend
- payment provider
- bank/card network/wallet

In a commerce platform, payments are not just "charge card."

They include:

- checkout intent
- order creation
- payment authorization
- payment capture
- confirmation
- webhook processing
- refunds
- disputes
- receipts/emails
- seller order views

## Why Payments Are High-Risk

Payment code is sensitive because mistakes can cause:

- duplicate charges
- missing orders
- unpaid orders marked as paid
- paid orders not fulfilled
- refund mistakes
- fraud exposure
- poor customer trust
- legal/compliance issues

Payment systems need correctness more than cleverness.

## Frontend Versus Backend Responsibility

Frontend can:

- show cart and checkout UI
- collect non-sensitive checkout input
- redirect to payment provider
- show payment status UI
- call backend APIs

Backend must:

- calculate trusted totals
- create payment sessions/intents
- store order/payment state
- verify webhook signatures
- process provider events
- enforce idempotency
- protect secrets

Never trust frontend-only payment success.

## Payment Provider

A payment provider such as Stripe handles:

- card/payment method collection
- payment authorization/capture
- secure card data handling
- fraud tools
- webhook events
- refunds/disputes APIs

Your app should not directly handle raw card data unless it is designed and certified for that.

## Common Payment Concepts

### Authorization

The payment method is approved and funds are held.

### Capture

The money is actually captured.

Some systems authorize first and capture later.

### Payment Intent / Session

A provider-side object representing a payment attempt or checkout flow.

### Webhook

A provider-to-backend callback telling your system that a payment event happened.

### Idempotency

Ensures repeated requests/events do not create duplicate side effects.

## Checkout Is A Workflow

Checkout can involve:

```text
validate cart
validate inventory/availability
calculate trusted totals
create order/payment attempt
create provider payment session
redirect user or confirm payment
receive webhook
mark order paid/failed
send confirmation
```

Each step can fail.

## Interview Explanation

If asked "How do payment systems work?", say:

> A payment system should keep trusted payment and order state on the backend. The frontend starts checkout and displays UI, but the backend calculates totals, creates a payment session with a provider such as Stripe, stores the pending order/payment state, and later updates final status from verified provider webhooks. Idempotency and state transitions are critical to avoid duplicate or inconsistent processing.

## Connection To Artistry Cart

In Artistry Cart:

- `user-ui` shows checkout UI
- `api-gateway` routes checkout requests
- `order-service` owns order/payment logic
- Stripe handles payment provider behavior
- MongoDB/Prisma stores order/payment state
- Stripe webhooks finalize important payment events

