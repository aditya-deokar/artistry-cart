# AI Vision

## Domain Summary

AI Vision is the platform’s AI-assisted design and discovery domain. It extends the commerce experience beyond browsing existing products into generating concepts, refining ideas, searching visually, exploring galleries, and connecting concepts with artisans.

## Owning Components

- `aivision-service`
- `user-ui`
- ImageKit integration
- Gemini and Hugging Face integrations

## Core Data Models

- `VisionSession`
- `Concept`
- `ConceptImage`
- `AIGeneratedProduct`
- `ArtisanMatch`
- `ConceptCollection`
- `ConceptComment`
- `RateLimitEntry`
- `ProductEmbedding`
- `APIUsageLog`

## Main Flows

### Concept generation

- user submits prompt or source image
- AI Vision service generates concept output
- concept records and images are persisted

### Product variation and refinement

- user starts from a product or prior concept
- AI Vision service produces variant outputs or refined concepts

### Visual and hybrid search

- user submits image or text-plus-image query
- service compares embeddings or combined features
- results return products or similar concepts

### Save and collaborate

- authenticated users save concepts
- concepts can be sent to artisans
- collections and comments support discussion and organization

### Background improvement loop

- Agenda jobs clean sessions and rate limits
- embeddings are backfilled or synced over time

## Domain Characteristics

This domain mixes:

- user-facing creativity tooling
- search and retrieval
- media management
- AI provider orchestration
- background embedding maintenance

That makes it the most experimental and technically varied domain in the repo.

## Strengths

- AI is treated as a product capability, not a side demo
- concept, search, and collaboration flows are modeled explicitly
- async jobs support long-term quality of AI features

## Tradeoffs

- highest external dependency surface
- more complex failure modes than ordinary CRUD domains
- AI cost, latency, and media lifecycle management all matter simultaneously

## Interview Framing

This domain is ideal for talking about how to isolate AI-heavy workflows from the core transactional system while still keeping them meaningfully connected to product discovery and seller collaboration.
