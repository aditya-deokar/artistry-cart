# Glossary

## Core Terms

### Artistry Cart

The overall platform and repository name.

### User UI

The buyer-facing Next.js storefront in `apps/user-ui`.

### Seller UI

The seller-facing Next.js dashboard in `apps/seller-ui`.

### API Gateway

The Express service in `apps/api-gateway` that exposes a single entry point and proxies traffic to backend services.

### Auth Service

The service responsible for user and seller authentication, registration, OAuth flows, and some onboarding-related actions such as shop creation.

### Product Service

The service responsible for products, shops, search, events, discounts, and offers.

### Order Service

The service responsible for order lifecycle, Stripe payment flows, webhook handling, and order-related side effects.

### Recommendation Service

The service responsible for serving recommendation-related functionality.

### Kafka Service

The analytics consumer that listens for user activity events and updates analytics state asynchronously.

### AI Vision Service

The service responsible for AI-assisted concept generation, visual search, gallery workflows, artisan-related AI experiences, and supporting jobs.

## Data and Infrastructure Terms

### Prisma

The ORM-like data access layer used here with MongoDB.

### MongoDB

The primary persistence store configured through `DATABASE_URL`.

### Redis

An auxiliary infrastructure component used for cache or token/session-adjacent flows depending on the service path.

### Kafka

The event-streaming system used for asynchronous user activity processing.

### Kafka UI

The local browser UI container exposed by the Docker Compose setup for inspecting Kafka topics and brokers.

### ImageKit

The media-storage and delivery integration used by image-handling flows.

### Stripe

The payment provider used for checkout and webhook-driven payment state transitions.

## Domain Terms

### Shop

A seller-owned storefront entity that groups products and commerce activity.

### Seller

An account type that can create and operate a shop through the seller UI.

### Product

The primary catalog item sold on the platform. Products carry pricing, inventory, category, images, and event/discount relationships.

### Event

A merchandising or promotional construct associated with products and shops.

### Discount

A pricing reduction mechanism that can be applied through product or event-related flows.

### Offer

A promotional construct distinct from core discount records, exposed through the product-service offer routes and seller UI flows.

### Recommendation

A product suggestion or personalized discovery output derived from user activity and recommendation logic.

### AI Vision

The project’s umbrella term for AI-assisted visual and concept-based workflows such as concept generation, gallery exploration, artisan matching, and visual search.
