# Payments And Webhooks

This folder is the thirteenth learning block for preparing for a bigger engineering role. It explains payment flows and webhooks from first principles, then connects those ideas to Artistry Cart's `order-service`.

The goal is to understand why payment systems need careful state handling, idempotency, webhook verification, retries, and strong backend ownership.

## Learning Outcome

After completing this topic, you should be able to explain:

- how online payment flows work
- why payment state must be owned by the backend
- what Stripe checkout/payment sessions are
- why webhooks are needed
- why webhook signature verification matters
- how idempotency prevents duplicate processing
- how to model order/payment state
- how payment failures, refunds, and retries should be handled
- how to test payment flows safely
- how payments and webhooks fit into Artistry Cart

## Files In This Topic

1. [Payment System Fundamentals](./01-payment-system-fundamentals.md)
2. [Stripe Checkout And Payment Flow](./02-stripe-checkout-and-payment-flow.md)
3. [Webhooks Fundamentals](./03-webhooks-fundamentals.md)
4. [Webhook Verification, Idempotency, And Retries](./04-webhook-verification-idempotency-retries.md)
5. [Order And Payment State Machines](./05-order-and-payment-state-machines.md)
6. [Failures, Refunds, Disputes, And Security](./06-failures-refunds-disputes-security.md)
7. [Payments In Artistry Cart](./07-payments-in-artistry-cart.md)
8. [Interview Questions And Answer Patterns](./08-interview-questions-and-answer-patterns.md)

## Core Mental Model

```text
frontend starts checkout
  -> backend creates payment session with provider
  -> user completes payment with provider
  -> provider sends webhook to backend
  -> backend verifies webhook
  -> backend updates order/payment state
```

Important:

> The frontend can start and display checkout, but the backend and payment provider events must own final payment truth.

## Connection To Artistry Cart

Artistry Cart uses `order-service` for:

- checkout
- orders
- Stripe payment/session flows
- webhooks
- order confirmation behavior
- seller order views

The frontend should never be the source of truth for payment completion.

