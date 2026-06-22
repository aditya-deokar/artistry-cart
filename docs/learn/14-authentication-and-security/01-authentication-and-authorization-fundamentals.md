# Authentication And Authorization Fundamentals

## Authentication

Authentication answers:

```text
Who are you?
```

Examples:

- login with email and password
- login with Google OAuth
- verify a JWT
- validate a session cookie

Authentication proves identity.

## Authorization

Authorization answers:

```text
What are you allowed to do?
```

Examples:

- buyer can view own orders
- seller can create products for own shop
- admin can access admin-only routes
- user cannot edit another user's profile

Authorization happens after authentication.

## 401 Versus 403

`401 Unauthorized` means authentication failed or is missing.

Example:

```text
no token
expired token
invalid token
```

`403 Forbidden` means identity is known, but permission is missing.

Example:

```text
buyer tries to create seller product
seller tries to edit another seller's product
```

## Identity

Identity is the system's representation of a user.

Common fields:

- user id
- email
- role
- account status
- seller id if applicable

Identity should be stable. Do not use email as the only durable identity because emails can change.

## Principal

A principal is the actor making a request.

It may be:

- user
- seller
- admin
- service account
- background worker

Security decisions should identify the principal clearly.

## Trust Boundary

A trust boundary is where untrusted data enters the system.

Examples:

- browser request
- API gateway request
- webhook payload
- Kafka message
- environment variable
- OAuth provider response

At trust boundaries, validate input and verify identity.

## Frontend Auth Versus Backend Auth

Frontend auth:

- controls UI visibility
- redirects unauthenticated users
- improves UX

Backend auth:

- verifies every protected request
- enforces permissions
- protects data and operations

Important:

> Hiding a button is not security. Backend authorization is security.

## Interview Explanation

If asked "Authentication versus authorization?", say:

> Authentication verifies identity: who the user is. Authorization checks permissions: what that authenticated user can do. A request with no valid identity should get 401, while an authenticated user without permission should get 403.

## Connection To Artistry Cart

In Artistry Cart:

- `auth-service` owns authentication
- `packages/middleware` helps services verify auth and roles
- seller dashboard routes need both login and seller authorization
- product/order ownership checks should stay in owning services

