# Monorepo

## What Is A Monorepo

A monorepo is one repository containing multiple projects.

Projects can be:

- frontend apps
- backend services
- shared packages
- tests
- scripts
- infrastructure
- documentation

Monorepo is about source code organization, not runtime shape.

## Example Shape

```text
repo/
  apps/
    user-ui
    seller-ui
    auth-service
    product-service
  packages/
    middleware
    error-handler
    utils
  docs/
  scripts/
  docker/
  k8s/
```

## Benefits

### Atomic Changes

Related changes can happen in one branch.

Example:

```text
update auth contract
  -> auth-service
  -> middleware
  -> user-ui
  -> seller-ui
  -> tests
```

### Shared Tooling

One workspace can standardize:

- TypeScript
- tests
- build tools
- package manager
- CI
- docs

### Code Discovery

Engineers can inspect the whole system in one place.

### Easier Refactoring

Large cross-project refactors are easier when all consumers are visible.

### Shared Packages

Internal packages can be consumed through workspace dependencies without publishing to npm.

## Costs

### Repo Size

The workspace can become large.

### CI Complexity

Without affected builds/tests, CI becomes slow.

### Hidden Coupling

Shared packages can make boundaries blurry.

### Ownership Complexity

Teams need clear package and service ownership.

## Monorepo Needs Tooling

Tools like Nx help by providing:

- project graph
- targets
- caching
- affected commands
- dependency-aware builds
- parallel execution

Without tooling, a monorepo can become painful at scale.

## Monorepo Versus Multi-Repo

Monorepo:

```text
one repository
atomic cross-project changes
shared tooling
needs boundary discipline
```

Multi-repo:

```text
separate repositories
stronger repo-level ownership
more release/version coordination
harder cross-service refactors
```

## Interview Explanation

If asked "What is a monorepo?", say:

> A monorepo is a single repository containing multiple projects such as apps, services, packages, tests, docs, and infrastructure. It helps with atomic changes, shared tooling, and refactoring, but requires good boundaries and tooling like Nx to keep CI fast and coupling controlled.

## Connection To Artistry Cart

Artistry Cart is an Nx monorepo with:

- two Next.js frontends
- multiple Express backend services
- e2e projects
- shared packages
- Prisma schema
- Docker/Kubernetes assets
- docs and learning material

This source organization supports a service-oriented runtime architecture.

