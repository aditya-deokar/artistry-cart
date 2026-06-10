# Package And Shared Library Architecture

This folder is the sixth learning block for preparing for a bigger engineering role. It explains how to design shared packages and libraries inside a monorepo without turning them into hidden coupling.

The goal is to understand when shared code helps, when it hurts, and how to explain package boundaries in a senior-level interview.

## Learning Outcome

After completing this topic, you should be able to explain:

- why shared packages exist
- what belongs in a shared package
- what should stay inside an app or service
- how workspace dependencies work
- how package exports define a public API
- how shared libraries create both reuse and coupling
- how to avoid "utils dumping grounds"
- how to design shared middleware, errors, test utilities, and infrastructure clients
- how shared packages work in the Artistry Cart Nx monorepo

## Files In This Topic

1. [Why Shared Packages Exist](./01-why-shared-packages-exist.md)
2. [Package Boundaries And Ownership](./02-package-boundaries-and-ownership.md)
3. [Public APIs, Index Files, And Package Exports](./03-public-apis-index-files-package-exports.md)
4. [Workspace Dependencies And Build Flow](./04-workspace-dependencies-and-build-flow.md)
5. [Designing Shared Runtime Libraries](./05-designing-shared-runtime-libraries.md)
6. [Designing Shared Test Utilities](./06-designing-shared-test-utilities.md)
7. [Coupling, Versioning, And Anti-Patterns](./07-coupling-versioning-antipatterns.md)
8. [Interview Questions And Answer Patterns](./08-interview-questions-and-answer-patterns.md)

## How To Study This Topic

Keep this principle in mind:

> Shared code should reduce real duplication without erasing ownership.

Good shared packages make services more consistent. Bad shared packages make every service secretly depend on every other service.

## Connection To Artistry Cart

Artistry Cart has several shared packages:

- `packages/error-handler`
- `packages/middleware`
- `packages/libs`
- `packages/utils`
- `packages/test-utils`

These packages support backend services, frontend apps, Kafka, Redis, Prisma, ImageKit, middleware, error handling, and tests. They are one of the main reasons an Nx monorepo is useful for this project.

