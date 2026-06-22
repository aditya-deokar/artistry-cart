# Microservices Fundamentals

## What Is A Microservice?

A microservice is an independently runnable service focused on a specific business or technical capability.

It usually has:

- its own process
- its own API
- its own deployment unit
- its own logs and health checks
- a clearly defined responsibility
- communication with other services over a network or event bus

The word "micro" is misleading. The goal is not to make services tiny. The goal is to make boundaries useful.

## First-Principles Definition

A service exists to protect a responsibility.

You split code into a service when that area:

- changes for different reasons
- has different runtime needs
- has different security requirements
- has different scaling requirements
- has different failure modes
- needs a separate ownership model

In Artistry Cart:

- payments and webhooks deserve special treatment, so they live in `order-service`
- identity and OAuth deserve special treatment, so they live in `auth-service`
- AI APIs and embedding jobs deserve special treatment, so they live in `aivision-service`
- analytics ingestion is asynchronous, so it lives in `kafka-service`

## What A Microservice Is Not

A microservice is not just:

- a folder under `apps/`
- a controller file
- a module in a monolith
- a package in a monorepo
- a function behind an HTTP route

The key question is whether it can run and evolve as a service boundary.

## Synchronous Communication

Synchronous communication means one component waits for another.

Example:

```text
user-ui -> api-gateway -> product-service -> MongoDB
```

Benefits:

- simple mental model
- immediate response
- easier request tracing at small scale

Costs:

- caller latency includes downstream latency
- downstream failure can fail the request
- chains of calls can become fragile

Use synchronous APIs for user-facing reads and commands where the caller needs an immediate answer.

## Asynchronous Communication

Asynchronous communication means work is sent to another component without blocking the main request path.

Example:

```text
user-ui -> Kafka -> kafka-service -> MongoDB analytics
```

Benefits:

- protects foreground latency
- buffers traffic spikes
- decouples producers and consumers
- enables event-driven workflows

Costs:

- eventual consistency
- harder debugging
- retry and ordering concerns
- needs monitoring for lag and failures

Use async events for analytics, notifications, background processing, and workflows that do not need immediate user-visible completion.

## Database Ownership

In textbook microservices, each service owns its own database or schema.

That gives:

- strong data ownership
- independent schema evolution
- clearer service contracts
- less accidental coupling

But it also creates:

- cross-service query difficulty
- data duplication
- eventual consistency
- migration complexity
- more operational overhead

Artistry Cart currently uses a shared MongoDB schema through Prisma. This is practical for a growing project, but it means the architecture is not fully database-isolated microservices.

A precise interview phrase:

> The services are separated at the process and domain level, but data ownership is still shared, so I would call it a service-oriented monorepo rather than fully autonomous microservices.

## API Gateway Pattern

An API gateway is a single backend entry point for clients.

It can handle:

- routing
- proxying
- auth enforcement
- rate limiting
- request normalization
- response normalization
- cross-cutting policy

In this repo, `api-gateway` is mostly a thin proxy:

- `/auth` routes to `auth-service`
- `/product` routes to `product-service`
- `/order` routes to `order-service`
- `/recommendation` routes to `recommendation-service`
- `/ai-vision` routes to `aivision-service`

This keeps frontend configuration simpler because clients can talk to one backend entry point.

## Health And Readiness

Microservices should expose health endpoints.

Common distinction:

- liveness: is the process alive?
- readiness: is the service ready to receive traffic?

This repo uses readiness endpoints such as `/readyz` in app and service workflows. CI waits for services to become ready before running e2e tests.

## Failure Thinking

Distributed systems fail in more ways than monoliths.

Things that can fail:

- network calls
- service startup
- DNS or service discovery
- database connection
- Kafka broker connection
- Redis connection
- third-party APIs
- background jobs
- webhook delivery

Good service design assumes partial failure. It uses:

- timeouts
- retries with limits
- idempotent handlers
- circuit breakers where needed
- durable queues for async work
- observability for debugging

## Interview Summary

You can describe microservices like this:

> Microservices split a system into independently runnable services around business capabilities. The benefit is clearer ownership, independent deployment, and targeted scaling. The cost is distributed system complexity: network failures, data consistency, observability, deployment coordination, and contract management.

