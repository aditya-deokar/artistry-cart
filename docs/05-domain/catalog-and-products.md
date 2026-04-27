# Catalog And Products

## Domain Summary

This domain is the heart of the commerce platform. It covers product creation, public product browsing, seller product management, product metadata, catalog categories, product imagery, and product lifecycle behavior.

## Owning Components

- `product-service`
- `seller-ui`
- `user-ui`

## Core Data Models

- `products`
- `ProductPricing`
- `productAnalytics`
- `site_config`

## Main Flows

### Seller catalog management

- seller authenticates
- seller uses `seller-ui` product forms and tables
- requests go to `product-service`
- service writes product data, images, and pricing-related fields

### Buyer catalog browsing

- buyer uses landing, shop, product, and search experiences in `user-ui`
- frontend reads public product endpoints
- product-service returns filtered or individual catalog records

### Product lifecycle cleanup

- products can be soft-deleted
- scheduled cleanup later permanently deletes expired product records and related dependent records

## Business Characteristics

This is not a flat product table domain. Product records include:

- rich metadata
- categories and subcategories
- images and custom properties
- pricing overlays
- analytics links
- event and discount relationships

## Strengths

- rich product model supports a serious commerce experience
- seller and buyer flows are both first-class
- lifecycle cleanup is accounted for operationally

## Tradeoffs

- product-service scope is very broad
- rich metadata increases schema and UI complexity
- catalog logic overlaps naturally with pricing, search, and promotions, so boundaries must be maintained carefully

## Interview Framing

Describe this as a catalog domain with embedded merchandising concerns, not just CRUD.
