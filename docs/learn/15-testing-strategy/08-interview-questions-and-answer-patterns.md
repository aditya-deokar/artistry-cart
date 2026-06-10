# Interview Questions And Answer Patterns

This file gives interview-ready answers for testing strategy.

## Question: Why Do We Write Tests?

Strong answer:

> Tests give confidence that important behavior works and continues working as the code changes. They catch regressions, protect business rules, document expected behavior, and make refactoring safer.

## Question: What Is The Testing Pyramid?

Strong answer:

> The testing pyramid means having many fast unit tests, fewer integration tests, and a small number of high-value e2e tests. Unit tests are fast and focused, integration tests verify components working together, and e2e tests validate critical real flows but are slower and harder to debug.

## Question: Unit Test Versus Integration Test?

Strong answer:

> A unit test checks a small piece of logic in isolation, such as validation, calculation, or state transition. An integration test checks multiple parts working together, such as an Express route with middleware, controller, service, and database behavior.

## Question: What Is An E2E Test?

Strong answer:

> An e2e test validates an important flow through the system as close to real runtime as practical. In a service-oriented app, it may start multiple services and call the gateway or APIs to verify the full flow works.

## Question: What Is A Contract Test?

Strong answer:

> A contract test verifies that a provider and consumer agree on an API or event shape. It is useful in microservices because services can change independently, and contract tests catch breaking changes before deployment.

## Question: What Should You Mock?

Strong answer:

> I mock external boundaries that are slow, expensive, unreliable, or not the purpose of the test, such as Stripe, SMTP, OAuth, AI providers, or external HTTP APIs. I avoid mocking the behavior I want to verify.

## Question: How Do You Test Express APIs?

Strong answer:

> I use integration tests that call the Express app through HTTP-like requests with tools such as Supertest. These tests cover routes, middleware, validation, controllers, error handling, and sometimes database behavior with a test database.

## Question: How Do You Test Auth?

Strong answer:

> I test missing token, invalid token, expired token, valid user, wrong role, and ownership cases. Role middleware can be tested generically, while domain-specific ownership checks should be tested in the owning service.

## Question: How Do You Test Webhooks?

Strong answer:

> I test valid signatures, invalid signatures, duplicate events, success and failure events, state transitions, and side effects such as confirmation emails. Webhook handlers must be idempotent, so duplicate event tests are important.

## Question: How Do You Avoid Flaky Tests?

Strong answer:

> I keep tests deterministic, isolate test data, avoid real external network calls, control time/randomness when needed, clean up database state, wait for readiness in e2e tests, and avoid test order dependencies.

## Question: How Does Nx Help Testing?

Strong answer:

> Nx understands the project graph, so it can run tests per project and calculate affected projects from Git changes. That lets CI run only impacted tests and dependent tests instead of running the entire monorepo on every pull request.

## Question: How Does This Apply To Artistry Cart?

Strong answer:

> Artistry Cart uses Vitest, Nx test targets, shared test utilities, and service e2e projects. CI runs affected tests/builds for pull requests and starts core backend services with MongoDB/Redis, waits for readiness endpoints, and runs e2e suites. High-risk areas like auth, order/payment, webhooks, middleware, and Kafka analytics deserve strong coverage.

## Best Short Project Pitch For This Topic

> The testing strategy in Artistry Cart is layered. Shared packages and pure logic get fast unit tests, services get integration tests for routes and middleware, critical cross-service behavior gets e2e coverage, and Nx keeps monorepo testing efficient through affected project detection and dependency-aware targets.

