# Testing Pyramid And Test Types

## Testing Pyramid

The testing pyramid is a mental model for balancing test levels.

Typical shape:

```text
few e2e tests
some integration tests
many unit tests
```

Why:

- unit tests are fast and cheap
- integration tests catch wiring issues
- e2e tests give high confidence but are slow and brittle

## Unit Tests

Unit tests verify small pieces of logic in isolation.

Examples:

- price calculation
- validation helper
- role check
- state transition function
- error formatter

Benefits:

- fast
- easy to debug
- good for edge cases

Limitations:

- can miss integration bugs
- can become too mock-heavy

## Integration Tests

Integration tests verify multiple parts working together.

Examples:

- Express route + middleware + controller
- service + Prisma test database
- webhook handler + state update
- Kafka event parser + analytics updater

Benefits:

- more realistic
- catches wiring/config/query bugs

Limitations:

- slower than unit tests
- needs setup/cleanup

## E2E Tests

E2E tests verify a real flow through major system parts.

Example:

```text
start auth-service, product-service, order-service, gateway
run API flow through gateway
```

Benefits:

- high confidence in real behavior
- catches service boundary issues

Limitations:

- slow
- harder to debug
- more flaky
- expensive in CI

## Contract Tests

Contract tests verify that producers and consumers agree on an API/event contract.

Examples:

- frontend expects `GET /products` response shape
- Kafka consumer expects analytics event schema
- gateway expects service readiness endpoint

Useful for microservices because services can evolve independently.

## Smoke Tests

Smoke tests are quick checks that a deployed or running system is basically alive.

Examples:

- service starts
- `/readyz` returns success
- gateway can reach downstream service
- basic login route responds

Smoke tests are not deep correctness tests.

## Regression Tests

Regression tests are added after a bug is found.

Purpose:

```text
prove the bug is fixed and does not come back
```

## Choosing The Right Test Type

Ask:

- Is this pure logic? Unit test.
- Does this involve middleware/API/database? Integration test.
- Does this validate a full user/service flow? E2E test.
- Does this protect a service boundary? Contract test.
- Does this verify deployment health? Smoke test.

## Interview Explanation

If asked "What is the testing pyramid?", say:

> The testing pyramid means having many fast unit tests, a smaller set of integration tests, and a few high-value e2e tests. Unit tests cover logic quickly, integration tests verify components work together, and e2e tests validate critical real flows but should be limited because they are slower and harder to debug.

## Connection To Artistry Cart

Artistry Cart should use:

- unit tests for shared packages and pure business logic
- integration tests for Express routes/middleware/services
- e2e tests for core service flows through running services
- contract tests for Kafka events and API responses as the system matures
- smoke checks for deployment readiness

