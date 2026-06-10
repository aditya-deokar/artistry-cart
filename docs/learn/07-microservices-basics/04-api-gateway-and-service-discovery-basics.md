# API Gateway And Service Discovery Basics

## What Is An API Gateway

An API gateway is a client-facing entry point in front of backend services.

Instead of clients calling every service directly:

```text
client -> auth-service
client -> product-service
client -> order-service
```

Clients call:

```text
client -> api-gateway -> services
```

## Why Use A Gateway

Benefits:

- one backend entry point for clients
- centralized routing
- hides internal service locations
- can enforce shared policies
- can simplify frontend configuration
- can support rate limiting, auth checks, or request normalization

## What A Gateway Should Do

Good gateway responsibilities:

- route requests
- proxy to services
- handle CORS at the edge
- apply broad rate limits
- attach request ids
- centralize simple cross-cutting policies
- expose health/readiness

## What A Gateway Should Avoid

Avoid putting too much business logic in the gateway.

Bad gateway:

```text
calculates order totals
owns product pricing
handles payment state transitions
contains all orchestration logic
```

This can create a distributed monolith.

Better:

```text
gateway routes checkout request to order-service
order-service owns checkout rules
```

## Backend For Frontend

Sometimes teams create a backend-for-frontend, or BFF.

A BFF is an API layer tailored to a specific frontend.

Example:

```text
buyer-bff
seller-bff
mobile-bff
```

A BFF can be useful when clients have very different API needs.

An API gateway is usually more generic routing/policy. A BFF is more client-specific.

## Service Discovery

Service discovery means finding where a service lives.

Local development often uses:

```text
localhost:6001
localhost:6002
localhost:6004
```

Container/Kubernetes environments use service names:

```text
auth-service
product-service
order-service
```

The gateway needs to know where to send traffic.

## Static Config Versus Dynamic Discovery

Static config:

```text
AUTH_SERVICE_URL=http://localhost:6001
```

Dynamic discovery:

```text
ask platform/service registry where auth-service is
```

Kubernetes gives service discovery through DNS.

## Gateway Failure Modes

Common failures:

- downstream service is down
- timeout
- bad route config
- gateway overload
- CORS misconfiguration
- auth header/cookie not forwarded
- response body too large

Gateway should return meaningful errors:

- `502 Bad Gateway` for downstream failure
- `504 Gateway Timeout` for timeout
- `503 Service Unavailable` if dependency is unavailable

## Interview Explanation

If asked "What is an API gateway?", say:

> An API gateway is a single client-facing entry point that routes requests to backend services and can apply cross-cutting policies like CORS, request ids, rate limits, and simple auth checks. It simplifies clients but should stay thin; domain business logic should remain inside the owning service.

## Connection To Artistry Cart

Artistry Cart has `api-gateway`, which routes:

```text
/auth -> auth-service
/product -> product-service
/order -> order-service
/recommendation -> recommendation-service
/ai-vision -> aivision-service
```

This keeps `user-ui` and `seller-ui` from needing to know every service location directly.

