# Workspace Structure: Apps, Packages, And Boundaries

## Why Workspace Structure Matters

A monorepo without boundaries becomes a large folder of tangled code.

Good structure tells engineers:

- where new code belongs
- what can depend on what
- which code is deployable
- which code is shared
- which code is internal

## Common Nx Workspace Layout

Common shape:

```text
apps/
  deployable applications and services

packages/ or libs/
  shared libraries and reusable code

tools/ or scripts/
  automation and maintenance scripts

docs/
  architecture and learning documentation
```

Artistry Cart uses:

```text
apps/
packages/
tools/
scripts/
docs/
docker/
k8s/
prisma/
```

## Apps

Apps are deployable or runnable projects.

Examples in this repo:

- `user-ui`
- `seller-ui`
- `api-gateway`
- `auth-service`
- `product-service`
- `order-service`
- `recommendation-service`
- `aivision-service`
- `kafka-service`

Apps own runtime behavior.

They should not be imported directly by other apps.

Bad:

```ts
import { authController } from "../../auth-service/src/controller/auth.controller";
```

Better:

```text
communicate through HTTP API, event, or shared contract package
```

## Packages

Packages contain reusable code.

Examples:

- `packages/error-handler`
- `packages/middleware`
- `packages/libs`
- `packages/utils`
- `packages/test-utils`

Packages can be imported by apps and other packages when boundaries allow.

## Good Shared Package Candidates

Good:

- error classes
- Express middleware
- Prisma client wrapper
- Redis helper
- Kafka client helper
- typed event contracts
- test factories
- validation helpers shared by design

Risky:

- mixed business logic from several services
- service-specific database queries
- random helpers
- code that makes all services depend on each other indirectly

## Public API Of A Package

A package should expose a clear public API.

Example:

```ts
import { isAuthenticated } from "@artistry-cart/middleware";
```

Avoid importing internal files by relative path.

Good boundaries rely on package entry points and exports.

## Workspace Dependencies

pnpm workspaces allow local packages to depend on each other.

Example:

```json
"@artistry-cart/utils": "workspace:*"
```

This tells pnpm:

> Use the local workspace package.

This is powerful because shared package changes are immediately available to local consumers.

## Boundary Rules

A healthy monorepo should define rules like:

- apps can depend on packages
- packages should not depend on apps
- feature-specific code should stay with its app/service
- shared packages should be intentionally small
- test utilities should not leak into production code
- frontend packages should not import backend-only code
- backend code should not import browser-only code

Nx can enforce some of these rules with lint/module-boundary configuration when set up.

## Coupling

Shared code creates coupling.

Some coupling is good:

```text
all Express services share error response format
```

Some coupling is risky:

```text
all services depend on one giant utils package containing domain logic
```

The goal is not zero coupling. The goal is intentional coupling.

## Interview Explanation

If asked "How should a monorepo be structured?", say:

> I separate runnable apps and services from shared packages. Apps own deployment and runtime behavior. Packages hold reusable infrastructure, contracts, or utilities. Apps should not import other apps directly; they should communicate through APIs, events, or well-defined shared packages. This keeps the monorepo useful without turning it into hidden coupling.

## Connection To Artistry Cart

Artistry Cart follows this pattern:

- `apps/` contains frontends, backend services, and e2e suites
- `packages/` contains shared runtime and test packages
- `prisma/` contains shared database schema
- `docs/` explains architecture and tradeoffs
- `docker/` and `k8s/` support deployment

