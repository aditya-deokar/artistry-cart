# Health Checks, Configuration, And Production API Readiness

## Production Readiness

A backend service is production-ready when it can be:

- configured safely
- started reliably
- checked by infrastructure
- monitored
- debugged
- shut down gracefully
- deployed without manual guesswork

Writing route handlers is only one part of backend engineering.

## Health Checks

Health endpoints let infrastructure ask:

> Is this service alive and ready?

Common endpoints:

```text
GET /healthz
GET /readyz
```

## Liveness Versus Readiness

### Liveness

Answers:

> Is the process alive?

If liveness fails, orchestration systems may restart the container.

### Readiness

Answers:

> Can this service receive traffic?

Readiness may check:

- app startup complete
- database reachable
- required config loaded
- dependent clients initialized

If readiness fails, the service should not receive traffic yet.

## Why Readiness Matters In CI And Kubernetes

In CI:

```text
start service
wait for /readyz
run e2e tests
```

In Kubernetes:

```text
pod starts
readiness probe fails until service is ready
traffic is sent only after readiness passes
```

This prevents requests hitting half-started services.

## Configuration

Production services should read config from environment variables.

Example:

```text
PORT=6001
DATABASE_URL=...
REDIS_URL=...
ACCESS_TOKEN_SECRET=...
```

Validate config at startup.

Bad:

```ts
const secret = process.env.ACCESS_TOKEN_SECRET;
// maybe undefined, app still starts
```

Better:

```ts
if (!process.env.ACCESS_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET is required");
}
```

## Security Basics For APIs

Production APIs should consider:

- HTTPS at the edge
- CORS allowlist
- secure cookies
- request size limits
- rate limiting
- input validation
- auth middleware
- least-privilege secrets
- safe error responses
- dependency updates

## Request Size Limits

Large request bodies can overload memory.

Example:

```ts
app.use(express.json({ limit: "1mb" }));
```

AI/image endpoints may need special upload handling, not unlimited JSON bodies.

## Timeouts

Backend services should not wait forever.

Timeouts matter for:

- downstream service calls
- database queries
- external APIs
- AI providers
- payment providers

Without timeouts, requests can hang and consume resources.

## Graceful Shutdown

On `SIGTERM`, a service should:

```text
1. Stop accepting new traffic.
2. Let in-flight requests complete briefly.
3. Close database/cache/queue clients.
4. Flush logs.
5. Exit.
```

This avoids broken deployments and dropped work.

## API Versioning

As APIs mature, clients need compatibility.

Options:

- path versioning: `/v1/products`
- header versioning
- backward-compatible changes

Breaking changes should be intentional.

## Pagination

List endpoints should avoid returning unlimited data.

Example:

```text
GET /products?page=1&limit=20
```

Benefits:

- lower response time
- less memory usage
- better UI performance
- safer database load

## Idempotency

Idempotency means repeating an operation produces the same final result.

Important for:

- payment sessions
- order creation
- webhooks
- retryable API calls

Example:

```text
Idempotency-Key: order_attempt_123
```

## Observability

Production APIs need:

- logs
- metrics
- traces
- health endpoints
- error alerts

Basic metrics:

- request count
- error rate
- response time
- database latency
- memory usage
- CPU usage

## Interview Explanation

If asked "What makes an API production-ready?", say:

> A production-ready API has clear routing and validation, centralized error handling, safe configuration, secure auth and CORS settings, request limits, timeouts, health/readiness endpoints, structured logging, graceful shutdown, and observability. It should fail predictably and be easy to debug in deployment.

## Connection To Artistry Cart

This repo already uses production-readiness patterns through:

- `/healthz` and `/readyz` routes
- CI waiting for services before e2e tests
- Docker and Kubernetes manifests
- environment files
- shared error and middleware packages
- service-specific ports
- Kubernetes readiness and deployment assets

