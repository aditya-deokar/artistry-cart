# Clean Reusable TypeScript Patterns

## What Clean Code Means Here

Clean TypeScript is not about clever syntax. It is code that is:

- easy to read
- easy to test
- explicit at boundaries
- predictable in errors
- small enough to reason about
- typed without becoming unreadable

## Keep Function Boundaries Clear

Good:

```ts
type CreateProductInput = {
  name: string;
  price: number;
  sellerId: string;
};

async function createProduct(input: CreateProductInput): Promise<Product> {
  // ...
}
```

Why:

- caller knows required data
- return type is clear
- tests are easier

## Separate Validation From Business Logic

Bad:

```ts
async function createProduct(req, res) {
  if (!req.body.name) {
    return res.status(400).json({ message: "Name required" });
  }

  // lots of business logic here
}
```

Better:

```ts
const input = validateCreateProduct(req.body);
const product = await productService.create(input);
res.status(201).json(product);
```

This gives separate responsibilities:

- controller handles HTTP
- validator handles input shape
- service handles business logic

## Prefer Explicit Domain Types

Avoid passing loose objects everywhere.

Bad:

```ts
function applyDiscount(data: any) {}
```

Better:

```ts
type DiscountInput = {
  price: number;
  discountPercent: number;
};

function applyDiscount(input: DiscountInput) {}
```

## Avoid Boolean Parameter Confusion

Bad:

```ts
createUser(user, true, false);
```

Better:

```ts
createUser(user, {
  sendWelcomeEmail: true,
  requireActivation: false,
});
```

Named options are easier to read and extend.

## Use Result Shapes For Expected Failures

Throwing is fine for exceptional errors. For expected business outcomes, a result type can be clearer.

```ts
type LoginResult =
  | { ok: true; user: User }
  | { ok: false; reason: "invalid_credentials" | "inactive_user" };
```

Then:

```ts
const result = await login(input);

if (!result.ok) {
  return res.status(401).json({ reason: result.reason });
}
```

## Centralize Error Handling

Use shared errors instead of random response shapes.

Example:

```ts
throw new AppError("Product not found", 404);
```

Then centralized middleware formats the response.

This is the role of packages like `packages/error-handler`.

## Dependency Injection By Parameter

Instead of importing everything deeply, pass dependencies where useful.

```ts
function createOrderService(deps: {
  paymentClient: PaymentClient;
  orderRepository: OrderRepository;
}) {
  return {
    async createOrder(input: CreateOrderInput) {
      // use deps
    },
  };
}
```

Benefits:

- easier testing
- fewer hidden dependencies
- clearer service boundaries

## Avoid Large Utility Files

Bad:

```text
utils.ts
  200 unrelated helpers
```

Better:

```text
formatting.ts
auth.ts
date.ts
kafka/
runtime/
```

Organize by purpose, not by "miscellaneous."

## Keep Shared Packages Infrastructure-Focused

Good shared package content:

- error handling
- middleware
- Kafka client
- Redis helper
- Prisma client
- test factories
- typed contracts

Risky shared package content:

- mixed product/order/auth business logic
- service-specific database queries
- random helpers from one feature

Shared packages should reduce duplication without erasing service ownership.

## Write Tests Around Contracts

For reusable functions, test:

- normal case
- edge case
- invalid input
- error behavior

Example:

```ts
describe("applyDiscount", () => {
  it("applies percentage discount", () => {
    expect(applyDiscount({ price: 100, discountPercent: 10 })).toBe(90);
  });
});
```

## Naming Patterns

Use names that reveal intent:

```ts
isAuthenticated
requireRole
createOrder
findProductById
publishAnalyticsEvent
validateCreateProductInput
```

Avoid vague names:

```ts
handleData
processThing
doStuff
helper
```

## Interview Explanation

If asked "How do you write reusable TypeScript?", say:

> I start by making boundaries explicit with input and output types. I keep HTTP concerns in controllers, business logic in services, validation at the edge, and shared infrastructure in packages. I avoid `any`, use runtime validation for external data, centralize error handling, and keep shared utilities focused so they do not become hidden coupling.

## Connection To Artistry Cart

Apply these patterns to:

- Express controllers in backend services
- shared middleware in `packages/middleware`
- error handling in `packages/error-handler`
- Kafka event helpers in `packages/utils`
- frontend API clients in `user-ui` and `seller-ui`
- test helpers in `packages/test-utils`

