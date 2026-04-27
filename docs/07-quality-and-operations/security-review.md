# Security Review

## Overview

The current codebase shows several good security-conscious decisions, but the security posture is still mixed. There are clear protections in auth, cookies, OAuth, rate limiting, and Stripe webhook handling, but the implementation is not yet fully standardized across the platform.

## Current Strengths

### JWT and protected-route enforcement

- shared backend auth middleware verifies JWTs
- protected routes load the current account from the database
- seller and admin routes use explicit role guards

### Cookie settings

Auth cookies are:

- `httpOnly`
- `secure` in production
- `sameSite=lax` in development
- `sameSite=none` in production

This is a reasonable default strategy for cross-site production usage with local development ergonomics.

### OAuth protections

The OAuth provider layer uses Arctic and includes:

- generated state values
- generated code verifiers

That is a good sign for CSRF and PKCE-aware OAuth handling.

### Stripe webhook verification

`order-service`:

- reads the raw request body
- extracts `stripe-signature`
- verifies the event with `constructEvent`

This is the right pattern for Stripe webhooks.

### Rate limiting

Visible rate limiting exists in:

- `api-gateway` via `express-rate-limit`
- `aivision-service` via MongoDB-backed per-endpoint rate limiting

### Input validation

AI Vision uses Zod-backed validation middleware for body and query validation on important routes.

## Security Gaps And Inconsistencies

### Validation is uneven

Validation is strongest in AI Vision. Other services do not show the same centralized request validation posture in the inspected files.

### Secret and env naming inconsistencies

Examples:

- `STRIPE_SECRETE_KEY` spelling in code

Inconsistent secret naming is not just cosmetic. It increases operational error risk.

### Role and auth convention drift risk

The platform uses multiple auth paths:

- shared JWT auth
- AI Vision optional auth
- buyer and seller frontend refresh behaviors that are not identical

That flexibility is useful, but it increases the risk of contract drift.

### Gateway trust assumptions

The gateway trusts proxy headers and applies coarse rate limiting, but it does not appear to perform its own auth hydration. That means some rate-limit logic tied to `req.user` may not behave as intended unless upstream assumptions change.

## Additional Risks To Track

- no visible standardized CSRF documentation for state-changing cookie-based flows
- no visible centralized secrets-management or rotation story
- no visible audit-logging or security-event telemetry layer
- no visible standard security headers policy documented at the app layer

## Overall Assessment

Current posture is best described as:

- good foundational safeguards
- several strong point solutions
- still short of a uniformly hardened production security program

## Interview Framing

A strong answer here is:

- the system already protects the most sensitive boundaries reasonably well
- the next security maturity step is consistency, standard validation, and stronger operational controls
