# ADR-003: API Gateway Pattern

## Status

Accepted

## Decision Summary

Client applications call a single API gateway, and the gateway proxies requests to backend services by route prefix.

## Context

The platform has:

- a buyer-facing frontend
- a seller-facing frontend
- multiple backend services with different ports and responsibilities

Without a gateway, each frontend would need direct knowledge of every backend origin, route group, and environment-specific service address.

## Problem

We needed one stable client-facing entry point that could simplify frontend configuration and provide a home for cross-cutting backend concerns.

## Decision

Use `api-gateway` as the public backend entry point and keep service routing centralized there.

## Why This Fits The Current Repo

- Both frontends benefit from one consistent backend origin.
- Service routing logic stays out of UI code.
- The gateway gives the system a natural place for future auth propagation, tracing, request policy, and traffic controls.
- It keeps the current service split practical without forcing the clients to understand internal topology.

## Consequences

### Positive

- Frontends are simpler to configure and deploy.
- Routing decisions are centralized.
- Backend topology can evolve without changing every client surface.
- Gateway-level concerns can grow without polluting domain services.

### Negative

- The gateway is another runtime dependency.
- Today it is still thin, so some operational overhead exists before full policy value is realized.
- Hardcoded local assumptions need more production-oriented configuration discipline.
- Cross-cutting behavior can become ambiguous if gateway and services both try to own it.

## Alternatives Considered

### Direct frontend-to-service calls

Rejected because it would spread backend topology knowledge into both frontends and make environment management noisier.

### Heavier orchestration gateway

Deferred. The current architecture benefits more from a routing-focused gateway than from aggressive gateway aggregation logic.

## Follow-Up Work

- standardize gateway configuration and environment-driven targets
- clarify auth propagation and rate-limiting assumptions
- add stronger observability and correlation IDs at the gateway boundary

## Related Docs

- [Service Topology](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/02-architecture/service-topology.md>)
- [API Gateway](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/03-applications/api-gateway.md>)
- [Port Map](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/11-reference/port-map.md>)
