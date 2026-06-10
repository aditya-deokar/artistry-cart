# Authentication And Security In Artistry Cart

## Auth Boundary

Authentication belongs mainly to:

```text
apps/auth-service
```

Shared auth support belongs to:

```text
packages/middleware
```

Frontend auth experience lives in:

```text
apps/user-ui
apps/seller-ui
```

## High-Level Auth Flow

```text
browser
  -> user-ui or seller-ui
  -> api-gateway
  -> auth-service
  -> MongoDB/Redis/OAuth/SMTP
  -> cookie/token response
```

## Auth Service Responsibilities

`auth-service` owns:

- registration
- login
- password hashing
- token/cookie issuance
- refresh behavior
- OAuth callbacks
- user activation
- seller activation/onboarding auth flows
- email templates for auth flows

## Middleware Responsibilities

`packages/middleware` can own:

- `isAuthenticated`
- `isAdmin`
- `authorizedRoles`
- shared auth request contract

It should not own:

- product ownership rules
- order ownership rules
- service-specific business decisions

## Frontend Responsibilities

Frontend apps should:

- show login/signup UI
- call auth APIs
- handle redirects
- show logged-in state
- protect routes for UX
- include credentials in API calls where needed

Frontend apps should not:

- store backend secrets
- make final authorization decisions
- trust role claims without backend checks

## Seller Security

Seller flows need:

- authenticated user
- seller role/status
- shop ownership checks
- product ownership checks
- order access checks

Example:

```text
seller can edit own product
seller cannot edit another seller's product
```

## Payment Security

Payment security belongs mainly to `order-service`.

Needs:

- Stripe secret backend-only
- webhook signature verification
- idempotent webhook handling
- trusted backend total calculation
- safe order state transitions

## AI Endpoint Security

AI endpoints can be expensive.

Protect with:

- authentication where needed
- rate limits
- input validation
- usage tracking
- provider key secrecy
- request size limits

## Security Maturity Improvements

Good next steps:

- formal auth contract docs
- stricter role/ownership tests
- typed request user augmentation
- rate limiting on auth and AI endpoints
- CSRF review for cookie flows
- security headers at gateway/frontend
- audit logging for sensitive actions
- secret rotation plan
- dependency vulnerability scanning

## Interview Explanation

If asked "How is auth designed in Artistry Cart?", say:

> Auth is centered in `auth-service`, which owns login, registration, OAuth, cookies/tokens, and identity flows. Shared middleware handles reusable authentication and role checks. Domain services still enforce ownership rules, such as seller product ownership or order access. Frontend route protection improves UX, but backend middleware and service checks enforce real security.

