# Passwords, Hashing, Sessions, JWT, And Cookies

## Password Storage

Never store plain-text passwords.

Bad:

```text
password = "mySecret123"
```

Good:

```text
password -> password hashing algorithm -> password hash
```

During login, compare submitted password with stored hash.

## Password Hashing

Password hashing should be slow enough to resist brute force.

Common algorithms:

- bcrypt
- argon2
- scrypt

Do not use fast general hashes such as SHA-256 alone for password storage.

## Sessions

Session-based auth stores login state on the server.

Flow:

```text
user logs in
server creates session
server sends session id cookie
browser sends cookie on future requests
server looks up session
```

Benefits:

- easy server-side revocation
- sensitive data stays server-side

Costs:

- needs session store
- scaling requires shared session storage

## JWT

JWT means JSON Web Token.

Shape:

```text
header.payload.signature
```

JWT payload contains claims.

Example:

```json
{
  "sub": "user-id",
  "role": "seller",
  "exp": 1730000000
}
```

Important:

> JWT payload is encoded, not encrypted by default. Do not put secrets in JWT payload.

## Access Token

Access token:

- short-lived
- used for API access
- sent with requests
- should expire quickly

## Refresh Token

Refresh token:

- longer-lived
- used to get new access tokens
- should be protected carefully
- should be revocable

## Cookies

Cookies are browser-managed key-value data sent with matching requests.

Security attributes:

```text
HttpOnly
Secure
SameSite
Path
Domain
Max-Age
```

## HttpOnly

`HttpOnly` prevents browser JavaScript from reading the cookie.

This helps reduce token theft from XSS.

## Secure

`Secure` means cookie is sent only over HTTPS.

Use it in production.

## SameSite

`SameSite` controls cross-site cookie sending.

Common values:

- `Strict`
- `Lax`
- `None`

`SameSite=None` requires `Secure`.

## Cookie Auth Versus Bearer Token

Cookie auth:

- browser sends cookie automatically
- works well for web apps
- needs CSRF thinking

Bearer token auth:

- client sends `Authorization: Bearer <token>`
- common for APIs/mobile
- storage choice matters

Avoid storing sensitive long-lived tokens in localStorage when possible.

## Interview Explanation

If asked "How does JWT auth work?", say:

> After login, the backend verifies credentials and issues a signed access token, often with a refresh token. The access token is short-lived and used for API requests. The refresh token is longer-lived and used to renew access. JWTs are signed so the backend can verify they were issued by a trusted server, but their payload is not encrypted by default.

## Connection To Artistry Cart

Artistry Cart auth flows include:

- password hashing in `auth-service`
- access/refresh token style secrets
- cookies for browser auth
- shared middleware for auth checks
- buyer and seller frontend auth state

