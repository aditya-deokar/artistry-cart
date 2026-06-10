# Stripe Checkout And Payment Flow

## What Stripe Provides

Stripe provides APIs and hosted/client-side tools for:

- checkout sessions
- payment intents
- customer/payment method handling
- webhooks
- refunds
- disputes
- receipts
- payment status events

Using Stripe reduces the need to handle raw card data directly.

## Typical Checkout Session Flow

```text
1. Buyer clicks checkout.
2. Frontend sends cart/checkout request to backend.
3. Backend validates cart and calculates trusted total.
4. Backend creates pending order/payment record.
5. Backend creates Stripe checkout session.
6. Frontend redirects buyer to Stripe or uses Stripe client flow.
7. Buyer completes or cancels payment.
8. Stripe sends webhook to backend.
9. Backend verifies webhook and updates order/payment state.
10. Frontend shows success/cancel/status page.
```

## Why Backend Calculates Total

The frontend can be modified by users.

Bad:

```text
frontend sends total = 1 rupee
backend trusts it
```

Good:

```text
frontend sends item ids/quantities
backend reads product prices
backend calculates total
backend creates payment session
```

Backend should own trusted pricing.

## Pending Order Pattern

Before payment completes, create a pending order or payment attempt.

Example states:

```text
pending_payment
paid
payment_failed
cancelled
refunded
```

Why:

- track checkout attempt
- reconcile webhook later
- avoid losing context
- handle user abandoning checkout

## Success URL Is Not Proof

Stripe may redirect user to success URL after checkout.

But frontend redirect is not final proof because:

- user can manipulate navigation
- webhook may arrive later
- payment can require async confirmation
- network redirects can fail

Final state should come from verified Stripe events.

## Webhook As Source Of Truth

Important phrase:

> The webhook is the trusted asynchronous confirmation from Stripe.

The backend should verify webhook signature and update payment/order state based on event type.

## Common Stripe Events

Examples:

- checkout session completed
- payment intent succeeded
- payment intent failed
- charge refunded
- dispute created

The exact event types depend on the Stripe integration style.

## Metadata

Stripe objects can include metadata.

Example:

```json
{
  "orderId": "ord_123",
  "userId": "u1"
}
```

Metadata helps connect Stripe events back to internal records.

Do not put sensitive data in metadata.

## Interview Explanation

If asked "How would you integrate Stripe checkout?", say:

> I would let the frontend request checkout, but the backend would validate the cart, calculate the trusted total, create a pending order/payment record, and create a Stripe checkout session. The user completes payment through Stripe, and the backend updates final order/payment state only after verifying Stripe webhooks. The success page is for UX, not the source of truth.

## Connection To Artistry Cart

Artistry Cart's `order-service` should be explained as the owner of:

- checkout session creation
- pending order/payment state
- Stripe secret key usage
- webhook verification
- final order/payment transitions

