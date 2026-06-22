# Shared Packages And Cross-Cutting Infrastructure

## Why Shared Packages Matter In This Repo

Artistry Cart has multiple services that need common behavior.

Without shared packages, each service might reimplement:

- error handling
- auth middleware
- role checks
- Prisma client setup
- Redis setup
- Kafka producer/consumer setup
- ImageKit setup
- test factories
- request helpers

Shared packages reduce duplication and improve consistency.

## Shared Package Map

| Package | Purpose |
| --- | --- |
| `packages/error-handler` | shared error classes and Express error middleware |
| `packages/middleware` | shared auth and role middleware |
| `packages/libs/prisma` | Prisma client entry point |
| `packages/libs/redis` | Redis initialization/fallback helper |
| `packages/libs/imageKit` | ImageKit client helper |
| `packages/utils/kafka` | Kafka client, producer helpers, analytics contracts |
| `packages/test-utils` | test setup, factories, auth helpers, request helpers |

## Error Handler

Purpose:

- normalize API errors
- avoid repeated error middleware
- keep frontend error handling consistent

Example benefit:

```text
auth-service and product-service return similar error response shapes
```

Interview point:

> Shared error handling is a good package because consistency matters across all services.

## Middleware

Purpose:

- reusable authentication checks
- reusable role checks
- shared auth contract types

Good shared logic:

```text
is user authenticated?
does user have required role?
```

Service-owned logic:

```text
does this seller own this product?
can this user cancel this specific order?
```

## Prisma Package

Purpose:

- central Prisma client import/setup
- shared database access entry point

Benefit:

- services use one consistent database client pattern

Tradeoff:

- shared database access can blur data ownership

## Redis Package

Purpose:

- Redis client setup
- fallback behavior
- config handling

Useful for:

- auth/session-adjacent behavior
- order/payment auxiliary state
- caching-style workflows

## Kafka Utilities

Purpose:

- KafkaJS setup
- producer helper
- analytics event contracts
- topic-related utilities

Benefit:

- producer and consumer agree on event payloads

## Test Utils

Purpose:

- consistent test setup
- factories
- auth helpers
- request helpers
- custom matchers

Benefit:

- less duplicated test boilerplate across services

## Cross-Cutting Concerns

Cross-cutting concerns are concerns used across many services:

- auth
- logging
- errors
- validation style
- config
- metrics
- database access
- queue access
- testing

Good architecture extracts cross-cutting infrastructure carefully while keeping domain logic in services.

## Interview Explanation

If asked "How does shared code work in your monorepo?", say:

> Shared infrastructure lives in workspace packages under `packages/`. Services import shared error handling, middleware, Prisma/Redis/ImageKit helpers, Kafka utilities, and test utilities through package names. This reduces duplication and makes behavior consistent, but we must keep shared packages focused so service-specific business logic does not leak across boundaries.

