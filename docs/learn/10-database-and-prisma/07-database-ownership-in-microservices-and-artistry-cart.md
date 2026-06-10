# Database Ownership In Microservices And Artistry Cart

## Why Ownership Matters

In a service-oriented system, code boundaries are only part of the story.

Data ownership answers:

- who owns this model?
- who can write it?
- who can read it?
- who can change its schema?
- what service enforces its business rules?

Without ownership, services can bypass each other.

## Textbook Microservice Data Ownership

Ideal microservice pattern:

```text
auth-service owns auth data
product-service owns catalog data
order-service owns order data
recommendation-service owns recommendation data
```

Other services interact through:

- APIs
- events
- replicated read models

They do not directly write each other's data.

## Shared Database Pattern

Artistry Cart currently uses a shared MongoDB/Prisma layer.

This is pragmatic because:

- local development is simpler
- schema is visible in one place
- cross-domain features move faster
- shared Prisma types help TypeScript development

But it reduces autonomy.

## Risks Of Shared Database

Risks:

- service A writes service B's data incorrectly
- schema changes break multiple services
- business rules are bypassed
- ownership becomes unclear
- hidden coupling grows over time

Example:

```text
order-service should not casually change product pricing rules.
product-service should not finalize payment state.
```

## Ownership Rules In A Shared Database

Even with one database, define ownership.

Example:

```text
auth-service owns user credential/auth fields
product-service owns product/catalog fields
order-service owns order/payment fields
kafka-service owns analytics materialization writes
aivision-service owns AI Vision concepts/sessions/embeddings
```

Other services may read certain fields but should not write them without a contract.

## Read Models

Sometimes a service needs data owned by another service.

Options:

- call owning service API
- consume events and maintain read model
- read shared database with explicit read-only rule

In early systems, shared reads may be acceptable. In mature systems, contracts become more important.

## Migration Toward Stronger Ownership

Possible maturity path:

1. document model ownership
2. prevent direct writes to non-owned models
3. create service APIs for cross-domain writes
4. add event contracts for async updates
5. split schemas or databases where needed
6. add contract tests

## Interview Explanation

If asked "Is a shared database okay in microservices?", say:

> A shared database is pragmatic early because it simplifies development and queries, but it weakens service autonomy. In mature microservices, each service should own its data and expose APIs or events. If a shared database is used, I would define model ownership rules and avoid services writing data they do not own.

## Connection To Artistry Cart

Best honest explanation:

> Artistry Cart has service boundaries at the application layer, but shared persistence through Prisma/MongoDB. This keeps development practical, but database ownership is a key maturity area. The next step would be documenting which service owns each model and gradually enforcing read/write boundaries.

