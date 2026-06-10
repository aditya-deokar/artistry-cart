# High-Level Design, Components, Boundaries, And Diagrams

## What High-Level Design Means

High-level design shows the major components and how they communicate.

It should answer:

- where users enter
- which services exist
- where data is stored
- where cache is used
- where async events flow
- which external systems are involved
- what the critical request paths are

Do not start with every class, table, or route.

## A Good Diagram Is A Conversation Tool

A useful diagram is simple enough to explain.

It should show:

- clients
- gateway or load balancer
- services
- database
- cache
- queue/event bus
- external providers
- observability/operations where relevant

Avoid drawing every minor helper or package.

## Component Categories

Clients:

- web app
- mobile app
- admin dashboard

Edge:

- CDN
- load balancer
- API gateway
- WAF/rate limit

Services:

- auth
- catalog/product
- order/payment
- recommendation
- worker
- AI/media

Data:

- primary database
- cache
- object storage
- search index
- event stream

Operations:

- metrics
- logs
- alerts
- CI/CD

## Boundary Types

API boundary:

```text
what callers can request
```

Service boundary:

```text
which runtime owns behavior
```

Data boundary:

```text
which service owns data writes
```

Event boundary:

```text
what happened and who can react later
```

Team boundary:

```text
who owns the component
```

## Artistry Cart High-Level Shape

```text
Buyer/Seller Browser
  -> user-ui / seller-ui
  -> api-gateway
  -> auth-service
  -> product-service
  -> order-service
  -> recommendation-service
  -> aivision-service

Kafka
  -> kafka-service
  -> UserAnalytics

MongoDB/Prisma shared data layer
Redis optional fast path
Stripe/OAuth/SMTP/AI providers external systems
```

## Why Gateway Exists

The gateway gives clients one backend entry point.

It can centralize:

- routing
- CORS
- request policy
- rate limiting
- future tracing
- future auth propagation

Tradeoff:

```text
one more runtime component and potential hop
```

## Why Service Boundaries Exist

Good service boundaries usually follow business or runtime differences.

In Artistry Cart:

- auth is identity-heavy
- product is catalog/merchandising-heavy
- order is payment-sensitive
- recommendation is compute/personalization-heavy
- Kafka worker is async ingestion-heavy
- AI Vision is provider/media/job-heavy

These are meaningful boundaries.

## What To Say About Shared Database

Strong and honest:

```text
The services are separated at the application and runtime layer, but storage isolation is softer because they share MongoDB through Prisma. That was a pragmatic speed-versus-isolation decision.
```

This sounds better than pretending the system is textbook microservices.

## Strong Interview Answer

If asked "How would you draw the high-level design?", say:

> I would start with clients and the main request entry point, then show domain services, data stores, cache, async event flow, and external providers. I would keep the first diagram simple, then deep dive the riskiest flows like checkout, analytics, recommendations, or AI processing.

## Artistry Cart Connection

Artistry Cart's high-level design is easy to explain because it has clear user surfaces, a gateway, domain services, a shared data layer, Redis, Kafka, external providers, and deployment/observability assets.
