# Recommendation Systems And Behavior Analytics

## What Recommendation Systems Do

Recommendation systems rank items for a user or context.

They answer:

```text
what should this user see next?
```

Examples:

- products you may like
- similar products
- trending shops
- artisans matching a concept
- recommended categories

## Common Recommendation Signals

Signals:

- product views
- add to cart
- wishlist
- purchases
- search queries
- shop visits
- category preferences
- price range
- similar user behavior

Signals are only useful if they are captured consistently.

## Explicit Versus Implicit Feedback

Explicit feedback:

- rating
- like
- review

Implicit feedback:

- view
- click
- add to cart
- purchase
- dwell time

Ecommerce recommendations often rely heavily on implicit feedback.

## Cold Start

Cold start means there is not enough data.

Types:

- new user
- new product
- new shop

Fallbacks:

- popular products
- recent products
- category-based recommendations
- editorial selections
- seller/shop similarity

## Collaborative Filtering

Collaborative filtering uses behavior patterns.

Simple idea:

```text
users who did similar things may like similar items
```

It can work well, but needs enough interaction data.

## Content-Based Recommendation

Content-based recommendation uses item attributes.

Examples:

- category
- tags
- material
- style
- price
- image embedding

It is useful for cold start and niche catalogs.

## Online Versus Offline Recommendations

Online:

```text
compute during request
```

Offline:

```text
precompute recommendations in background, serve fast later
```

At scale, serving should usually be cheap and predictable.

## Artistry Cart Recommendation Flow

Flow:

```text
user event -> Kafka -> kafka-service -> UserAnalytics -> recommendation-service -> products
```

The recommendation service uses TensorFlow.js-style embedding layers and behavior weights:

- product view: low signal
- wishlist: medium signal
- add to cart: stronger signal
- purchase: strongest signal

## Tradeoffs

Strengths:

- analytics capture is async
- foreground user flows stay cleaner
- recommendation service has a clear boundary
- cold-start fallback exists

Constraints:

- some scoring/training happens in request path
- recommendation freshness is eventually consistent
- more metrics are needed for cold-start rate and latency

## Strong Interview Answer

If asked "How would you design recommendations?", say:

> I would capture user behavior events asynchronously, materialize user and item analytics, start with simple fallback and content-based logic, then add collaborative or model-based ranking as data grows. For scale, I would move heavy training/scoring offline and keep the online serving path fast, cached, and observable.

## Artistry Cart Connection

Artistry Cart already has the right separation: Kafka captures behavior asynchronously, `kafka-service` materializes analytics, and `recommendation-service` serves recommendations from that behavioral data.
