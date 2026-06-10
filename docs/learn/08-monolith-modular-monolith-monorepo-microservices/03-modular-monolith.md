# Modular Monolith

## What Is A Modular Monolith

A modular monolith is one deployable application with strong internal module boundaries.

It is still a monolith at runtime:

```text
one process
one deployment unit
```

But internally it is organized by domain:

```text
auth module
catalog module
order module
payment module
recommendation module
```

## Why Modular Monoliths Matter

A modular monolith is often the best default architecture.

It gives many benefits of clean boundaries without distributed system complexity.

## Example Structure

```text
src/
  modules/
    auth/
      controllers/
      services/
      repository/
    catalog/
      controllers/
      services/
      repository/
    orders/
      controllers/
      services/
      repository/
```

Each module owns its domain logic, but all modules deploy together.

## Benefits

### Simple Runtime

One app to deploy and monitor.

### Strong Internal Boundaries

Modules keep domain logic separated.

### Easier Refactoring

Internal calls are still in-process.

### Easier Transactions

One database can be used more safely than distributed transactions.

### Future Extraction Path

If a module needs independent scaling later, it can be extracted into a service.

## Costs

### Still One Deployable

You cannot deploy modules independently.

### Scaling Is Still Coarse

You scale the whole app, not one module.

### Boundaries Need Discipline

If modules import each other's internals freely, the modular monolith becomes a messy monolith.

## Modular Monolith Versus Microservices

Modular monolith:

```text
strong code boundaries
one runtime
simple operations
```

Microservices:

```text
strong runtime boundaries
many deployables
complex operations
```

## When To Choose Modular Monolith

Good fit when:

- team is small to medium
- domain boundaries are still evolving
- independent deployment is not required yet
- system needs clean code organization
- operations should stay simple
- transactions are important

## Enforcing Boundaries

Ways to enforce module boundaries:

- import rules
- package boundaries
- folder conventions
- tests
- code reviews
- clear module APIs
- architecture docs

## Interview Explanation

If asked "What is a modular monolith?", say:

> A modular monolith is one deployable application organized into strong internal domain modules. It keeps the operational simplicity of a monolith while improving maintainability and creating a future path to microservices. The risk is that boundaries must be enforced, otherwise modules become tangled.

## Connection To Artistry Cart

Artistry Cart did not choose a single modular monolith backend. It chose separate services inside one monorepo.

However, the same modular thinking still applies inside each service:

- keep controllers separate from services
- keep business logic cohesive
- avoid random shared utilities
- expose clear package APIs

