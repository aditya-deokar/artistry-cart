# Authentication And Security

This folder is the fourteenth learning block for preparing for a bigger engineering role. It explains authentication and application security from first principles, then connects those ideas to Artistry Cart.

The goal is to understand how users prove identity, how systems enforce permissions, how tokens/cookies/OAuth work, and how to reason about common web security risks in interviews.

## Learning Outcome

After completing this topic, you should be able to explain:

- authentication versus authorization
- password hashing and credential security
- sessions, JWTs, access tokens, refresh tokens, and cookies
- OAuth login flow
- role-based access control and ownership checks
- common web attacks such as XSS, CSRF, injection, and brute force
- CORS and secure browser communication
- secrets management and environment security
- rate limiting and abuse prevention
- secure API design for services
- how Artistry Cart handles auth and security concerns

## Files In This Topic

1. [Authentication And Authorization Fundamentals](./01-authentication-and-authorization-fundamentals.md)
2. [Passwords, Hashing, Sessions, JWT, And Cookies](./02-passwords-hashing-sessions-jwt-cookies.md)
3. [OAuth And Social Login](./03-oauth-and-social-login.md)
4. [Authorization, RBAC, Ownership, And Middleware](./04-authorization-rbac-ownership-middleware.md)
5. [Common Web Security Risks](./05-common-web-security-risks.md)
6. [API Security, Secrets, Rate Limits, And Hardening](./06-api-security-secrets-rate-limits-hardening.md)
7. [Authentication And Security In Artistry Cart](./07-authentication-and-security-in-artistry-cart.md)
8. [Interview Questions And Answer Patterns](./08-interview-questions-and-answer-patterns.md)

## Core Mental Model

```text
authentication = who are you?
authorization = what are you allowed to do?
security = how do we protect the system, users, data, and operations?
```

Frontend checks improve user experience. Backend checks enforce real security.

## Connection To Artistry Cart

Artistry Cart uses:

- `auth-service` for registration, login, OAuth, cookies/tokens, and identity flows
- `packages/middleware` for shared authentication and role middleware
- `api-gateway` to route auth-related requests
- `user-ui` and `seller-ui` for auth-aware frontend experiences
- environment variables for secrets such as JWT, OAuth, Stripe, SMTP, and AI keys

