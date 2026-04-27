# ADR-005: AI Vision Service Boundary

## Status

Accepted

## Decision Summary

AI Vision runs as its own backend service rather than being embedded inside `product-service`, `order-service`, or the frontend applications.

## Context

AI Vision includes:

- generation workflows
- visual and hybrid search
- embeddings
- concept persistence
- collections and comments
- artisan matching
- recurring background jobs
- provider integrations with different latency and failure characteristics

These behaviors are materially different from core commerce APIs.

## Problem

We needed a boundary that could isolate AI-specific dependencies, experimentation, and job processing without turning the core commerce services into mixed-purpose runtimes.

## Decision

Keep AI Vision in a dedicated service with its own routes, runtime concerns, and supporting workflows.

## Why This Fits The Current Repo

- AI-heavy dependencies do not leak into every commerce service.
- Background jobs and embedding workflows have a clear home.
- The service can support a slightly different auth posture, including anonymous exploration and authenticated persistence.
- Product and order services stay more focused on marketplace and transaction logic.

## Consequences

### Positive

- Cleaner conceptual separation
- Safer experimentation around AI providers and prompts
- Better isolation of latency-heavy and job-oriented behavior
- Lower risk of bloating transactional services with AI-specific concerns

### Negative

- More services to operate and test
- Frontend flows that touch AI Vision and commerce need stronger coordination
- Observability and provider-failure handling become especially important
- It can drift into an isolated sub-platform if contracts are not kept intentional

## Alternatives Considered

### Put AI logic inside product-service

Rejected because AI Vision is not just product enrichment. It is a broader product capability area with its own persistence, jobs, and interaction model.

### Keep AI behavior only in the frontend

Rejected because the workflows require persistence, protected actions, background jobs, shared data access, and server-side provider orchestration.

## Follow-Up Work

- deepen testing and CI coverage for AI Vision paths
- add stronger provider failure telemetry and fallback handling
- standardize contracts between AI Vision and the rest of the platform

## Related Docs

- [AI Vision](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/05-domain/ai-vision.md>)
- [AI Vision Service](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/03-applications/aivision-service.md>)
- [Known Gaps And Risks](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/07-quality-and-operations/known-gaps-and-risks.md>)
