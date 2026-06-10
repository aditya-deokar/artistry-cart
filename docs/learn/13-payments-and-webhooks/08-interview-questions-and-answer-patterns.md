# Interview Questions And Answer Patterns

This file gives interview-ready answers for payments and webhooks.

## Question: How Does An Online Payment Flow Work?

Strong answer:

> The frontend starts checkout, but the backend validates the cart, calculates trusted totals, creates pending order/payment state, and creates a payment session with a provider like Stripe. The user completes payment through the provider, and the backend updates final state from verified provider webhooks.

## Question: Why Should The Backend Calculate The Total?

Strong answer:

> The frontend can be modified by users, so it cannot be trusted for final pricing. The backend should read product/pricing data, validate quantities and discounts, calculate the trusted total, and create the payment session based on that.

## Question: What Is A Webhook?

Strong answer:

> A webhook is an HTTP callback from an external system to our backend when an event happens. In payments, webhooks are essential because final payment state may happen asynchronously even if the user closes the browser.

## Question: Why Is The Success Page Not The Source Of Truth?

Strong answer:

> A success page is only a frontend UX state. Users can navigate URLs manually, redirects can fail, and payment confirmation may happen asynchronously. The backend should trust verified payment provider webhooks for final payment state.

## Question: How Do You Secure Webhooks?

Strong answer:

> I verify the provider signature using the raw request body and webhook secret, validate event type and metadata, check amount/currency where needed, and only then update internal state. I do not trust unsigned payloads.

## Question: What Is Idempotency In Payments?

Strong answer:

> Idempotency means repeated requests or events produce the same final result. It prevents duplicate orders, duplicate charges, duplicate emails, or duplicate state transitions when users double-click checkout or providers retry webhooks.

## Question: How Do You Handle Duplicate Webhooks?

Strong answer:

> I store processed provider event ids or use state-based checks. If the event was already processed, I return success without repeating side effects. For example, if an order is already paid, I do not mark it paid again or resend the confirmation email.

## Question: What Is A Payment State Machine?

Strong answer:

> A payment state machine defines valid states and transitions, such as pending, processing, succeeded, failed, refunded, and disputed. Webhook events trigger transitions only if the current state allows them.

## Question: How Do You Handle Payment Failure?

Strong answer:

> I keep the order in pending or failed payment state, show a user-friendly retry path, avoid fulfillment or confirmation emails, log provider error details safely, and ensure a retry does not create duplicate orders or charges.

## Question: How Would You Test Webhooks?

Strong answer:

> I would test signature verification, success events, failure events, duplicate events, invalid payloads, state transitions, and side effects such as confirmation emails. I would use Stripe test mode or mocked provider events, not real payment credentials.

## Question: How Does This Apply To Artistry Cart?

Strong answer:

> Artistry Cart routes checkout from `user-ui` through `api-gateway` to `order-service`. The order service owns checkout, Stripe session creation, pending order/payment state, webhook verification, and final order updates through Prisma/MongoDB. The frontend displays status but does not decide payment truth.

## Best Short Project Pitch For This Topic

> In Artistry Cart, payments are owned by `order-service` because checkout and webhooks need strong correctness. Stripe handles payment collection, but the backend validates totals, creates payment sessions, verifies webhooks, and updates order state idempotently. That prevents frontend tampering, duplicate processing, and inconsistent payment/order state.

