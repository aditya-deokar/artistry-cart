# Runtime Topology And Service Responsibilities

## High-Level Runtime Shape

At runtime, Artistry Cart looks like:

```text
Buyer Browser -> user-ui -> api-gateway -> backend services
Seller Browser -> seller-ui -> api-gateway -> backend services
```

Backend services use:

- MongoDB through Prisma
- Redis for selected fast-path/support behavior
- Kafka for analytics events
- Stripe for payments
- OAuth providers for login
- SMTP for email
- AI providers for AI Vision
- ImageKit for image handling

## Service Topology

```text
user-ui
seller-ui
  -> api-gateway
    -> auth-service
    -> product-service
    -> order-service
    -> recommendation-service
    -> aivision-service

user-ui -> Kafka -> kafka-service -> MongoDB analytics
```

## API Gateway

Responsibility:

- route frontend API traffic to backend services
- provide one backend entry point for clients
- hide internal service ports from frontends

Routes:

```text
/auth -> auth-service
/product -> product-service
/order -> order-service
/recommendation -> recommendation-service
/ai-vision -> aivision-service
```

Architectural note:

> The gateway should stay thin. Business logic belongs in owning services.

## Auth Service

Owns:

- registration
- login
- logout
- JWT/cookie flows
- OAuth
- user activation
- seller onboarding/auth-adjacent flows
- email templates for auth flows

Why separate:

- security-sensitive
- shared by buyer and seller apps
- auth failures affect the whole platform
- OAuth/token/cookie logic deserves isolation

## Product Service

Owns:

- products
- shops
- search
- pricing
- offers
- discounts
- events
- product cleanup/scheduled behavior

Why separate:

- catalog is a large business domain
- seller dashboard heavily depends on it
- search/pricing/events evolve independently

## Order Service

Owns:

- checkout
- orders
- seller order views
- payment sessions
- Stripe webhooks
- order confirmation email

Why separate:

- payments are reliability-sensitive
- webhooks require idempotency and signature verification
- order state should not be mixed with catalog browsing

## Recommendation Service

Owns:

- recommendation endpoints
- recommendation scoring/generation
- reading behavior analytics

Why separate:

- recommendation logic may become compute-heavy
- it changes differently from transactional APIs
- can evolve toward offline/async recommendation pipelines later

## AI Vision Service

Owns:

- AI generation workflows
- visual search
- concepts
- gallery
- artisan matching
- embeddings
- AI usage tracking
- background jobs

Why separate:

- AI providers have different latency/cost/failure behavior
- dependencies are heavier
- background embedding/sync jobs should not live in core commerce services

## Kafka Service

Owns:

- consuming analytics events
- validating user activity messages
- updating user analytics
- updating product analytics

Why separate:

- analytics processing should not block buyer requests
- workers scale differently from HTTP APIs
- event consumption has different failure modes

## Interview Explanation

If asked "What are the service responsibilities?", say:

> The gateway routes client traffic. Auth owns identity and tokens. Product owns catalog, shops, pricing, discounts, offers, and events. Order owns checkout, order state, Stripe sessions, and webhooks. Recommendation owns recommendation APIs. AI Vision owns AI-heavy visual workflows and background jobs. Kafka service consumes analytics events and materializes user/product analytics.

