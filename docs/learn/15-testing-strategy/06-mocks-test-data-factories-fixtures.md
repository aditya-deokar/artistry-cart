# Mocks, Test Data, Factories, And Fixtures

## Why Test Data Strategy Matters

Tests need data.

Bad test data causes:

- flaky tests
- hidden dependencies
- hard-to-read setup
- test order coupling
- accidental production data usage

Good test data is explicit, isolated, and repeatable.

## Mock

A mock replaces a dependency with controlled behavior.

Examples:

- fake Stripe client
- fake SMTP sender
- fake OAuth provider
- fake AI provider
- fake Kafka producer

Use mocks for external boundaries and expensive/unreliable dependencies.

## Stub

A stub returns a fixed response.

Example:

```text
paymentClient.createSession returns { id: "sess_test" }
```

## Spy

A spy records calls.

Example:

```text
expect(emailSender.send).toHaveBeenCalledOnce()
```

Use sparingly. Overusing spies couples tests to implementation.

## Factory

A factory creates test data.

Example:

```ts
const seller = createSeller({ verified: true });
const product = createProduct({ sellerId: seller.id });
```

Good factories:

- produce valid defaults
- allow overrides
- make tests readable
- avoid hidden global state

## Fixture

A fixture is predefined test data.

Examples:

- JSON product list
- sample webhook payload
- seed user
- known analytics event

Fixtures are useful for stable external payloads.

## Seed Data

Seed data initializes a database.

Use for:

- local development
- e2e tests
- demo flows

Keep test seeds separate from production data.

## Test Isolation

Tests should not depend on previous tests.

Strategies:

- reset database between suites
- use unique ids
- cleanup created data
- use transactions where possible
- avoid shared mutable globals

## What To Mock

Usually mock:

- payment providers
- email providers
- OAuth providers
- AI providers
- external HTTP APIs

Usually do not mock in integration tests:

- route handling
- middleware behavior
- validation
- error middleware

## Interview Explanation

If asked "How do you use mocks?", say:

> I mock external boundaries that are slow, expensive, unreliable, or outside the test's purpose, such as Stripe, SMTP, OAuth, or AI providers. I avoid mocking the behavior I actually want confidence in. For test data, I use factories with valid defaults and explicit overrides to keep tests readable and isolated.

## Connection To Artistry Cart

Artistry Cart has:

```text
packages/test-utils
```

for:

- request helpers
- auth helpers
- data factories
- global setup
- custom matchers

This reduces repeated setup across service tests.

