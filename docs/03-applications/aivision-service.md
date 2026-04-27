# AI Vision Service

## Overview

`aivision-service` is the most integration-heavy and experimentation-oriented backend service in the repository. It owns AI-assisted generation, visual search, concept workflows, artisan-related AI flows, gallery browsing, collections, comments, schema helpers, and recurring maintenance jobs.

It is intentionally separated from core commerce services because its runtime behavior, dependencies, and data model are materially different.

## Responsibilities

- text-to-image generation
- product-variation generation
- image-based and hybrid search
- concept browsing, saving, refinement, and artisan handoff
- gallery browsing
- artisan discovery/matching support
- collections and comments
- schema/category helpers
- session management
- rate limiting
- embeddings and recurring AI-support jobs

## Inbound Interfaces

Mounted under `/api/v1/ai`.

Route groups:

- `/generate`
- `/search`
- `/concepts`
- `/artisans`
- `/gallery`
- `/schema`
- `/collections`
- `/comments`
- `/test`

Representative endpoints:

- `POST /api/v1/ai/generate/text-to-image`
- `POST /api/v1/ai/generate/product-variation`
- `POST /api/v1/ai/generate/from-image`
- `POST /api/v1/ai/generate/refine`
- `POST /api/v1/ai/search/visual`
- `POST /api/v1/ai/search/hybrid`
- `POST /api/v1/ai/search/similar-concepts`
- `GET /api/v1/ai/search/quick`
- `GET /api/v1/ai/concepts`
- `GET /api/v1/ai/concepts/:id`
- `POST /api/v1/ai/concepts/:id/save`
- `POST /api/v1/ai/concepts/:id/send-to-artisans`

## Outbound Dependencies

- MongoDB via Prisma
- Google Gemini
- Hugging Face
- ImageKit
- Agenda
- shared auth-aware middleware local to the service
- local validation and rate-limit middleware

## Internal Structure

Key folders:

- `agents/`
- `config/`
- `controllers/`
- `jobs/`
- `middleware/`
- `routes/`
- `services/`
- `validators/`

Notable files:

- `src/main.ts`
- `src/jobs/agenda.ts`
- `src/services/embedding.service.ts`
- `src/services/search/*`
- `src/services/generation/*`

## Data Touch Points

This service appears to own several AI-specific models such as:

- concepts and related images
- collections
- comments
- sessions
- rate-limit entries
- API usage logs
- embedding records

It also reads product data for search and product-variation flows.

## Runtime Behavior

- listens on `6006` by default
- loads env explicitly from the workspace `.env`
- supports both anonymous and authenticated request contexts
- generates a request id and session token in auth middleware
- applies service-level rate limiting
- starts Agenda on boot and schedules recurring jobs

## Auth Model

This service uses a more flexible auth model than the rest of the backend:

- every request passes through `authMiddleware`
- authenticated users are attached when a valid bearer token exists
- anonymous use is still allowed for many flows
- specific routes can require auth with `requireAuth`

That is a good fit for AI discovery flows where anonymous exploration can be useful.

## Background Jobs

Recurring jobs include:

- expired session cleanup
- rate limit cleanup
- concept embedding backfill
- product embedding sync
- API usage aggregation

## Tests And Operational Signals

There is an e2e project for the service, but the visible route surface is broader than the currently inspected test surface. This service would benefit from especially strong integration coverage because it has the highest dependency and behavior complexity.

## Strengths

- clean boundary between AI-heavy workflows and transactional commerce services
- supports both synchronous AI routes and asynchronous maintenance jobs
- flexible auth model fits the product experience
- validation and rate limiting are more explicit here than in several other services

## Tradeoffs

- highest external dependency surface in the backend
- complex data model and job orchestration increase operational burden
- AI latency, media handling, and embedding maintenance create more failure modes than standard CRUD services

## Future Hardening

- expand integration coverage around third-party failure paths
- document model/provider fallback strategy explicitly
- add stronger observability around job lag, embedding coverage, and rate-limit behavior
