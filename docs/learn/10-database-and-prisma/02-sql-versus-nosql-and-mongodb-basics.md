# SQL Versus NoSQL And MongoDB Basics

## SQL Databases

SQL databases are relational databases.

Examples:

- PostgreSQL
- MySQL
- SQL Server
- SQLite

They organize data into:

```text
tables
rows
columns
relations
```

Strengths:

- strong relational modeling
- joins
- transactions
- constraints
- mature query language
- strong consistency patterns

## NoSQL Databases

NoSQL is a broad category of non-relational databases.

Types:

- document databases: MongoDB
- key-value stores: Redis
- wide-column stores: Cassandra
- graph databases: Neo4j

NoSQL systems often optimize for flexible schemas, scale patterns, or specialized data models.

## MongoDB

MongoDB is a document database.

It stores JSON-like documents in collections.

Example:

```json
{
  "_id": "p1",
  "name": "Handmade Bowl",
  "price": 1500,
  "tags": ["ceramic", "handmade"],
  "sellerId": "s1"
}
```

## Document Modeling

MongoDB modeling starts with access patterns.

Ask:

- how will data be read?
- what needs to be updated together?
- how large can documents grow?
- what fields need indexes?
- should related data be embedded or referenced?

## Embedding

Embedding stores related data inside one document.

Example:

```json
{
  "orderId": "o1",
  "items": [
    {
      "productId": "p1",
      "name": "Bowl",
      "priceAtPurchase": 1500,
      "quantity": 2
    }
  ]
}
```

Good when:

- data is read together
- child data belongs to parent lifecycle
- bounded array size
- atomic update with parent is useful

## Referencing

Referencing stores ids to other documents.

Example:

```json
{
  "productId": "p1",
  "sellerId": "s1"
}
```

Good when:

- related data is large
- data changes independently
- many-to-many relationships exist
- duplication would be expensive

## Denormalization

Denormalization means duplicating data to optimize reads.

Example:

```text
order item stores product name and price at purchase time
```

Why:

- order history should show the old price even if product price changes later
- avoids joining product collection for old order details

Tradeoff:

- duplicated data must be managed carefully

## SQL Versus MongoDB Tradeoff

SQL is often strong when:

- relational consistency is central
- complex joins are common
- transactions are critical
- schema is stable and structured

MongoDB is often useful when:

- document-shaped data is natural
- schema needs flexibility
- related data is read as one document
- rapid iteration is important

## Interview Explanation

If asked "SQL versus NoSQL?", say:

> SQL databases model data relationally with tables, rows, constraints, joins, and strong transaction support. NoSQL databases use different models such as documents or key-value pairs. MongoDB stores documents, which can be flexible and natural for nested data, but data modeling still requires careful thinking about access patterns, indexes, embedding, references, and consistency.

## Connection To Artistry Cart

Artistry Cart uses MongoDB through Prisma because the platform has many document-like domains:

- products with media/specifications/variants
- orders with line items
- AI Vision sessions and concept data
- analytics action history
- seller/shop/product metadata

The tradeoff is that relational-style ownership and consistency rules must still be designed intentionally.

