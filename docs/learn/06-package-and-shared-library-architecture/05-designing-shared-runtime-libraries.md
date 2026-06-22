# Designing Shared Runtime Libraries

## What Runtime Libraries Are

Runtime libraries are shared packages used while the application is running.

Examples:

- error handling
- middleware
- database client
- Redis helper
- Kafka client
- ImageKit client
- logging helper

These are different from test-only utilities.

## Design Principle

Runtime libraries should be:

- small
- focused
- stable
- easy to configure
- safe by default
- free of service-specific business logic

## Shared Error Handler

A shared error package can provide:

- `AppError`
- `ValidationError`
- `UnauthorizedError`
- Express error middleware
- normalized API response shape

Benefits:

- all services return similar error responses
- frontend can handle errors consistently
- tests can expect common behavior

Risk:

- making error classes too tied to one service's domain

## Shared Middleware

Shared middleware can provide:

- `isAuthenticated`
- `isAdmin`
- `authorizedRoles`
- request auth contract helpers

Benefits:

- consistent auth behavior
- no repeated token parsing code
- easier security fixes

Risk:

- middleware knows too much about service-specific ownership rules

Rule:

> Generic role/auth checks can be shared. Domain-specific authorization should stay in the owning service.

Example:

```text
shared: user has seller role
service-owned: seller owns this specific product
```

## Shared Prisma Client

A shared Prisma package can centralize:

- client creation
- import path
- connection lifecycle
- database helper conventions

Benefits:

- consistent database access
- avoids many Prisma client instances
- easier setup

Tradeoff:

- shared database client increases coupling between services
- services may reach into models they do not truly own

## Shared Redis Helper

A Redis helper can centralize:

- client creation
- enable/disable behavior
- connection fallback
- common config

Useful for:

- auth/session-adjacent flows
- order/payment temporary state
- caching

## Shared Kafka Utilities

Kafka package can provide:

- KafkaJS client factory
- producer helper
- topic constants
- event payload types
- analytics event contract

Benefits:

- producer and consumer agree on event shape
- fewer duplicated Kafka configs
- easier event schema evolution

Risk:

- event contract changes can affect producers and consumers together

## Configuration Design

Shared runtime libraries should avoid hidden config.

Good:

```ts
createRedisClient({ url, enabled });
```

Risky:

```ts
createRedisClient(); // secretly reads many env vars inside
```

Sometimes env reading is acceptable, but explicit configuration is easier to test.

## Error Handling In Shared Libraries

Shared libraries should:

- throw known error types when useful
- avoid swallowing errors silently
- log carefully
- avoid leaking secrets
- document fallback behavior

## Interview Explanation

If asked "How do you design shared runtime packages?", say:

> I keep runtime packages focused on infrastructure or contracts, such as error handling, middleware, database clients, Redis, or Kafka helpers. They should expose a small public API, accept explicit configuration where possible, avoid service-specific business logic, and be tested because many services depend on them.

## Connection To Artistry Cart

Runtime shared libraries in Artistry Cart include:

- `packages/error-handler`
- `packages/middleware`
- `packages/libs/prisma`
- `packages/libs/redis`
- `packages/libs/imageKit`
- `packages/utils/kafka`

