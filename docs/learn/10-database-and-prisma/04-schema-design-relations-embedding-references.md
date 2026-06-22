# Schema Design, Relations, Embedding, And References

## Start With Access Patterns

Good schema design starts with questions:

- what pages/API endpoints need this data?
- what queries are most common?
- what needs to be updated together?
- what must be historically accurate?
- what grows without bound?
- what needs fast lookup?

Design the model around real workflows, not only abstract entities.

## Entity Examples In Artistry Cart

Important entities include:

- User
- Seller
- Shop
- Product
- Order
- Discount
- Event
- Offer
- UserAnalytics
- ProductAnalytics
- AI Vision concepts/sessions

## Relations

Relations connect entities.

Examples:

```text
user -> orders
seller -> shop
shop -> products
product -> discounts/events/offers
order -> order items
user -> analytics
```

In MongoDB/Prisma, relations are often represented by object ids and relation fields.

## One-To-One

Example:

```text
seller -> shop
```

A seller may own one shop, depending on business rules.

## One-To-Many

Example:

```text
shop -> products
user -> orders
```

One parent has many child records.

## Many-To-Many

Example:

```text
event -> many products
product -> many events
```

This often needs an array of references or join-like collection depending on query needs.

## Embedding

Embedding means storing child data inside the parent document.

Good for:

- order line items
- small snapshots
- settings objects
- bounded nested data

Example order item snapshot:

```json
{
  "productId": "p1",
  "name": "Handmade Bowl",
  "priceAtPurchase": 1500,
  "quantity": 2
}
```

Why snapshot:

> Order history should remain accurate even if product name or price changes later.

## Referencing

Referencing means storing another document's id.

Good for:

- products belonging to shop
- orders belonging to user
- analytics referencing products
- large independently changing entities

Example:

```json
{
  "productId": "p1",
  "sellerId": "s1"
}
```

## Embedded Versus Referenced Decision

Embed when:

- data is read together
- data lifecycle belongs to parent
- nested data is bounded
- atomic update with parent matters

Reference when:

- data changes independently
- data is large
- many-to-many relationships exist
- multiple parents need same entity
- duplication creates correctness risk

## Public API DTOs Versus Database Models

Do not expose raw database documents directly.

Database model may contain:

- internal ids
- secrets
- timestamps
- provider state
- deleted flags
- private metadata

API DTO should expose what the client needs.

## Schema Evolution

Schema changes happen when product requirements change.

Examples:

- add discount usage tracking
- add product analytics counters
- add AI embedding fields
- add order status fields
- add seller onboarding metadata

Every schema change should consider:

- existing data
- default values
- backfill needs
- affected services
- tests
- deployment order

## Interview Explanation

If asked "How do you design schemas?", say:

> I start from access patterns and business rules. I decide which entities own which data, which fields need indexes, what should be embedded for snapshot or parent-owned data, and what should be referenced because it changes independently. I also separate database models from public API DTOs so internal fields do not leak to clients.

## Connection To Artistry Cart

Artistry Cart must carefully model:

- product/shop/seller relationships
- order line item snapshots
- discounts/events linked to products
- analytics action histories
- AI Vision sessions and embeddings
- user and seller identity flows

