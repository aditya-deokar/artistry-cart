# ADR-001: Monorepo And Nx

## Status

Accepted

## Decision Summary

Artistry Cart uses a single Nx monorepo with pnpm workspaces for both product delivery and platform infrastructure.

## Context

The repository contains:

- two Next.js frontend applications
- multiple Express-based backend services
- shared packages for middleware, error handling, Prisma, Redis, Kafka, ImageKit, and tests
- one documentation system intended to explain the whole platform coherently

The current platform is large enough to have real service boundaries, but still early enough that most changes cross application boundaries. Common examples include:

- introducing a new auth or cookie contract that affects frontends, gateway, and auth-service
- changing a Prisma model used by more than one backend service
- updating shared middleware or error formatting used across the platform
- expanding AI Vision or recommendations in ways that touch both API surfaces and persistence

## Problem

We needed a repository structure that would let us move quickly across shared code, shared contracts, and shared documentation without paying the operational overhead of coordinating many separate repositories.

## Decision

Keep the platform in one Nx monorepo and treat applications, libraries, tests, and docs as first-class projects inside that workspace.

## Why This Fits The Current Repo

- Most platform changes are still cross-cutting rather than isolated to one service.
- Shared infrastructure code is substantial enough to justify a common workspace.
- Nx makes project-level scripts, dependency graphs, and affected execution practical.
- Documentation quality improves when the whole system is visible in one place.
- Interview preparation is easier when architecture, code, and tradeoffs live side by side.

## Consequences

### Positive

- Cross-service refactors are faster and easier to validate.
- Shared packages stay discoverable and reusable.
- Frontend and backend contracts can evolve together.
- The team gets one source of truth for tooling, tests, and docs.

### Negative

- Service independence is softer than in a hard multi-repo split.
- Poor package boundaries can become hidden coupling.
- The workspace can become cognitively heavy as more services and experiments are added.
- CI strategy needs discipline or the monorepo becomes slow and noisy.

## Alternatives Considered

### Multiple repositories per service

Rejected for the current stage. It would create more release and coordination overhead before service contracts and ownership boundaries are fully stable.

### Single backend deployable

Rejected because the code already has meaningful operational and domain distinctions, especially around payments, analytics, recommendations, and AI Vision.

## Follow-Up Work

- tighten ownership boundaries around shared packages
- expand affected-based CI so monorepo scale remains manageable
- keep service docs explicit about what is truly shared versus what is service-owned

## Related Docs

- [Repository Map](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/00-overview/repo-map.md>)
- [System Overview](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/02-architecture/system-overview.md>)
- [Tradeoffs](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/02-architecture/tradeoffs.md>)
