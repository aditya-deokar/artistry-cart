# Test, Build, E2E, And Quality Gates

## What A Quality Gate Is

A quality gate is a condition that must pass before code can move forward.

Examples:

- tests pass
- build succeeds
- e2e flows pass
- image scan completes
- rollout succeeds
- smoke checks pass

Quality gates reduce the chance of broken code reaching users.

## Unit Tests

Unit tests verify small pieces of logic in isolation.

They answer:

```text
does this function or module behave correctly?
```

They should be fast and deterministic.

## Integration Tests

Integration tests verify that multiple pieces work together.

They answer:

```text
do these modules work together with real or realistic dependencies?
```

For backend systems, integration tests often touch databases, caches, service clients, or route handlers.

## Build Validation

Build validation checks whether production artifacts can be generated.

It catches issues like:

- TypeScript compilation errors
- missing imports
- broken framework config
- invalid build output paths
- dependency problems

In Artistry Cart, build validation uses Nx build targets.

## E2E Tests

E2E tests validate a real flow across service boundaries.

The Artistry Cart test workflow starts:

- MongoDB service container
- Redis service container
- `auth-service`
- `product-service`
- `order-service`
- `recommendation-service`
- `api-gateway`

Then it waits for `/readyz` endpoints and runs core e2e projects:

- `auth-service-e2e`
- `product-service-e2e`
- `order-service-e2e`
- `api-gateway-e2e`
- `recommendation-service-e2e`

## Readiness In CI

Starting a service process is not enough.

CI must wait until the service is ready:

```text
service started != service ready
```

That is why the workflow checks `/readyz` before e2e tests run.

This prevents flaky tests caused by racing against service startup.

## Service Logs On Failure

When e2e tests fail, Artistry Cart prints service logs from `/tmp`.

That is a good CI pattern because the failure output should include enough data to debug without rerunning blindly.

## Coverage

Coverage tells how much code was exercised by tests.

It is useful, but it is not the same as quality.

Strong interpretation:

```text
coverage helps identify untested areas, but meaningful assertions matter more than raw percentage
```

Artistry Cart uploads coverage to Codecov on pushes to `master`.

## Fast Feedback Versus Confidence

CI design balances speed and confidence.

Pull requests need fast feedback:

- affected tests
- affected builds

Release workflows need higher confidence:

- full unit and integration tests
- deployable app builds
- e2e validation
- image publishing
- scan artifacts

## Strong Interview Answer

If asked "What should a CI pipeline validate?", say:

> A CI pipeline should validate dependency installation, generated code, tests, builds, and important integration or e2e flows. For services, I also wait for readiness endpoints before testing and collect logs on failure. The goal is fast pull request feedback plus stronger release gates before packaging and deployment.

## Artistry Cart Connection

Artistry Cart uses PR affected validation for speed and release validation for confidence. It starts real backend services for e2e tests, waits for `/readyz`, and uploads logs, coverage, and artifacts to make failures diagnosable.
