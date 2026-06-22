# Why Shared Packages Exist

## The First-Principles Problem

As a system grows, the same kind of code appears in many places.

Examples:

- error response formatting
- authentication middleware
- role checks
- database client setup
- Redis setup
- Kafka client setup
- test data factories
- request test helpers
- common runtime utilities

If every service implements these separately, the codebase becomes inconsistent.

Shared packages answer:

> Can we extract repeated infrastructure or contracts into one reusable place?

## What A Shared Package Is

A shared package is a reusable library inside the workspace.

In a monorepo, it can be imported by many apps or services.

Example:

```ts
import { isAuthenticated } from "@artistry-cart/middleware";
```

The consuming service does not need to know the internal file path.

## Why Shared Packages Are Useful

### Consistency

If every Express service uses the same error middleware, clients receive consistent error shapes.

### Less Duplication

One Redis helper is easier to maintain than five slightly different Redis helpers.

### Faster Refactoring

If a shared auth contract changes, it can be updated once and tested across affected services.

### Better Testing

Shared test utilities make service tests easier to write and more consistent.

### Clearer Contracts

Typed shared packages can expose official types for events, middleware, errors, and API helpers.

## What Belongs In Shared Packages

Good candidates:

- infrastructure clients
- middleware
- error classes
- error middleware
- event contracts
- test helpers
- logging helpers
- config parsing helpers
- validation helpers used by multiple services by design

## What Should Usually Stay Service-Owned

Service-owned code:

- business rules
- database queries specific to one domain
- controllers
- route handlers
- service-specific validators
- product pricing rules
- order state transitions
- AI workflow logic
- auth domain workflows

If shared packages contain too much business logic, service boundaries become fake.

## Reuse Versus Ownership

Shared packages create reuse. They also create ownership questions.

Ask:

```text
Who owns this package?
Who reviews changes?
Which services depend on it?
What is the blast radius if it changes?
Is this truly shared or just convenient?
```

## The "Two Consumers" Rule

A practical rule:

> Do not extract code into a shared package until at least two real consumers need it or the boundary is clearly architectural.

Exceptions:

- generated contracts
- infrastructure clients
- test utilities
- package boundaries created for future reuse intentionally

## Interview Explanation

If asked "Why create shared packages?", say:

> Shared packages centralize code that is reused across multiple apps or services, such as middleware, error handling, infrastructure clients, and test utilities. They improve consistency and reduce duplication, but they must be scoped carefully so they do not become hidden coupling or a dumping ground for business logic.

## Connection To Artistry Cart

Artistry Cart uses shared packages for:

- error handling in `packages/error-handler`
- auth and role middleware in `packages/middleware`
- Prisma, Redis, and ImageKit helpers in `packages/libs`
- Kafka utilities in `packages/utils`
- test helpers in `packages/test-utils`

