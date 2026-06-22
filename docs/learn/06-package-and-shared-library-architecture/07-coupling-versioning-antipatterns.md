# Coupling, Versioning, And Anti-Patterns

## Shared Packages Create Coupling

Coupling means one part of the system depends on another.

Shared packages intentionally create coupling.

Good coupling:

```text
all services share one error response contract
```

Risky coupling:

```text
all services depend on one giant package full of unrelated business logic
```

The goal is intentional coupling.

## Blast Radius

Changing a shared package can affect many services.

Example:

```text
change middleware auth contract
  -> auth-service affected
  -> product-service affected
  -> order-service affected
  -> gateway affected
  -> tests affected
```

Nx helps identify this through affected commands.

## Versioning In Monorepos

Internal workspace packages often use:

```json
"workspace:*"
```

This means consumers use the local package version.

In a monorepo, package changes can be atomic.

In a multi-repo setup, you may need:

- publish package version
- update consumers
- coordinate releases

## Breaking Changes

Breaking changes include:

- removing an export
- renaming a function
- changing parameter order
- changing response shape
- changing error code
- changing event payload
- changing runtime behavior unexpectedly

In a monorepo, you can update all consumers in one PR, but the change is still breaking.

## Anti-Pattern: Giant Utils Package

Bad:

```text
utils/
  auth helpers
  product pricing
  order state
  React hooks
  Kafka clients
  date formatting
  database queries
```

Problems:

- unclear ownership
- hard to tree-shake
- hidden dependencies
- high blast radius
- poor discoverability

Better:

```text
packages/middleware
packages/error-handler
packages/utils/kafka
packages/utils/runtime
service-owned domain helpers
```

## Anti-Pattern: Sharing Too Early

Do not extract code just because it looks similar once.

Premature sharing can create the wrong abstraction.

Better:

```text
duplicate once
learn the pattern
extract when real reuse is clear
```

## Anti-Pattern: Domain Logic In Infrastructure Package

Bad:

```text
packages/libs/prisma contains product pricing rules
```

Better:

```text
product-service owns product pricing rules
packages/libs/prisma provides database client
```

## Anti-Pattern: Deep Imports

Bad:

```ts
import { x } from "../../../packages/utils/kafka/client";
```

Better:

```ts
import { x } from "@artistry-cart/utils/kafka";
```

Deep imports bypass package boundaries.

## Anti-Pattern: Package Depends On App

Bad:

```text
packages/middleware imports apps/auth-service internals
```

This reverses dependency direction.

Better:

```text
middleware exports generic auth helpers
auth-service owns auth-specific workflows
```

## Anti-Pattern: Test Utilities In Production

Bad:

```ts
import { createUserFactory } from "@artistry-cart/test-utils";
```

inside production service code.

Test utilities should stay in tests.

## Interview Explanation

If asked "What are the risks of shared libraries?", say:

> Shared libraries reduce duplication but increase coupling. A change to a shared package can affect many apps and services, so public APIs should be small and stable. The main anti-patterns are giant utils packages, deep imports, premature sharing, domain logic in infrastructure packages, and production code depending on test utilities.

## Connection To Artistry Cart

Risks to watch in Artistry Cart:

- `packages/utils` becoming too broad
- shared Prisma access weakening service data ownership
- auth middleware knowing too much about service-specific rules
- event contract changes affecting producers and consumers
- test utilities leaking into runtime code

