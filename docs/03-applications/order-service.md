# Order Service

## Overview

`order-service` owns payment initiation, payment verification, Stripe webhook handling, order retrieval, order mutation, seller-order views, and payout-related flows.

It is the most operationally sensitive service in the platform because it handles money movement and post-payment state transitions.

## Responsibilities

- create payment sessions and payment intents
- verify payment session outcomes
- expose payment status
- manage customer order views
- order cancellation and refund requests
- seller earnings and payout requests
- seller order management and order status updates
- receive and process Stripe webhooks
- send order-related emails
- enqueue purchase analytics into the Kafka analytics outbox

## Inbound Interfaces

Mounted under `/order/api` in the service and proxied through `/order/api` by the gateway and frontend rewrites.

Representative endpoints:

- `POST /order/api/create-payment-session`
- `GET /order/api/verify-payment-session`
- `GET /order/api/verify-session-and-create-intent`
- `POST /order/api/create-payment-intent`
- `GET /order/api/payment-status`
- `GET /order/api/orders`
- `GET /order/api/orders/:orderId`
- `POST /order/api/orders/:orderId/cancel`
- `POST /order/api/refunds/request`
- `GET /order/api/seller/earnings`
- `GET /order/api/seller/payouts`
- `POST /order/api/seller/payouts/request`
- `GET /order/api/seller/orders`
- `PUT /order/api/seller/orders/:orderId/status`
- `GET /order/api/seller/analytics`

Webhook endpoint:

- `POST /order/api/webhooks`

## Outbound Dependencies

- MongoDB via Prisma
- Stripe
- Redis
- SMTP
- Kafka via the shared analytics producer
- shared auth and seller-role middleware
- shared error middleware

## Internal Structure

Key folders:

- `controllers/`
- `routes/`
- `services/`
- `utils/`
- `__tests__/`

Order behavior is split between customer-order flows and seller-order flows, which is a healthy separation inside the service.

## Data Touch Points

Primary models include:

- `orders`
- `OrderItem`
- `payments`
- `analyticsOutbox`
- `payouts`
- discount-usage relationships tied to order state

## Runtime Behavior

- listens on `6004` by default
- mounts Stripe webhook parsing before `express.json()`
- uses credentialed CORS for buyer and seller frontends
- validates authenticated user or seller access through shared middleware

The raw-body webhook placement is an important implementation detail because Stripe signature verification depends on it.

Purchase analytics are now written to `analyticsOutbox` during webhook processing and published asynchronously to Kafka by the in-process outbox publisher. That keeps order persistence decoupled from Kafka availability while still exercising the analytics worker contract end to end.

## Tests

This service includes:

- order controller specs
- seller-order controller specs
- route integration spec
- email utility spec
- dedicated e2e project in `apps/order-service-e2e`

## Strengths

- payment, order, and seller operational flows are grouped into one coherent boundary
- webhook handling is explicitly modeled rather than being treated as an afterthought
- route separation between customer and seller workflows is clear

## Tradeoffs

- payment orchestration, order management, analytics views, refund handling, and payouts all live together, which raises service complexity
- Redis and SMTP widen the operational surface in addition to Stripe
- money-sensitive logic increases the need for observability, idempotency, and careful testing

## Future Hardening

- strengthen webhook idempotency and replay documentation
- formalize payout and refund state-machine behavior
- consider explicit read models for seller analytics if those views grow more complex
- standardize secret naming, especially around Stripe configuration
- expose outbox lag and failure metrics alongside webhook health
