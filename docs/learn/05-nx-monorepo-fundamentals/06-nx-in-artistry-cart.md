# Nx In Artistry Cart

## Workspace Shape

Artistry Cart uses:

- Nx
- pnpm workspaces
- TypeScript
- Next.js
- Express services
- shared packages
- e2e projects

The root workspace includes:

```text
nx.json
package.json
pnpm-workspace.yaml
apps/
packages/
```

The pnpm workspace includes:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

## Apps

Frontend apps:

- `apps/user-ui`
- `apps/seller-ui`

Backend services:

- `apps/api-gateway`
- `apps/auth-service`
- `apps/product-service`
- `apps/order-service`
- `apps/recommendation-service`
- `apps/aivision-service`
- `apps/kafka-service`

E2E projects:

- `apps/auth-service-e2e`
- `apps/api-gateway-e2e`
- `apps/product-service-e2e`
- `apps/order-service-e2e`
- `apps/recommendation-service-e2e`
- `apps/kafka-service-e2e`
- `apps/aivision-service-e2e`

## Packages

Shared packages:

- `packages/error-handler`
- `packages/middleware`
- `packages/libs`
- `packages/test-utils`
- `packages/utils`

These packages are consumed through workspace dependencies like:

```json
"@artistry-cart/utils": "workspace:*"
```

## Root Nx Configuration

Root `nx.json` defines:

- default base branch
- named inputs
- plugins
- target defaults
- generator defaults

Important target behavior:

- builds are cached
- builds depend on dependency builds
- tests are cached
- tests depend on dependency builds
- e2e is not cached

## Build Dependencies

The target default:

```text
dependsOn: ^build
```

means dependency projects build first.

Example:

```text
build @artistry-cart/middleware
  -> build auth-service
```

This matters because backend services depend on shared packages.

## Frontend Targets

The frontend apps use Next.js behavior.

Examples:

```bash
pnpm exec nx dev user-ui
pnpm exec nx dev seller-ui
pnpm exec nx build user-ui
```

Root scripts also provide:

```bash
pnpm user-ui
pnpm seller-ui
```

## Backend Targets

Backend services commonly support:

```bash
pnpm exec nx serve auth-service
pnpm exec nx build product-service
pnpm exec nx test order-service
```

Some services define `docker-build` targets for container image builds.

## Shared Package Build

Root script:

```bash
pnpm run build:shared
```

builds shared packages:

- error handler
- libs
- middleware
- test utils
- utils

This helps tests and services consume built package outputs.

## Why Nx Fits This Repo

Artistry Cart has many cross-project relationships:

```text
frontends -> gateway/API contracts
services -> shared middleware
services -> shared Prisma package
services -> shared error handler
kafka-service -> shared Kafka event utilities
tests -> shared test-utils
```

Nx makes these relationships manageable through project graph and target orchestration.

## Practical Commands

Build one service:

```bash
pnpm exec nx build auth-service
```

Serve one service:

```bash
pnpm exec nx serve product-service
```

Run one frontend:

```bash
pnpm exec nx dev user-ui
```

Build many services:

```bash
pnpm exec nx run-many --target=build --projects=auth-service,product-service,order-service
```

Run affected tests:

```bash
pnpm exec nx affected --target=test --base=origin/master --head=HEAD
```

## Interview Explanation

If asked "How does Nx work in your project?", say:

> Artistry Cart uses Nx with pnpm workspaces. Apps live under `apps/`, shared packages live under `packages/`, and Nx models each app, service, package, and e2e suite as a project. Root `nx.json` defines target defaults for build, test, and e2e. Nx builds shared dependencies first, caches repeatable tasks, and CI uses affected commands so pull requests run only impacted builds and tests.

