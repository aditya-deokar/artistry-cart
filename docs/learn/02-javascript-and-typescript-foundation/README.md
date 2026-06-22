# JavaScript And TypeScript Foundation

This folder is the second learning block for preparing for a bigger engineering role. JavaScript and TypeScript are the language foundation behind this repo's Next.js frontends, Express backend services, shared packages, scripts, and tests.

The goal is to understand not only syntax, but also runtime behavior: how JavaScript executes, how async code works, why TypeScript helps, and how to explain these ideas clearly in interviews.

## Learning Outcome

After completing this topic, you should be able to explain:

- how JavaScript runs in browsers and Node.js
- call stack, heap, event loop, tasks, and microtasks
- `var`, `let`, `const`, scope, hoisting, and closures
- promises, async/await, and error handling
- object, array, and function patterns used in production code
- TypeScript types, interfaces, unions, generics, and narrowing
- CommonJS versus ES modules
- package exports and workspace package structure
- how to write clean reusable TypeScript for APIs, services, and shared libraries

## Files In This Topic

1. [JavaScript Runtime Fundamentals](./01-javascript-runtime-fundamentals.md)
2. [Scope, Hoisting, Closures, Objects, And Functions](./02-scope-hoisting-closures-objects-functions.md)
3. [Async JavaScript: Event Loop, Promises, And Async Await](./03-async-javascript-event-loop-promises-async-await.md)
4. [TypeScript Fundamentals](./04-typescript-fundamentals.md)
5. [Advanced TypeScript For Real Projects](./05-advanced-typescript-for-real-projects.md)
6. [Modules, ESM, CommonJS, And Package Exports](./06-modules-esm-commonjs-package-exports.md)
7. [Clean Reusable TypeScript Patterns](./07-clean-reusable-typescript-patterns.md)
8. [Interview Questions And Answer Patterns](./08-interview-questions-and-answer-patterns.md)

## How To Study This Topic

Read the JavaScript runtime files first, then TypeScript. TypeScript makes much more sense once JavaScript's runtime behavior is clear.

For interviews, keep this distinction sharp:

```text
JavaScript = runtime behavior
TypeScript = compile-time type checking on top of JavaScript
```

TypeScript does not change what runs in production. It helps you catch mistakes before JavaScript runs.

## Connection To Artistry Cart

This repo uses JavaScript and TypeScript across:

- `apps/user-ui`: Next.js, React, hooks, frontend API clients
- `apps/seller-ui`: dashboard components, forms, state, API clients
- backend services: Express routes, controllers, services, middleware
- `packages/error-handler`: reusable error classes and middleware
- `packages/middleware`: auth and role middleware
- `packages/utils`: Kafka and runtime utilities
- `packages/test-utils`: testing helpers and factories
- scripts and CI helpers under `tools/` and `scripts/`

