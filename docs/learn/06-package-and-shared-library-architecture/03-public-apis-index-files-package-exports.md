# Public APIs, Index Files, And Package Exports

## What A Package Public API Is

A package public API is the set of imports that consumers are allowed to use.

Example:

```ts
import { isAuthenticated } from "@artistry-cart/middleware";
```

This is different from internal files inside the package.

## Why Public APIs Matter

Public APIs create stability.

They tell consumers:

- what can be imported
- what is supported
- what may change only carefully
- what is internal implementation detail

Without a public API, consumers may import any file, making refactoring painful.

## Index Files

An `index.ts` file often acts as a package entry point.

Example:

```ts
export * from "./isAuthenticated";
export * from "./isAdmin";
export * from "./authorizedRoles";
```

Consumer:

```ts
import { isAuthenticated, isAdmin } from "@artistry-cart/middleware";
```

## Barrel Files

Index files are sometimes called barrel files.

Benefits:

- cleaner imports
- one public entry point
- easier package discovery

Risks:

- exporting too much
- circular dependencies
- hiding large dependency chains

Use barrels intentionally.

## Package Exports

`package.json` can define `exports`.

Example:

```json
{
  "exports": {
    ".": {
      "types": "./index.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.js"
    },
    "./kafka": {
      "types": "./kafka/index.ts",
      "import": "./dist/kafka/index.js",
      "require": "./dist/kafka/index.js"
    }
  }
}
```

This controls import paths.

Allowed:

```ts
import { createKafkaClient } from "@artistry-cart/utils/kafka";
```

Blocked or unsupported:

```ts
import { createKafkaClient } from "@artistry-cart/utils/kafka/client/internal";
```

## Root Export Versus Subpath Export

Root export:

```ts
import { runtimeHelper } from "@artistry-cart/utils";
```

Subpath export:

```ts
import { createKafkaClient } from "@artistry-cart/utils/kafka";
```

Subpath exports are useful when a package has multiple focused areas.

Example:

```text
@artistry-cart/utils
@artistry-cart/utils/runtime
@artistry-cart/utils/kafka
```

## Types And Runtime Output

TypeScript packages often expose:

- source `.ts` files for types
- compiled `dist/*.js` for runtime

Example package fields:

```json
{
  "main": "./dist/index.js",
  "types": "./index.ts"
}
```

The type path helps TypeScript. The runtime path helps Node.js.

## Public API Design Rules

Good public APIs are:

- small
- documented
- stable
- named clearly
- implementation-independent
- hard to misuse

Bad public APIs:

- expose internal classes
- expose raw mutable state
- require consumers to know file layout
- export every file automatically
- mix unrelated concerns

## Breaking Changes

Changing a public API can break many consumers.

Examples:

- rename exported function
- change function parameters
- remove export
- change error shape
- change event payload type

In a monorepo, Nx can help find affected projects, but you still need careful migration.

## Interview Explanation

If asked "What are package exports?", say:

> Package exports define the supported import paths for a package. They act as the package's public API and prevent consumers from relying on internal files. This makes shared packages easier to refactor and keeps boundaries clean in a monorepo.

## Connection To Artistry Cart

Artistry Cart packages use public entry points like:

- `@artistry-cart/error-handler`
- `@artistry-cart/middleware`
- `@artistry-cart/libs`
- `@artistry-cart/utils`
- `@artistry-cart/utils/kafka`
- `@artistry-cart/test-utils`

These import paths should be preferred over deep relative imports.

