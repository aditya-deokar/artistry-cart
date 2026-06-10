# Transactions, Consistency, Migrations, And Seeding

## Transactions

A transaction groups multiple database operations so they succeed or fail together.

Example:

```text
create order
create payment record
update inventory
```

If one step fails, the whole operation should not leave broken partial state.

## Why Transactions Matter

Without transaction thinking:

```text
order created
payment record failed
user sees inconsistent checkout state
```

Critical flows need careful consistency design.

## MongoDB And Transactions

MongoDB supports transactions in certain deployment configurations, but document modeling often tries to keep data that changes together in one document where practical.

For complex multi-document workflows, application logic must be careful about partial failure.

## Consistency

Strong consistency:

```text
all readers immediately see latest correct state
```

Eventual consistency:

```text
state becomes consistent after async processing
```

Use strong consistency for:

- payments
- order state
- auth/session validity

Eventual consistency is often okay for:

- analytics
- recommendations
- search indexes
- email notifications

## Idempotency

Idempotency means repeating the same operation has the same final effect.

Important for:

- Stripe webhooks
- retries
- Kafka consumers
- order creation

Example:

```text
same payment webhook arrives twice
order should not be marked/processed twice incorrectly
```

## Migrations

Migration means changing database schema/data safely over time.

Examples:

- add field
- rename field
- change enum/status values
- add index
- backfill existing documents
- remove obsolete field

With MongoDB, schema flexibility does not remove migration needs.

Existing documents may still need backfills or compatibility handling.

## Safe Schema Change Pattern

For breaking changes:

```text
1. Add new field while old field still works.
2. Deploy code that writes both or reads both.
3. Backfill old data.
4. Switch reads to new field.
5. Remove old field later.
```

This avoids breaking running services.

## Seeding

Seeding means creating initial or test data.

Uses:

- local development
- demos
- tests
- portfolio walkthroughs

Seed data should be:

- realistic enough for testing
- safe
- repeatable
- documented

Artistry Cart has seed data under:

```text
prisma/seed
```

## Test Data

Test data should be isolated from production.

Good practices:

- use test database
- reset between suites when needed
- use factories
- avoid relying on developer local data
- avoid real external provider calls

## Backup And Recovery

Production database thinking includes:

- backups
- restore tests
- retention policy
- disaster recovery
- auditability

Backups are only useful if restore is tested.

## Interview Explanation

If asked "How do you handle schema changes?", say:

> I avoid big-bang breaking changes. I add new fields in a backward-compatible way, deploy code that can read old and new shapes, backfill existing data, switch reads/writes gradually, and remove old fields later. Even with MongoDB's flexible schema, data migrations and compatibility still matter.

## Connection To Artistry Cart

Important consistency/migration areas:

- order/payment state
- Stripe webhook idempotency
- product price changes and order snapshots
- analytics materialization
- AI Vision embedding backfills
- Prisma schema changes affecting multiple services
- seed data for products/sellers/payments

