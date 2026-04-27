# System Design Walkthrough

## Goal

Use this when an interviewer asks you to walk through the system end to end. The strongest approach is to move from users to boundaries to data to tradeoffs.

## Recommended Whiteboard Order

1. user surfaces
2. gateway
3. core services
4. data layer
5. async analytics
6. AI Vision boundary
7. tradeoffs and next improvements

## Opening Frame

I would describe Artistry Cart as a service-oriented commerce platform with an AI-assisted discovery and custom-creation layer. The design separates standard transactional concerns from AI-heavy and analytics-heavy concerns without pretending the system is fully isolated everywhere.

## Step-By-Step Walkthrough

### 1. Start with the user-facing applications

- `user-ui` serves buyers
- `seller-ui` serves sellers

Why this matters:

- the personas have very different workflows
- separate Next.js apps keep each surface easier to reason about

### 2. Move to the gateway

- `api-gateway` is the client-facing backend entry point
- it proxies requests to backend services by route group

Talking point:

This keeps backend topology out of the frontends and creates a natural place for cross-cutting concerns like request policy, logging, and future tracing.

### 3. Explain the domain services

- `auth-service`: identity, tokens, OAuth, account flows
- `product-service`: products, shops, search, discounts, offers, events, pricing logic
- `order-service`: Stripe checkout, payment webhooks, orders, payouts
- `recommendation-service`: recommendation serving
- `kafka-service`: async analytics materialization
- `aivision-service`: generation, visual search, embeddings, concepts, collections, comments, artisan matching, background jobs

### 4. Explain persistence honestly

- MongoDB with Prisma
- shared schema across services

Say this explicitly:

The service boundaries are real at the application level, but storage isolation is softer because the backend services still share one database schema. That was a speed-versus-isolation tradeoff.

### 5. Show where async architecture matters

- user activity is emitted to Kafka
- `kafka-service` consumes and materializes analytics state
- `recommendation-service` reads that state

Strong explanation:

This is a good example of using event-driven design where it buys something concrete. Analytics and personalization signals do not need to slow down the transactional request that produced them.

### 6. Explain the AI Vision boundary separately

Why it is separate:

- different external providers
- different latency and cost profile
- background embedding and media jobs
- partial anonymous usage pattern

This makes AI Vision feel like a product capability, not just a utility function bolted onto catalog APIs.

## If The Interviewer Pushes On Scale

Good areas to discuss:

- move more recommendation computation off the request path
- tighten service ownership around the shared database
- add stronger tracing, metrics, and operational standards
- budget AI Vision cost and latency more aggressively

## If The Interviewer Pushes On Maintainability

Good answer:

The monorepo and shared packages improve consistency and refactor speed, but the biggest maintainability risk is hidden coupling. That is why explicit service docs, ADRs, and contract cleanup matter.

## Strong Close

The architecture is intentionally pragmatic. It already has meaningful domain and runtime boundaries, and the next maturity step is not a total redesign. It is operational hardening: clearer contracts, deeper observability, and stronger ownership boundaries where scale demands them.

## Related Docs

- [Project Story](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/09-interview-prep/project-story.md>)
- [System Overview](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/02-architecture/system-overview.md>)
- [Tradeoffs](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/02-architecture/tradeoffs.md>)
