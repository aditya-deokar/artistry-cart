# E2E, Contract, Smoke, And Microservice Tests

## Why Higher-Level Tests Exist

Some bugs only appear when real components work together.

Examples:

- gateway route points to wrong service
- service starts but readiness fails
- auth cookie not forwarded
- database env var wrong
- response contract changed
- service build output missing

Higher-level tests catch system wiring issues.

## E2E Tests

E2E tests validate a full important flow.

Example:

```text
start services
call gateway
create user/product/order
assert final response/state
```

E2E tests should be few and high-value.

## E2E Test Costs

Costs:

- slower
- more setup
- more flaky
- harder debugging
- port/service conflicts
- infrastructure dependencies

Because of this, do not test every edge case through e2e.

## Contract Tests

Contract tests protect boundaries.

Examples:

- frontend expects product API shape
- gateway expects downstream route behavior
- Kafka consumer expects analytics event schema
- order-service webhook handler expects provider event shape

Contract tests are especially useful when services deploy independently.

## Consumer-Driven Contracts

Consumer-driven contract idea:

```text
consumer defines what it needs
provider test proves it satisfies that contract
```

Useful for frontend/backend or service/service boundaries.

## Smoke Tests

Smoke tests are shallow checks that a service is basically working.

Examples:

```text
GET /healthz
GET /readyz
gateway can route to product-service
service process starts from build output
```

Smoke tests are useful after deployment.

## Microservice Test Strategy

For microservices, use layers:

```text
unit tests for service logic
integration tests for service API + database
contract tests for boundaries
e2e tests for critical cross-service flows
smoke tests for deployment readiness
```

Avoid relying only on e2e tests.

## Readiness Checks In Tests

Before e2e tests, wait for services:

```text
start auth-service
wait /readyz
start product-service
wait /readyz
start gateway
wait /readyz
run e2e
```

This prevents tests from failing because services are still starting.

## Interview Explanation

If asked "How do you test microservices?", say:

> I use layered testing. Unit tests cover service logic, integration tests cover each service with middleware and database behavior, contract tests protect service/API/event boundaries, e2e tests cover critical cross-service flows, and smoke tests verify deployment readiness. I keep e2e tests focused because they are slower and harder to debug.

## Connection To Artistry Cart

Artistry Cart includes e2e projects such as:

- `auth-service-e2e`
- `api-gateway-e2e`
- `product-service-e2e`
- `order-service-e2e`
- `recommendation-service-e2e`
- `kafka-service-e2e`
- `aivision-service-e2e`

CI starts core backend services, waits for `/readyz`, then runs e2e suites.

