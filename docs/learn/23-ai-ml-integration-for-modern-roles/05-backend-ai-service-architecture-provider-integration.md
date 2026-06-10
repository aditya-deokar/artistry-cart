# Backend AI Service Architecture And Provider Integration

## Why AI Needs A Backend Boundary

AI calls should usually go through a backend service.

Reasons:

- protect API keys
- validate input
- enforce rate limits
- track cost
- persist outputs
- normalize provider responses
- handle retries and timeouts
- apply auth rules
- log operational metadata

Calling model providers directly from the browser is usually risky for serious apps.

## Provider Integration

An AI provider is an external dependency.

Examples in Artistry Cart:

- Google Gemini
- Hugging Face
- ImageKit for media

Provider integration needs:

- secret management
- client configuration
- request validation
- retry policy
- timeout policy
- error mapping
- usage logging
- fallback strategy

## AI Service Responsibilities

A good AI service owns:

- AI route surface
- provider clients
- prompt templates
- input validation
- output validation
- model response parsing
- persistence
- background jobs
- rate limits
- usage metrics
- domain-specific AI workflows

## Why AI Vision Is Separate

Artistry Cart separates `aivision-service` because AI Vision has different runtime behavior:

- external model latency
- media handling
- embeddings
- generation
- background jobs
- provider failures
- higher cost
- flexible anonymous/authenticated usage

Putting all of that inside product or order services would blur boundaries.

## Auth Model

AI products often support mixed auth:

- anonymous exploration
- authenticated save
- authenticated collaboration
- seller/admin-only actions

Artistry Cart's AI Vision service supports anonymous and authenticated contexts, then uses route-level auth requirements where needed.

## Rate Limiting

AI routes need rate limits because model calls can be expensive.

Rate limits protect:

- cost
- provider quotas
- system stability
- abuse surfaces

Rate limits should be stricter for expensive operations like generation and image processing.

## Request Size Limits

AI/media routes may receive large payloads.

`aivision-service` uses larger JSON/body limits than ordinary APIs.

This is useful, but it also increases risk:

- memory pressure
- upload abuse
- slow requests
- larger logs if mishandled

## Provider Abstraction

Avoid scattering provider calls throughout controllers.

Better shape:

```text
route -> controller -> domain service -> provider client
```

This makes it easier to:

- test
- swap provider
- add fallback
- centralize retries
- track usage

## Strong Interview Answer

If asked "How would you integrate AI into a backend?", say:

> I would isolate provider calls behind a backend service, protect API keys, validate inputs, enforce rate limits, parse and validate outputs, persist useful results, add retries and timeouts, track cost and latency, and design fallbacks. I would avoid letting frontend clients call expensive model providers directly.

## Artistry Cart Connection

`aivision-service` is a dedicated backend boundary for AI workflows. It owns generation, visual search, embeddings, concepts, collections, comments, artisan matching, provider integration, validation, rate limits, and background jobs.
