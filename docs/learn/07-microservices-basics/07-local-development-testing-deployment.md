# Local Development, Testing, And Deployment

## Why Microservices Are Harder Locally

A monolith may need:

```text
one app
one database
```

A microservices setup may need:

```text
frontend
gateway
auth-service
product-service
order-service
recommendation-service
AI service
Kafka worker
MongoDB
Redis
Kafka
external API mocks
```

This makes local development more complex.

## Local Development Strategies

### Run Only What You Need

If working on product APIs:

```text
api-gateway
product-service
MongoDB
frontend if needed
```

Do not always run the whole platform.

### Use Docker Compose For Infrastructure

Use Compose for dependencies like:

- MongoDB
- Redis
- Kafka
- Kafka UI

### Use Environment Variables

Each service needs correct local config:

- port
- database URL
- Redis URL
- Kafka broker
- service URLs
- API keys or mock values

## Health And Readiness

Services should expose endpoints:

```text
/healthz
/readyz
```

Local scripts and CI can wait for readiness before running tests.

## Testing Layers

### Unit Tests

Test one function or module.

Example:

```text
calculateOrderTotal
validateDiscountInput
formatErrorResponse
```

### Integration Tests

Test interaction with real or test infrastructure.

Example:

```text
controller + service + database
```

### Contract Tests

Test that service API contracts match consumer expectations.

Useful when services deploy independently.

### E2E Tests

Test a real flow through multiple services.

Example:

```text
start auth-service, product-service, order-service, gateway
run checkout/auth/product flows
```

## Test Data

Microservices need disciplined test data:

- isolated test database
- predictable seed data
- cleanup between tests
- factories for common entities
- no dependence on production services

## Deployment Units

Each service can become its own deployment unit.

Deployment unit includes:

- container image
- environment variables
- health checks
- resource limits
- scaling rules
- logs and metrics

## Kubernetes Basics For Services

Microservices often run in Kubernetes using:

- Deployment
- Service
- ConfigMap
- Secret
- Ingress
- HPA
- readiness/liveness probes

Each service needs correct runtime configuration.

## CI/CD For Microservices

CI should answer:

- what changed?
- which services are affected?
- which tests should run?
- which images should build?
- what should deploy?

Nx helps in a monorepo by calculating affected projects.

## Interview Explanation

If asked "How do you test microservices?", say:

> I use multiple test layers. Unit tests cover pure logic, integration tests cover service plus database or dependencies, contract tests protect service boundaries, and e2e tests validate important flows across services. I avoid relying only on e2e tests because they are slower and harder to debug.

## Connection To Artistry Cart

Artistry Cart supports this through:

- Nx project targets
- service-level unit/integration tests
- e2e projects under `apps/*-e2e`
- Docker Compose for infrastructure
- CI service startup and readiness checks
- Kubernetes manifests for deployment shape

