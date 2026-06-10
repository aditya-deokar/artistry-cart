# Database And Prisma

This folder is the tenth learning block for preparing for a bigger engineering role. It explains database fundamentals and Prisma usage through the lens of the Artistry Cart project.

The goal is to understand how data is modeled, queried, indexed, validated, migrated, seeded, and shared across services, plus how to explain database tradeoffs in interviews.

## Learning Outcome

After completing this topic, you should be able to explain:

- what a database is and why applications need persistence
- SQL versus NoSQL tradeoffs
- MongoDB document modeling basics
- Prisma schema, models, client, and queries
- relations, embedding, references, and denormalization thinking
- indexes and query performance
- transactions and consistency
- database ownership in microservices
- shared database tradeoffs in Artistry Cart
- seeding and test data strategy
- common Prisma/database interview questions

## Files In This Topic

1. [Database Fundamentals](./01-database-fundamentals.md)
2. [SQL Versus NoSQL And MongoDB Basics](./02-sql-versus-nosql-and-mongodb-basics.md)
3. [Prisma Fundamentals](./03-prisma-fundamentals.md)
4. [Schema Design, Relations, Embedding, And References](./04-schema-design-relations-embedding-references.md)
5. [Queries, Indexes, And Performance](./05-queries-indexes-and-performance.md)
6. [Transactions, Consistency, Migrations, And Seeding](./06-transactions-consistency-migrations-seeding.md)
7. [Database Ownership In Microservices And Artistry Cart](./07-database-ownership-in-microservices-and-artistry-cart.md)
8. [Interview Questions And Answer Patterns](./08-interview-questions-and-answer-patterns.md)

## Core Mental Model

```text
API request
  -> service validates input
  -> service applies business rules
  -> Prisma client performs database query
  -> MongoDB stores/retrieves documents
  -> service maps result to API response
```

Prisma helps TypeScript code talk to the database safely and consistently, but it does not remove the need for good data modeling, indexing, validation, and ownership decisions.

## Connection To Artistry Cart

Artistry Cart uses:

- `prisma/schema.prisma` for the MongoDB schema
- `@prisma/client` for generated database client access
- `packages/libs/prisma` as a shared Prisma entry point
- MongoDB as primary persistence
- seed data under `prisma/seed`
- services such as auth, product, order, recommendation, AI Vision, gateway, and Kafka worker reading/writing data

