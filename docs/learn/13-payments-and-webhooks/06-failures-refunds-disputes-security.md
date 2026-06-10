# Failures, Refunds, Disputes, And Security

## Payment Failures

Payments can fail because:

- card declined
- insufficient funds
- authentication required
- fraud check failed
- provider timeout
- network issue
- invalid currency/amount
- expired session

The system should show user-friendly errors without exposing internals.

## Failure Handling

Good behavior:

- keep order in `payment_failed` or `pending_payment`
- allow retry where appropriate
- avoid duplicate orders
- do not send confirmation email
- log provider event/error id

## Refunds

Refunds can be:

- full
- partial
- manual
- automatic

Refund state should be tracked.

Example:

```text
paid -> partially_refunded -> refunded
```

Refunds may also generate provider webhook events.

## Disputes

A dispute occurs when a buyer challenges a charge.

Dispute workflows can include:

- provider notification
- evidence submission
- temporary funds hold/reversal
- final decision

Even if not implemented early, senior engineers know disputes exist in real payment systems.

## Security Rules

Never expose:

- Stripe secret key
- webhook secret
- raw sensitive payment data
- full card details

Frontend may use:

- Stripe publishable key

Backend uses:

- Stripe secret key
- webhook secret

## Amount And Currency Verification

When processing webhook, verify:

- provider amount matches expected amount
- currency matches expected currency
- provider object maps to internal order

This prevents mismatched or manipulated flows.

## Duplicate Submission

User may double-click checkout.

Mitigations:

- disable submit while loading
- idempotency keys
- pending order reuse
- unique constraints
- backend duplicate checks

## Reconciliation

Reconciliation means comparing internal payment/order state with provider records.

Useful for:

- missed webhooks
- failed processing
- support cases
- accounting correctness

Production systems may run scheduled reconciliation jobs.

## Interview Explanation

If asked "What payment failure cases do you consider?", say:

> I consider declined payments, provider timeouts, duplicate submissions, missed or duplicate webhooks, refunds, disputes, and mismatched amount/currency. The backend should verify provider events, update explicit states, avoid duplicate side effects, and support reconciliation if internal state diverges from provider state.

## Connection To Artistry Cart

Important Artistry Cart payment concerns:

- Stripe secret stays backend-only
- webhook secret stays backend-only
- frontend success page does not mark order paid
- order-service owns final state
- duplicate checkout/webhook handling should be idempotent
- seller order views should reflect backend order state

