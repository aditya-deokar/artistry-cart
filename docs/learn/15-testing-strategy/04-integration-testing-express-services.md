# Integration Testing Express Services

## What Integration Tests Verify

Integration tests verify that multiple parts work together.

For Express services, this often means:

```text
route
  -> middleware
  -> controller
  -> service
  -> database or mocked external client
  -> response
```

## Why Integration Tests Matter

Unit tests can pass while the actual API is broken.

Integration tests catch:

- route path mistakes
- middleware order bugs
- body parsing issues
- auth/cookie issues
- validation response shape
- database query problems
- error middleware behavior

## Supertest-Style API Tests

Supertest lets tests call an Express app without starting a real network server.

Example shape:

```ts
await request(app)
  .post("/auth/login")
  .send({ email, password })
  .expect(200);
```

This is useful for testing HTTP behavior directly.

## Test Database

Integration tests may use a test database.

Rules:

- never use production database
- use isolated test database
- clean up between tests
- seed only needed data
- make tests deterministic

## Testing Middleware

Test middleware through routes when possible.

Examples:

- missing token returns 401
- buyer role returns 403 for seller route
- seller role reaches handler
- invalid cookie is rejected

This verifies real request behavior.

## Testing Error Middleware

Test:

- known `AppError` maps to expected status
- validation error returns field errors
- unknown error returns safe `500`
- stack trace is not exposed in production response

## Testing Webhooks

Webhook integration tests should cover:

- valid signature
- invalid signature
- duplicate event
- payment success event
- payment failure event
- missing order id
- idempotent state transition

Use provider test helpers or controlled mocks.

## External Dependency Strategy

For integration tests, decide what is real and what is mocked.

Often real:

- Express app
- middleware
- validation
- test database

Often mocked:

- Stripe external network call
- SMTP email sending
- OAuth provider call
- AI provider call

## Interview Explanation

If asked "How do you integration test Express APIs?", say:

> I test the Express app through HTTP-like requests using tools such as Supertest. These tests cover routing, middleware, validation, controllers, error handling, and sometimes database behavior using a test database. I mock external providers like Stripe, SMTP, OAuth, or AI APIs to keep tests deterministic.

## Connection To Artistry Cart

Integration tests are valuable for:

- `auth-service` login/register/OAuth routes
- `product-service` product/shop/search routes
- `order-service` checkout/webhook routes
- `api-gateway` proxy route behavior
- `recommendation-service` recommendation endpoints
- `packages/middleware` auth/role behavior through route tests

