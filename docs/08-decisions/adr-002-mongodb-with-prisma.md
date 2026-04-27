# ADR-002: MongoDB With Prisma

## Status

Accepted

## Decision Summary

Artistry Cart uses MongoDB as the primary database and Prisma as the shared typed access layer across backend services.

## Context

The platform stores:

- standard commerce entities such as users, products, orders, discounts, payments, and shops
- rich product metadata and merchandising fields
- analytics read models used by recommendation workflows
- AI Vision concepts, images, embeddings, collections, comments, and related collaboration records

The data model needs structure, but it also needs to absorb evolving fields without heavy migration friction.

## Problem

We needed a persistence approach that balanced flexibility, developer speed, and enough schema discipline to keep a multi-service codebase maintainable.

## Decision

Use MongoDB for document-oriented storage and Prisma for schema management, type-safe access, and shared database ergonomics.

## Why This Fits The Current Repo

- Product and AI Vision payloads have document-style characteristics.
- Analytics read models are easier to evolve when shape changes are cheap.
- Prisma improves consistency over ad hoc MongoDB access.
- Shared tooling in the monorepo benefits from one common client abstraction.

## Consequences

### Positive

- Fast iteration on evolving domain models
- Good fit for mixed commerce, analytics, and AI-oriented entities
- Better type safety and discoverability than raw driver usage
- Lower day-to-day friction for feature development

### Negative

- Database ownership boundaries across services are weaker
- Validation discipline matters more when flexible shapes are allowed
- Relationship-heavy invariants are less explicit than in a relational-first design
- A shared schema can blur the line between service API contracts and direct data coupling

## Alternatives Considered

### Relational database first

Rejected for the current stage because the project benefits from flexible document-style entities, especially in product metadata and AI Vision.

### MongoDB without Prisma

Rejected because it would reduce type safety, increase access inconsistency, and make schema reasoning harder across services.

## Follow-Up Work

- strengthen validation at service boundaries
- document data ownership more explicitly as the platform matures
- identify tables or aggregates that may deserve stricter isolation later

## Related Docs

- [Data Architecture](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/02-architecture/data-architecture.md>)
- [Database Schema](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/06-data-and-api/database-schema.md>)
- [Prisma And Database Client](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/04-shared-packages/prisma-and-database-client.md>)
