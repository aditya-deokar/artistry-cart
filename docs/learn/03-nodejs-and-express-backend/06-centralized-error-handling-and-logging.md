# Centralized Error Handling And Logging

## Why Error Handling Matters

APIs fail for many reasons:

- invalid input
- missing auth
- forbidden access
- database failure
- downstream service timeout
- external provider failure
- unexpected code bug

Good error handling makes failures:

- consistent for clients
- useful for developers
- safe for users
- observable in production

## Bad Error Handling

Bad patterns:

```ts
res.status(500).json(error);
```

Problems:

- may leak stack traces
- may leak secrets
- inconsistent response shape
- hard for frontend to handle
- hard to log consistently

## Good Error Response Shape

Example:

```json
{
  "success": false,
  "message": "Product not found",
  "code": "PRODUCT_NOT_FOUND"
}
```

For validation:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "price",
      "message": "Price must be positive"
    }
  ]
}
```

## Custom Error Classes

Example:

```ts
class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code = "APP_ERROR"
  ) {
    super(message);
  }
}
```

Usage:

```ts
throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
```

## Centralized Error Middleware

Express error middleware:

```ts
function errorMiddleware(error, req, res, next) {
  const statusCode = error.statusCode ?? 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500 ? "Internal server error" : error.message,
    code: error.code ?? "INTERNAL_ERROR",
  });
}
```

Register it after routes:

```ts
app.use(errorMiddleware);
```

## Operational Versus Programmer Errors

Operational errors are expected failure cases:

- invalid credentials
- product not found
- payment declined
- rate limit exceeded
- database temporarily unavailable

Programmer errors are bugs:

- undefined property access
- wrong assumptions
- unhandled null
- logic bug

Operational errors should become clean API responses. Programmer errors should be logged and fixed.

## Logging

Logs are records of what happened.

Useful log fields:

- timestamp
- level
- service name
- request id
- user id if safe
- method
- path
- status code
- duration
- error code
- stack trace for internal logs

Log levels:

```text
debug
info
warn
error
```

## Request IDs

A request id connects logs across the lifecycle.

Example:

```text
request id: req_123
gateway log -> product-service log -> database error log
```

In distributed systems, request ids or trace ids are essential.

## What Not To Log

Never log:

- passwords
- access tokens
- refresh tokens
- Stripe secret keys
- OAuth secrets
- full credit card data
- private user data unless truly needed and protected

## Error Handling With Async Routes

Pattern:

```ts
async function handler(req, res, next) {
  try {
    const result = await service.doWork();
    res.json(result);
  } catch (error) {
    next(error);
  }
}
```

Or async wrapper:

```ts
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

## Downstream Errors

If a service calls another service or external provider, handle failure intentionally.

Examples:

- gateway cannot reach product service -> `502 Bad Gateway`
- downstream service times out -> `504 Gateway Timeout`
- database unavailable -> `503 Service Unavailable`
- Stripe payment failure -> domain-specific payment error

## Shared Error Package

In Artistry Cart, shared error behavior belongs in:

```text
packages/error-handler
```

Benefits:

- consistent error classes
- consistent Express error middleware
- fewer duplicated response shapes
- easier test coverage

## Interview Explanation

If asked "How do you handle errors in Express?", say:

> I use custom error classes for expected application errors and a centralized Express error middleware registered after all routes. Controllers pass errors with `next(error)`, and the middleware maps them to consistent HTTP responses. Internal errors are logged with context, but sensitive details and stack traces are not exposed to clients.

## Connection To Artistry Cart

Error and logging discipline matters for:

- login failures
- seller authorization failures
- product not found
- payment/webhook errors
- Kafka consumer failures
- AI provider failures
- gateway downstream errors

