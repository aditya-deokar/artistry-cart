# Interview Questions And Answer Patterns

This file converts the topic into interview-ready answers.

Use the answers as patterns, not scripts. A good interview answer sounds natural and shows you understand the flow.

## Question: What Happens When You Type A URL In The Browser?

Strong answer:

> The browser parses the URL, checks cache, resolves the domain using DNS, opens a TCP connection to the server, performs a TLS handshake if the URL uses HTTPS, sends an HTTP request, receives an HTTP response, and then renders the page. For modern apps, the rendered page may also execute JavaScript that makes additional API requests to backend services.

Project connection:

> In Artistry Cart, opening the buyer storefront hits `user-ui`, and API calls from the UI go through `api-gateway` to services such as `product-service`, `auth-service`, or `order-service`.

## Question: What Is DNS?

Strong answer:

> DNS is the system that translates domain names into IP addresses. Humans use names like `example.com`, but machines connect using IP addresses. Before the browser can connect to a server, it needs DNS resolution.

## Question: What Is The Difference Between HTTP And HTTPS?

Strong answer:

> HTTP is the web request-response protocol. HTTPS is HTTP over TLS, which adds encryption, server identity verification, and integrity protection. HTTPS is necessary for sensitive flows like login, cookies, checkout, and personal data.

## Question: What Is An API?

Strong answer:

> An API is a contract that lets one piece of software use functionality or data from another. In web systems, APIs are often HTTP endpoints. A client sends a request with a method, path, headers, and optional body. The server returns a response with a status code, headers, and usually JSON.

Project connection:

> In Artistry Cart, the gateway exposes routes that forward to backend APIs for auth, products, orders, recommendations, and AI Vision.

## Question: What Is REST?

Strong answer:

> REST is an API design style that models the system around resources and uses HTTP methods to act on those resources. For example, `GET /products` reads products, `POST /products` creates a product, `PATCH /products/:id` updates a product, and `DELETE /products/:id` removes one.

## Question: What Are HTTP Status Codes?

Strong answer:

> HTTP status codes tell the client the result of a request. `2xx` means success, `3xx` means redirect or cache behavior, `4xx` means the client request has a problem, and `5xx` means the server or upstream service failed.

Useful examples:

```text
200 OK
201 Created
400 Bad Request
401 Unauthenticated
403 Forbidden
404 Not Found
409 Conflict
429 Too Many Requests
500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
```

## Question: What Is The Difference Between 401 And 403?

Strong answer:

> `401` means the user is not authenticated or the credentials are invalid. `403` means the user is authenticated, but does not have permission to perform the action.

Example:

```text
No token -> 401
Buyer token accessing seller-only route -> 403
```

## Question: What Are Headers?

Strong answer:

> Headers are metadata attached to HTTP requests or responses. They describe things like content type, accepted response format, authentication, cookies, cache rules, origin, and CORS permissions.

Examples:

```text
Content-Type: application/json
Authorization: Bearer <token>
Cookie: access_token=...
Set-Cookie: refresh_token=...
Access-Control-Allow-Origin: http://localhost:3000
```

## Question: What Is Authentication?

Strong answer:

> Authentication verifies who the user is. A common flow is login with email and password, verifying the password against a stored hash, then issuing a session or token so future requests can identify the user.

## Question: What Is Authorization?

Strong answer:

> Authorization checks what an authenticated user is allowed to do. For example, a user may be logged in, but only sellers can create products and only admins can access admin routes.

## Question: Sessions Versus JWT?

Strong answer:

> Sessions usually store login state on the server and send the browser a session id cookie. JWTs store signed claims in the token itself, so the server can verify the token without a database lookup. Sessions are easier to revoke centrally, while JWTs are useful for stateless verification but need careful expiry and refresh-token handling.

## Question: What Is A Refresh Token?

Strong answer:

> A refresh token is a longer-lived credential used to obtain new short-lived access tokens. The access token is used for normal API calls and expires quickly. The refresh token is protected more carefully and can be revoked when needed.

## Question: Why Use HttpOnly Cookies?

Strong answer:

> HttpOnly cookies cannot be read by browser JavaScript, which helps protect tokens from being stolen during XSS attacks. The browser still sends the cookie automatically to matching servers.

## Question: What Is CORS?

Strong answer:

> CORS is a browser security mechanism for cross-origin requests. The server sends headers that tell the browser which origins, methods, headers, and credentials are allowed. If the response does not satisfy CORS rules, the browser blocks frontend JavaScript from reading it.

Important note:

> CORS is enforced by browsers. Backend-to-backend requests and tools like Postman do not enforce CORS the same way.

## Question: What Is CSRF?

Strong answer:

> CSRF is an attack where a malicious website tricks a user's browser into sending an authenticated request to another site, usually because cookies are sent automatically. Defenses include SameSite cookies, CSRF tokens, Origin checks, and requiring custom headers for state-changing requests.

## Question: CORS Versus CSRF?

Strong answer:

> CORS controls whether JavaScript from one origin can read responses from another origin. CSRF is about a malicious site causing the browser to send an authenticated request. CORS is read protection; CSRF is unwanted action protection.

## Question: Why Use Environment Variables?

Strong answer:

> Environment variables let the same code run in different environments by injecting runtime configuration such as database URLs, service URLs, ports, secrets, and feature flags. This avoids hardcoding environment-specific values and keeps secrets out of source code.

## Question: What Should Not Go In Frontend Public Env Variables?

Strong answer:

> Secrets should never go in public frontend environment variables. Anything exposed to the browser can be inspected by users. Public variables are safe only for non-secret values like public API URLs or publishable keys.

## Question: How Would You Debug A Failed API Request?

Strong answer:

> I would debug by layer. First check whether the frontend is calling the correct URL. Then check browser network details: status code, headers, request body, and CORS errors. Then check whether the gateway is reachable, whether the downstream service is healthy, whether auth cookies or tokens are present, and whether the database or external dependency is failing. Logs and request IDs help connect the flow across services.

## Best Short Project Pitch For This Topic

> In Artistry Cart, a user request starts in a Next.js frontend, goes over HTTP or HTTPS to the API gateway, and then the gateway routes it to a backend Express service. The service uses middleware for concerns like parsing, authentication, authorization, and error handling, then runs business logic and accesses MongoDB, Redis, Stripe, Kafka, or AI providers depending on the flow. Understanding DNS, HTTP, cookies, CORS, tokens, and env configuration is necessary to debug the whole path end to end.

