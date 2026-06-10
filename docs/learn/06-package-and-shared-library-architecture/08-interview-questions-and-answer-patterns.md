# Interview Questions And Answer Patterns

This file gives interview-ready answers for package and shared library architecture.

## Question: Why Use Shared Packages?

Strong answer:

> Shared packages centralize reusable code used by multiple apps or services, such as middleware, error handling, infrastructure clients, event contracts, and test helpers. They improve consistency and reduce duplication, but they must be scoped carefully to avoid hidden coupling.

## Question: What Should Go Into A Shared Package?

Strong answer:

> Good shared package candidates are infrastructure and contract code: error classes, middleware, Prisma/Redis/Kafka helpers, typed event contracts, config helpers, and test utilities. Service-specific business logic should usually stay inside the owning service.

## Question: What Should Not Go Into A Shared Package?

Strong answer:

> I avoid putting service-specific business rules, controllers, route handlers, domain-specific database queries, and one-off helpers into shared packages. If everything goes into shared packages, the service boundaries become fake.

## Question: What Is A Package Public API?

Strong answer:

> A package public API is the supported set of imports exposed to consumers. It is usually defined through index files and package exports. Consumers should import from package entry points rather than internal files so the package can be refactored safely.

## Question: What Are Package Exports?

Strong answer:

> Package exports in `package.json` define which import paths are supported. They let a package expose a root entry point and specific subpaths while keeping internal implementation files private.

## Question: What Is `workspace:*`?

Strong answer:

> `workspace:*` is a pnpm workspace dependency specifier. It means the package should resolve to the local workspace package instead of a remote npm package. This makes internal package development and cross-project refactoring easier.

## Question: How Do Shared Packages Build In Nx?

Strong answer:

> Nx uses the project graph to understand which apps depend on which shared packages. With target defaults like `dependsOn: ^build`, Nx builds dependency packages before building consumers. It can also cache unchanged builds and run affected builds/tests when shared packages change.

## Question: What Is The Risk Of A Shared Utils Package?

Strong answer:

> A shared utils package can become a dumping ground for unrelated logic. That creates unclear ownership, large blast radius, hidden dependencies, and poor boundaries. I prefer small focused packages or subpath exports organized by responsibility.

## Question: How Do You Avoid Hidden Coupling?

Strong answer:

> I keep shared packages focused, expose small public APIs, avoid deep imports, prevent packages from importing app internals, keep domain rules in owning services, and use Nx affected commands to understand blast radius when shared packages change.

## Question: Runtime Package Versus Test Utility Package?

Strong answer:

> Runtime packages are used by production code, such as middleware, error handling, or Kafka helpers. Test utility packages are used only by tests, such as factories, mocks, and request helpers. Runtime code should not depend on test utility packages.

## Question: How Does This Apply To Artistry Cart?

Strong answer:

> Artistry Cart uses shared packages for error handling, middleware, Prisma/Redis/ImageKit helpers, Kafka utilities, and test helpers. These packages make services consistent and reduce duplication. The main design concern is keeping domain logic inside services and using shared packages for infrastructure, contracts, and test support.

## Best Short Project Pitch For This Topic

> In Artistry Cart, shared packages are one of the main benefits of the Nx monorepo. Services can reuse middleware, error handling, Prisma, Redis, Kafka, and test utilities through workspace packages. The architecture works well as long as those packages stay focused and do not become a place where service-specific business logic leaks across boundaries.

