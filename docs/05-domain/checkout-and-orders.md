# Checkout And Orders

## Domain Summary

This domain covers customer checkout, payment orchestration, order state, refunds, seller order operations, and payout-related flows.

## Owning Components

- `order-service`
- `user-ui`
- `seller-ui`

## Core Data Models

- `orders`
- `OrderItem`
- `payments`
- `payouts`
- `refunds`
- `discount_usage`

## Main Flows

### Checkout flow

- buyer enters checkout in `user-ui`
- order-service creates a Stripe payment session or intent
- frontend completes payment interaction
- order-service verifies session outcomes

### Payment finalization

- Stripe webhook reaches order-service
- signature is verified
- payment or order state is updated in the database

### Post-purchase customer flow

- buyer views orders and order details
- cancellation or refund request paths are available

### Seller order flow

- seller views incoming orders
- seller updates order status
- seller checks earnings and payout-related data

## Domain Characteristics

This is both a transactional and operational domain:

- transactional because money and order state are involved
- operational because sellers need reporting and payout workflows

## Strengths

- payment orchestration and order lifecycle are in one coherent service boundary
- webhook handling acknowledges external-source-of-truth behavior
- seller and buyer order views are both represented

## Tradeoffs

- money movement increases the need for idempotency and observability
- seller analytics and payout behavior can expand scope quickly
- order lifecycle rules should stay explicit as the domain matures

## Interview Framing

The strongest framing is that order-service is the operationally sensitive core where external payment truth and internal order truth have to be reconciled correctly.
