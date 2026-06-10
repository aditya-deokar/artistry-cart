# Modules, ESM, CommonJS, And Package Exports

## Why Modules Exist

Modules let code be split into files and reused safely.

Without modules, everything would live in one global namespace.

Modules give:

- encapsulation
- imports and exports
- reusable packages
- clearer dependencies
- better testing

## ES Modules

ES modules use `import` and `export`.

```ts
export function add(a: number, b: number) {
  return a + b;
}
```

Import:

```ts
import { add } from "./math";
```

Default export:

```ts
export default function add(a: number, b: number) {
  return a + b;
}
```

Import default:

```ts
import add from "./math";
```

## CommonJS

CommonJS uses `require` and `module.exports`.

```js
const fs = require("fs");

module.exports = {
  add,
};
```

CommonJS is older and common in Node.js ecosystems.

## ESM Versus CommonJS

| Feature | ESM | CommonJS |
| --- | --- | --- |
| Syntax | `import/export` | `require/module.exports` |
| Loading | more static | more dynamic |
| Browser standard | yes | no |
| Modern TypeScript/Node | preferred | still common |

## Why This Gets Confusing

Many Node.js projects mix:

- TypeScript source
- compiled JavaScript output
- package `type` field
- `moduleResolution`
- CJS dependencies
- ESM dependencies

This repo uses TypeScript settings with:

```json
"module": "nodenext",
"moduleResolution": "nodenext"
```

That means TypeScript follows modern Node.js module resolution behavior.

## Named Exports Versus Default Exports

Named exports:

```ts
export function createClient() {}
export function closeClient() {}
```

Import:

```ts
import { createClient } from "@artistry-cart/utils";
```

Default export:

```ts
export default createClient;
```

Named exports are often clearer in shared packages because imports remain explicit.

## Barrel Files

A barrel file re-exports from several files.

Example `index.ts`:

```ts
export * from "./kafka/client";
export * from "./kafka/analytics-producer";
```

Benefits:

- cleaner imports
- central public API

Risk:

- exporting too much internal code
- circular dependencies

## Package Exports

Package exports define what consumers can import.

Example from a shared package shape:

```json
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
```

This allows imports like:

```ts
import { createKafkaClient } from "@artistry-cart/utils/kafka";
```

Package exports are important because they define the public contract of a package.

## Workspace Packages

In pnpm workspaces, packages can depend on each other using:

```json
"@artistry-cart/utils": "workspace:*"
```

This means:

> Use the local workspace package, not a remote npm package.

Benefits:

- local development is fast
- package changes can be tested immediately
- cross-package refactors are easier

## Public API Versus Internal Files

Good package design separates:

- public exports
- internal implementation

Consumers should import from package entry points:

```ts
import { isAuthenticated } from "@artistry-cart/middleware";
```

Avoid importing internal files:

```ts
import { isAuthenticated } from "../../packages/middleware/isAuthenticated";
```

Internal imports create fragile coupling.

## Circular Dependencies

A circular dependency happens when:

```text
A imports B
B imports A
```

Problems:

- undefined values at runtime
- hard-to-debug initialization behavior
- confusing boundaries

Avoid by:

- extracting shared types/helpers
- reversing dependency direction
- using dependency injection
- keeping package layers clear

## Interview Explanation

If asked "What is the difference between ESM and CommonJS?", say:

> ESM is the modern JavaScript module system using `import` and `export`. CommonJS is the older Node.js module system using `require` and `module.exports`. Modern TypeScript and Node projects often prefer ESM or NodeNext resolution, but many dependencies still support CommonJS, so understanding both matters.

## Connection To Artistry Cart

This repo uses package exports and workspace dependencies for shared libraries such as:

- `@artistry-cart/error-handler`
- `@artistry-cart/middleware`
- `@artistry-cart/libs`
- `@artistry-cart/utils`
- `@artistry-cart/test-utils`

Good imports preserve boundaries. Bad relative imports across package internals make the monorepo harder to maintain.

