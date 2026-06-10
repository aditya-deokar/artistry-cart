# Queries, Indexes, And Performance

## Query Performance Starts With Access Patterns

A query is only fast if the database can find data efficiently.

Common access patterns in Artistry Cart:

- find user by email
- find product by id
- list products by shop/category
- search products
- list orders by user
- list orders by seller
- find active discounts/events
- read analytics by user/product
- find AI Vision sessions/concepts

## Index

An index is a data structure that helps the database find records faster.

Without index:

```text
scan many documents
```

With index:

```text
jump closer to matching documents
```

Index examples:

- user email
- product seller id
- product category
- order user id
- order seller id
- event status/date
- analytics user id

## Unique Index

A unique index prevents duplicates.

Example:

```text
user email should be unique
```

This protects data integrity.

## Compound Index

A compound index covers multiple fields.

Example:

```text
sellerId + status + createdAt
```

Useful for queries like:

```text
find orders for seller by status sorted by date
```

## Pagination

List endpoints should paginate.

Bad:

```text
GET /products returns 50,000 records
```

Better:

```text
GET /products?page=1&limit=20
```

Benefits:

- lower response time
- lower memory usage
- better UI
- safer database load

## Offset Versus Cursor Pagination

Offset pagination:

```text
page=5&limit=20
```

Simple, but can get slow or inconsistent for large changing datasets.

Cursor pagination:

```text
after=lastSeenId&limit=20
```

Better for large/infinite lists.

## Select Only Needed Fields

Use `select` to avoid overfetching.

Example:

```ts
await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    price: true,
  },
});
```

Benefits:

- smaller response
- less memory
- fewer accidental sensitive fields

## Avoid N+1 Queries

N+1 means:

```text
1 query for list
N extra queries for each item
```

Example:

```text
get 20 orders
then query items for each order separately
```

This can become slow.

Fixes:

- include related data carefully
- batch queries
- denormalize read models
- design API response around access pattern

## Search Performance

Search can be expensive.

Options:

- text indexes
- specific indexed filters
- external search engine
- precomputed search fields
- autocomplete indexes

For product search, think about:

- category
- price range
- seller/shop
- tags
- availability
- sort order

## Analytics Query Performance

Analytics can grow quickly.

Avoid:

```text
recomputing everything from raw events on every request
```

Better:

```text
Kafka worker materializes counters/action history
recommendation-service reads prepared analytics
```

## Monitoring Database Performance

Watch:

- slow queries
- query count per request
- index usage
- connection count
- memory usage
- lock/contention indicators
- response latency

## Interview Explanation

If asked "How do you improve database performance?", say:

> I start by identifying access patterns and slow queries. Then I add appropriate indexes, paginate list endpoints, select only needed fields, avoid N+1 queries, batch or denormalize where useful, and monitor query latency and index usage. Performance is a schema and query design problem, not just an infrastructure problem.

## Connection To Artistry Cart

Important performance areas:

- product search and filtering
- seller order dashboards
- checkout/order creation
- recommendation reads
- analytics materialization
- AI Vision embedding lookup/search
- dashboard tables and pagination

