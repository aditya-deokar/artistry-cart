# Order And Payment State Machines

## Why State Machines Matter

Payments and orders move through states.

If state transitions are not controlled, bugs happen:

- unpaid order marked paid
- paid order marked pending
- cancelled order shipped
- refund applied twice
- duplicate confirmation email

A state machine defines valid states and transitions.

## Example Order States

```text
draft
pending_payment
paid
processing
shipped
delivered
cancelled
refunded
payment_failed
```

Your exact states depend on business rules.

## Example Payment States

```text
requires_payment
processing
succeeded
failed
cancelled
refunded
partially_refunded
disputed
```

Payment state and order state are related but not always identical.

## Valid Transitions

Example:

```text
pending_payment -> paid
pending_payment -> payment_failed
paid -> processing
processing -> shipped
paid -> refunded
```

Invalid:

```text
cancelled -> paid
refunded -> shipped
delivered -> pending_payment
```

Unless business rules explicitly allow exceptions.

## Why Separate Order And Payment State

Order state answers:

```text
What is happening with fulfillment?
```

Payment state answers:

```text
What is happening with money?
```

Example:

```text
payment succeeded, order processing
payment refunded, order cancelled/refunded
```

Keeping them separate can make workflows clearer.

## State Transition Function

Good pattern:

```ts
function transitionOrder(currentState, event) {
  // validate allowed transition
  // return next state
}
```

Benefits:

- central rules
- easier tests
- fewer invalid transitions
- safer webhook handling

## Webhooks As State Events

Stripe events should map to state transitions.

Example:

```text
checkout.session.completed -> payment succeeded candidate
payment_intent.succeeded -> payment succeeded
payment_intent.payment_failed -> payment failed
charge.refunded -> refunded
```

Before transition, verify:

- event is valid
- order exists
- amount/currency match
- current state allows transition

## Audit Trail

Payment/order systems benefit from audit history.

Track:

- previous state
- next state
- event id
- source
- timestamp
- reason

This helps debugging and support.

## Interview Explanation

If asked "How would you model order/payment states?", say:

> I would model order and payment as explicit states with allowed transitions. Webhook events trigger transitions only after verification and idempotency checks. This prevents invalid state changes like marking cancelled orders as paid or sending duplicate confirmations.

## Connection To Artistry Cart

Artistry Cart `order-service` should be explained as owning:

- order lifecycle
- payment lifecycle
- Stripe event mapping
- seller order views
- confirmation behavior
- refund/cancellation handling when implemented

