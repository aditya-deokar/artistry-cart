# Prisma Fundamentals

## What Prisma Is

Prisma is a database toolkit for TypeScript and JavaScript.

It provides:

- schema definition
- generated typed client
- query API
- type-safe database access
- migration/db tooling depending on provider

In Artistry Cart, Prisma is used with MongoDB.

## Prisma Schema

The schema file defines models and database configuration.

Location:

```text
prisma/schema.prisma
```

It describes:

- datasource
- generator
- models
- fields
- ids
- relations/references
- indexes

## Model

A model maps to a database collection/table.

Example shape:

```prisma
model Product {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  price     Float
  sellerId  String   @db.ObjectId
  createdAt DateTime @default(now())
}
```

In MongoDB, Prisma models map to collections.

## Prisma Client

Prisma generates a typed client from the schema.

Generate:

```bash
pnpm exec prisma generate
```

Use:

```ts
const product = await prisma.product.findUnique({
  where: { id: productId },
});
```

## Type Safety

Prisma generates TypeScript types based on the schema.

Benefits:

- field names are checked
- query shapes are typed
- return values are typed
- refactors are safer

Example:

```ts
await prisma.product.findUnique({
  where: { id: 123 },
});
```

If `id` expects a string, TypeScript can catch the mismatch.

## Common Query Methods

Create:

```ts
await prisma.product.create({
  data: {
    name: "Handmade Bowl",
    price: 1500,
    sellerId,
  },
});
```

Read one:

```ts
await prisma.product.findUnique({
  where: { id },
});
```

Read many:

```ts
await prisma.product.findMany({
  where: { sellerId },
  take: 20,
});
```

Update:

```ts
await prisma.product.update({
  where: { id },
  data: { price: 1800 },
});
```

Delete:

```ts
await prisma.product.delete({
  where: { id },
});
```

## Select And Include

`select` chooses fields:

```ts
await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
  },
});
```

`include` includes related data when supported by relation modeling:

```ts
await prisma.user.findUnique({
  where: { id },
  include: {
    orders: true,
  },
});
```

Use `select` to avoid returning unnecessary or sensitive fields.

## Prisma Is Not Runtime Validation

Prisma types help with database queries, but they do not validate HTTP input by themselves.

Still validate:

- request body
- query params
- route params
- webhook payloads
- Kafka messages
- environment variables

## Shared Prisma Client

In a monorepo, services often share a Prisma client helper.

Artistry Cart has:

```text
packages/libs/prisma
```

Benefit:

- consistent database client import
- shared setup

Tradeoff:

- shared database access can blur service data ownership

## Interview Explanation

If asked "What is Prisma?", say:

> Prisma is a TypeScript-friendly database toolkit. We define models in a Prisma schema, generate a typed client, and use that client to query the database. It improves type safety and developer experience, but we still need runtime validation, indexing, good data modeling, and clear ownership rules.

## Connection To Artistry Cart

Artistry Cart uses Prisma to let services access MongoDB with typed query APIs. Services such as auth, product, order, recommendation, AI Vision, gateway, and Kafka worker can all use the shared Prisma setup.

