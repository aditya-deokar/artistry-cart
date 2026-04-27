# Tradeoff Talking Points

## How To Use This

These are concise answer shapes for the questions senior interviewers usually ask:

- why did you choose this design
- what did you gain
- what did it cost you
- what would you improve next

The key is to sound deliberate, not defensive.

## Monorepo And Nx

Recommended answer:

I chose an Nx monorepo because the platform has multiple apps and services that still share a lot of infrastructure and evolve together. It made shared packages, documentation, and cross-cutting refactors much easier. The tradeoff is softer service independence and a heavier workspace, so you need discipline around boundaries and CI strategy.

## Shared MongoDB Schema

Recommended answer:

I used MongoDB with Prisma because the platform mixes standard commerce entities with rich product metadata, analytics read models, and AI-oriented documents. That let us move quickly without giving up typed access. The tradeoff is that the services are not fully storage-isolated, so schema discipline and ownership clarity matter more.

## API Gateway

Recommended answer:

The gateway gives both frontends one backend entry point and keeps routing centralized. That simplifies client configuration and gives us a place for cross-cutting behavior. The tradeoff is another runtime component, and today the gateway is still thinner than a fully hardened production edge.

## Kafka Analytics Pipeline

Recommended answer:

I used Kafka for user-activity ingestion because recommendation and analytics signals should not slow down browse, cart, or checkout requests. The tradeoff is eventual consistency and more operational overhead, especially around topic contracts, consumer lag, and debugging.

## Dedicated AI Vision Service

Recommended answer:

I separated AI Vision because generation, embeddings, provider orchestration, and background jobs have very different runtime behavior from transactional commerce APIs. The tradeoff is more service complexity, but it keeps product and order boundaries cleaner.

## Recommendation Serving

Recommended answer:

Recommendations already have a dedicated service, but some computation still happens in the request path. That was acceptable for iteration speed, but if traffic grew I would shift more scoring and artifact generation offline so the serving path becomes cheaper and more predictable.

## Redis And Graceful Degradation

Recommended answer:

Redis is used as an optimization layer, not as the only source of truth. That is a good production instinct because cache failures should degrade performance before they break core platform correctness. The tradeoff is that fallback behavior still needs strong observability so the team notices degraded mode quickly.

## Current Production Readiness

Recommended answer:

The strongest parts of the system are domain decomposition and the places where async design is used for real latency benefits. The biggest remaining gaps are contract consistency, observability standardization, and fuller test and CI coverage for analytics and AI-heavy paths.

## Best "What Would You Improve First?" Answer

Recommended answer:

I would first tighten operational consistency: fix naming and contract mismatches, standardize health and logging conventions, add stronger tracing, and bring the AI Vision and Kafka paths deeper into the automated quality loop.

## Related Docs

- [Project Story](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/09-interview-prep/project-story.md>)
- [Deep-Dive Questions](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/09-interview-prep/deep-dive-questions.md>)
- [Known Gaps And Risks](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/07-quality-and-operations/known-gaps-and-risks.md>)
