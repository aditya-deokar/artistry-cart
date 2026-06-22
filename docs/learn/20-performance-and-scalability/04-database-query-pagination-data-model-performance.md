# Database, Query, Pagination, And Data Model Performance

## Why Database Performance Matters

In many web systems, the database becomes the first serious bottleneck.

APIs often spend most time:

- finding rows/documents
- joining or populating relationships
- filtering
- sorting
- aggregating
- writing transactional state

Fast application code cannot hide a slow query.

## Query Shape

Query shape means what the database is asked to do.

Important questions:

- what fields are filtered?
- what fields are sorted?
- how many records are scanned?
- how many records are returned?
- are relationships loaded efficiently?
- is there pagination?
- are large fields fetched unnecessarily?

## Indexes

An index helps the database find data faster.

Good indexes match common query patterns:

- product by seller
- product by category
- active products by price
- user orders by created time
- payment webhook event IDs
- analytics by user ID

Indexes improve reads, but they add write cost and storage usage.

## Pagination

Pagination limits how much data one request returns.

Without pagination:

```text
one request can accidentally load the whole collection
```

Common pagination styles:

- offset pagination
- cursor pagination

Offset pagination is simple but can become slow for deep pages.

Cursor pagination is better for large changing datasets.

## Projection

Projection means selecting only fields needed by the caller.

Example:

```text
product card list does not need every product detail field
```

Smaller payloads improve:

- database work
- network transfer
- frontend rendering

## Denormalization

Denormalization stores derived or duplicated data to speed reads.

Artistry Cart stores effective pricing fields such as:

- `current_price`
- `is_on_discount`

That avoids recalculating every pricing rule on every product read.

Tradeoff:

```text
faster reads, but writes must keep derived data correct
```

## Shared Database Bottlenecks

Artistry Cart uses a shared MongoDB schema across multiple backend services.

This is pragmatic for development, but at scale it can create:

- cross-service contention
- harder ownership boundaries
- harder independent scaling
- shared failure impact
- index tuning conflicts

This does not mean the design is wrong. It means the scaling story must be honest.

## Read Models

A read model is data shaped for reading.

Kafka analytics materialization is a form of read-model thinking:

```text
events happen -> worker updates analytics records -> recommendation service reads prepared state
```

This avoids recomputing everything from raw events on every request.

## N Plus One Problem

N plus one means:

```text
fetch list -> then fetch related data once per item
```

This can create many database calls.

Fixes:

- batch queries
- include relations carefully
- precompute read models
- use dataloader-style batching
- adjust API response shape

## Strong Interview Answer

If asked "How do you improve database performance?", say:

> I inspect slow queries, query shape, indexes, pagination, projections, and relationship loading. I avoid fetching unnecessary data, add indexes that match real access patterns, use cursor pagination for large datasets, precompute derived values when reads dominate, and monitor whether the database is becoming a shared bottleneck.

## Artistry Cart Connection

Artistry Cart has useful read optimizations like effective pricing fields and analytics read models, but shared MongoDB and large catalog/recommendation queries are important areas to watch as traffic and data grow.
