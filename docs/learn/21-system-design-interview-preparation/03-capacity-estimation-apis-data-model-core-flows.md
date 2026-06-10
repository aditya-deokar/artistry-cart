# Capacity Estimation, APIs, Data Model, And Core Flows

## Why Capacity Estimation Matters

Capacity estimation helps choose a reasonable architecture.

You do not need perfect math.

You need rough numbers that guide decisions:

- requests per second
- read/write ratio
- storage size
- bandwidth
- cache need
- queue volume
- database pressure

## Simple Estimation Method

Start with product assumptions:

```text
monthly active users
daily active users
requests per user per day
peak multiplier
read/write ratio
average payload size
```

Then estimate:

```text
daily requests
average requests per second
peak requests per second
storage growth
event volume
```

## Example Ecommerce Estimate

Assume:

- 1 million monthly active users
- 100,000 daily active users
- 50 product-browse requests per active user per day
- 5 checkout-related requests per purchasing user
- 10 percent of daily users purchase
- peak traffic is 10 times average

Rough browse requests:

```text
100,000 * 50 = 5,000,000 browse requests per day
5,000,000 / 86,400 = about 58 requests per second average
peak about 580 requests per second
```

This tells us product browsing is read-heavy and cache/index work matters.

## API Design

Good APIs should map to user workflows.

Examples:

```text
POST /auth/api/register
POST /auth/api/login-user
GET /product/api/products
GET /product/api/products/:id
POST /order/api/create-checkout-session
POST /order/api/webhooks/stripe
GET /recommendation/api/recommendations/:userId
POST /ai-vision/api/v1/ai/generate
```

In an interview, exact paths matter less than clear resource and workflow design.

## API Questions

For each API, ask:

- who can call it?
- what does it read?
- what does it write?
- is it idempotent?
- what are failure cases?
- what latency is acceptable?
- should it emit an event?
- should it be cached?

## Data Model

A system design data model should focus on core entities.

For Artistry Cart-like ecommerce:

- User
- Seller
- Shop
- Product
- Cart
- Order
- Payment
- WebhookEvent
- UserAnalytics
- Recommendation
- AIConcept
- ImageAsset

You do not need every field. Show ownership and relationships.

## Core Flow: Product Browse

```text
buyer -> user-ui -> api-gateway -> product-service -> MongoDB/Redis -> response
```

Performance concerns:

- indexes
- pagination
- product card projection
- cache strategy
- image CDN

## Core Flow: Checkout

```text
buyer -> user-ui -> api-gateway -> order-service -> Stripe
Stripe -> webhook -> order-service -> MongoDB
```

Correctness concerns:

- idempotent webhook handling
- durable order state
- payment verification
- retry safety

## Core Flow: Analytics And Recommendation

```text
user action -> Kafka event -> kafka-service -> UserAnalytics -> recommendation-service
```

Design point:

```text
analytics should not block browse or checkout paths
```

## Strong Interview Answer

If asked "How do you move from requirements to APIs and data?", say:

> I identify the core user flows, define the APIs needed for those flows, then model the entities and ownership boundaries behind them. I also mark which operations are read-heavy, write-critical, cacheable, idempotent, or async because those properties drive the architecture.

## Artistry Cart Connection

Artistry Cart already maps well to this method: user and seller UIs drive gateway APIs, backend services own major workflow groups, MongoDB stores core entities, Kafka carries analytics events, and Stripe webhooks update payment/order state asynchronously.
