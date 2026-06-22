# Workspace Dependencies And Build Flow

## What Workspace Dependencies Are

Workspace dependencies let packages in the same repository depend on each other locally.

Example:

```json
{
  "dependencies": {
    "@artistry-cart/middleware": "workspace:*"
  }
}
```

This tells pnpm:

> Use the local workspace package named `@artistry-cart/middleware`.

## Why Workspace Dependencies Help

Benefits:

- no need to publish internal packages to npm
- local package changes are immediately testable
- cross-package refactors are easier
- dependency relationships are explicit
- Nx can understand project relationships

## pnpm Workspace Shape

This repo's workspace includes:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

That means direct folders under `apps/` and `packages/` are workspace projects.

## Package Build Flow

A TypeScript package often has:

```text
source .ts files
  -> build target
  -> dist .js output
  -> consumed by services/tests
```

Example:

```text
packages/utils/index.ts
  -> packages/utils/dist/index.js
```

## Dependency-Aware Builds

If a service depends on a shared package, the package should build first.

Example:

```text
build @artistry-cart/middleware
  -> build auth-service
```

Nx supports this with:

```json
"dependsOn": ["^build"]
```

The caret means:

> run the target on dependency projects first.

## Build Inputs

Build inputs decide what invalidates a build.

Examples:

- source files
- package config
- TypeScript config
- dependency source files
- lockfile

Nx uses these inputs for caching.

## Build Outputs

Outputs are generated files.

Examples:

- `dist/`
- `.next/`

Nx can cache and restore outputs when inputs have not changed.

## TypeScript Declarations

Shared packages should expose useful types.

This can include:

- generated declaration files
- source types through `types`
- exported DTOs or event contracts

Types matter because consumers should know what functions expect and return.

## Local Development Flow

Typical local workflow:

```bash
pnpm install
pnpm run build:shared
pnpm exec nx serve auth-service
```

Or build only what is needed:

```bash
pnpm exec nx build @artistry-cart/utils
pnpm exec nx build auth-service
```

## CI Flow

CI should use the graph:

```bash
pnpm exec nx affected --target=test
pnpm exec nx affected --target=build
```

If a shared package changes, Nx should include dependent apps/services.

## Common Build Problems

- package exports point to missing `dist` files
- package was not built before service starts
- TypeScript module resolution mismatch
- circular dependency between packages
- deep imports bypass package exports
- generated client not available
- stale cache from incorrect inputs/outputs

## Interview Explanation

If asked "How do workspace packages build in Nx?", say:

> Workspace packages are local dependencies declared with `workspace:*`. Nx uses the project graph to understand which services depend on which packages. With dependency-aware target defaults like `dependsOn: ^build`, Nx builds shared package dependencies before building consumers, and caching avoids rebuilding unchanged outputs.

## Connection To Artistry Cart

Artistry Cart uses workspace packages for:

- backend shared middleware
- shared error handling
- Prisma/Redis/ImageKit helpers
- Kafka utilities
- test utilities

The root `build:shared` script builds important shared packages before tests.

