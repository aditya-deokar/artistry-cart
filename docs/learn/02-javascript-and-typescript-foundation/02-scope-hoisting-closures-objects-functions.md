# Scope, Hoisting, Closures, Objects, And Functions

## Scope

Scope determines where variables can be accessed.

Main types:

- global scope
- module scope
- function scope
- block scope

Example:

```ts
function createUser() {
  const name = "Asha";
  return name;
}

console.log(name); // error
```

`name` exists only inside the function.

## `var`, `let`, And `const`

### `var`

- function-scoped
- hoisted
- can be redeclared
- avoid in modern code

### `let`

- block-scoped
- can be reassigned
- cannot be redeclared in same scope

### `const`

- block-scoped
- cannot be reassigned
- object contents can still mutate

Preferred rule:

```text
Use const by default.
Use let when reassignment is needed.
Avoid var.
```

## Hoisting

Hoisting means declarations are processed before code executes.

Function declarations are hoisted:

```ts
sayHello();

function sayHello() {
  console.log("hello");
}
```

`let` and `const` are also hoisted but are not usable before initialization. This period is called the temporal dead zone.

Example:

```ts
console.log(name); // ReferenceError
const name = "Asha";
```

Interview answer:

> Hoisting means JavaScript registers declarations before execution. Function declarations can be called before they appear. `let` and `const` are hoisted too, but accessing them before initialization throws because of the temporal dead zone.

## Closures

A closure is when a function remembers variables from its outer scope even after that outer function has finished.

Example:

```ts
function createCounter() {
  let count = 0;

  return function increment() {
    count += 1;
    return count;
  };
}

const counter = createCounter();
counter(); // 1
counter(); // 2
```

The inner function remembers `count`.

## Why Closures Matter

Closures are used for:

- private state
- callbacks
- event handlers
- React hooks
- middleware factories
- memoization
- dependency injection

Example middleware factory:

```ts
function requireRole(role: string) {
  return function middleware(req, res, next) {
    if (req.user?.role !== role) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}
```

The middleware remembers `role`.

## Objects

Objects group related data and behavior.

```ts
const product = {
  id: "p1",
  name: "Handmade Bowl",
  price: 1500,
};
```

Access:

```ts
product.name;
product["name"];
```

## Object Destructuring

```ts
const { id, name } = product;
```

Useful in controllers:

```ts
const { email, password } = req.body;
```

## Spread Operator

Create a shallow copy:

```ts
const updatedProduct = {
  ...product,
  price: 1800,
};
```

Important:

> Spread is shallow. Nested objects are still shared references.

## Arrays

Arrays store ordered lists.

Common methods:

```ts
products.map(...)
products.filter(...)
products.find(...)
products.some(...)
products.every(...)
products.reduce(...)
```

Use immutable patterns when possible:

```ts
const activeProducts = products.filter((product) => product.active);
```

## Functions

Functions are first-class values in JavaScript.

That means you can:

- assign them to variables
- pass them as arguments
- return them from functions
- store them in objects

Example:

```ts
const validate = (input: unknown) => {
  return Boolean(input);
};
```

## Arrow Functions Versus Function Declarations

Function declaration:

```ts
function add(a: number, b: number) {
  return a + b;
}
```

Arrow function:

```ts
const add = (a: number, b: number) => a + b;
```

Important difference:

> Arrow functions do not have their own `this`.

This matters more in classes and object methods than in most functional backend code.

## `this`

`this` depends on how a function is called.

In modern TypeScript backend/frontend code, you often avoid complex `this` behavior by using:

- pure functions
- arrow functions
- classes carefully
- explicit parameters

## Interview Explanation

If asked "What is a closure?", say:

> A closure is created when a function keeps access to variables from its outer lexical scope even after the outer function has returned. It is useful for callbacks, private state, middleware factories, and React hooks.

## Connection To Artistry Cart

You will see these concepts in:

- React hooks that capture state
- Express middleware factories
- route handlers destructuring request data
- services mapping and filtering database results
- shared utility functions
- validation helpers

