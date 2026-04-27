# Error Handler

## Overview

`packages/error-handler` provides the shared error vocabulary and Express error middleware used across backend services.

It gives the platform a common way to represent operational failures, validation problems, auth failures, database issues, and unexpected internal errors.

## What It Contains

- base `AppError` class
- typed subclasses such as:
  - `NotFoundError`
  - `ValidationError`
  - `AuthError`
  - `ForbiddenError`
  - `DatabaseError`
  - `RateLimitError`
  - `InternalServerError`
- shared `errorMiddleware` for Express apps

## Why It Exists

Without a shared error layer, each service would drift into its own response shape and failure semantics. This package keeps the backend closer to a single error contract even though the runtime is split across multiple services.

## Current Behavior

The middleware currently normalizes:

- custom `AppError` responses
- connection-refused style database failures
- Prisma initialization errors
- Prisma known request errors like duplicate records and missing records
- Zod validation failures
- a generic fallback `500` response

In non-production environments it returns the raw error message for unexpected failures. In production it returns a generic message.

## Where It Is Used

Visible usage includes:

- `auth-service`
- `product-service`
- `order-service`

AI Vision has its own local error middleware, which is a notable boundary difference.

## Strengths

- gives services a common failure vocabulary
- centralizes Prisma and validation error translation
- keeps route handlers cleaner

## Tradeoffs

- not every service uses the exact same error stack
- if the shared error model changes, multiple services inherit the blast radius
- response consistency depends on services actually routing all errors through the middleware

## Interview Notes

This package is a good example of a monorepo shared primitive that increases consistency without introducing business-domain coupling.
