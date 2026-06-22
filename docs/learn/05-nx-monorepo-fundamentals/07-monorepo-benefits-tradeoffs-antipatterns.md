# Monorepo Benefits, Tradeoffs, And Anti-Patterns

## Benefits

### Atomic Cross-Project Changes

Related changes can happen in one pull request.

Example:

```text
change auth response
  -> update auth-service
  -> update frontend auth store
  -> update middleware
  -> update tests
```

### Shared Tooling

One workspace can standardize:

- TypeScript
- test runner
- build system
- formatting
- package manager
- CI patterns
- Docker conventions

### Easier Refactoring

Because all code is visible, you can update imports, types, and contracts across projects more safely.

### Better Code Discovery

Engineers can inspect the whole system:

- frontend
- backend
- shared packages
- docs
- infra
- tests

This is especially useful in architecture reviews and interviews.

### Shared Packages

Internal packages can evolve with their consumers without publishing to npm.

## Tradeoffs

### Bigger Workspace

The repo can become large and cognitively heavy.

Mitigation:

- clear docs
- project boundaries
- folder conventions
- ownership rules

### CI Can Become Slow

If every PR runs everything, feedback is slow.

Mitigation:

- Nx affected commands
- caching
- task parallelism
- focused e2e suites

### Hidden Coupling

Shared code can make services depend on each other indirectly.

Mitigation:

- small shared packages
- package exports
- module boundary rules
- avoid importing app internals

### Dependency Upgrade Blast Radius

One dependency upgrade can affect many projects.

Mitigation:

- test affected projects
- use lockfile discipline
- upgrade intentionally

### Ownership Can Be Blurry

When everything is in one repo, unclear ownership can slow reviews.

Mitigation:

- CODEOWNERS
- service docs
- package ownership
- ADRs

## Anti-Patterns

### Giant Utils Package

Bad:

```text
packages/utils
  auth business logic
  product calculations
  order queries
  UI helpers
  random constants
```

Better:

```text
packages/utils/kafka
packages/utils/runtime
packages/middleware
packages/error-handler
domain logic stays in owning services
```

### App-To-App Imports

Bad:

```ts
product-service imports auth-service source code
```

Better:

```text
product-service verifies auth through shared middleware/contract
or communicates through API/event
```

### Shared Package As Business Logic Dump

If shared packages contain all business rules, services become thin shells and boundaries disappear.

### Running Everything On Every PR

This ignores monorepo tooling and makes CI painful.

Use affected commands where possible.

### No Public Package API

If consumers import deep internal files, packages become hard to refactor.

Use package exports and index files intentionally.

## When Monorepo Is A Good Choice

Good fit when:

- projects change together
- shared contracts matter
- teams need consistent tooling
- cross-project refactors are common
- internal packages are used heavily
- CI has graph-aware tooling

## When Multi-Repo May Be Better

Better fit when:

- services are owned by independent teams
- release cycles are completely separate
- access control must be strict per service
- shared code is minimal
- teams can handle versioning and package publishing discipline

## Interview Explanation

If asked "What are monorepo tradeoffs?", say:

> A monorepo improves atomic changes, shared tooling, refactoring, and code discovery, but it can create large-workspace complexity, slow CI, hidden coupling, and unclear ownership. Tools like Nx help with graph-aware builds and affected tests, but architecture discipline is still needed to keep boundaries clean.

## Connection To Artistry Cart

Artistry Cart's monorepo is useful because:

- services share middleware, Prisma, Redis, Kafka, and error handling packages
- frontend/backend contracts evolve together
- CI can use affected builds and tests
- docs explain the entire platform

The risks to watch:

- shared database coupling
- overly broad shared packages
- services importing too much from each other
- gateway becoming too central

