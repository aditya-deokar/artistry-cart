# TypeScript Fundamentals

## What TypeScript Is

TypeScript is JavaScript with static types.

It helps catch errors before runtime.

Example:

```ts
function formatPrice(price: number) {
  return price.toFixed(2);
}

formatPrice("100"); // TypeScript error
```

At runtime, TypeScript becomes JavaScript.

Interview answer:

> TypeScript adds compile-time type checking to JavaScript. It improves maintainability and catches many mistakes before code runs, but it does not enforce types at runtime unless we also validate data.

## Type Annotations

```ts
const productId: string = "p1";
const price: number = 1500;
const active: boolean = true;
```

Often TypeScript can infer types:

```ts
const productId = "p1"; // string
```

Prefer inference when obvious. Add annotations at function boundaries.

## Function Types

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

For async functions:

```ts
async function getUser(id: string): Promise<User> {
  return userRepository.findById(id);
}
```

## Object Types

```ts
type Product = {
  id: string;
  name: string;
  price: number;
  active: boolean;
};
```

Use it:

```ts
function formatProduct(product: Product) {
  return `${product.name}: ${product.price}`;
}
```

## Type Alias Versus Interface

Interface:

```ts
interface User {
  id: string;
  email: string;
}
```

Type alias:

```ts
type User = {
  id: string;
  email: string;
};
```

Both are common for object shapes.

General rule:

- use `interface` for public object contracts that may be extended
- use `type` for unions, utility types, and flexible compositions

## Optional Properties

```ts
type User = {
  id: string;
  name?: string;
};
```

`name` may be `string` or `undefined`.

Use carefully:

```ts
if (user.name) {
  console.log(user.name.toUpperCase());
}
```

## Union Types

A value can be one of several types:

```ts
type UserRole = "buyer" | "seller" | "admin";
```

This is better than arbitrary strings.

Example:

```ts
function requireRole(role: UserRole) {
  // ...
}
```

## Literal Types

```ts
type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";
```

Useful for state machines and API contracts.

## Narrowing

Narrowing means checking a type before using it.

```ts
function format(value: string | number) {
  if (typeof value === "string") {
    return value.toUpperCase();
  }

  return value.toFixed(2);
}
```

TypeScript understands the type inside each branch.

## Arrays

```ts
const products: Product[] = [];
```

Alternative:

```ts
const products: Array<Product> = [];
```

## Records

```ts
type ProductMap = Record<string, Product>;
```

Useful for dictionaries:

```ts
const productsById: Record<string, Product> = {};
```

## Unknown Versus Any

`any` disables type checking.

```ts
const input: any = getInput();
input.whatever.deep.call(); // allowed, dangerous
```

`unknown` forces validation before use.

```ts
const input: unknown = getInput();

if (typeof input === "string") {
  input.toUpperCase();
}
```

Prefer `unknown` for untrusted input.

## Runtime Validation

TypeScript does not validate external data at runtime.

External data includes:

- request body
- query params
- environment variables
- database data from loose schemas
- third-party API responses
- Kafka messages

Use runtime validators such as Zod when needed.

Example idea:

```ts
const CreateProductSchema = z.object({
  name: z.string(),
  price: z.number().positive(),
});
```

## Null And Undefined

With strict TypeScript, you must handle missing values.

```ts
function getLength(value?: string) {
  return value.length; // error
}
```

Fix:

```ts
function getLength(value?: string) {
  return value?.length ?? 0;
}
```

## Interview Explanation

If asked "Why TypeScript?", say:

> TypeScript catches type errors during development, makes API contracts clearer, improves refactoring, and helps teams understand data shapes across a codebase. It is especially useful in a monorepo because shared packages and services can expose typed contracts. But external data still needs runtime validation because TypeScript types disappear at runtime.

## Connection To Artistry Cart

TypeScript helps this repo because:

- services share package contracts
- route handlers need typed inputs and outputs
- middleware can attach typed user data to requests
- Kafka event payloads should be typed
- Prisma generates types from the schema
- frontend API clients benefit from typed response shapes

