# Database Fundamentals

## What Is A Database

A database is a system for storing, retrieving, and managing data reliably.

Applications need databases because server memory is temporary.

If a backend stores a product only in memory:

```text
service restarts -> product disappears
```

If it stores the product in a database:

```text
service restarts -> product still exists
```

## Why Applications Need Persistence

Persistence is needed for:

- users
- sessions
- products
- shops
- orders
- payments
- discounts
- analytics
- AI Vision concepts
- recommendations
- audit/history data

In Artistry Cart, MongoDB is the primary persistent store.

## Database Versus Cache

Database:

- source of truth
- durable storage
- supports querying
- stores important business state

Cache:

- speed optimization
- often temporary
- can be rebuilt
- may expire

Example:

```text
MongoDB stores order truth.
Redis may store temporary fast-access/session-adjacent data.
```

## Tables, Collections, Rows, And Documents

SQL databases usually use:

```text
table -> row -> column
```

MongoDB uses:

```text
collection -> document -> field
```

Example document:

```json
{
  "id": "p1",
  "name": "Handmade Bowl",
  "price": 1500,
  "sellerId": "s1"
}
```

## CRUD

CRUD means:

- Create
- Read
- Update
- Delete

Example product CRUD:

```text
Create product
Read product list
Update product price
Delete/archive product
```

Most backend APIs are built around CRUD plus business workflows.

## Primary Key

A primary key uniquely identifies a record/document.

Example:

```text
user.id
product.id
order.id
```

APIs often use ids in routes:

```text
GET /products/:id
```

## Foreign Key / Reference

A reference connects one record to another.

Example:

```text
product.sellerId -> seller.id
order.userId -> user.id
```

In MongoDB, these references are usually stored as ids.

## Schema

A schema defines the structure of data.

In Prisma, schema lives in:

```text
prisma/schema.prisma
```

It defines:

- models
- fields
- types
- ids
- relations/references
- indexes

## Query

A query asks the database for data.

Examples:

```text
find product by id
find all orders for user
find active discounts
count product views
```

Good database design starts with understanding query patterns.

## Data Integrity

Data integrity means data remains correct and consistent.

Examples:

- order total should match captured line item prices
- product price should not be negative
- user email should be unique
- payment status should not move backwards incorrectly

Some integrity is enforced by the database. Some is enforced by application logic.

## Interview Explanation

If asked "What is a database?", say:

> A database is durable storage for application data. It lets services persist and query important state such as users, products, orders, payments, and analytics. Backend services should treat the database as the source of truth for durable business data, while caches like Redis are usually performance or coordination tools.

## Connection To Artistry Cart

Artistry Cart stores:

- auth and user identity data
- sellers and shops
- products, pricing, offers, discounts, events
- orders and payment state
- analytics and recommendation inputs
- AI Vision concepts, sessions, embeddings, and usage data

