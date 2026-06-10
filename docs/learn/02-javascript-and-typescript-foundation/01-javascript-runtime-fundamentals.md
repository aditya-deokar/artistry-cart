# JavaScript Runtime Fundamentals

## What JavaScript Is

JavaScript is a high-level, dynamically typed programming language used in browsers, Node.js, and many server-side runtimes.

In this repo:

- browser JavaScript powers interactive UI
- Node.js runs backend services and scripts
- TypeScript compiles to JavaScript before execution

Interview answer:

> JavaScript is the runtime language. TypeScript adds static types during development, but the code that actually runs in Node.js or the browser is JavaScript.

## Browser Runtime Versus Node.js Runtime

JavaScript needs a runtime environment.

### Browser runtime

Provides:

- DOM APIs
- `window`
- `document`
- `fetch`
- browser storage
- timers
- events

Used by:

- React components
- client-side hooks
- browser API calls

### Node.js runtime

Provides:

- file system APIs
- HTTP server APIs
- process environment
- module loading
- networking
- streams

Used by:

- Express services
- build scripts
- test runners
- backend utilities

## JavaScript Engine

A JavaScript engine parses, compiles, and executes JavaScript.

Examples:

- V8 in Chrome and Node.js
- SpiderMonkey in Firefox
- JavaScriptCore in Safari

The engine handles:

- parsing source code
- compiling or interpreting code
- memory allocation
- garbage collection
- executing functions

## Call Stack

The call stack tracks currently running function calls.

Example:

```ts
function a() {
  b();
}

function b() {
  c();
}

function c() {
  console.log("done");
}

a();
```

Execution:

```text
a pushed onto stack
b pushed onto stack
c pushed onto stack
c finishes and pops
b finishes and pops
a finishes and pops
```

If functions call too deeply, you get:

```text
Maximum call stack size exceeded
```

## Heap

The heap is memory where objects and dynamic data live.

Example:

```ts
const user = {
  id: "u1",
  name: "Asha",
};
```

The variable `user` references an object in memory.

## Primitive Values

Common primitive types:

- `string`
- `number`
- `boolean`
- `undefined`
- `null`
- `bigint`
- `symbol`

Primitive values are compared by value.

Example:

```ts
"a" === "a"; // true
1 === 1; // true
```

## Reference Values

Objects, arrays, and functions are reference values.

Example:

```ts
const a = { id: 1 };
const b = { id: 1 };

console.log(a === b); // false
```

They look the same, but they are different objects in memory.

## Mutability

Objects and arrays can be mutated.

```ts
const user = { name: "Asha" };
user.name = "Ravi";
```

Even though `user` is `const`, the object it references can still change.

`const` protects reassignment, not deep immutability.

Interview answer:

> `const` means the variable binding cannot be reassigned. It does not make the object immutable.

## Equality

Use strict equality:

```ts
=== 
!== 
```

Avoid loose equality:

```ts
==
!=
```

Loose equality performs type coercion, which can produce surprising results.

## Truthy And Falsy

Falsy values:

```text
false
0
""
null
undefined
NaN
```

Everything else is truthy.

Common pattern:

```ts
if (!userId) {
  throw new Error("Missing user id");
}
```

Be careful: this treats `""`, `0`, `null`, and `undefined` similarly.

## Garbage Collection

JavaScript automatically frees memory that is no longer reachable.

Example:

```ts
let user = { id: "u1" };
user = null;
```

If no references remain to the original object, it becomes eligible for garbage collection.

Common memory leak sources:

- unremoved event listeners
- global caches that grow forever
- timers that never stop
- large objects kept in closures
- unbounded arrays/maps

## Interview Explanation

If asked "How does JavaScript execute?", say:

> JavaScript runs inside a runtime like the browser or Node.js. The engine executes synchronous code on a call stack and stores objects in heap memory. JavaScript is single-threaded for normal execution, but runtimes provide asynchronous APIs like timers, network calls, and file operations. Completed async work is scheduled back into the event loop.

## Connection To Artistry Cart

This matters in the repo because:

- backend services run on Node.js
- frontend components run in the browser
- shared packages must avoid browser-only APIs if used by backend services
- async API handlers should not block the event loop
- large caches or background jobs need memory discipline

