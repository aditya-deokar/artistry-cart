# CORS, CSRF, And Web Security Basics

## Why Browser Security Exists

Browsers run code from many websites. Without security rules, a malicious website could read data from another site where the user is logged in.

Example danger:

```text
User is logged into bank.com.
User opens evil.com.
evil.com tries to read bank.com/account.
```

Browser security rules exist to prevent this kind of attack.

## Same-Origin Policy

The same-origin policy is a browser rule that restricts one origin from reading data from another origin.

Origin means:

```text
scheme + host + port
```

Examples:

```text
http://localhost:3000
http://localhost:8080
https://artistrycart.com
https://api.artistrycart.com
```

These are different origins:

```text
http://localhost:3000
http://localhost:8080
```

Even though both use localhost, the ports are different.

## CORS

CORS means Cross-Origin Resource Sharing.

It is a browser security mechanism that lets a server say:

> This origin is allowed to read my response.

Example response header:

```http
Access-Control-Allow-Origin: http://localhost:3000
```

If cookies are involved:

```http
Access-Control-Allow-Credentials: true
```

The browser enforces CORS. The backend provides CORS headers.

## Simple Request Versus Preflight

Some cross-origin requests trigger a preflight request.

Preflight uses `OPTIONS`.

Flow:

```text
1. Browser sends OPTIONS request.
2. Server responds with allowed methods/headers/origin.
3. Browser sends actual request if allowed.
```

Example preflight:

```http
OPTIONS /auth/login
Origin: http://localhost:3000
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type
```

Server response:

```http
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET,POST,PATCH,DELETE
Access-Control-Allow-Headers: Content-Type,Authorization
Access-Control-Allow-Credentials: true
```

## Common CORS Mistakes

- frontend origin not allowed
- credentials enabled on frontend but not backend
- wildcard origin used with credentials
- missing allowed headers
- missing allowed methods
- API gateway has CORS but downstream service also conflicts
- development and production origins mixed incorrectly

Interview answer:

> CORS is not an API authentication mechanism. It is a browser-enforced read protection rule. The server declares which origins can access responses, and the browser blocks JavaScript from reading responses that do not satisfy CORS.

## CSRF

CSRF means Cross-Site Request Forgery.

It happens when a malicious site causes the browser to send an authenticated request to another site.

Example:

```text
User is logged into shop.com with cookies.
User visits evil.com.
evil.com submits a hidden form to shop.com/order.
Browser automatically includes shop.com cookies.
```

If the server does not protect against CSRF, it may treat the request as legitimate.

## CORS Versus CSRF

CORS controls whether browser JavaScript can read cross-origin responses.

CSRF is about a malicious site causing a browser to send authenticated requests.

They are related but not the same.

## CSRF Defenses

Common defenses:

- SameSite cookies
- CSRF tokens
- checking Origin/Referer headers
- requiring custom headers for state-changing requests
- using short-lived tokens
- avoiding cookie auth for some API clients

## XSS

XSS means Cross-Site Scripting.

It happens when attacker-controlled JavaScript runs in your application.

Risks:

- steal tokens from localStorage
- make authenticated requests
- read sensitive page data
- modify UI

Defenses:

- escape user input
- sanitize HTML
- use HttpOnly cookies for sensitive tokens
- Content Security Policy
- avoid dangerous HTML rendering

## Injection

Injection happens when untrusted input is interpreted as code or query logic.

Examples:

- SQL injection
- NoSQL injection
- command injection
- template injection

Defenses:

- validation
- parameterized queries
- safe ORM usage
- least privilege
- avoid building queries from raw strings

## Rate Limiting

Rate limiting restricts how many requests a client can make.

Used for:

- login attempts
- password reset
- AI generation endpoints
- public APIs
- expensive search endpoints

It protects against:

- brute force attacks
- abuse
- accidental overload
- cost spikes

## Secure Headers

Useful headers:

```text
Content-Security-Policy
X-Frame-Options
X-Content-Type-Options
Strict-Transport-Security
Referrer-Policy
```

These reduce browser-level attack surface.

## Interview Explanation

If asked "What is CORS?", say:

> CORS is a browser security mechanism for cross-origin API access. Because the same-origin policy blocks one origin from reading another origin's response, the server must send CORS headers saying which origins, methods, headers, and credentials are allowed. It is enforced by the browser, not by Postman or backend-to-backend calls.

If asked "What is CSRF?", say:

> CSRF is an attack where a malicious site tricks a user's browser into sending an authenticated request to another site, usually relying on cookies being sent automatically. Defenses include SameSite cookies, CSRF tokens, Origin checks, and requiring custom headers for state-changing requests.

## Connection To Artistry Cart

Artistry Cart has separate frontend and backend ports locally:

```text
user-ui:      localhost:3000
seller-ui:    localhost:3001
api-gateway:  localhost:8080
```

That means CORS and credentials matter during development.

Auth and seller workflows also need CSRF and cookie security thinking because:

- login uses cookies/tokens
- seller dashboards perform state-changing actions
- checkout and orders are sensitive
- AI endpoints may be expensive and need rate protection

