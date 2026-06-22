# Authentication, Authorization, Sessions, JWT, And Cookies

## Authentication Versus Authorization

Authentication means:

> Who are you?

Authorization means:

> What are you allowed to do?

Example:

```text
Login with email/password -> authentication
Check if user is seller/admin -> authorization
```

Interview answer:

> Authentication verifies identity. Authorization checks permissions after identity is known.

## Common Authentication Flow

```text
1. User submits email and password.
2. Server finds user by email.
3. Server verifies password hash.
4. Server creates session or tokens.
5. Server sends token/cookie to browser.
6. Browser includes token/cookie in future requests.
7. Server validates token/cookie before protected actions.
```

## Password Hashing

Passwords should never be stored as plain text.

Instead:

```text
password -> hashing algorithm -> password hash
```

During login:

```text
submitted password + stored hash -> verify true/false
```

Common tools:

- bcrypt
- argon2
- scrypt

Interview answer:

> We do not decrypt passwords. We hash them with a slow password hashing algorithm. During login we compare the submitted password against the stored hash.

## Sessions

A session is server-side state representing a logged-in user.

Flow:

```text
1. User logs in.
2. Server creates session in database/Redis.
3. Server sends session id as cookie.
4. Browser sends session id on future requests.
5. Server looks up session id to identify user.
```

Benefits:

- server can revoke sessions easily
- token data stays server-side
- session state can be changed centrally

Costs:

- requires server-side storage
- needs scaling strategy for multiple servers
- session store must be reliable

## JWT

JWT means JSON Web Token.

A JWT contains encoded claims and a signature.

Shape:

```text
header.payload.signature
```

Payload example:

```json
{
  "sub": "user-id",
  "role": "seller",
  "exp": 1730000000
}
```

Important:

- JWT payload is encoded, not encrypted by default.
- Do not put secrets in JWT payload.
- Signature proves the token was issued by a trusted server.

## Access Token And Refresh Token

Access token:

- short-lived
- used for API access
- expires quickly

Refresh token:

- longer-lived
- used to get a new access token
- must be protected carefully

Flow:

```text
1. User logs in.
2. Server issues access token and refresh token.
3. Access token is used for API calls.
4. When access token expires, refresh token gets a new access token.
5. If refresh token expires or is revoked, user logs in again.
```

## Cookies

Cookies are browser-managed storage automatically sent with requests to matching domains.

Security attributes:

### HttpOnly

JavaScript cannot read the cookie.

This helps protect against token theft through XSS.

### Secure

Cookie is sent only over HTTPS.

### SameSite

Controls cross-site cookie sending.

Common values:

- `Strict`
- `Lax`
- `None`

### Max-Age Or Expires

Controls cookie lifetime.

## Cookie-Based Auth Versus Bearer Token Auth

### Cookie-Based

Browser automatically sends cookie.

Benefits:

- convenient for web apps
- HttpOnly cookies protect against JavaScript access

Risks:

- CSRF must be considered
- CORS/cookie settings can be tricky

### Bearer Token

Client sends token manually:

```http
Authorization: Bearer <token>
```

Benefits:

- common for APIs/mobile apps
- explicit request behavior

Risks:

- if stored in localStorage, token can be stolen through XSS
- client code must attach token correctly

## Authentication Middleware

Backend services often use middleware:

```text
request
  -> read token/cookie
  -> verify token
  -> attach user to request
  -> continue to route handler
```

Authorization middleware may then check:

```text
is user role seller?
is user role admin?
does user own this shop?
```

In Artistry Cart, shared auth and role middleware belongs under `packages/middleware`.

## OAuth

OAuth lets users log in through providers like Google or GitHub.

Simplified flow:

```text
1. User clicks "Continue with Google".
2. App redirects user to Google.
3. User grants permission.
4. Google redirects back with authorization code.
5. Backend exchanges code for provider tokens/user info.
6. Backend creates or finds local user.
7. Backend issues app session/tokens.
```

Important:

> OAuth proves identity through a trusted provider, but your app still needs its own user/session model.

## Common Auth Failure Cases

- missing token
- expired access token
- invalid signature
- revoked refresh token
- cookie blocked by browser
- wrong SameSite setting
- CORS not allowing credentials
- user authenticated but lacks role
- password comparison bug
- clock skew around token expiry

## Interview Explanation

If asked "How does login work?", say:

> The user sends credentials to the auth service. The server finds the user, verifies the password against a stored hash, and then issues either a session cookie or tokens. For JWT-based auth, the access token is short-lived and used on API requests, while the refresh token is longer-lived and used to obtain new access tokens. Protected routes use middleware to verify identity, then authorization logic checks roles or ownership.

## Connection To Artistry Cart

In this project:

- `auth-service` owns login, registration, OAuth, and token/cookie flows.
- `packages/middleware` contains shared authentication and authorization middleware.
- `user-ui` and `seller-ui` depend on correct cookie/token behavior.
- `api-gateway` routes auth-related traffic to `auth-service`.
- seller-only workflows need authorization, not only authentication.

