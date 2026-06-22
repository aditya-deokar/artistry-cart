# Interview Questions And Answer Patterns

This file gives interview-ready answers for Nx and monorepo fundamentals.

## Question: What Is A Monorepo?

Strong answer:

> A monorepo is a single repository containing multiple projects such as frontend apps, backend services, shared packages, tests, docs, and infrastructure. It helps with atomic cross-project changes, shared tooling, and code discovery, but it needs strong boundaries and good build tooling to avoid slow CI and hidden coupling.

## Question: Is A Monorepo The Same As A Monolith?

Strong answer:

> No. A monorepo is about where source code lives. A monolith is about runtime and deployment shape. You can have microservices in one monorepo, or a monolith split across multiple repos. Artistry Cart uses one repo but has multiple runnable services.

## Question: What Is Nx?

Strong answer:

> Nx is a graph-aware build system for monorepos. It models apps, services, packages, and test suites as projects, understands dependencies between them, and uses that graph for caching, task orchestration, parallel execution, and affected builds/tests.

## Question: What Is An Nx Project?

Strong answer:

> An Nx project is a unit of code Nx can reason about and run tasks for. It can be an app, backend service, shared package, or e2e test suite.

## Question: What Is An Nx Target?

Strong answer:

> A target is a named task for a project, such as build, serve, test, e2e, dev, or docker-build. Targets are run with commands like `nx build auth-service` or `nx test product-service`.

## Question: What Is An Executor?

Strong answer:

> An executor is the implementation used to run a target. For example, a TypeScript package build may use `@nx/js:tsc`, while a custom framework command may use `nx:run-commands`.

## Question: What Is The Nx Project Graph?

Strong answer:

> The project graph is Nx's map of project dependencies. It shows which apps and packages depend on each other. Nx uses it to decide task order, calculate affected projects, and avoid unnecessary builds or tests.

## Question: What Does `affected` Mean In Nx?

Strong answer:

> Affected means the projects impacted by a set of file changes. Nx compares a branch against a base branch, maps changed files to projects, includes dependent projects, and runs targets only where needed.

## Question: What Is Nx Caching?

Strong answer:

> Nx caching stores task outputs based on inputs like source files, dependency files, and config. If the same task runs again with the same inputs, Nx can reuse the cached output instead of rerunning the task.

## Question: `run-many` Versus `affected`?

Strong answer:

> `run-many` runs a target on explicitly selected projects. `affected` calculates impacted projects from Git changes and runs a target only for those projects and their dependents. `run-many` is useful when I know exactly what to run; `affected` is useful in PR CI.

## Question: Why Use Nx For Microservices?

Strong answer:

> Microservices create many projects: services, shared packages, e2e tests, Docker targets, and frontend apps. Nx gives one command model, dependency-aware builds, caching, and affected CI, which keeps a service-oriented monorepo manageable.

## Question: What Are Monorepo Anti-Patterns?

Strong answer:

> Common anti-patterns are giant shared utility packages, app-to-app source imports, shared packages full of business logic, no module boundary rules, running every task on every PR, and unclear package ownership.

## Question: How Does This Apply To Artistry Cart?

Strong answer:

> Artistry Cart uses Nx with pnpm workspaces. Frontend apps, backend services, e2e suites, and shared packages live in one workspace. Nx target defaults ensure builds and tests are cached and dependency-aware. CI uses affected commands for pull requests. This lets the project keep service boundaries while still making cross-cutting changes across frontends, services, shared packages, and docs.

## Best Short Project Pitch For This Topic

> The repo is an Nx monorepo, not a monolith. It contains multiple deployable apps and services plus shared packages. Nx gives us the project graph, targets, dependency-aware builds, caching, and affected CI, which is what makes a multi-service TypeScript workspace practical to develop and validate.

