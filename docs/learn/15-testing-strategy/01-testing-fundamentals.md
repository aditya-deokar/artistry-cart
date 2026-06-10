# Testing Fundamentals

## Why Testing Exists

Testing exists to increase confidence that software behaves correctly as it changes.

Tests help catch:

- regressions
- incorrect business logic
- broken API contracts
- invalid error handling
- auth/authorization mistakes
- database integration bugs
- payment/webhook edge cases
- deployment/startup failures

Testing is not only about proving code works today. It protects future changes.

## What A Good Test Does

A good test is:

- focused
- repeatable
- deterministic
- easy to read
- fast enough for its level
- clear when it fails
- tied to meaningful behavior

Bad tests are:

- flaky
- hard to understand
- too coupled to implementation details
- slow without enough value
- full of hidden setup
- testing mocks instead of behavior

## Behavior Versus Implementation

Prefer testing behavior.

Behavior:

```text
invalid login returns 401
seller cannot edit another seller's product
checkout rejects invalid cart
```

Implementation detail:

```text
function X called helper Y exactly once
```

Implementation details can be useful in some unit tests, but overusing them makes tests brittle.

## Arrange, Act, Assert

Common test structure:

```text
Arrange: set up data and dependencies
Act: run the behavior
Assert: verify result
```

Example:

```ts
it("rejects invalid quantity", async () => {
  const input = { quantity: 0 };

  const result = validateQuantity(input);

  expect(result.ok).toBe(false);
});
```

## Deterministic Tests

A deterministic test gives the same result every time.

Avoid hidden dependence on:

- current time
- random ids
- external network
- shared database state
- test order
- local developer machine state

When needed, control time, randomness, and external dependencies.

## Test Naming

Good names describe behavior:

```text
returns 401 when access token is missing
creates product for authenticated seller
does not process duplicate Stripe webhook twice
```

Avoid vague names:

```text
test auth
works
should pass
```

## What To Test

Test:

- important business rules
- validation
- auth and authorization
- error behavior
- state transitions
- external integration boundaries
- serialization/deserialization
- database query behavior where important
- critical user journeys

Do not test:

- framework internals
- trivial getters/setters
- every implementation detail
- the same behavior repeatedly at every layer

## Confidence Versus Cost

Every test has cost:

- writing time
- runtime
- maintenance
- flakiness risk
- debugging time

Higher-level tests provide more realistic confidence, but they are slower and harder to debug.

Lower-level tests are faster, but they may miss integration issues.

Good strategy uses both.

## Interview Explanation

If asked "Why do we write tests?", say:

> Tests give confidence that important behavior works and continues working as the code changes. I focus tests on business rules, API behavior, error cases, auth, data boundaries, and critical flows. A good test is deterministic, readable, and useful when it fails.

## Connection To Artistry Cart

Testing matters in Artistry Cart because changes can cross:

- frontend apps
- gateway
- auth middleware
- product/order services
- shared packages
- Prisma schema
- Kafka events
- payment webhooks

Without tests, cross-service regressions would be easy to miss.

