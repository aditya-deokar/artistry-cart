# Designing Shared Test Utilities

## Why Shared Test Utilities Exist

Tests often need repeated setup:

- fake users
- auth tokens
- request helpers
- data factories
- global setup
- custom matchers
- common mocks

Without shared test utilities, every service duplicates test setup.

## Test Utilities Are Different From Runtime Packages

Test utilities should help tests.

They should not become production dependencies.

Good:

```text
packages/test-utils
  data factories
  request helpers
  auth helpers
  test setup
```

Bad:

```text
production service imports test factory
```

## Data Factories

Factories create test data.

Example:

```ts
const user = createUserFactory({
  role: "seller",
});
```

Benefits:

- tests are shorter
- defaults are consistent
- edge cases can override fields

Good factory design:

- returns valid data by default
- allows overrides
- does not hide important test behavior

## Request Helpers

Request helpers make API tests easier.

Example:

```ts
await request(app)
  .post("/auth/login")
  .send(loginInput)
  .expect(200);
```

A helper can wrap common headers or auth setup.

## Auth Helpers

Auth-heavy systems need helpers for:

- creating fake JWTs
- setting auth cookies
- creating seller/admin users
- testing unauthorized requests

Be careful:

> Auth helpers should help tests, not bypass the behavior under test accidentally.

## Global Setup

Global setup can prepare:

- environment variables
- database test state
- custom matchers
- shared mocks

Keep it predictable. Hidden global state makes tests flaky.

## Avoid Over-Abstraction In Tests

Bad:

```ts
await setupEverythingAndCreateMagicOrder();
```

If helpers hide too much, tests become hard to understand.

Good helpers make intent clearer:

```ts
const seller = createSeller();
const product = createProduct({ sellerId: seller.id });
```

## Test Utility Boundaries

Rules:

- test utilities should be imported only by tests
- runtime code should not depend on test packages
- helpers should be stable and simple
- service-specific test setup can stay near that service
- cross-service helpers belong in shared test package

## Interview Explanation

If asked "Why have shared test utilities?", say:

> Shared test utilities reduce duplicated setup across services by providing factories, auth helpers, request helpers, mocks, and global setup. They make tests faster to write and more consistent, but they should stay test-only and not hide the actual behavior being tested.

## Connection To Artistry Cart

Artistry Cart uses:

```text
packages/test-utils
```

for:

- request helpers
- auth helpers
- data factories
- custom matchers
- global setup

This supports consistent tests across backend services.

