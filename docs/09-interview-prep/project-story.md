# Project Story

## Why This Document Exists

This is the narrative layer for interviews. The goal is not to memorize a script word for word. The goal is to give you a clean story shape so you can explain the project with confidence at different time depths.

## Core Thesis

Artistry Cart is a service-oriented artisan-commerce platform that combines standard marketplace behavior with AI-assisted discovery and custom-creation workflows. The most interesting engineering story is not that it uses many technologies. It is that it balances pragmatic speed with real architectural boundaries: separate buyer and seller surfaces, domain-oriented backend services, async analytics for recommendations, and a dedicated AI boundary for higher-variance workflows.

## Two-Minute Version

Artistry Cart is an artisan-commerce platform built as an Nx monorepo. It has two main frontend applications: a buyer-facing storefront and a seller-facing operational dashboard. On the backend, I split responsibilities across services for auth, products and merchandising, orders and payments, recommendations, Kafka-based analytics materialization, and AI Vision.

What makes it more interesting than a basic ecommerce project is the AI Vision layer. Users can browse and buy standard marketplace inventory, but they can also generate or search visual concepts, save them, and connect those ideas back to artisans and products. Technically, the platform uses Next.js, Express, MongoDB with Prisma, Redis, Kafka, Stripe, OAuth, and external AI providers. The strongest tradeoff is that the services are logically separated but still share one MongoDB schema, which increased delivery speed while leaving storage isolation as future maturity work.

## Five-Minute Version

I would frame the project as a platform rather than a single app. There are two primary personas.

- Buyers use `user-ui` for browsing, discovery, commerce, and AI-assisted concept exploration.
- Sellers use `seller-ui` for operational workflows like product management, offers, discounts, events, and order handling.

On the backend, the split is domain-oriented.

- `auth-service` owns identity, local auth, OAuth, and token lifecycle concerns.
- `product-service` owns the broadest commerce domain: products, shops, search, offers, events, discounts, and pricing logic.
- `order-service` handles checkout-sensitive behavior like Stripe sessions, webhooks, order state, payouts, and seller-facing order operations.
- `recommendation-service` serves recommendation results.
- `kafka-service` consumes user events and materializes analytics state asynchronously.
- `aivision-service` owns generation, visual search, embeddings, concepts, collections, comments, artisan matching, and recurring AI-related jobs.

The architecture is intentionally pragmatic. I did not force strict microservice purity everywhere. The services are real at the runtime and code-ownership level, but they still share a common Prisma schema backed by MongoDB. That let the platform evolve faster while preserving enough structure to keep the system understandable. I also used Kafka where the async boundary matters, so analytics and recommendation inputs do not slow down browse or checkout flows.

## Ten-Minute Walkthrough Shape

When you have more time, use this order:

1. Product framing
   - marketplace for artisan products
   - AI-assisted concept generation and visual discovery

2. User surfaces
   - separate buyer and seller applications because the workflows differ substantially

3. Backend decomposition
   - gateway for client entry
   - auth, product, order, recommendation, analytics, and AI Vision services

4. Data model
   - MongoDB plus Prisma
   - flexible enough for product metadata and AI entities
   - shared schema is efficient, but not fully isolated

5. Event design
   - Kafka captures user activity asynchronously
   - analytics materialization feeds recommendation behavior

6. AI boundary
   - isolated because AI has different latency, provider, and job-processing needs

7. Real tradeoffs
   - operational maturity is uneven across services
   - observability and contract consistency still need hardening
   - recommendation scoring still has some request-time cost

8. What I would improve next
   - standardize health, logging, and tracing
   - fix naming and contract mismatches
   - deepen CI and automated coverage for AI Vision and Kafka paths

## What Makes The Project Worth Talking About

- It has more than CRUD. There are real domain boundaries and non-trivial workflows.
- It shows judgment about where async architecture is useful.
- It combines standard commerce concerns with AI-specific runtime concerns.
- It gives you honest tradeoff material instead of forcing a "perfect architecture" story.

## What Not To Overclaim

Do not pitch the system as if it is already a fully hardened internet-scale platform. A stronger answer is:

This project demonstrates solid architectural judgment and system decomposition, and it also shows that I understand where the current maturity limits are and what I would improve next.

## Related Docs

- [System Design Walkthrough](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/09-interview-prep/system-design-walkthrough.md>)
- [Tradeoff Talking Points](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/09-interview-prep/tradeoff-talking-points.md>)
- [Deep-Dive Questions](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/09-interview-prep/deep-dive-questions.md>)
