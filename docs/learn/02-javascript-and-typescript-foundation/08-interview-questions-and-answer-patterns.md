# Interview Questions And Answer Patterns

This file gives interview-ready answers for JavaScript and TypeScript foundations.

## Question: What Is JavaScript?

Strong answer:

> JavaScript is a high-level, dynamically typed language that runs in browsers and server runtimes like Node.js. In browsers it powers UI behavior and uses browser APIs like the DOM and fetch. In Node.js it can run servers, scripts, and backend services.

## Question: What Is TypeScript?

Strong answer:

> TypeScript is a typed superset of JavaScript. It adds compile-time type checking, which helps catch errors before runtime and makes large codebases easier to refactor. It compiles to JavaScript, so the production runtime still executes JavaScript.

## Question: Does TypeScript Validate Runtime Data?

Strong answer:

> No. TypeScript types are erased at runtime. If data comes from a request body, environment variable, database, Kafka message, or third-party API, we still need runtime validation with checks or schema libraries like Zod.

## Question: Explain The Event Loop.

Strong answer:

> JavaScript runs synchronous code on a call stack. Async operations like timers, network calls, or database queries are handled by the runtime. When they complete, their callbacks or promise continuations are queued. The event loop runs queued work when the call stack is empty. Promise continuations run as microtasks, which are processed before the next task.

## Question: What Is The Output?

Code:

```ts
console.log("A");

setTimeout(() => console.log("B"), 0);

Promise.resolve().then(() => console.log("C"));

console.log("D");
```

Answer:

```text
A
D
C
B
```

Explanation:

> `A` and `D` run synchronously. The promise callback is a microtask, so it runs after synchronous code but before the timer task. The timeout callback runs last.

## Question: What Is A Promise?

Strong answer:

> A promise represents a future value. It can be pending, fulfilled, or rejected. It is used to model asynchronous operations such as network requests or database queries.

## Question: What Does Async/Await Do?

Strong answer:

> `async/await` is syntax over promises. An async function returns a promise. `await` pauses that function until the promise settles, but it does not block the whole JavaScript runtime. The continuation runs later through the event loop.

## Question: What Is A Closure?

Strong answer:

> A closure happens when a function remembers variables from its outer lexical scope even after the outer function has finished. Closures are used in callbacks, middleware factories, React hooks, private state, and memoization.

## Question: What Is Hoisting?

Strong answer:

> Hoisting means JavaScript registers declarations before executing code. Function declarations can be called before their location in the file. `let` and `const` are hoisted too, but they cannot be used before initialization because of the temporal dead zone.

## Question: Difference Between `let`, `const`, And `var`?

Strong answer:

> `var` is function-scoped and can be redeclared, so it is avoided in modern code. `let` is block-scoped and can be reassigned. `const` is block-scoped and cannot be reassigned. However, a `const` object can still have its properties mutated.

## Question: Difference Between Primitive And Reference Values?

Strong answer:

> Primitives like strings, numbers, booleans, null, and undefined are compared by value. Objects, arrays, and functions are reference values, so two separate objects with the same fields are not equal unless they reference the same object.

## Question: What Is A Generic In TypeScript?

Strong answer:

> A generic lets a function or type work with different types while preserving type information. For example, `ApiResponse<T>` can represent an API response containing a `Product`, `Order`, or `User` without using `any`.

## Question: Interface Versus Type?

Strong answer:

> Both can describe object shapes. Interfaces are often used for public object contracts and can be extended or merged. Type aliases are more flexible for unions, intersections, utility types, and composed types. In practice, consistency within the codebase matters most.

## Question: Unknown Versus Any?

Strong answer:

> `any` disables type checking, so TypeScript stops helping. `unknown` means the value can be anything, but we must narrow or validate it before using it. For untrusted external data, `unknown` is safer.

## Question: What Is A Discriminated Union?

Strong answer:

> A discriminated union models multiple variants using a common field, such as `status` or `type`. TypeScript can narrow the variant based on that field, which is useful for events, state machines, payment states, and API results.

Example:

```ts
type Result =
  | { ok: true; data: Product }
  | { ok: false; error: string };
```

## Question: CommonJS Versus ESM?

Strong answer:

> CommonJS is the older Node.js module system using `require` and `module.exports`. ESM is the modern JavaScript module system using `import` and `export`. Modern TypeScript and Node projects often use ESM or NodeNext resolution, but many packages still support CommonJS.

## Question: What Are Package Exports?

Strong answer:

> Package exports define the public import paths of a package. They let package authors control what consumers can import, such as the root entry point or subpaths like `@artistry-cart/utils/kafka`. This keeps internal files private and makes package boundaries clearer.

## Question: How Do You Write Clean Reusable TypeScript?

Strong answer:

> I define clear input and output types at function and package boundaries, avoid `any`, validate external data at runtime, separate controllers from business logic, centralize error handling, and keep shared packages focused on infrastructure or contracts. I use generics and utility types when they reduce duplication, but I avoid overly clever types that make code hard to read.

## Project-Specific Pitch

> In Artistry Cart, JavaScript runs in both the browser and Node.js. TypeScript gives typed contracts across Next.js apps, Express services, shared middleware, Kafka utilities, Prisma access, and tests. The important distinction is that TypeScript protects development-time boundaries, while runtime validation is still needed for HTTP requests, environment variables, Kafka messages, and third-party API responses.

