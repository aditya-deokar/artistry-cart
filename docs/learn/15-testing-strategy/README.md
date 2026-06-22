# Testing Strategy

This folder is the fifteenth learning block for preparing for a bigger engineering role. It explains testing strategy from first principles, then connects those ideas to Artistry Cart's Nx monorepo, backend services, shared packages, and e2e projects.

The goal is to understand what to test, where to test it, how much to test, and how to explain testing tradeoffs in interviews.

## Learning Outcome

After completing this topic, you should be able to explain:

- why testing exists
- the testing pyramid
- unit tests, integration tests, e2e tests, contract tests, and smoke tests
- what to mock and what not to mock
- how to test Express APIs and middleware
- how to test frontend behavior at the right level
- how to manage test data and factories
- how to test microservices without relying only on slow e2e tests
- how Nx affected tests improve monorepo CI
- how Artistry Cart uses Vitest, Supertest, test-utils, and service e2e projects

## Files In This Topic

1. [Testing Fundamentals](./01-testing-fundamentals.md)
2. [Testing Pyramid And Test Types](./02-testing-pyramid-and-test-types.md)
3. [Unit Testing Strategy](./03-unit-testing-strategy.md)
4. [Integration Testing Express Services](./04-integration-testing-express-services.md)
5. [E2E, Contract, Smoke, And Microservice Tests](./05-e2e-contract-smoke-microservice-tests.md)
6. [Mocks, Test Data, Factories, And Fixtures](./06-mocks-test-data-factories-fixtures.md)
7. [Testing In Artistry Cart And Nx CI](./07-testing-in-artistry-cart-and-nx-ci.md)
8. [Interview Questions And Answer Patterns](./08-interview-questions-and-answer-patterns.md)

## Core Mental Model

```text
unit tests = fast confidence in small logic
integration tests = confidence that components work together
e2e tests = confidence that real user/service flows work
contract tests = confidence that service boundaries match
smoke tests = confidence that deployment basically works
```

Good testing strategy balances speed, confidence, cost, and maintainability.

## Connection To Artistry Cart

Artistry Cart uses:

- Vitest for unit/integration test projects
- Supertest-style API testing patterns
- Nx targets for test/e2e execution
- `packages/test-utils` for shared helpers
- service e2e projects under `apps/*-e2e`
- GitHub Actions with affected tests/builds and e2e service readiness checks

