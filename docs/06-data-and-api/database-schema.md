# Database Schema

## Overview

The platform uses a single MongoDB database accessed through Prisma. The schema is broad and covers:

- identity and profiles
- seller and shop operations
- catalog and merchandising
- orders and payments
- analytics and recommendations
- AI Vision sessions, concepts, embeddings, and collaboration

The schema lives in `prisma/schema.prisma`.

## Schema Strategy

This is a document-oriented schema with typed Prisma access. It mixes:

- normalized relations where they matter
- flexible `Json` and `Json[]` fields for rich metadata
- denormalized read models for analytics and AI workflows

## Major Model Clusters

### Identity and accounts

- `users`
- `addresses`
- `sellers`
- `Notification`

Important characteristics:

- `users` support optional OAuth identity fields
- `sellers` are distinct from users
- `UserRole` enum includes `USER`, `SELLER`, and `ADMIN`

### Shops and reviews

- `shops`
- `shopReviews`
- `site_config`

Important characteristics:

- each shop belongs to one seller
- shops connect to products, events, discount codes, and orders
- `site_config` provides global category and subcategory metadata

### Catalog and merchandising

- `products`
- `ProductPricing`
- `events`
- `EventProductDiscount`
- `discount_codes`
- `discount_usage`
- `banners`

Important characteristics:

- products contain rich metadata and cached effective pricing
- pricing history is explicit
- events can apply both event-wide and product-specific discounts
- discount code usage is persisted separately

### Orders and payments

- `orders`
- `OrderItem`
- `payments`
- `payouts`
- `refunds`

Important characteristics:

- orders connect buyer, shop, items, and optional payment
- payments track Stripe identifiers and fee breakdown
- payouts and refunds are modeled explicitly

### Analytics and recommendations

- `UserAnalytics`
- `productAnalytics`
- `shopAnalytics`
- `uniqueShopVisitor`

Important characteristics:

- `UserAnalytics.actions` stores JSON action history
- `UserAnalytics.recommendations` stores cached recommendation ids
- `productAnalytics` stores materialized counters for views and intent signals

### AI Vision

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

Important characteristics:

- AI Vision has its own substantial subgraph
- concept images store embeddings directly
- collaboration, comments, and artisan matching are first-class persisted concerns

## High-Value Models

### `users`

Represents buyer identity and profile state.

Important fields:

- `email`
- `password`
- `avatar`
- `role`
- `oauthProvider`
- `oauthId`

### `sellers`

Represents seller identity and payout-adjacent state.

Important fields:

- `email`
- `stripeId`
- `stripeOnboardingComplete`

### `shops`

Represents the seller's storefront and public identity.

Important fields:

- `slug`
- `category`
- `avatar`
- `coverBanner`
- `socialLinks`

### `products`

Represents the central commerce entity.

Important fields:

- `slug`
- `category`
- `subCategory`
- `images`
- `stock`
- `regular_price`
- `sale_price`
- `current_price`
- `is_on_discount`
- `status`
- `shopId`
- optional `eventId`

### `orders`

Represents buyer purchase state.

Important fields:

- `totalAmount`
- `status`
- `deliveryStatus`
- `couponCode`
- `discountAmount`
- `userId`
- `shopId`

### `payments`

Represents payment and Stripe reconciliation state.

Important fields:

- `stripePaymentIntent`
- `stripeChargeId`
- `amount`
- `platformFee`
- `sellerAmount`
- `status`

### `UserAnalytics`

Represents the recommendation-ready user activity read model.

Important fields:

- `actions`
- `recommendations`
- `lastTrained`

### `Concept`

Represents a persisted AI-generated concept.

Important fields:

- `sessionId`
- `generationPrompt`
- `primaryImageUrl`
- `analyzedFeatures`
- `estimatedPrice`
- `isSaved`
- `isFavorite`
- `status`

## Indexing Patterns

The schema includes indexes across:

- ids and uniqueness boundaries
- status fields
- active-window dates
- recommendation and analytics lookup keys
- AI Vision session and concept lifecycle fields

This indicates the system is already thinking about queryability, not just raw persistence.

## Design Strengths

- rich domain modeling
- explicit pricing and payments data
- strong AI Vision persistence model
- denormalized analytics records for downstream reads

## Design Constraints

- one shared schema supports many services
- JSON-heavy fields trade strictness for flexibility
- cross-service ownership must be managed socially and through docs, not only through storage boundaries

## Related Docs

- [Entity Relationship Notes](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/06-data-and-api/entity-relationship-notes.md>)
- [External Integrations](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/06-data-and-api/external-integrations.md>)
