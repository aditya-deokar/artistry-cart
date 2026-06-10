# First Principles

## The Core Problem

Software architecture starts with a simple problem:

> Many pieces of code must work together while changing over time.

As a project grows, you need answers for:

- where code should live
- how teams discover code
- how changes are tested
- how applications share contracts
- how runtime components communicate
- how failures are isolated
- how deployment stays reliable

The Artistry Cart repository answers those questions with two major choices:

- use one source repository for many applications and packages
- split runtime responsibilities into separate services where the domain benefits from separation

Those are different decisions. A monorepo is a source-code organization decision. Microservices are a runtime architecture decision.

## Source Architecture Versus Runtime Architecture

These two ideas are often confused.

Source architecture is about the developer workspace:

- repositories
- package boundaries
- build tools
- shared libraries
- dependency graphs
- test execution
- code review workflow

Runtime architecture is about what runs in production:

- processes
- containers
- services
- databases
- queues
- APIs
- network calls
- deployment units

You can have:

- a monolith in one repo
- a monolith split across many repos
- microservices in one monorepo
- microservices in many repos

Artistry Cart is closest to "microservices in one monorepo", with an important caveat: the services share a MongoDB schema and Prisma access package, so the service independence is practical but not absolute.

## Why Boundaries Matter

A boundary is a rule about what belongs together and what must communicate through a contract.

Good boundaries reduce accidental complexity. They help engineers reason locally.

Examples in this repo:

- `auth-service` owns identity and authentication workflows.
- `product-service` owns catalog, shops, offers, events, and discounts.
- `order-service` owns checkout, orders, Stripe webhooks, and payment-related flows.
- `recommendation-service` owns recommendation responses.
- `aivision-service` owns AI-heavy visual workflows and background jobs.
- `kafka-service` owns analytics event consumption.
- `packages/middleware` owns shared auth middleware.
- `packages/error-handler` owns shared error handling.

The first-principles test for a boundary is:

> Would this area change for its own reasons, scale for its own reasons, or fail for its own reasons?

If yes, it may deserve a separate service, package, or module.

## Coupling And Cohesion

Two words appear constantly in architecture interviews:

- cohesion: how strongly related the code inside a unit is
- coupling: how much one unit depends on another

High cohesion is good. Low coupling is usually good.

In this project:

- `order-service` is cohesive because payment, checkout, order creation, and webhooks belong together.
- `packages/libs/prisma` creates coupling because many services depend on one shared data access layer.
- `packages/test-utils` is useful shared infrastructure because it reduces test duplication without owning business rules.

Good architecture does not eliminate coupling. It makes coupling explicit, intentional, and cheaper to change.

## The Three Kinds Of Scale

When people say "this architecture scales", ask which scale they mean.

### Developer scale

Can more engineers work without constantly blocking each other?

Nx helps here by giving project-level targets, dependency graphs, caching, and affected builds.

### Runtime scale

Can the system handle more users, traffic, and data?

Service boundaries help here because each service can be containerized and scaled separately.

### Organizational scale

Can teams own parts of the platform independently?

This repo is partially ready for that. The app boundaries are clear, but shared database ownership means teams would still need coordination around schema changes.

## The Golden Interview Framing

A strong architecture answer usually sounds like this:

> We chose a monorepo to optimize development speed, shared tooling, and cross-service refactors. We chose service boundaries to isolate domain complexity and runtime concerns. The tradeoff is that shared packages and a shared database reduce full service autonomy, so this is a pragmatic service-oriented monorepo rather than a textbook microservices system.

