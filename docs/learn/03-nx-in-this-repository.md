# Nx In This Repository

## Workspace Shape

Artistry Cart uses Nx with pnpm workspaces.

The root `pnpm-workspace.yaml` includes:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

That means every direct folder under `apps/` and `packages/` can be treated as a workspace package.

The high-level structure is:

```text
apps/        Next.js frontends, Express services, and e2e projects
packages/    shared runtime and testing packages
prisma/      MongoDB schema and seed data
docker/      Dockerfile and compose assets
k8s/         Kubernetes manifests
docs/        architecture, operations, and learning docs
```

## Applications And Services

Frontend apps:

- `apps/user-ui`: buyer-facing storefront
- `apps/seller-ui`: seller dashboard

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

Shared packages:

- `packages/error-handler`
- `packages/middleware`
- `packages/libs`
- `packages/test-utils`
- `packages/utils`

## Project Discovery

This repo uses package-level Nx configuration inside `package.json` files rather than separate `project.json` files.

For example, `apps/auth-service/package.json` defines Nx targets for:

- `serve`
- `test`
- `docker-build`

`packages/utils/package.json` defines a `build` target using `@nx/js:tsc`.

This keeps each package's local metadata close to the package itself.

## Root Nx Configuration

The root `nx.json` defines workspace-wide behavior.

Important parts:

- `defaultBase` is `master`, so affected commands compare against the master branch by default.
- `namedInputs` define what files count as inputs for tasks.
- `targetDefaults` define shared behavior for targets such as `build`, `test`, and `e2e`.
- plugins wire in TypeScript, Jest, Webpack, and Next.js behavior.

## Target Defaults

The root target defaults encode important architecture assumptions.

### Build

Builds are cached and depend on upstream builds:

```json
"build": {
  "cache": true,
  "dependsOn": ["^build"],
  "inputs": ["production", "^production"]
}
```

The `^build` syntax means "build dependencies first." If a service depends on a shared package, Nx can build the package before building the service.

### Test

Tests are cached and depend on dependency builds:

```json
"test": {
  "cache": true,
  "dependsOn": ["^build"],
  "inputs": ["default", "^production"]
}
```

This is useful because backend tests often import built shared packages.

### E2E

E2E tests are not cached:

```json
"e2e": {
  "cache": false
}
```

That is sensible because e2e tests depend on live services, databases, ports, and runtime state. Caching them can hide real integration failures.

## Shared Package Mechanics

Root `package.json` uses workspace dependencies:

```json
"@artistry-cart/error-handler": "workspace:*",
"@artistry-cart/libs": "workspace:*",
"@artistry-cart/middleware": "workspace:*",
"@artistry-cart/test-utils": "workspace:*",
"@artistry-cart/utils": "workspace:*"
```

Service packages also depend on those shared packages.

For example, `auth-service` depends on:

- `@artistry-cart/error-handler`
- `@artistry-cart/libs`
- `@artistry-cart/middleware`
- `@artistry-cart/utils`

This lets service code import shared functionality through package names instead of fragile relative paths.

## Commands You Should Know

Build one project:

```bash
pnpm exec nx build auth-service
```

Serve one backend:

```bash
pnpm exec nx serve product-service
```

Run one frontend:

```bash
pnpm exec nx dev user-ui
```

Run many builds:

```bash
pnpm exec nx run-many --target=build --projects=auth-service,product-service,order-service --parallel=3
```

Run affected tests:

```bash
pnpm exec nx affected --target=test --base=origin/master --head=HEAD
```

Run root test workflow:

```bash
pnpm test
```

## CI Usage

The GitHub Actions test workflow uses Nx in two important ways:

- pull requests run affected tests and affected builds
- pushes to `master` run broader test and build validation

This is a standard monorepo CI pattern:

- PRs optimize for fast feedback.
- main branch validation optimizes for stronger confidence.

## Why This Setup Fits Artistry Cart

The repo has many moving parts, but many changes are cross-cutting:

- auth contract changes affect frontends, gateway, middleware, and auth service
- Prisma schema changes affect multiple backend services
- Kafka analytics changes affect `user-ui`, `packages/utils`, `kafka-service`, and `recommendation-service`
- error contract changes affect every Express service

Nx makes those relationships visible and runnable from one place.

## What To Watch For

The main risk in this setup is hidden coupling.

Examples:

- a shared package starts accumulating business logic from several services
- services directly depend on database models they should not own
- a change to a common package triggers too many rebuilds
- frontend and backend contracts evolve without formal API schemas

The workspace structure is strong, but the architecture still needs boundary discipline.

