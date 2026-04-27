# Redis And Caching

## Overview

`packages/libs/redis` provides a shared Redis integration layer with graceful degradation behavior.

Unlike many Redis wrappers, this one is intentionally designed so the application can continue running even when Redis is disabled or unavailable.

## What It Does

- reads `REDIS_ENABLED` and `REDIS_URL`
- lazily initializes a Redis client
- wraps common operations:
  - `get`
  - `set`
  - `del`
  - `keys`
  - `setex`
- exposes `isAvailable()`

## Design Philosophy

If Redis is disabled or unavailable:

- the wrapper logs the degraded mode
- operations return safe fallbacks such as `null`, `0`, or `[]`
- the app can keep running, though some features may degrade

## Why It Exists

This package centralizes:

- connection lifecycle
- retry behavior
- fallback semantics
- developer ergonomics

It also keeps Redis from becoming a brittle hard dependency for the whole stack.

## Where It Matters

Visible service usage includes:

- `auth-service`
- `order-service`

The exact feature impact depends on the path, but the docs and code both signal that some OTP or auxiliary fast-path behavior may be unavailable in degraded mode.

## Strengths

- resilient local development
- cleaner service code
- explicit fallback behavior

## Tradeoffs

- degraded mode can create behavior differences between ideal and fallback runtime
- developers need to know which features are best-effort
- graceful failure reduces outages, but it can also hide missing infrastructure if observability is weak

## Interview Notes

This is a good example of choosing availability and iteration speed over strict dependency enforcement.
