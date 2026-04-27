# Testing Strategy

## Overview

The repository uses a layered testing strategy built around:

- Vitest for unit and integration tests
- shared test helpers in `packages/test-utils`
- Nx e2e projects for service-level end-to-end scenarios
- GitHub Actions for CI execution

This is a meaningful test posture for a multi-service monorepo, though coverage is not uniform across every app.

## Test Layers

### Unit tests

Unit-level coverage exists for:

- controllers
- middleware
- utility helpers
- pricing logic
- cookies and auth helpers
- error handling

### Integration tests

Integration-style tests exist for:

- `api-gateway` proxy behavior
- `product-service`
- `order-service` route behavior
- `recommendation-service` routes

### End-to-end tests

Dedicated Nx e2e projects exist for:

- `auth-service-e2e`
- `api-gateway-e2e`
- `product-service-e2e`
- `order-service-e2e`
- `recommendation-service-e2e`
- `kafka-service-e2e`
- `aivision-service-e2e`

However, not all of these are currently exercised in CI.

## Current Unit/Integration Project Wiring

The root Vitest workspace currently includes:

- `apps/product-service`
- `apps/auth-service`
- `apps/order-service`
- `apps/api-gateway`
- `apps/recommendation-service`
- `packages/middleware`
- `packages/error-handler`

Notably absent from the root Vitest project list:

- `aivision-service`
- `kafka-service`
- frontend apps

## Shared Test Infrastructure

`packages/test-utils` provides:

- Prisma, Redis, Stripe, Kafka, ImageKit, and Nodemailer mocks
- Express request/response/next helpers
- auth token and cookie helpers
- data factories for major entities
- shared global setup and custom matchers

This is one of the stronger signs of engineering maturity in the repo.

## Coverage Thresholds

The current thresholds vary by project:

- `auth-service`: branches 70, functions 80, lines 80, statements 80
- `product-service`: branches 70, functions 80, lines 80, statements 80
- `order-service`: branches 65, functions 75, lines 75, statements 75
- `api-gateway`: branches 60, functions 70, lines 70, statements 70
- `recommendation-service`: branches 60, functions 70, lines 70, statements 70
- shared packages have higher thresholds, reaching 80 to 90

This shows a practical rather than ideological coverage posture.

## Test Environment Conventions

Shared global test setup:

- sets `NODE_ENV=test`
- seeds test JWT secrets
- seeds Stripe and Redis placeholders
- points database to a test MongoDB URL
- disables Redis by default in shared setup
- suppresses console noise unless `DEBUG` is set

## Strengths

- good backend test breadth across core commerce services
- shared test toolkit reduces duplicated test setup
- e2e suites exist for the most important request paths
- coverage thresholds are explicit

## Current Gaps

- `aivision-service` unit/integration coverage is not wired into the root Vitest workspace
- `kafka-service` unit/integration coverage is not wired into the root Vitest workspace
- frontend apps do not have visible automated test coverage in the inspected setup
- CI does not currently execute every e2e project that exists in the repo

## Interview Framing

The best honest description is:

- the project has a real multi-layer backend testing strategy
- the highest-value commerce services are covered better than the newest or most experimental surfaces
- AI Vision and some frontend coverage are the next obvious expansion areas
