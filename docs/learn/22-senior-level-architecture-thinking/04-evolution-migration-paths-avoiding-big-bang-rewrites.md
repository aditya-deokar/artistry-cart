# Evolution, Migration Paths, And Avoiding Big-Bang Rewrites

## Systems Evolve

Architecture is not one final design.

Systems evolve as:

- product requirements change
- traffic grows
- team size changes
- reliability expectations increase
- cost pressure appears
- external providers change
- technical debt accumulates

Senior engineers design for evolution.

## Avoid Big-Bang Rewrites

A big-bang rewrite tries to replace a large system all at once.

Risks:

- long time without user value
- unknown parity gaps
- migration bugs
- team burnout
- duplicated maintenance
- delayed feedback

Prefer incremental migration.

## Strangler Pattern

The strangler pattern replaces a system gradually.

Simple idea:

```text
new path handles one slice
old path handles the rest
move slices over time
retire old path when complete
```

This reduces risk and gives feedback.

## Expand And Contract

Useful for data migrations:

1. Add new field or model.
2. Write both old and new shapes.
3. Backfill old data.
4. Read from new shape.
5. Stop writing old shape.
6. Remove old shape later.

This avoids breaking old readers during rollout.

## Migration Design Questions

Ask:

- can old and new paths run together?
- what is the rollback plan?
- how do we verify parity?
- who owns backfill?
- what metrics prove success?
- what happens to in-flight requests or jobs?
- how do we communicate contract changes?

## Service Extraction

Before extracting a service, first extract ownership.

Steps:

1. Identify domain boundary.
2. Define API contract.
3. Define data ownership.
4. Remove direct internal imports.
5. Add tests and observability.
6. Move runtime only when the boundary is stable.

Moving code into a new process without ownership is not real decoupling.

## Database Ownership Migration

For Artistry Cart, a future path could be:

1. Document model ownership by service.
2. Restrict writes to owning services.
3. Replace cross-service direct reads with APIs or read models where needed.
4. Split the highest-value domain storage only when justified.
5. Keep shared Prisma ergonomics only where it does not violate ownership.

## Recommendation Maturity Migration

Current:

```text
some recommendation scoring in request path
```

Future:

```text
events -> offline scoring/training -> cached recommendation artifacts -> fast serving API
```

This is an incremental evolution, not a rewrite.

## AI Vision Maturity Migration

Current:

```text
AI API and background jobs share service boundary
```

Future:

```text
AI API service + dedicated worker service + provider telemetry + job status model
```

This can happen gradually by moving one job type at a time.

## Strong Interview Answer

If asked "How would you evolve this architecture?", say:

> I would avoid a big-bang rewrite. First I would make ownership and contracts explicit, add observability and tests, then migrate one boundary at a time. For data changes I would use expand-and-contract. For service extraction I would stabilize API and data ownership before moving runtime deployment.

## Artistry Cart Connection

Artistry Cart's next maturity steps should be incremental: stronger service contracts, data ownership conventions, deeper observability, more CI coverage for AI/Kafka, and moving heavier recommendation/AI work off request paths.
