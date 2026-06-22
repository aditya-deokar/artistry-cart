# API Security, Secrets, Rate Limits, And Hardening

## Secure API Design

Secure APIs should:

- validate input
- authenticate protected routes
- authorize by role and ownership
- avoid leaking internal errors
- use consistent status codes
- limit request body size
- rate limit risky endpoints
- log safely
- use HTTPS in production

## Input Validation

Validate:

- body
- params
- query
- headers
- cookies
- webhooks
- Kafka messages

TypeScript alone is not runtime validation.

## Secrets Management

Secrets include:

- JWT secrets
- OAuth client secrets
- Stripe secret key
- Stripe webhook secret
- SMTP password
- database URL/password
- AI provider keys

Secrets should:

- not be committed
- not be exposed to frontend
- be rotated when leaked
- be scoped by environment
- be stored in platform secret systems in production

## Public Frontend Variables

Anything public in frontend is visible to users.

Safe:

```text
NEXT_PUBLIC_SERVER_URI
Stripe publishable key
```

Unsafe:

```text
JWT signing secret
Stripe secret key
OAuth client secret
database URL with password
```

## Rate Limiting

Rate limiting reduces abuse.

Apply to:

- login
- registration
- password reset
- OAuth callback abuse
- AI generation
- checkout attempts
- public search

Common response:

```text
429 Too Many Requests
```

Redis is often used for distributed rate limit counters.

## Request Size Limits

Large request bodies can cause memory or CPU issues.

Use JSON body limits and special upload handling.

Example:

```text
AI/image upload endpoints need careful file limits.
```

## Security Headers

Useful headers:

- Content-Security-Policy
- Strict-Transport-Security
- X-Content-Type-Options
- X-Frame-Options
- Referrer-Policy

They reduce browser attack surface.

## Logging Security

Log:

- request id
- route
- status
- safe user id
- error code

Do not log:

- passwords
- tokens
- cookies
- secret keys
- raw payment data
- sensitive provider responses

## Dependency Security

Keep dependencies updated and monitor vulnerabilities.

Use:

- lockfile discipline
- CI security checks
- dependency scanning
- minimal package usage where possible

## Interview Explanation

If asked "How do you secure APIs?", say:

> I validate all external input, enforce backend authentication and authorization, protect secrets, use secure cookie settings, rate limit risky endpoints, limit request sizes, avoid leaking internal errors, log safely, use HTTPS in production, and monitor dependencies and suspicious behavior.

## Connection To Artistry Cart

Security hardening applies to:

- `auth-service` login/OAuth/token flows
- `order-service` Stripe/webhook flows
- `product-service` seller operations
- `aivision-service` expensive AI endpoints
- `api-gateway` CORS/routing behavior
- `.env` and Kubernetes secrets/config

