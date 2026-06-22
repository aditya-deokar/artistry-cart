# Nx Monorepo Fundamentals

## What Is A Monorepo?

A monorepo is a single repository that contains multiple projects.

Those projects can be:

- frontend applications
- backend services
- shared libraries
- test projects
- scripts
- infrastructure definitions
- documentation

A monorepo is not automatically a monolith. A monorepo says where code is stored. A monolith says how code is deployed and executed.

## What Nx Adds

Nx is a build system and workspace orchestrator for monorepos.

At a high level, Nx answers:

- What projects exist?
- Which projects depend on which other projects?
- What commands can run for each project?
- Which files affect which projects?
- Which tasks can be cached?
- Which tasks can run in parallel?
- Which tasks must run before other tasks?

In a small repo, you can run `npm test` and hope for the best. In a large monorepo, that becomes slow and noisy. Nx makes the workspace project-aware.

## Core Nx Concepts

### Workspace

The full repository managed by Nx. In this repo, the workspace root is the repository root containing `nx.json`, `package.json`, and `pnpm-workspace.yaml`.

### Project

A unit that Nx can understand. A project can be an app, service, library, package, or e2e test suite.

Examples:

- `@artistry-cart/user-ui`
- `@artistry-cart/auth-service`
- `@artistry-cart/product-service`
- `@artistry-cart/utils`
- `auth-service-e2e`

### Target

A command associated with a project.

Common targets:

- `build`
- `serve`
- `dev`
- `test`
- `e2e`
- `docker-build`

Example:

```bash
pnpm exec nx build auth-service
pnpm exec nx serve auth-service
pnpm exec nx test product-service
```

### Executor

An implementation that knows how to run a target. For example:

- `@nx/js:tsc` compiles TypeScript libraries.
- `@nx/js:node` serves a Node application from a build target.
- `nx:run-commands` runs a custom shell command.

### Project Graph

Nx builds a graph of projects and dependencies.

If `auth-service` imports `@artistry-cart/middleware`, Nx can understand that `auth-service` depends on `middleware`.

This graph powers:

- affected builds
- affected tests
- dependency-aware task ordering
- visualization
- cache invalidation

### Affected

"Affected" means "only projects impacted by a change."

If a pull request changes `packages/error-handler`, then services depending on that package may need to be rebuilt or retested. If it changes only `docs/learn`, application builds should not need to run.

Common command:

```bash
pnpm exec nx affected --target=test --base=origin/master --head=HEAD
```

### Cache

Nx can cache task outputs. If the same task runs with the same inputs, Nx can reuse the previous result instead of doing the work again.

This is useful because monorepos can become slow if every change rebuilds everything.

## How Nx Knows What Changed

Nx computes task inputs from:

- project files
- dependency project files
- configured named inputs in `nx.json`
- global files such as CI workflow scripts

In this repo, `nx.json` defines:

- `default` inputs for normal project files
- `production` inputs that exclude tests and dev-only files
- `sharedGlobals` for CI and deployment scripts that can affect many tasks

That means Nx can be more precise than a plain script runner.

## Why Nx Is Useful For Microservices

Microservices often produce many small projects:

- one service for auth
- one service for products
- one service for orders
- one service for recommendations
- one gateway
- several shared packages
- one e2e project per service

Without orchestration, commands become hard to remember and CI becomes expensive.

Nx gives one common command model:

```bash
pnpm exec nx build order-service
pnpm exec nx run-many --target=build --projects=auth-service,product-service,order-service
pnpm exec nx affected --target=test
```

## What Nx Does Not Solve By Itself

Nx is powerful, but it is not a replacement for architecture discipline.

Nx does not automatically:

- create clean domain boundaries
- prevent bad imports unless rules are configured
- make a service independently deployable
- make a shared database safe
- design APIs
- solve distributed system failures
- guarantee good CI strategy

Nx makes good monorepo practices easier. It does not make architectural decisions for you.

## Interview Summary

You can describe Nx like this:

> Nx is a monorepo build system that models each app and library as a project, builds a dependency graph between them, and uses that graph for task orchestration, caching, affected builds, and CI optimization.

