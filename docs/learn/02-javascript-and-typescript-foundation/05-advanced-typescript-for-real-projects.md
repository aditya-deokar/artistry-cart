# Advanced TypeScript For Real Projects

## Generics

Generics let you write reusable typed code.

Example:

```ts
function identity<T>(value: T): T {
  return value;
}

const id = identity("p1"); // string
```

Real use:

```ts
type ApiResponse<T> = {
  success: boolean;
  data: T;
};
```

Then:

```ts
type ProductResponse = ApiResponse<Product>;
type OrderResponse = ApiResponse<Order>;
```

Interview answer:

> Generics let us parameterize types so reusable functions and data structures preserve type information instead of falling back to `any`.

## Generic Constraints

```ts
function getId<T extends { id: string }>(item: T) {
  return item.id;
}
```

This means `T` can be any type, but it must have an `id: string`.

## Utility Types

TypeScript includes built-in type helpers.

### Partial

Makes all properties optional.

```ts
type ProductUpdate = Partial<Product>;
```

Useful for PATCH-style updates.

### Pick

Selects specific fields.

```ts
type ProductCard = Pick<Product, "id" | "name" | "price">;
```

### Omit

Removes fields.

```ts
type PublicUser = Omit<User, "passwordHash">;
```

### Required

Makes optional fields required.

```ts
type CompleteUser = Required<User>;
```

### Record

Creates a key-value object type.

```ts
type FeatureFlags = Record<string, boolean>;
```

## Discriminated Unions

Discriminated unions are useful for modeling states and events.

```ts
type PaymentResult =
  | { status: "success"; paymentId: string }
  | { status: "failed"; reason: string };
```

Use:

```ts
function handlePayment(result: PaymentResult) {
  if (result.status === "success") {
    return result.paymentId;
  }

  return result.reason;
}
```

TypeScript narrows based on `status`.

## Exhaustiveness Checking

Use `never` to ensure all cases are handled.

```ts
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

function label(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "Pending";
    case "paid":
      return "Paid";
    case "shipped":
      return "Shipped";
    case "cancelled":
      return "Cancelled";
    default:
      return assertNever(status);
  }
}
```

If a new status is added, TypeScript can catch missing handling.

## Type Guards

A type guard is a function that narrows a type.

```ts
function isProduct(value: unknown): value is Product {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value
  );
}
```

Use:

```ts
if (isProduct(input)) {
  input.name;
}
```

For serious validation, prefer schema validators. Type guards are useful for small checks.

## `as const`

`as const` keeps literal types narrow.

```ts
const roles = ["buyer", "seller", "admin"] as const;
type Role = (typeof roles)[number];
```

Result:

```ts
type Role = "buyer" | "seller" | "admin";
```

## `satisfies`

`satisfies` checks that a value matches a type while preserving specific inference.

```ts
const ports = {
  auth: 6001,
  product: 6002,
} satisfies Record<string, number>;
```

Useful for config maps.

## Inferred Types From Constants

Example:

```ts
const eventTypes = {
  PRODUCT_VIEW: "product_view",
  ADD_TO_CART: "add_to_cart",
} as const;

type EventType = (typeof eventTypes)[keyof typeof eventTypes];
```

This helps avoid duplicated string unions.

## Typing API Boundaries

API boundaries should have explicit types:

```ts
type CreateOrderRequest = {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};

type CreateOrderResponse = {
  orderId: string;
  status: "pending" | "paid";
};
```

This improves:

- frontend-backend contracts
- tests
- refactoring
- documentation

## Typing Errors

Avoid throwing random strings.

Better:

```ts
class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
  }
}
```

Shared error types belong in a shared package, like `packages/error-handler`.

## Type Safety In Monorepos

In a monorepo, TypeScript helps shared packages expose stable contracts.

Example:

```text
packages/utils/kafka
  -> exports typed analytics events

apps/user-ui
  -> produces events

apps/kafka-service
  -> consumes events
```

The producer and consumer should agree on event shape.

## Common Advanced TypeScript Mistakes

- using `any` to silence real problems
- overusing generics when a simple type works
- making types too clever to read
- trusting TypeScript for runtime input validation
- leaking database types directly into public API contracts
- using `Partial<T>` where required fields should stay required

## Interview Explanation

If asked "How do you use TypeScript in large projects?", say:

> I use TypeScript to make boundaries explicit: API request/response types, domain models, event payloads, config objects, and shared package exports. I use generics and utility types where they reduce duplication, discriminated unions for state or event variants, and runtime validation for external input because TypeScript types are erased at runtime.

## Connection To Artistry Cart

Good candidates for advanced TypeScript here:

- analytics event contracts in `packages/utils/kafka`
- auth role types in middleware
- API request and response DTOs
- shared error shapes
- typed environment configuration
- order/payment state unions
- AI Vision workflow states

