# AI/ML In Artistry Cart

## AI/ML Areas

Artistry Cart has two major AI/ML areas:

- AI Vision
- recommendations and analytics

They solve different product problems.

AI Vision:

```text
help users generate, refine, search, and collaborate around visual product concepts
```

Recommendations:

```text
use behavior analytics to personalize product discovery
```

## AI Vision Service

`aivision-service` owns:

- text-to-image generation
- product variation generation
- generation from image
- concept refinement
- visual search
- hybrid search
- similar concepts
- concept save and collaboration
- artisan matching
- gallery browsing
- collections and comments
- schema/category helpers
- sessions
- rate limiting
- embeddings
- background jobs

Routes are mounted under:

```text
/api/v1/ai
```

## Providers And Tools

The AI stack includes:

- Google Gemini / LangChain Google bindings
- Hugging Face-related package support
- ImageKit for media
- TensorFlow.js in recommendation service
- Agenda for background jobs
- Zod for validation
- Prisma/MongoDB for persistence

## Data Models

AI Vision uses models such as:

- VisionSession
- Concept
- ConceptImage
- AIGeneratedProduct
- ArtisanMatch
- ConceptCollection
- ConceptComment
- RateLimitEntry
- ProductEmbedding
- APIUsageLog

These make AI a real product domain, not a throwaway API call.

## Strong Design Choices

Strong choices:

- AI has a dedicated service boundary
- AI inputs are validated
- LLM outputs are validated
- embeddings are persisted
- background jobs maintain embeddings and cleanup state
- anonymous and authenticated use cases are both supported
- AI routes are separate from transactional order/product services

## Honest Constraints

Current constraints:

- AI Vision has the highest external dependency surface
- provider failures need strong handling
- cost and latency need ongoing controls
- e2e/integration coverage should be deep for this service
- simple vector search should mature if dataset grows
- recommendation scoring should move more offline at scale

## Recommendation Architecture

Flow:

```text
user actions -> Kafka -> kafka-service -> UserAnalytics -> recommendation-service
```

This is strong because behavior capture is async.

The next maturity step:

```text
offline recommendation generation -> cached serving results -> fast API response
```

## How To Explain The AI Boundary

Use this:

> AI Vision is separate because it has different latency, cost, provider, media, and background job behavior from core commerce APIs. The service boundary keeps auth/product/order services cleaner while still connecting AI outputs to real marketplace concepts, products, and artisans.

## How To Explain The ML Recommendation Boundary

Use this:

> Recommendations are split from analytics ingestion. Kafka captures behavior asynchronously, the worker materializes analytics state, and the recommendation service reads that state. This avoids slowing browse and checkout flows with recommendation bookkeeping.

## Best Project Pitch

> Artistry Cart integrates AI as product infrastructure, not a side demo. AI Vision gives users concept generation, visual search, hybrid search, and artisan matching, while recommendation logic uses Kafka-backed behavior analytics. The system isolates AI-heavy workloads behind a dedicated service and uses validation, embeddings, jobs, rate limits, persistence, and observability to make the feature operationally realistic.
