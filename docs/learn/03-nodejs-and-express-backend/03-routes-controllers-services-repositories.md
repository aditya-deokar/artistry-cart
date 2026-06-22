# Routes, Controllers, Services, And Repositories

## Why Structure Matters

Express lets you put everything in one route handler, but that does not scale.

Bad long-term shape:

```ts
app.post("/orders", async (req, res) => {
  // validate input
  // check auth
  // calculate totals
  // call Stripe
  // write database
  // send email
  // return response
});
```

This becomes hard to test and change.

Better structure separates responsibilities.

## Layered Backend Shape

Common production shape:

```text
route
  -> middleware
  -> controller
  -> service
  -> repository/data access
  -> database/external API
```

Not every small service needs every layer, but the separation is useful for complex domains.

## Routes

Routes define URL and HTTP method mapping.

Example:

```ts
router.post("/orders", isAuthenticated, orderController.createOrder);
router.get("/orders/:id", isAuthenticated, orderController.getOrder);
```

Route files should be easy to scan.

They answer:

- what endpoint exists?
- what method does it use?
- what middleware protects it?
- which controller handles it?

## Controllers

Controllers translate HTTP into application operations.

Responsibilities:

- read params/query/body
- call validators
- call service methods
- choose HTTP status code
- send response
- pass errors to error middleware

Controller example:

```ts
async function createOrder(req, res, next) {
  try {
    const input = validateCreateOrder(req.body);
    const order = await orderService.createOrder(input, req.user.id);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}
```

Controllers should not contain large business logic.

## Services

Services contain business logic.

Responsibilities:

- apply business rules
- coordinate repositories and external clients
- enforce domain invariants
- produce domain results

Service example:

```ts
async function createOrder(input: CreateOrderInput, userId: string) {
  const items = await productRepository.findManyByIds(input.productIds);
  const total = calculateOrderTotal(items);
  const payment = await paymentClient.createSession(total);

  return orderRepository.create({
    userId,
    items,
    total,
    paymentSessionId: payment.id,
  });
}
```

## Repositories Or Data Access

Repositories isolate database access.

Example:

```ts
async function findProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
  });
}
```

Benefits:

- database queries are easier to test
- services do not depend on raw query details everywhere
- future schema changes have fewer call sites

In smaller services, direct Prisma calls inside services may be acceptable. The key is to avoid database details leaking everywhere.

## External Clients

External integrations should be wrapped.

Examples:

- Stripe client
- OAuth provider client
- SMTP/email client
- Kafka producer
- Redis client
- AI provider client

Why wrap them:

- easier testing
- consistent error handling
- fewer vendor-specific details across business logic

## DTOs

DTO means Data Transfer Object.

DTOs define API input/output shapes.

Example:

```ts
type CreateProductRequest = {
  name: string;
  price: number;
  categoryId: string;
};

type ProductResponse = {
  id: string;
  name: string;
  price: number;
};
```

DTOs should not always be the same as database models.

## Avoid Leaking Database Models To Public APIs

Database models may contain internal fields:

- password hash
- internal status
- audit fields
- provider tokens
- deleted flags

Public API responses should expose only what clients need.

Bad:

```ts
res.json(userFromDatabase);
```

Better:

```ts
res.json(toPublicUser(userFromDatabase));
```

## Folder Structure Example

```text
src/
  main.ts
  routes/
    product.route.ts
  controllers/
    product.controller.ts
  services/
    product.service.ts
  repositories/
    product.repository.ts
  validators/
    product.validator.ts
  utils/
    pricing.ts
```

This style matches many services in the repo, though each service may vary.

## Interview Explanation

If asked "How do you structure an Express app?", say:

> I keep route files responsible for endpoint mapping, controllers responsible for HTTP translation, services responsible for business logic, and repositories or clients responsible for database and external integrations. Middleware handles cross-cutting concerns like auth, logging, and validation. This keeps handlers small and makes the code easier to test and refactor.

## Connection To Artistry Cart

You can see similar separation in:

- `apps/product-service/src/routes`
- `apps/product-service/src/controllers`
- `apps/order-service/src/controllers`
- `apps/order-service/src/services`
- `apps/auth-service/src/controller`
- `apps/auth-service/src/routes`
- `apps/aivision-service/src/controllers`
- `apps/aivision-service/src/services`

