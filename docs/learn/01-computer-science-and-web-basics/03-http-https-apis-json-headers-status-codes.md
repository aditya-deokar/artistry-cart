# HTTP, HTTPS, APIs, JSON, Headers, And Status Codes

## HTTP

HTTP is the protocol used by browsers and web servers to exchange requests and responses.

HTTP is stateless by default.

That means each request is independent unless the client sends extra information such as:

- cookies
- authorization headers
- session id
- request body

## HTTPS

HTTPS is HTTP over TLS.

It adds:

- encryption
- server verification
- integrity protection

Interview answer:

> HTTP defines the request-response protocol. HTTPS uses the same HTTP semantics but sends them through an encrypted TLS connection, which protects sensitive data like tokens, cookies, login forms, and payment requests.

## HTTP Request Structure

Example:

```http
POST /auth/login HTTP/1.1
Host: api.artistrycart.com
Content-Type: application/json
Accept: application/json

{
  "email": "user@example.com",
  "password": "secret"
}
```

Parts:

- method: `POST`
- path: `/auth/login`
- protocol version: `HTTP/1.1`
- headers: metadata
- body: request data

## HTTP Response Structure

Example:

```http
HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: access_token=...; HttpOnly; Secure

{
  "user": {
    "id": "u1",
    "email": "user@example.com"
  }
}
```

Parts:

- status code: `200`
- reason phrase: `OK`
- headers: metadata
- body: response data

## Common HTTP Methods

### GET

Read data.

```http
GET /products
```

Should not change server state.

### POST

Create something or execute a command.

```http
POST /orders
```

### PUT

Replace a resource.

```http
PUT /products/123
```

### PATCH

Partially update a resource.

```http
PATCH /products/123
```

### DELETE

Delete a resource.

```http
DELETE /products/123
```

## REST APIs

REST is an API design style based on resources.

Resource examples:

- users
- products
- orders
- shops
- events
- discounts

REST-like routes:

```text
GET    /products
GET    /products/:id
POST   /products
PATCH  /products/:id
DELETE /products/:id
```

Interview answer:

> REST organizes APIs around resources and uses HTTP methods to express actions. GET reads, POST creates or triggers commands, PATCH updates part of a resource, PUT replaces, and DELETE removes.

## JSON

JSON means JavaScript Object Notation.

It is a lightweight data format used by most web APIs.

Example:

```json
{
  "id": "p1",
  "name": "Handmade Bowl",
  "price": 1500,
  "inStock": true
}
```

Why JSON is common:

- easy for JavaScript clients
- human-readable
- language-independent
- supported everywhere
- works well with HTTP APIs

## Headers

Headers are key-value metadata sent with requests and responses.

Common request headers:

```text
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>
Cookie: access_token=...
User-Agent: Chrome
Origin: https://app.example.com
```

Common response headers:

```text
Content-Type: application/json
Set-Cookie: refresh_token=...
Cache-Control: no-store
Access-Control-Allow-Origin: https://app.example.com
```

## Content-Type Versus Accept

`Content-Type` means:

> This is the format of the body I am sending.

`Accept` means:

> This is the format I want back.

Example:

```http
Content-Type: application/json
Accept: application/json
```

## Cookies

Cookies are small pieces of data stored by the browser and sent back to matching servers.

Common uses:

- session id
- access token
- refresh token
- preferences

Secure cookie attributes:

```text
HttpOnly
Secure
SameSite
Path
Domain
Max-Age
```

## Status Codes

Status codes tell the client what happened.

### 2xx Success

| Code | Meaning |
| --- | --- |
| `200` | OK |
| `201` | Created |
| `204` | No Content |

### 3xx Redirect

| Code | Meaning |
| --- | --- |
| `301` | Permanent redirect |
| `302` | Temporary redirect |
| `304` | Not modified/cache |

### 4xx Client Error

| Code | Meaning |
| --- | --- |
| `400` | Bad request |
| `401` | Unauthenticated |
| `403` | Forbidden |
| `404` | Not found |
| `409` | Conflict |
| `422` | Validation error |
| `429` | Too many requests |

### 5xx Server Error

| Code | Meaning |
| --- | --- |
| `500` | Internal server error |
| `502` | Bad gateway |
| `503` | Service unavailable |
| `504` | Gateway timeout |

## 401 Versus 403

This is a common interview question.

`401 Unauthorized` means:

> The server does not know who you are. Authentication is missing or invalid.

`403 Forbidden` means:

> The server knows who you are, but you do not have permission.

Example:

```text
No token -> 401
Valid buyer token trying admin route -> 403
```

## Idempotency

An operation is idempotent if running it multiple times has the same final effect.

Usually idempotent:

- `GET`
- `PUT`
- `DELETE`

Usually not idempotent:

- `POST`

But you can design POST operations to be idempotent with an idempotency key.

This is important for payment and webhook systems.

## Interview Explanation

If asked "How do APIs work?", say:

> A web API exposes server functionality through HTTP endpoints. The client sends an HTTP request with a method, path, headers, and optional body. The server validates the request, runs business logic, and returns an HTTP response with a status code, headers, and usually JSON. Status codes communicate success or failure, while headers carry metadata like content type, cookies, auth tokens, cache policy, and CORS information.

## Connection To Artistry Cart

Examples:

- login request goes to `auth-service`
- product browsing goes to `product-service`
- checkout goes to `order-service`
- recommendation requests go to `recommendation-service`
- AI workflows go to `aivision-service`
- gateway returns `502` or `504` style errors if downstream services fail

