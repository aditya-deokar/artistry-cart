# Interview Questions And Answer Patterns

This file gives interview-ready answers for database and Prisma topics.

## Question: What Is A Database?

Strong answer:

> A database is durable storage for application data. It lets services persist and query important state like users, products, orders, payments, analytics, and sessions. The database is usually the source of truth, while caches are used for speed or temporary coordination.

## Question: SQL Versus NoSQL?

Strong answer:

> SQL databases use relational tables, constraints, joins, and strong transaction patterns. NoSQL databases use models like documents, key-value, graph, or wide-column. MongoDB is a document database, which is useful for flexible and nested data, but still requires careful modeling, indexing, and consistency design.

## Question: What Is MongoDB?

Strong answer:

> MongoDB is a document database that stores JSON-like documents in collections. It is useful when data naturally fits document shapes or needs schema flexibility. Good MongoDB design depends on access patterns, embedding versus referencing decisions, indexes, and document growth limits.

## Question: What Is Prisma?

Strong answer:

> Prisma is a TypeScript-friendly database toolkit. We define models in a Prisma schema, generate a typed client, and use that client to query the database. It improves developer experience and type safety, but it does not replace runtime validation or good database design.

## Question: Does Prisma Validate Request Data?

Strong answer:

> No. Prisma validates query shape from TypeScript and schema perspective, but HTTP request bodies, query params, webhooks, Kafka messages, and environment variables are runtime inputs. Those still need validation before reaching business logic or database writes.

## Question: Embedding Versus Referencing In MongoDB?

Strong answer:

> Embed data when it is usually read together, belongs to the parent lifecycle, is bounded in size, and benefits from atomic updates with the parent. Reference data when it changes independently, is large, is shared by many parents, or represents many-to-many relationships.

## Question: What Is Denormalization?

Strong answer:

> Denormalization means duplicating data to optimize reads or preserve historical snapshots. For example, an order item can store product name and price at purchase time so order history remains accurate even if the product changes later.

## Question: What Is An Index?

Strong answer:

> An index is a database data structure that helps queries find matching records faster. Indexes are important for fields used in filters, sorting, uniqueness, and joins/references, but too many indexes can slow writes and consume storage.

## Question: How Do You Improve Query Performance?

Strong answer:

> I identify slow access patterns, add appropriate indexes, paginate list endpoints, select only needed fields, avoid N+1 queries, batch reads when possible, and denormalize or materialize read models where it makes sense. Then I monitor query latency and index usage.

## Question: What Is A Transaction?

Strong answer:

> A transaction groups multiple operations so they succeed or fail together. It protects consistency for workflows like order creation and payment state updates. In distributed systems, transactions across services are harder, so teams often use eventual consistency, sagas, and idempotent operations.

## Question: What Is Eventual Consistency?

Strong answer:

> Eventual consistency means data may not be immediately synchronized everywhere, but it converges over time. It is acceptable for analytics, recommendations, search indexes, and notifications, but payment and order correctness usually need stronger guarantees.

## Question: How Do You Handle Schema Changes?

Strong answer:

> I make schema changes backward-compatible where possible. I add new fields, deploy code that can read old and new shapes, backfill existing data, switch reads/writes gradually, and remove old fields later. MongoDB flexibility does not remove the need for migration planning.

## Question: Is Shared Database Good For Microservices?

Strong answer:

> It is pragmatic early because it simplifies development and cross-domain queries, but it weakens service autonomy. Mature microservices usually prefer service-owned databases or schemas. If using a shared database, I would define model ownership and restrict writes to the owning service.

## Question: How Does This Apply To Artistry Cart?

Strong answer:

> Artistry Cart uses MongoDB through Prisma, with a shared Prisma package used by multiple services. This gives type-safe database access and fast development, but also means data ownership is shared. I would describe it as service-oriented with shared persistence, and a future improvement would be documenting and enforcing model ownership by service.

## Best Short Project Pitch For This Topic

> The data layer uses MongoDB with Prisma for typed database access across services. Prisma improves TypeScript developer experience, while MongoDB supports document-style data for products, orders, analytics, and AI Vision. The biggest architectural tradeoff is shared persistence: it speeds development but requires clear ownership rules as the service architecture matures.

