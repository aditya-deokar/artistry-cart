# Service Boundaries And Business Capabilities

## What Is A Service Boundary

A service boundary defines what a service owns and how other parts of the system interact with it.

It answers:

- what business capability belongs here?
- what data does this service own?
- what APIs or events does it expose?
- what should other services not know?
- what failures should be isolated?

Good boundaries make the system easier to reason about.

## Business Capability

A business capability is something the business needs the system to do.

Examples:

- authenticate users
- manage product catalog
- process orders
- recommend products
- ingest analytics
- run AI visual discovery

Services should usually align with capabilities, not technical layers.

Bad split:

```text
controller-service
database-service
validation-service
```

Better split:

```text
auth-service
product-service
order-service
recommendation-service
```

## High Cohesion

Cohesion means related logic stays together.

High cohesion example:

```text
order-service contains checkout, order state, payment session, and webhook handling.
```

These concepts change together.

Low cohesion example:

```text
one service contains login, product search, payments, AI generation, and analytics.
```

Too many unrelated reasons to change.

## Low Coupling

Coupling means one service depends on another.

Some coupling is necessary.

Good coupling:

```text
frontend calls gateway using API contract
order-service calls Stripe through a payment client
kafka-service consumes analytics events by schema
```

Bad coupling:

```text
product-service imports auth-service controller source code
order-service directly mutates product-service internal data without a contract
```

## Bounded Context

A bounded context is a domain boundary where words and rules have specific meaning.

Example:

In product/catalog context:

```text
product means item listed for sale
price means listed product price
```

In order context:

```text
item means purchased line item
price means price captured at checkout time
```

Same words can have different rules in different contexts.

## Boundary Questions

When designing a service, ask:

- Does this capability have its own business rules?
- Does it need different scaling?
- Does it have different data lifecycle?
- Does it use different external providers?
- Would a team own it independently?
- Would failure here need to be isolated?
- Does it need independent deployment?

If most answers are no, a module may be enough.

## Artistry Cart Boundaries

Good boundaries in this repo:

- auth is separate because identity and token flows are security-sensitive
- product is separate because catalog/search/pricing/events form a large domain
- order is separate because checkout and webhooks need reliability
- recommendation is separate because recommendation logic has different compute patterns
- AI Vision is separate because AI providers and embeddings have different latency/cost behavior
- Kafka worker is separate because analytics ingestion is asynchronous

## Boundary Maturity

Service boundaries can mature over time.

Stage 1:

```text
separate folders/modules
```

Stage 2:

```text
separate runnable services
```

Stage 3:

```text
separate deployable services
```

Stage 4:

```text
separate data ownership and team ownership
```

Artistry Cart is around stages 2 and 3, with shared data ownership still present.

## Interview Explanation

If asked "How do you decide service boundaries?", say:

> I split services around business capabilities and reasons to change, not around technical layers. A good service boundary has high cohesion inside the service and clear contracts outside it. I also consider scaling, failure isolation, data ownership, security, and team ownership. If the boundary is not clear yet, a modular monolith may be safer than premature microservices.

## Connection To Artistry Cart

The cleanest explanation:

> Artistry Cart separates backend services by major capability: auth, product catalog, orders/payments, recommendations, AI Vision, gateway routing, and analytics ingestion. The source lives in one Nx monorepo, but each service has its own runtime responsibility.

