# Interview Questions And Answer Patterns

This file gives interview-ready answers for authentication and security.

## Question: Authentication Versus Authorization?

Strong answer:

> Authentication verifies identity: who the user is. Authorization checks permissions: what that user is allowed to do. Missing or invalid identity should return 401, while authenticated users without permission should return 403.

## Question: How Should Passwords Be Stored?

Strong answer:

> Passwords should never be stored in plain text. They should be hashed with a slow password hashing algorithm such as bcrypt, argon2, or scrypt. During login, the submitted password is compared against the stored hash.

## Question: How Does JWT Auth Work?

Strong answer:

> After login, the backend issues a signed access token, often with a refresh token. The access token is short-lived and used for API requests. The refresh token is longer-lived and used to renew access. JWT payloads are signed but not encrypted by default, so secrets should not be stored inside them.

## Question: Session Versus JWT?

Strong answer:

> Sessions store auth state on the server and send a session id to the browser, usually in a cookie. JWTs store signed claims in the token so the server can verify them without a session lookup. Sessions are easier to revoke centrally; JWTs are convenient for stateless verification but need careful expiry and refresh handling.

## Question: Why Use HttpOnly Cookies?

Strong answer:

> HttpOnly cookies cannot be read by browser JavaScript, which helps protect tokens from XSS token theft. The browser still sends the cookie automatically to matching servers.

## Question: How Does OAuth Login Work?

Strong answer:

> The user is redirected to a provider like Google. After consent, the provider redirects back to the backend with an authorization code. The backend exchanges the code for provider user information, maps it to a local user, and issues the app's own session or tokens.

## Question: What Is RBAC?

Strong answer:

> RBAC means Role-Based Access Control. Users have roles such as buyer, seller, or admin, and routes/actions require specific roles. For real security, role checks must be combined with ownership checks where needed.

## Question: Why Are Ownership Checks Important?

Strong answer:

> Role checks only answer whether a user has a role. Ownership checks answer whether that user owns the specific resource. For example, a seller role is not enough to edit every product; the backend must check that the seller owns that product.

## Question: What Is XSS?

Strong answer:

> XSS is Cross-Site Scripting, where attacker-controlled JavaScript runs in your app. It can steal unsafe tokens or perform actions as the user. Defenses include escaping output, sanitizing HTML, avoiding unsafe rendering, Content Security Policy, and HttpOnly cookies.

## Question: What Is CSRF?

Strong answer:

> CSRF tricks a user's browser into sending an authenticated request to another site, often relying on cookies being sent automatically. Defenses include SameSite cookies, CSRF tokens, Origin checks, and custom headers for state-changing requests.

## Question: How Do You Secure APIs?

Strong answer:

> I validate all external input, authenticate protected routes, authorize by role and ownership, protect secrets, use secure cookies, rate limit risky endpoints, limit request sizes, avoid leaking internal errors, log safely, and use HTTPS in production.

## Question: How Does This Apply To Artistry Cart?

Strong answer:

> Artistry Cart uses `auth-service` for registration, login, OAuth, cookies/tokens, and identity flows. Shared middleware handles reusable authentication and role checks. Domain services like product and order must still enforce ownership checks. Frontend route protection improves UX, but backend checks enforce real security.

## Best Short Project Pitch For This Topic

> Authentication in Artistry Cart is centralized in `auth-service`, while reusable auth middleware lives in shared packages. Security depends on backend enforcement: tokens/cookies identify the user, middleware checks roles, services enforce ownership, and sensitive secrets such as JWT, OAuth, Stripe, SMTP, and AI keys stay out of frontend code.

