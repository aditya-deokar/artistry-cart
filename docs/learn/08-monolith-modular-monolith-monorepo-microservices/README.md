# Monolith, Modular Monolith, Monorepo, Microservices

This folder is the eighth learning block for preparing for a bigger engineering role. These four terms are often mixed up in interviews, so this topic teaches them as separate architecture dimensions.

The goal is to explain the difference clearly, compare tradeoffs, and describe where a project like Artistry Cart fits without overclaiming.

## Learning Outcome

After completing this topic, you should be able to explain:

- what a monolith is
- what a modular monolith is
- what a monorepo is
- what microservices are
- why monorepo does not mean monolith
- why microservices can live in one monorepo
- when a monolith is better
- when a modular monolith is better
- when microservices are worth the complexity
- how systems evolve from monolith to modular monolith to services
- where Artistry Cart fits in this model

## Files In This Topic

1. [Architecture Dimensions](./01-architecture-dimensions.md)
2. [Monolith](./02-monolith.md)
3. [Modular Monolith](./03-modular-monolith.md)
4. [Monorepo](./04-monorepo.md)
5. [Microservices](./05-microservices.md)
6. [Comparison And Decision Matrix](./06-comparison-and-decision-matrix.md)
7. [Migration Paths And Evolution](./07-migration-paths-and-evolution.md)
8. [Interview Questions And Answer Patterns](./08-interview-questions-and-answer-patterns.md)

## Core Mental Model

These terms answer different questions:

```text
Monolith: how many runtime/deployment units?
Modular monolith: how strong are internal module boundaries inside one deployable?
Monorepo: how many source repositories?
Microservices: how many independently runnable service boundaries?
```

## Connection To Artistry Cart

Artistry Cart is:

- a monorepo at the source-code level
- service-oriented at the backend runtime level
- not a single backend monolith
- not fully autonomous microservices because several services share Prisma/MongoDB
- a pragmatic Nx monorepo with multiple apps, services, and shared packages

Best phrase:

> Artistry Cart is a service-oriented Nx monorepo with multiple deployable apps and backend services, plus shared infrastructure packages and shared persistence.

