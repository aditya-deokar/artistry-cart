# Pricing, Discounts, Events, And Offers

## Domain Summary

This domain captures the merchandising intelligence of the platform. It goes beyond static prices to include:

- base price and sale price
- current computed price
- event pricing
- product-specific event discounts
- discount codes
- offers and seller-facing promotional tooling
- pricing history

## Owning Components

- `product-service`
- `seller-ui`
- `user-ui` for public promotional display

## Core Data Models

- `products`
- `ProductPricing`
- `events`
- `EventProductDiscount`
- `discount_codes`
- `discount_usage`

## Main Flows

### Event-based pricing

- seller creates an event
- products are attached or updated for that event
- pricing service derives effective event discounts
- cached current price can be updated on the product record

### Discount code flow

- seller creates discount code
- buyer applies or validates the code
- usage tracking is stored in discount usage records

### Offer aggregation

- buyer-facing offer pages and category deals are served through product-service offer routes
- seller UI exposes operational views for seasonal and limited-time offer tooling

## Pricing Logic

The pricing service shows that the platform already treats pricing as computed logic, not a single stored field.

It evaluates:

- whether an event is active
- whether a product-level event discount overrides default event discount
- maximum discount caps
- special pricing overrides

This is exactly the kind of hidden complexity that strong documentation should expose.

## Strengths

- promotions are modeled explicitly instead of buried in ad hoc flags
- pricing history creates room for auditability and analysis
- seller tooling reflects real merchandising needs

## Tradeoffs

- merchandising complexity raises the risk of inconsistent pricing behavior if rules are not clearly documented
- offers, discounts, and events have overlapping business semantics and need careful domain language
- cached `current_price` improves reads but requires consistency discipline

## Interview Framing

This domain is a strong talking point because it shows movement from basic ecommerce into real merchandising logic and computed pricing rules.
