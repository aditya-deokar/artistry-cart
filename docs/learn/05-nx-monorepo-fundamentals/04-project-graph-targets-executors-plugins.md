# Project Graph, Targets, Executors, And Plugins

## Project Graph

The project graph is Nx's map of how projects depend on each other.

Example:

```text
order-service
  -> error-handler
  -> middleware
  -> libs
  -> utils
```

Nx can build this graph by reading:

- package dependencies
- TypeScript imports
- project configuration
- plugin-inferred metadata

## Why The Project Graph Matters

The graph lets Nx answer:

- If this package changes, which apps are affected?
- Which dependencies must build first?
- Which tests should run?
- Which tasks can be parallelized?
- Which cache entries are still valid?

Without a graph, CI often runs too much or too little.

## Target

A target is a task attached to a project.

Examples:

```text
build
serve
dev
test
e2e
docker-build
```

Command shape:

```bash
pnpm exec nx <target> <project>
```

Example:

```bash
pnpm exec nx build product-service
```

## Running Many Targets

Run a target across multiple projects:

```bash
pnpm exec nx run-many --target=build --projects=auth-service,product-service,order-service
```

Run all projects that have a target:

```bash
pnpm exec nx run-many --target=test --all
```

Use carefully. In large repos, affected commands are often better.

## Executor

An executor is the actual runner behind a target.

Example target idea:

```json
{
  "build": {
    "executor": "@nx/js:tsc",
    "options": {
      "main": "packages/utils/index.ts",
      "outputPath": "packages/utils/dist"
    }
  }
}
```

This means:

> Build this package using Nx's TypeScript compiler executor.

## Custom Commands

Some targets run shell commands.

Example:

```json
{
  "build": {
    "executor": "nx:run-commands",
    "options": {
      "command": "pnpm exec next build"
    }
  }
}
```

This is useful when a framework already has its own command.

## Plugins

Nx plugins help Nx understand technologies.

Examples:

- `@nx/next/plugin`
- `@nx/js/typescript`
- `@nx/webpack/plugin`
- `@nx/jest/plugin`

Plugins can infer targets and dependencies.

This reduces manual config.

## DependsOn

`dependsOn` controls task order.

Example:

```json
"dependsOn": ["^build"]
```

The caret means:

> Run this target on dependencies first.

Example:

```text
build middleware
  -> build auth-service
```

## Inputs And Outputs

Inputs are files/settings that affect a task.

Outputs are files produced by a task.

Example:

```text
input: packages/utils/**/*.ts
output: packages/utils/dist
```

Nx uses inputs and outputs for caching.

## Continuous Targets

Some targets do not finish quickly.

Examples:

- dev server
- backend serve process
- file watcher

Nx can mark these as continuous so it knows they are long-running tasks.

## Interview Explanation

If asked "How does Nx know what to run?", say:

> Nx builds a project graph from package metadata, imports, and plugin inference. Each project has targets like build, test, serve, or e2e. Targets use executors or custom commands. Nx combines the project graph with target dependencies and inputs to create a task graph, then runs tasks in the right order, parallelizes where safe, and uses cache when possible.

## Connection To Artistry Cart

In this repo:

- shared package builds use TypeScript targets
- backend services use build and serve targets
- frontends use Next.js build/dev behavior
- e2e projects have e2e targets
- some services define Docker build targets
- root `nx.json` defines target defaults for build/test/e2e

