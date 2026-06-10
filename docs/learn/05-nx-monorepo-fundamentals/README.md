# Nx Monorepo Fundamentals

This folder is the fifth learning block for preparing for a bigger engineering role. It teaches Nx and monorepo thinking from first principles, then connects those ideas to the Artistry Cart workspace.

The goal is to understand why a monorepo exists, how Nx manages many apps and packages, and how to explain the tradeoffs in interviews.

## Learning Outcome

After completing this topic, you should be able to explain:

- what a monorepo is and what it is not
- how monorepo differs from monolith
- why Nx is useful in large TypeScript workspaces
- how Nx discovers projects
- what projects, targets, executors, and plugins are
- how the Nx project graph works
- how caching and affected commands improve CI
- how `apps/` and `packages/` should be organized
- how shared packages help and how they can create coupling
- how Nx fits this repo's microservices base architecture

## Files In This Topic

1. [Monorepo First Principles](./01-monorepo-first-principles.md)
2. [Nx Core Concepts](./02-nx-core-concepts.md)
3. [Workspace Structure: Apps, Packages, And Boundaries](./03-workspace-structure-apps-packages-boundaries.md)
4. [Project Graph, Targets, Executors, And Plugins](./04-project-graph-targets-executors-plugins.md)
5. [Caching, Affected Commands, And CI Optimization](./05-caching-affected-commands-ci-optimization.md)
6. [Nx In Artistry Cart](./06-nx-in-artistry-cart.md)
7. [Monorepo Benefits, Tradeoffs, And Anti-Patterns](./07-monorepo-benefits-tradeoffs-antipatterns.md)
8. [Interview Questions And Answer Patterns](./08-interview-questions-and-answer-patterns.md)

## How To Study This Topic

Keep this distinction clear:

```text
Monorepo = source code organization
Microservices = runtime architecture
Monolith = deployment/runtime architecture
Nx = tooling that manages a monorepo
```

That distinction is a common interview trap.

## Connection To Artistry Cart

Artistry Cart uses Nx with pnpm workspaces to manage:

- two Next.js frontend apps
- multiple Express backend services
- e2e projects
- shared packages
- TypeScript builds
- test targets
- Docker build targets
- CI affected builds/tests
- documentation and architecture decisions

The repo is a strong example of a service-oriented monorepo: one source workspace, many runnable applications and services.

