# Express Fundamentals And Request Lifecycle

## What Express Is

Express is a minimal web framework for Node.js.

It helps build:

- HTTP APIs
- middleware pipelines
- routing layers
- JSON services
- proxy/gateway services

Express does not force a strict architecture. That flexibility is useful, but it also means teams must define structure and conventions.

## Minimal Express App

```ts
import express from "express";

const app = express();

app.get("/healthz", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(3000);
```

This creates an HTTP server with one route.

## Request And Response

Every route receives:

- `req`: request object
- `res`: response object
- `next`: function to pass control to next middleware or error handler

Example:

```ts
app.get("/products/:id", async (req, res, next) => {
  try {
    const product = await findProductById(req.params.id);
    res.json(product);
  } catch (error) {
    next(error);
  }
});
```

## Express Request Lifecycle

Typical flow:

```text
HTTP request arrives
  -> Express app receives it
  -> global middleware runs
  -> route matching happens
  -> route-specific middleware runs
  -> controller/handler runs
  -> response is sent
  -> error middleware runs if next(error) is called
```

## Middleware Order Matters

Express runs middleware in the order it is registered.

Example:

```ts
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRouter);
app.use(errorMiddleware);
```

If `express.json()` is registered after routes, route handlers may not see parsed JSON bodies.

## JSON Body Parsing

For APIs that accept JSON:

```ts
app.use(express.json());
```

This parses request body JSON into:

```ts
req.body
```

Without it, `req.body` may be undefined.

## Route Parameters

Example route:

```ts
app.get("/products/:productId", (req, res) => {
  res.json({ productId: req.params.productId });
});
```

Request:

```text
GET /products/p1
```

Result:

```json
{
  "productId": "p1"
}
```

## Query Parameters

Request:

```text
GET /products?category=home&page=2
```

Access:

```ts
req.query.category;
req.query.page;
```

Query params are usually strings and should be validated/converted.

## Request Body

Used for `POST`, `PUT`, and `PATCH`.

Example:

```json
{
  "name": "Handmade Bowl",
  "price": 1500
}
```

Access:

```ts
req.body.name;
```

Always validate request bodies.

## Response Methods

Common methods:

```ts
res.status(201).json(data);
res.json(data);
res.send("ok");
res.sendStatus(204);
res.cookie("access_token", token, options);
res.clearCookie("access_token");
```

## Routers

Routers group related routes.

```ts
import { Router } from "express";

const router = Router();

router.get("/products", listProducts);
router.get("/products/:id", getProduct);

export { router as productRouter };
```

Register:

```ts
app.use("/product", productRouter);
```

## Error Middleware

Error middleware has four parameters:

```ts
function errorMiddleware(error, req, res, next) {
  res.status(500).json({ message: "Internal server error" });
}
```

It must be registered after routes.

## Async Errors

In Express, async route errors should be passed to error middleware.

Pattern:

```ts
app.get("/orders/:id", async (req, res, next) => {
  try {
    const order = await getOrder(req.params.id);
    res.json(order);
  } catch (error) {
    next(error);
  }
});
```

Some projects use an async wrapper to avoid repeated `try/catch`.

## Interview Explanation

If asked "How does Express handle a request?", say:

> Express receives the HTTP request and passes it through middleware in registration order. Middleware can parse JSON, read cookies, apply CORS, authenticate users, validate input, or log requests. Then Express matches the route and runs the handler. The handler sends a response or passes errors to centralized error middleware.

## Connection To Artistry Cart

Express patterns appear in:

- `api-gateway` routing and proxying
- `auth-service` auth routes and controllers
- `product-service` product/shop/search/event routes
- `order-service` order and webhook routes
- `recommendation-service` recommendation routes
- `aivision-service` AI workflow routes

