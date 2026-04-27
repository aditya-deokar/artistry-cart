# API Inventory

## Overview

This document catalogs the main HTTP API surfaces exposed by the backend services. It is organized by service and route group rather than by every individual controller method implementation detail.

## API Gateway

### Role

- client-facing proxy layer

### Endpoints

- `GET /gateway-health`

### Proxied prefixes

- `/auth`
- `/product`
- `/order`
- `/recommendation`
- `/ai-vision`

## Auth Service

Base path through gateway:

- `/auth/api`

### Auth and registration

- `POST /user-registration`
- `POST /verify-user`
- `POST /login-user`
- `GET /logout-user`
- `POST /refresh-token`
- `GET /logged-in-user`
- `POST /forgot-password-user`
- `POST /reset-password-user`
- `POST /verify-forgot-password-user`

### Seller auth and onboarding

- `POST /seller-registration`
- `POST /verify-seller`
- `POST /create-shop`
- `POST /create-stripe-link`
- `POST /login-seller`
- `GET /logged-in-seller`

### Profile and account

- `GET /me`
- `PATCH /me`
- `GET /me/orders`
- `GET /me/orders/:orderId`
- `GET /me/addresses`
- `POST /me/addresses`
- `PATCH /me/addresses/:addressId`
- `DELETE /me/addresses/:addressId`

### OAuth

Base path:

- `/auth/api/oauth`

Routes:

- `GET /status`
- `GET /google`
- `GET /google/callback`
- `GET /github`
- `GET /github/callback`
- `GET /facebook`
- `GET /facebook/callback`

## Product Service

Base path through gateway:

- `/product/api`

### Product routes

- categories
- public product listing and product detail
- seller product CRUD
- image upload and delete
- admin product management
- coupon validation

Representative routes:

- `GET /categories`
- `GET /products`
- `GET /product/:slug`
- `GET /products/by-ids`
- `POST /coupon/validate`
- `POST /images/upload`
- `DELETE /images/delete`
- `POST /products`
- `GET /seller/products/summary`
- `GET /seller/products`
- `PUT /products/:productId`
- `DELETE /products/:productId`
- `PUT /products/:productId/restore`
- `GET /admin/products`
- `PUT /admin/products/:productId/status`

### Event routes

Base:

- `/events`

Representative routes:

- `GET /`
- `GET /:eventId`
- `GET /type/:eventType`
- `GET /shop/:shopId`
- `POST /`
- `POST /with-products`
- `GET /seller/events`
- `PUT /:eventId`
- `DELETE /:eventId`
- `GET /seller/products`
- `PUT /:eventId/products`
- `GET /admin/all`
- `PUT /admin/:eventId/status`

### Discount routes

Base:

- `/discounts`

Representative routes:

- `POST /validate`
- `POST /`
- `GET /seller`
- `PUT /:discountId`
- `DELETE /:discountId`
- `GET /:discountId/stats`
- `POST /apply`
- `GET /admin/all`
- `PUT /admin/:discountId/status`

### Shop routes

Base:

- `/shops`

Representative routes:

- `GET /`
- `GET /categories`
- `GET /:slug`
- `GET /:shopId/products`
- `GET /:shopId/reviews`
- `POST /reviews`

### Search routes

Base:

- `/search`

Representative routes:

- `GET /live`
- `GET /suggestions`
- `GET /`
- `GET /products`
- `GET /events`
- `GET /shops`
- `GET /seller`

### Offers routes

Base:

- `/offers`

Representative routes:

- `GET /`
- `GET /user`
- `GET /category/:category`
- `GET /limited-time`
- `GET /seasonal`
- `GET /admin/stats`

## Order Service

Base path through gateway:

- `/order/api`

### Payment and checkout

- `POST /create-payment-session`
- `GET /verify-payment-session`
- `GET /verify-session-and-create-intent`
- `POST /create-payment-intent`
- `GET /payment-status`

### Customer orders

- `GET /orders`
- `GET /orders/:orderId`
- `POST /orders/:orderId/cancel`
- `POST /refunds/request`

### Seller payout and order ops

- `GET /seller/earnings`
- `GET /seller/payouts`
- `POST /seller/payouts/request`
- `GET /seller/orders`
- `GET /seller/orders/:orderId`
- `PUT /seller/orders/:orderId/status`
- `GET /seller/analytics`

### Stripe webhook

- `POST /webhooks`

## Recommendation Service

Base path through gateway:

- `/recommendation/api`

### Recommendation routes

- `GET /recommendations/:userId`

## AI Vision Service

Base path through gateway:

- `/ai-vision/api/v1/ai`

### Generation

- `POST /generate/text-to-image`
- `POST /generate/product-variation`
- `POST /generate/from-image`
- `POST /generate/refine`

### Search

- `POST /search/visual`
- `POST /search/hybrid`
- `POST /search/similar-concepts`
- `GET /search/quick`

### Concepts

- `GET /concepts`
- `GET /concepts/:id`
- `POST /concepts/:id/save`
- `DELETE /concepts/:id`
- `POST /concepts/:id/send-to-artisans`

### Artisans

- `GET /artisans/match`
- `POST /artisans/respond`
- `GET /artisans/my-matches`

### Gallery

- `GET /gallery`
- `GET /gallery/:id`
- `POST /gallery/:id/favorite`
- `GET /gallery/:id/related`

### Schema helpers

- `GET /schema/categories`
- `GET /schema/materials`
- `GET /schema/styles`

### Collections

- `POST /collections`
- `GET /collections`
- `GET /collections/:id`
- `PUT /collections/:id`
- `DELETE /collections/:id`
- `POST /collections/:id/concepts`
- `DELETE /collections/:id/concepts/:conceptId`
- `POST /collections/:id/collaborators`
- `DELETE /collections/:id/collaborators/:collaboratorId`

### Comments

- `POST /comments`
- `GET /comments/concept/:conceptId`
- `GET /comments/my-comments`
- `PUT /comments/:commentId`
- `DELETE /comments/:commentId`

### Test and diagnostics

- test routes exist under `/test`

## Contract Observations

- most services expose clear route-group boundaries
- auth and AI Vision have the richest contract surfaces
- gateway and frontend rewrites make the backend appear more unified to clients than it is internally
- service contract normalization is good, but not perfectly uniform yet
