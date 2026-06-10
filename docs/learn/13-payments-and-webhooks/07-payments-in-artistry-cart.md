# Payments In Artistry Cart

## Payment Boundary

In Artistry Cart, payment behavior belongs to:

```text
apps/order-service
```

The order service owns:

- checkout
- order creation
- payment session creation
- Stripe webhook handling
- seller order views
- order email behavior

## High-Level Flow

```text
user-ui
  -> api-gateway
  -> order-service
  -> Stripe
  -> MongoDB/Prisma

Stripe
  -> order-service webhook
  -> MongoDB/Prisma
```

## Frontend Role

`user-ui` should:

- show cart/checkout UI
- collect shipping/contact details
- call checkout API
- redirect/show Stripe UI
- show pending/success/failure status from backend

It should not:

- calculate trusted final total alone
- store Stripe secret key
- mark orders paid by itself
- trust URL query params as payment truth

## Gateway Role

`api-gateway` should:

- route `/order` traffic to `order-service`
- preserve required headers/body behavior
- avoid owning payment business logic

## Order Service Role

`order-service` should:

- validate checkout input
- calculate trusted totals
- create pending order/payment record
- create Stripe session/payment object
- verify webhook signatures
- update order/payment state
- handle duplicate events safely
- send confirmation email once

## Database Role

MongoDB/Prisma stores:

- order records
- payment status
- provider ids
- user/seller references
- line item snapshots
- webhook/event processing records if implemented

## Redis Role

Redis may support:

- checkout idempotency keys
- temporary payment attempt data
- duplicate submission prevention
- short-lived locks

But durable payment truth should remain in MongoDB/Prisma and Stripe.

## Testing Payment Flows

Test:

- checkout session creation
- invalid cart input
- duplicate checkout request
- webhook signature verification
- payment success event
- payment failure event
- duplicate webhook event
- order state transitions
- confirmation email not duplicated

Use test keys and mocked provider behavior in automated tests.

## Interview Explanation

If asked "How do payments work in Artistry Cart?", say:

> The buyer checkout flow starts in `user-ui`, goes through `api-gateway`, and is handled by `order-service`. The order service validates cart input, calculates trusted totals, creates pending order/payment state, and creates a Stripe payment session. Stripe later sends webhooks to `order-service`, which verifies the signature and updates final order/payment state in MongoDB through Prisma. The frontend displays state but is not the source of truth.

