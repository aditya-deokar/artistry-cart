# Middleware Pipeline And Cross-Cutting Concerns

## What Middleware Is

Middleware is a function that runs during the request lifecycle before or after route handling.

Express middleware shape:

```ts
function middleware(req, res, next) {
  // do work
  next();
}
```

Middleware can:

- modify `req`
- modify `res`
- end the request
- pass control to the next middleware
- pass errors to error middleware

## Why Middleware Exists

Middleware keeps cross-cutting concerns out of controllers.

Cross-cutting concerns are behaviors needed across many routes:

- JSON parsing
- cookie parsing
- CORS
- request logging
- authentication
- authorization
- validation
- rate limiting
- error handling

Without middleware, every controller repeats the same code.

## Middleware Flow

Example:

```ts
app.use(requestLogger);
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use("/orders", isAuthenticated, orderRouter);
app.use(errorMiddleware);
```

Request flow:

```text
request
  -> requestLogger
  -> express.json
  -> cookieParser
  -> cors
  -> isAuthenticated
  -> orderRouter
  -> errorMiddleware if needed
```

## Middleware Can End A Request

Example auth middleware:

```ts
function isAuthenticated(req, res, next) {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  next();
}
```

If token is missing, the route handler never runs.

## Authentication Middleware

Authentication middleware verifies identity.

Typical flow:

```text
1. Read token/cookie/header.
2. Verify token.
3. Load or decode user identity.
4. Attach user to request.
5. Continue.
```

Example:

```ts
req.user = {
  id: "u1",
  role: "seller",
};
```

## Authorization Middleware

Authorization middleware checks permission.

Example:

```ts
function requireRole(role: string) {
  return function middleware(req, res, next) {
    if (req.user?.role !== role) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}
```

Authentication asks:

```text
Who are you?
```

Authorization asks:

```text
What are you allowed to do?
```

## Validation Middleware

Validation middleware checks request shape before business logic.

Example:

```ts
function validateBody(schema) {
  return function middleware(req, res, next) {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }

    req.body = result.data;
    next();
  };
}
```

## Rate Limiting Middleware

Rate limiting protects endpoints from abuse.

Important for:

- login
- password reset
- checkout
- AI generation
- public search APIs

Response:

```text
429 Too Many Requests
```

## Request Logging Middleware

Logs useful request metadata:

- method
- path
- status code
- duration
- request id
- user id if available

Avoid logging:

- passwords
- access tokens
- refresh tokens
- payment secrets
- raw sensitive request bodies

## Error Middleware

Error middleware centralizes API error responses.

Shape:

```ts
function errorMiddleware(error, req, res, next) {
  const status = error.statusCode ?? 500;
  res.status(status).json({
    message: error.message ?? "Internal server error",
  });
}
```

It should be registered after routes.

## Middleware Ordering Rules

Good order:

```text
1. request id/log context
2. security headers/CORS
3. body/cookie parsing
4. auth middleware
5. route handlers
6. not-found handler
7. error middleware
```

Bad order can cause bugs:

- auth runs before cookie parser
- route runs before JSON parser
- error middleware registered too early
- CORS not applied to preflight requests

## Shared Middleware In A Monorepo

Shared middleware is a good monorepo package candidate.

In Artistry Cart:

```text
packages/middleware
```

This can hold:

- `isAuthenticated`
- `isAdmin`
- `authorizedRoles`
- auth contracts

Benefits:

- consistent auth behavior
- less duplication
- easier updates across services

Risk:

- shared middleware can create coupling if it knows too much about service-specific logic

## Interview Explanation

If asked "What is middleware in Express?", say:

> Middleware is a function that runs in the request pipeline before the final route handler or error handler. It is used for cross-cutting concerns like parsing JSON, reading cookies, CORS, logging, authentication, authorization, validation, rate limiting, and centralized error handling. Middleware order matters because each function receives the request in registration order.

## Connection To Artistry Cart

Middleware is central to:

- shared auth and role checks in `packages/middleware`
- error formatting in `packages/error-handler`
- CORS and cookie handling in auth flows
- protected seller routes
- API gateway request handling
- service-level logging and request parsing

