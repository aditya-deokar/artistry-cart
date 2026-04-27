# Shops And Sellers

## Domain Summary

This domain represents the supply side of the marketplace: seller accounts, shop creation, shop identity, shop browsing, and shop-linked commerce activity.

## Owning Components

- `auth-service` for seller registration and shop creation
- `product-service` for shop listings, detail pages, and reviews
- `seller-ui` for seller operations
- `user-ui` for public shop discovery

## Core Data Models

- `sellers`
- `shops`
- `shopReviews`

## Main Flows

### Seller registration and shop creation

- seller registers through `auth-service`
- seller verifies account
- shop is created during onboarding
- seller can later manage commerce entities through `seller-ui`

### Public shop discovery

- buyer browses shops in `user-ui`
- product-service serves shop listings, categories, product listings, and reviews

### Seller operations

- seller dashboard acts as the main operational shell
- products, events, discounts, and orders all tie back to the seller/shop identity model

## Domain Role In The Platform

Shops act as the bridge between:

- sellers
- products
- events
- discounts
- orders

That makes this a central relational anchor in the business model.

## Strengths

- seller identity is distinct from buyer identity
- shops are modeled as first-class entities rather than just seller metadata
- public shop browsing supports the artisan-commerce positioning of the platform

## Tradeoffs

- shop creation living inside auth-service is pragmatic but broadens the identity boundary
- seller, shop, and payout concerns are spread across auth, product, and order services

## Interview Framing

This domain is a good example of a marketplace pattern where operational actors and customer actors have different application surfaces but share parts of the same backend data graph.
