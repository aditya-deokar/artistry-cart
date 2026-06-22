# Data Ownership, Transactions, And Consistency

## Why Data Is Hard In Microservices

In a monolith, one application often uses one database.

This makes transactions and joins easier.

In microservices, each service should ideally own its data.

That creates harder questions:

- who owns each table/collection?
- how do services read data from each other?
- how are multi-service changes coordinated?
- what happens when one service succeeds and another fails?

## Database Ownership

Textbook microservices prefer:

```text
service owns its own database or schema
```

Example:

```text
auth-service -> auth database
product-service -> catalog database
order-service -> order database
```

Other services do not directly write into that database.

They communicate through APIs or events.

## Benefits Of Separate Data Ownership

Benefits:

- strong service autonomy
- clearer domain ownership
- independent schema changes
- fewer accidental cross-service dependencies
- easier team ownership

## Costs Of Separate Data Ownership

Costs:

- cross-service queries are harder
- joins across services are not direct
- data duplication may be needed
- eventual consistency is common
- distributed transactions are difficult
- more operational overhead

## Shared Database Approach

Some systems use multiple services with one shared database.

Benefits:

- simpler development
- easier queries
- fewer infrastructure pieces
- easier early-stage migration

Costs:

- weaker service autonomy
- schema changes affect many services
- services can bypass each other's rules
- hidden coupling
- harder to split later

## Artistry Cart Reality

Artistry Cart has separate services but a shared Prisma/MongoDB layer.

This means:

```text
service boundaries exist at runtime/code level
data ownership is still shared
```

Best interview phrase:

> Artistry Cart is service-oriented, but not fully database-isolated microservices yet.

## Transactions

A transaction makes multiple changes succeed or fail together.

In one database:

```text
create order
decrement inventory
write payment record
commit all or rollback all
```

Across multiple services/databases, this is much harder.

## Distributed Transactions

A distributed transaction tries to coordinate changes across services.

They are complex because:

- services can fail independently
- networks can fail
- locks can hurt availability
- coordination is expensive

Many microservice systems avoid distributed transactions and use eventual consistency.

## Eventual Consistency

Eventual consistency means different parts of the system may not match immediately, but converge over time.

Example:

```text
Order is created.
Analytics updates later.
Recommendation data updates later.
```

This is acceptable for analytics, but not always for payment correctness.

## Saga Pattern

A saga coordinates a workflow through multiple local transactions and compensating actions.

Example:

```text
reserve inventory
create payment
create order
if payment fails, release inventory
```

Each step commits locally. If a later step fails, compensation runs.

## Read Models

Sometimes services duplicate data for reads.

Example:

```text
kafka-service materializes user analytics
recommendation-service reads prepared analytics
```

This avoids expensive synchronous chains.

## Interview Explanation

If asked "How do microservices handle data?", say:

> Ideally each service owns its own data and other services access it through APIs or events. This improves autonomy but makes cross-service queries and transactions harder, so systems often use eventual consistency, sagas, and read models. A shared database is simpler early on but weakens service boundaries and requires strong ownership discipline.

## Connection To Artistry Cart

Artistry Cart currently chooses a pragmatic shared MongoDB/Prisma layer.

This helps:

- local development
- shared schema visibility
- faster cross-domain work

But it requires care:

- document model ownership
- avoid services bypassing domain rules
- move toward stronger data ownership if the system scales

