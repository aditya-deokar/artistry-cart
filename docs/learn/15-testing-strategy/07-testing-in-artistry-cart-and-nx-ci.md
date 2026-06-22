# Testing In Artistry Cart And Nx CI

## Test Stack

Artistry Cart uses:

- Vitest for test execution
- Supertest-style API testing patterns
- Nx targets for project-level test/e2e commands
- shared `packages/test-utils`
- service e2e projects
- GitHub Actions for CI

## Root Test Workflow

The root test script builds shared packages before running Vitest.

This matters because services depend on workspace packages such as:

- `@artistry-cart/error-handler`
- `@artistry-cart/middleware`
- `@artistry-cart/libs`
- `@artistry-cart/utils`
- `@artistry-cart/test-utils`

## Vitest Projects

The root Vitest config references service/package test configs.

Examples:

- kafka-service
- product-service
- auth-service
- order-service
- api-gateway
- recommendation-service
- middleware
- error-handler

This lets tests run across multiple projects from one command.

## Nx Test Targets

Nx can run tests per project:

```bash
pnpm exec nx test auth-service
pnpm exec nx test product-service
```

Root scripts also expose targeted test commands such as:

```bash
pnpm test:auth
pnpm test:product
pnpm test:order
pnpm test:gateway
```

## Affected Tests In CI

On pull requests, CI can run:

```bash
pnpm exec nx affected --target=test --base=origin/master --head=HEAD
```

Why:

- avoid running unrelated tests
- keep feedback fast
- still include dependent projects when shared packages change

## E2E In CI

CI e2e flow:

```text
start MongoDB and Redis services
install dependencies
generate Prisma client
build core backend services
start services from build output
wait for /readyz
run e2e projects
show service logs on failure
```

This is a good production-like validation pattern.

## What Should Be Tested More As The Project Matures

Good next improvements:

- contract tests for API response shapes
- event schema tests for Kafka analytics
- webhook idempotency tests
- gateway downstream failure tests
- ownership authorization tests
- Prisma model ownership tests by convention
- frontend form and auth flow tests
- smoke tests for Docker/Kubernetes deployment outputs

## Risk-Based Testing

High-risk areas deserve stronger tests:

- authentication
- seller authorization
- checkout/payment
- Stripe webhooks
- product ownership
- Kafka event processing
- AI rate limits/cost controls
- shared packages

Lower-risk areas can have lighter coverage.

## Interview Explanation

If asked "How does testing work in your monorepo?", say:

> Artistry Cart uses Vitest and Nx. Each service/package can have its own test target, while root scripts run shared builds and project tests. CI uses Nx affected tests/builds for pull requests and runs service e2e tests by building services, starting them, waiting for readiness endpoints, and then executing e2e suites. Shared test utilities reduce duplicated setup.

