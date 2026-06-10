# Monorepo First Principles

## What Problem A Monorepo Solves

As a product grows, code spreads across many areas:

- frontend apps
- backend services
- shared libraries
- tests
- scripts
- infrastructure
- documentation

The engineering problem becomes:

> How do we change related code together without losing consistency?

A monorepo answers:

> Put related projects in one repository and use tooling to manage them as one workspace.

## What A Monorepo Is

A monorepo is a single source repository containing multiple projects.

Examples of projects:

- web app
- admin dashboard
- backend API
- worker service
- shared package
- test suite
- deployment scripts

In Artistry Cart:

```text
apps/
  user-ui
  seller-ui
  api-gateway
  auth-service
  product-service
  order-service
  recommendation-service
  aivision-service
  kafka-service

packages/
  error-handler
  middleware
  libs
  utils
  test-utils
```

## What A Monorepo Is Not

A monorepo is not automatically:

- a monolith
- one deployable application
- bad architecture
- good architecture
- microservices
- tightly coupled code

It is only a source-control strategy.

Architecture quality depends on boundaries, dependency rules, tests, CI, ownership, and deployment discipline.

## Monorepo Versus Monolith

These are different dimensions.

Monorepo:

```text
Where does source code live?
```

Monolith:

```text
How is the application deployed and executed?
```

You can have:

- monolith in a monorepo
- monolith in one repo
- microservices in many repos
- microservices in a monorepo

Artistry Cart is closest to:

```text
microservices/service-oriented apps inside one monorepo
```

## Why Teams Use Monorepos

Common reasons:

- shared tooling
- atomic changes across projects
- easier refactors
- consistent dependencies
- one place for docs and architecture decisions
- shared packages without publishing overhead
- easier cross-team discovery
- graph-aware CI optimization with tools like Nx

## Atomic Changes

Atomic means related changes can be committed together.

Example:

```text
change auth cookie contract
  -> update auth-service
  -> update shared middleware
  -> update user-ui
  -> update seller-ui
  -> update tests
  -> update docs
```

In a multi-repo setup, this could require multiple pull requests and careful release coordination.

In a monorepo, it can be one branch and one review.

## Why Monorepos Need Tooling

A small monorepo can use simple scripts.

A large monorepo needs answers to:

- which projects changed?
- which tests should run?
- which builds are affected?
- which tasks can run in parallel?
- which task outputs can be reused?
- which projects depend on shared packages?

Nx exists to answer these questions.

## Interview Explanation

If asked "What is a monorepo?", say:

> A monorepo is a single repository containing multiple projects, such as apps, services, libraries, tests, and infrastructure. It helps teams make atomic cross-project changes and share tooling, but it needs strong boundaries and graph-aware tooling like Nx to avoid slow CI and hidden coupling.

## Connection To Artistry Cart

Artistry Cart benefits from a monorepo because many changes are cross-cutting:

- auth contracts affect frontends, gateway, auth service, and middleware
- Prisma schema changes affect several backend services
- Kafka event changes affect producers, consumers, and recommendation logic
- shared error handling affects all Express services
- documentation explains the whole platform in one place

