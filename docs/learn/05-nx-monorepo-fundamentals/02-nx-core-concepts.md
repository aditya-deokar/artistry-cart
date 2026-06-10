# Nx Core Concepts

## What Nx Is

Nx is a build system and monorepo toolkit.

It helps manage many projects in one workspace by understanding:

- project structure
- dependencies
- commands
- task inputs
- task outputs
- cacheability
- affected projects

Interview answer:

> Nx is a graph-aware build system for monorepos. It models apps and packages as projects, tracks dependencies between them, and uses that graph to run builds, tests, caching, and affected commands efficiently.

## Workspace

The workspace is the full repository managed by Nx.

In this repo, the workspace root contains:

```text
nx.json
package.json
pnpm-workspace.yaml
apps/
packages/
```

## Project

A project is a unit Nx can understand and run tasks for.

Examples:

- `user-ui`
- `seller-ui`
- `auth-service`
- `product-service`
- `order-service`
- `@artistry-cart/utils`
- `@artistry-cart/middleware`

Projects are usually apps, services, libraries, or e2e test suites.

## Target

A target is a named task for a project.

Common targets:

```text
build
serve
dev
test
e2e
typecheck
docker-build
```

Example commands:

```bash
pnpm exec nx build auth-service
pnpm exec nx serve product-service
pnpm exec nx test order-service
```

## Executor

An executor is the implementation that runs a target.

Examples:

- `@nx/js:tsc` compiles TypeScript packages
- `@nx/js:node` runs Node services
- `nx:run-commands` runs custom commands
- Next.js plugin targets run Next.js builds/dev servers

Targets say what to run. Executors know how to run it.

## Plugin

Nx plugins teach Nx how to work with specific technologies.

This repo uses plugins for:

- TypeScript
- Jest/Nx test target support
- Webpack
- Next.js

Plugins reduce custom configuration because Nx can infer common project behavior.

## Named Inputs

Named inputs define which files affect a task.

Example idea:

```text
production input = source files excluding tests
```

If test files do not affect production builds, Nx can avoid invalidating build cache unnecessarily.

## Target Defaults

Target defaults define shared behavior for all projects with a target.

Example:

```text
all build targets should be cached
all build targets should build dependencies first
all test targets should depend on dependency builds
```

This avoids repeating the same config in every project.

## Dependency Graph

Nx builds a graph of project dependencies.

Example:

```text
auth-service -> middleware
auth-service -> error-handler
auth-service -> libs
```

This graph powers affected commands and dependency-aware builds.

## Task Graph

The project graph knows project relationships.

The task graph knows execution order.

Example:

```text
build middleware
  -> build auth-service
  -> test auth-service
```

Nx uses this to run tasks in the correct order and parallelize safely.

## Interview Explanation

If asked "What are Nx projects and targets?", say:

> A project is an app, service, package, or test suite Nx can reason about. A target is a task for that project, such as build, test, serve, or e2e. Nx uses executors and plugins to run those targets, and it uses the project graph to know dependencies and task order.

## Connection To Artistry Cart

Artistry Cart defines Nx behavior through:

- root `nx.json`
- package-level `nx.targets` in package files
- pnpm workspace packages
- Nx plugins for TypeScript, Webpack, Next.js, and tests
- target defaults for build/test/e2e behavior

