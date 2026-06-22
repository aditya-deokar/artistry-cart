# Boundaries, Ownership, Coupling, And Blast Radius

## Why Boundaries Matter

Boundaries control how change spreads.

Good boundaries make it clear:

- who owns behavior
- who owns data
- who owns APIs
- what can change privately
- what requires coordination

Without boundaries, every change feels risky.

## Boundary Types

Code boundary:

```text
folder, package, module, import direction
```

Runtime boundary:

```text
process, service, worker, job
```

Data boundary:

```text
which service owns reads and writes for a model
```

API boundary:

```text
contract exposed to callers
```

Team boundary:

```text
who reviews and operates the component
```

## Ownership

Ownership means a person or team is accountable for:

- correctness
- API contracts
- data shape
- operations
- documentation
- changes

Ownership does not mean nobody else can contribute. It means changes have a clear review path.

## Coupling

Coupling means one part depends on another.

Some coupling is necessary.

Dangerous coupling is:

- hidden
- accidental
- undocumented
- broad in blast radius
- hard to test

## Shared Packages

Shared packages are useful for infrastructure behavior:

- middleware
- logging
- error handling
- Prisma client
- Redis wrapper
- Kafka utilities
- test utilities

But shared packages can become dangerous if they contain domain logic that should belong to one service.

## Blast Radius

Blast radius means how much breaks when something changes.

Small blast radius:

```text
one service changes internally without affecting callers
```

Large blast radius:

```text
one shared package change affects every frontend and backend service
```

Senior engineers pay attention to blast radius before changing shared code.

## Boundary Drift

Boundary drift happens when:

- services import each other's internals
- shared packages absorb business logic
- database models are changed without owners
- gateway starts owning domain behavior
- workers and APIs mix too many concerns

Boundary drift is normal unless teams actively prevent it.

## Artistry Cart Boundary Examples

Strong boundaries:

- AI Vision is separated from core commerce services
- Kafka worker is separated from foreground request handling
- buyer and seller frontends are separate
- shared runtime utilities centralize observability and health conventions

Softer boundaries:

- shared MongoDB/Prisma layer
- shared packages can create hidden coupling
- some worker/API responsibilities are still coupled inside services

## Strong Interview Answer

If asked "How do you think about service boundaries?", say:

> I look for business capability, runtime behavior, data ownership, team ownership, and failure isolation. A good boundary reduces coordination and blast radius. A bad boundary only moves code into another process while keeping the same hidden coupling through shared data, shared libraries, or unclear contracts.

## Artistry Cart Connection

Artistry Cart has real application/runtime boundaries, but the senior explanation should acknowledge that data ownership is still maturing because services share MongoDB through Prisma.
