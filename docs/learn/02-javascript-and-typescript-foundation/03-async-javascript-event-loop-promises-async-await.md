# Async JavaScript: Event Loop, Promises, And Async Await

## Why Async Exists

Many operations take time:

- network requests
- database queries
- reading files
- timers
- calling external APIs
- sending emails
- Kafka publish/consume operations

JavaScript should not freeze while waiting for these operations.

Async programming lets JavaScript start an operation and continue later when the result is ready.

## JavaScript Is Single-Threaded For Normal Execution

JavaScript executes normal code on one main call stack.

That means this blocks:

```ts
while (true) {
  // never ends
}
```

If you block the event loop in Node.js, the service cannot respond to other requests.

## Runtime APIs Do Async Work

The JavaScript runtime provides async APIs.

Browser examples:

- `fetch`
- `setTimeout`
- DOM events

Node.js examples:

- database drivers
- HTTP server
- file system operations
- timers
- network sockets

## Event Loop

The event loop coordinates when async callbacks and promise continuations run.

Simplified model:

```text
1. Run synchronous code on call stack.
2. Async operation starts in runtime.
3. When async operation completes, callback/continuation is queued.
4. Event loop picks queued work when call stack is empty.
```

## Tasks And Microtasks

Tasks include:

- `setTimeout`
- `setInterval`
- I/O callbacks

Microtasks include:

- promise `.then`
- `await` continuations
- `queueMicrotask`

Microtasks usually run before the next task.

Example:

```ts
console.log("A");

setTimeout(() => console.log("B"), 0);

Promise.resolve().then(() => console.log("C"));

console.log("D");
```

Output:

```text
A
D
C
B
```

Why:

- `A` and `D` are synchronous
- promise continuation is a microtask
- timeout callback is a task

## Promises

A promise represents a value that may be available later.

States:

- pending
- fulfilled
- rejected

Example:

```ts
fetch("/api/products")
  .then((response) => response.json())
  .then((products) => console.log(products))
  .catch((error) => console.error(error));
```

## Async/Await

`async/await` makes promise code easier to read.

Example:

```ts
async function loadProducts() {
  const response = await fetch("/api/products");
  const products = await response.json();
  return products;
}
```

Important:

> `await` pauses the async function, not the entire JavaScript runtime.

Other requests can still be handled while the awaited operation is pending.

## Error Handling With Async/Await

Use `try/catch`:

```ts
async function createOrder(input: CreateOrderInput) {
  try {
    const order = await prisma.order.create({ data: input });
    return order;
  } catch (error) {
    throw new Error("Failed to create order");
  }
}
```

In Express, async route errors should reach centralized error middleware.

## Sequential Versus Parallel Awaits

Sequential:

```ts
const user = await getUser(userId);
const orders = await getOrders(user.id);
```

Use when second operation depends on first.

Parallel:

```ts
const [products, shops] = await Promise.all([
  getProducts(),
  getShops(),
]);
```

Use when operations are independent.

## Promise.all Failure Behavior

`Promise.all` rejects if any promise rejects.

```ts
await Promise.all([taskA(), taskB(), taskC()]);
```

If `taskB` fails, the whole `Promise.all` rejects.

Use `Promise.allSettled` when you need all results, even failures.

## Common Async Mistakes

### Forgetting `await`

```ts
const user = getUser(id); // Promise, not user
```

### Using `forEach` With Async Incorrectly

Bad:

```ts
items.forEach(async (item) => {
  await processItem(item);
});
```

Better sequential:

```ts
for (const item of items) {
  await processItem(item);
}
```

Better parallel:

```ts
await Promise.all(items.map((item) => processItem(item)));
```

### Blocking CPU Work

Heavy CPU work can block Node.js.

Examples:

- large synchronous loops
- image processing in request path
- expensive model computation
- huge JSON parsing

For CPU-heavy work, consider:

- background jobs
- worker threads
- separate services
- queues

## Async In Express Services

Typical backend handler:

```ts
app.get("/products/:id", async (req, res, next) => {
  try {
    const product = await productService.findById(req.params.id);
    res.json(product);
  } catch (error) {
    next(error);
  }
});
```

Flow:

```text
request comes in
handler starts
database query awaited
Node handles other work while DB is pending
query resolves
response is sent
```

## Interview Explanation

If asked "How does async/await work?", say:

> `async/await` is syntax over promises. An async function returns a promise. When it hits `await`, the function pauses until the promise settles, and the continuation is scheduled as a microtask. It does not block the whole runtime, so Node.js can handle other requests while waiting for I/O.

## Connection To Artistry Cart

This matters in:

- Express route handlers calling Prisma
- API gateway proxying downstream services
- Stripe API calls in `order-service`
- OAuth provider calls in `auth-service`
- Kafka producers and consumers
- AI provider calls in `aivision-service`
- frontend React hooks calling APIs

