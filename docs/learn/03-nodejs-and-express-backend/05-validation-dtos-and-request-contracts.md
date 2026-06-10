# Validation, DTOs, And Request Contracts

## Why Validation Matters

Every backend API receives untrusted input.

Input can come from:

- request body
- route params
- query params
- cookies
- headers
- webhooks
- Kafka messages
- environment variables
- third-party APIs

TypeScript types do not protect runtime input by themselves.

## Boundary Rule

Validate data at system boundaries.

Boundaries include:

- HTTP request enters service
- webhook enters service
- Kafka message enters consumer
- config loads at startup
- third-party API response enters system

## What Can Go Wrong Without Validation

Problems:

- missing required fields
- wrong data types
- negative prices
- invalid email
- invalid object ids
- unexpected enum values
- unsafe query filters
- malformed webhook payloads
- runtime crashes from undefined values

Example:

```ts
const quantity = req.body.quantity;
const total = quantity * price;
```

If `quantity` is `"abc"`, the result is broken.

## DTOs

DTO means Data Transfer Object.

It defines the shape of data crossing a boundary.

Example request DTO:

```ts
type CreateProductRequest = {
  name: string;
  price: number;
  categoryId: string;
};
```

Example response DTO:

```ts
type ProductResponse = {
  id: string;
  name: string;
  price: number;
};
```

## DTOs Versus Database Models

Do not automatically expose database models as API responses.

Database models may contain:

- internal fields
- secrets
- audit metadata
- provider ids
- implementation details

DTOs let you design the public contract intentionally.

## Validation With Zod Style Schemas

Example:

```ts
const CreateProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  categoryId: z.string().min(1),
});
```

Use:

```ts
const input = CreateProductSchema.parse(req.body);
```

Or safer:

```ts
const result = CreateProductSchema.safeParse(req.body);

if (!result.success) {
  throw new ValidationError(result.error.issues);
}
```

## Validation Locations

Common options:

### In Controller

```ts
const input = validateCreateProduct(req.body);
const product = await productService.create(input);
```

Good for explicit flow.

### In Middleware

```ts
router.post(
  "/products",
  validateBody(CreateProductSchema),
  productController.create
);
```

Good for reusable validation.

### In Service

Useful for business invariants, not raw HTTP shape.

Example:

```ts
if (discount.endDate <= discount.startDate) {
  throw new AppError("Invalid discount date range", 400);
}
```

## Input Validation Versus Business Validation

Input validation:

```text
Is price a positive number?
Is email valid?
Is required field present?
```

Business validation:

```text
Does seller own this product?
Can this order be cancelled?
Is this discount allowed for this shop?
```

Both matter, but they belong at different layers.

## Params And Query Validation

Route params:

```text
GET /products/:id
```

Validate:

- id exists
- id has correct format

Query:

```text
GET /products?page=2&limit=20
```

Convert strings to numbers:

```ts
const page = Number(req.query.page ?? 1);
```

Validate:

- page >= 1
- limit within max range
- sort field is allowed

## Webhook Validation

Webhooks need special care.

For Stripe-style webhooks:

- verify signature
- use raw body if required
- handle duplicate events idempotently
- return success only after safe processing

Do not trust a webhook just because it hits your endpoint.

## Contract Consistency

An API contract should define:

- request method
- path
- auth requirement
- request body
- params/query
- response body
- status codes
- error shape

Contract discipline is especially important in monorepos because frontends and backends evolve together.

## Interview Explanation

If asked "Why validate if we use TypeScript?", say:

> TypeScript checks our code at compile time, but incoming data from HTTP requests, webhooks, Kafka, environment variables, or external APIs is just runtime data. We validate at boundaries to turn unknown input into trusted typed data before business logic uses it.

## Connection To Artistry Cart

Validation matters for:

- login/register requests in `auth-service`
- product creation and seller dashboard flows
- order creation and payment flows
- Stripe webhooks
- Kafka analytics events
- AI Vision prompts and image/session payloads
- environment configuration in every service

