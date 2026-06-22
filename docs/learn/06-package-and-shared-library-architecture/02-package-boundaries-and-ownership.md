# Package Boundaries And Ownership

## What A Boundary Is

A boundary is a rule that defines:

- what belongs inside a package
- what the package exposes
- who can depend on it
- who owns changes
- what should stay private

Without boundaries, a monorepo becomes tightly coupled even if folders look organized.

## Package Responsibility

Every shared package should have a clear sentence:

```text
This package exists to...
```

Examples:

```text
packages/error-handler exists to provide shared error classes and Express error middleware.
packages/middleware exists to provide shared auth and role middleware.
packages/test-utils exists to provide test helpers and factories.
```

If you cannot describe the package in one sentence, it may be too broad.

## Ownership

Package ownership answers:

- who approves changes?
- who fixes bugs?
- who decides public API changes?
- who watches breaking changes?

In small projects, one team may own everything. In larger projects, ownership should become explicit.

Tools that help:

- CODEOWNERS
- package README files
- ADRs
- service docs
- changelog discipline

## Dependency Direction

Good dependency direction:

```text
apps -> packages
```

Usually bad:

```text
packages -> apps
```

Shared packages should not import application internals.

Bad:

```ts
// package imports service controller
import { authController } from "../../apps/auth-service/src/controller/auth.controller";
```

Better:

```text
package exports generic middleware or contract
service owns its controller
```

## Infrastructure Package Versus Domain Package

Infrastructure packages support technical concerns:

- error handling
- logging
- Redis
- Kafka
- Prisma client
- middleware

Domain packages contain business concepts:

- product rules
- order rules
- payment state
- seller workflows

Infrastructure packages are safer to share broadly. Domain packages require stronger ownership because they can blur service boundaries.

## Internal Code Versus Public API

Inside a package:

```text
internal files = implementation details
public exports = supported contract
```

Consumers should import only public exports.

Good:

```ts
import { AppError } from "@artistry-cart/error-handler";
```

Bad:

```ts
import { AppError } from "../../packages/error-handler/src/internal/app-error";
```

Deep imports make refactoring harder.

## Blast Radius

Blast radius means how many projects are affected by a change.

Changing a shared package can affect:

- all backend services
- all frontends
- test projects
- CI build flow

Nx helps identify affected projects, but design discipline reduces unnecessary blast radius.

## Boundary Checklist

Before adding a shared package, ask:

- Is this code used by multiple projects?
- Is it infrastructure, contract, or domain logic?
- Who owns it?
- What is the public API?
- What is private?
- Will changing it rebuild too many projects?
- Can consumers use it without knowing internals?
- Does it make service boundaries clearer or blurrier?

## Interview Explanation

If asked "How do you keep shared packages clean?", say:

> I give every package a clear responsibility, expose a small public API, avoid app-to-app imports, keep dependency direction from apps to packages, and prevent shared packages from becoming dumping grounds. I also think about ownership and blast radius because a shared package change can affect many services.

## Connection To Artistry Cart

Artistry Cart's shared package boundaries should stay like this:

- `error-handler`: cross-service error behavior
- `middleware`: reusable auth/role middleware
- `libs`: infrastructure clients such as Prisma, Redis, ImageKit
- `utils`: runtime/Kafka helpers and small focused utilities
- `test-utils`: test-only helpers

