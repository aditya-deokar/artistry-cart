# Unit Testing Strategy

## What Unit Tests Are Best For

Unit tests are best for focused logic.

Good candidates:

- validation functions
- price/discount calculations
- auth role helpers
- state transition rules
- error formatting
- DTO mapping
- event payload builders
- pure utility functions

## What Unit Tests Should Avoid

Avoid using unit tests as the only test for:

- database queries
- Express routing
- real middleware behavior
- payment provider integration
- Kafka consumer runtime behavior
- full auth cookie flow

Those need integration or e2e coverage.

## Pure Function Tests

Pure functions are easiest to unit test.

Example:

```ts
function calculateTotal(items: CartItem[]) {
  return items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
}
```

Test:

```ts
it("calculates total from item prices and quantities", () => {
  const total = calculateTotal([
    { price: 100, quantity: 2 },
    { price: 50, quantity: 1 },
  ]);

  expect(total).toBe(250);
});
```

## Edge Cases

Good unit tests cover edge cases:

- empty array
- zero quantity
- invalid status
- missing required field
- expired token
- unauthorized role
- duplicate event id

## Table-Driven Tests

Table tests reduce duplication for many cases.

Example:

```ts
it.each([
  ["buyer", false],
  ["seller", true],
  ["admin", true],
])("checks seller access for %s", (role, expected) => {
  expect(canAccessSellerDashboard(role)).toBe(expected);
});
```

## Mocking In Unit Tests

Mocks are useful when testing logic that depends on:

- email client
- payment client
- database repository
- Kafka producer
- clock/time

But too many mocks can make tests meaningless.

Good rule:

> Mock external boundaries, not the behavior you are trying to verify.

## Testing Errors

Test expected errors:

```ts
expect(() => validatePrice(-1)).toThrow("Price must be positive");
```

For async:

```ts
await expect(createOrder(invalidInput)).rejects.toThrow();
```

## Unit Tests In Shared Packages

Shared packages should have strong unit tests because many services depend on them.

Examples:

- `packages/error-handler`
- `packages/middleware`
- `packages/utils`
- `packages/test-utils`

If a shared package has a bug, blast radius can be large.

## Interview Explanation

If asked "What do you unit test?", say:

> I unit test focused business logic and pure functions: validation, calculations, state transitions, error formatting, event builders, and shared utilities. Unit tests should be fast and deterministic. I mock external dependencies only when needed and use integration tests for database, HTTP, and middleware wiring.

## Connection To Artistry Cart

Good Artistry Cart unit tests:

- auth helper behavior
- middleware role checks
- slugify/utils
- order total calculation
- webhook state transition rules
- analytics event validation
- shared error middleware formatting
- product discount validation

