# Product Service

## Overview

`product-service` is the largest business-domain service in the repository. It owns the core commerce catalog plus adjacent merchandising concerns such as shops, search, discounts, events, and offers.

This is effectively the catalog and merchandising backbone of the platform.

## Responsibilities

- product CRUD
- seller product listings and summaries
- public product browsing
- product image management
- categories and catalog metadata
- shop discovery and shop reviews
- search, live search, and seller search
- discounts and discount validation/application
- events and event-product linking
- offer aggregation and offer statistics
- pricing support and pricing history behavior
- scheduled cleanup of soft-deleted products

## Inbound Interfaces

Mounted under `/api` in the service and proxied through `/product/api` by the frontend rewrite layer and gateway.

Route groups:

- product routes
- event routes
- discount routes
- shop routes
- search routes
- offers routes

Representative endpoints:

- `GET /api/products`
- `GET /api/product/:slug`
- `POST /api/products`
- `GET /api/seller/products`
- `GET /api/seller/products/summary`
- `GET /api/events`
- `POST /api/events`
- `GET /api/discounts/seller`
- `POST /api/discounts/apply`
- `GET /api/shops`
- `GET /api/shops/:slug`
- `GET /api/search`
- `GET /api/search/live`
- `GET /api/offers`

## Outbound Dependencies

- MongoDB via Prisma
- shared auth and admin middleware
- shared error middleware

Unlike auth, order, and AI Vision, this service does not currently depend on many external SaaS systems. Its complexity is domain complexity more than integration complexity.

## Internal Structure

Key folders:

- `controllers/`
- `routes/`
- `lib/`
- `jobs/`
- `middleware/`

Notable files:

- `src/app.ts`
- `src/main.ts`
- `src/lib/pricing.service.ts`
- `src/jobs/product-cron.job.ts`

## Data Touch Points

Primary models include:

- `products`
- `shops`
- `events`
- `EventProductDiscount`
- `ProductPricing`
- `discount_codes`
- `discount_usage`
- `productAnalytics`

This service owns one of the richest data surfaces in the platform.

## Runtime Behavior

- listens on `6002` by default
- exposes a health-style root endpoint with endpoint inventory
- applies credentialed CORS for buyer and seller frontends
- starts a cron job for permanent deletion of expired soft-deleted products

## Background Work

The product cron job:

- runs hourly
- finds expired soft-deleted products
- deletes related pricing, event-discount, and analytics records in a transaction
- then deletes the product records

This is an important operational detail because catalog cleanup is not purely request-driven.

## Tests

There is good test evidence across this service:

- controller specs
- pricing service spec
- cron job spec
- integration spec
- dedicated e2e project in `apps/product-service-e2e`

## Strengths

- strong domain coverage for the seller and buyer catalog experience
- pricing and promotions are modeled as first-class concepts
- public and seller flows are separated in routing
- background cleanup shows attention to lifecycle management

## Tradeoffs

- this service owns many adjacent domains and is at risk of becoming too broad
- search, shops, offers, discounts, pricing, and products all being colocated increases convenience but also blast radius
- the service is central enough that schema or API changes here can ripple through much of the platform

## Future Hardening

- consider whether search and pricing/promotions deserve stronger internal module boundaries or separate services later
- standardize route naming and admin conventions
- document pricing precedence rules formally as the merchandising logic evolves
