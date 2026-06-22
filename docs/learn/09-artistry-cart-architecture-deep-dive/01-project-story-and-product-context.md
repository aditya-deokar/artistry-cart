# Project Story And Product Context

## What Artistry Cart Is

Artistry Cart is a full-stack commerce platform focused on artisan products.

It supports multiple user experiences:

- buyers browsing and purchasing products
- sellers managing shops, products, orders, discounts, offers, and events
- AI-assisted product discovery and visual workflows
- analytics capture for recommendations and product insights

It is built as an Nx monorepo with multiple applications, backend services, shared packages, infrastructure definitions, and documentation.

## Product Personas

### Buyer

Buyer workflows include:

- browse products
- search products
- view shops and artisans
- use wishlist/cart
- checkout and pay
- view profile and orders
- use AI Vision discovery features
- receive recommendations

### Seller

Seller workflows include:

- create/manage shop
- create/update products
- manage pricing
- manage discounts
- manage events
- review orders
- view operational dashboard data

### Platform/Admin/Operations

Platform concerns include:

- auth and roles
- service health
- CI/CD
- Docker/Kubernetes deployment
- observability
- secrets/config
- event processing
- database schema

## Why The Project Is Architecturally Interesting

This is not only a UI project and not only a backend API.

It includes:

- frontend apps
- backend services
- API gateway
- shared packages
- database schema
- event-driven analytics
- AI service boundary
- payment integration
- local infrastructure
- Kubernetes manifests
- CI workflows
- interview-focused documentation

That makes it a strong learning project for full-stack/backend/platform interviews.

## Main Architecture Choices

### Nx Monorepo

All apps, services, packages, docs, and infra live in one repo.

Why:

- shared tooling
- atomic cross-project changes
- easier refactors
- consistent TypeScript setup
- easier portfolio review
- Nx affected builds/tests

### Service-Oriented Backend

Backend responsibilities are split into services:

- auth
- product/catalog
- orders/payments
- recommendations
- AI Vision
- gateway
- Kafka analytics worker

Why:

- clearer domain ownership
- different runtime concerns
- future independent scaling/deployment
- isolation of payments, AI, analytics, and auth concerns

### Shared Packages

Common infrastructure is extracted into workspace packages.

Why:

- reduce duplication
- consistent middleware
- consistent error handling
- shared Kafka/Redis/Prisma helpers
- shared test utilities

### Shared Prisma/MongoDB Layer

Multiple services use MongoDB through Prisma.

Why:

- simpler local development
- one visible schema
- faster cross-domain iteration

Tradeoff:

- weaker service autonomy
- shared data ownership risk
- schema changes can affect multiple services

## Strong Interview Framing

Use this:

> Artistry Cart is designed as a pragmatic service-oriented monorepo. The monorepo gives developer velocity and shared tooling, while service boundaries separate major runtime responsibilities like auth, catalog, orders, recommendations, AI Vision, gateway routing, and analytics ingestion. The main tradeoff is shared persistence through Prisma/MongoDB, which keeps development practical but means it is not fully database-isolated microservices.

## What This Project Demonstrates

It demonstrates:

- frontend/backend integration
- API gateway pattern
- Express service design
- shared library architecture
- event-driven analytics with Kafka
- AI service isolation
- payment/webhook thinking
- monorepo CI strategy
- Kubernetes deployment shape
- architecture tradeoff awareness

