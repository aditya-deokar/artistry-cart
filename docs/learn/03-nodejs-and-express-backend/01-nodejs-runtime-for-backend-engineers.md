# Node.js Runtime For Backend Engineers

## What Node.js Is

Node.js is a JavaScript runtime built for running JavaScript outside the browser.

It is commonly used for:

- HTTP APIs
- backend services
- command-line tools
- build scripts
- background workers
- real-time applications

In Artistry Cart, Node.js runs Express services, Next.js servers, test tooling, Nx tasks, Prisma scripts, and CI helper scripts.

## Why Node.js Is Popular For Backends

Node.js is useful because:

- JavaScript/TypeScript can be used across frontend and backend
- it handles I/O-heavy workloads efficiently
- npm has a huge package ecosystem
- it works well for JSON APIs
- it is lightweight for service-oriented systems
- it integrates well with tools like Express, Prisma, KafkaJS, Redis clients, and Stripe SDKs

## Node.js Is Good At I/O

Most backend services spend time waiting for I/O:

- database queries
- HTTP requests
- Redis calls
- Kafka operations
- file reads
- external APIs

Node.js can start I/O work and handle other requests while waiting.

Example:

```ts
app.get("/products/:id", async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
  });

  res.json(product);
});
```

While the database query is pending, Node.js can process other requests.

## Node.js Is Not Automatically Good At CPU-Heavy Work

Node.js can struggle if one request does heavy CPU work on the main event loop.

Examples:

- image processing
- large synchronous loops
- expensive ML inference
- huge JSON transformations
- cryptographic work done synchronously

If the event loop is blocked, all requests wait.

Better options:

- move CPU work to background jobs
- use worker threads
- use a separate service
- offload to external infrastructure
- batch work asynchronously

This is one reason AI-heavy behavior belongs in a separate service such as `aivision-service`.

## Event Loop In Backend Terms

Node.js uses an event loop to coordinate asynchronous work.

Simplified:

```text
1. Request arrives.
2. JavaScript handler starts running.
3. Handler starts async I/O, such as a DB query.
4. Handler awaits result.
5. Node can process other work while I/O is pending.
6. I/O completes.
7. Handler continues and sends response.
```

Interview answer:

> Node.js is single-threaded for JavaScript execution, but it uses an event loop and non-blocking I/O so one process can handle many concurrent I/O-bound requests. The main risk is blocking the event loop with heavy synchronous work.

## Node.js Process

A Node.js application runs as a process.

A process has:

- process id
- memory
- environment variables
- open network ports
- file descriptors
- logs
- exit code

Backend services usually read:

```ts
process.env.PORT
process.env.DATABASE_URL
process.env.NODE_ENV
```

## Environment Variables

Node.js services should use environment variables for configuration.

Examples:

```text
PORT=6001
DATABASE_URL=mongodb://localhost:27017/artistry-cart
REDIS_URL=redis://localhost:6379
ACCESS_TOKEN_SECRET=...
```

Never hardcode secrets in source code.

## Node Package Management

Node projects use package managers such as:

- npm
- pnpm
- yarn

This repo uses pnpm workspaces.

Root `package.json` defines shared dependencies and scripts. Each app/package can also define local metadata and Nx targets.

## Backend Startup Flow

A typical Express service starts like this:

```text
1. Load environment configuration.
2. Create Express app.
3. Register middleware.
4. Register routes.
5. Register error middleware.
6. Connect to required infrastructure if needed.
7. Listen on configured port.
```

Example shape:

```ts
const app = express();

app.use(express.json());
app.use("/auth", authRouter);
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Service listening on ${port}`);
});
```

## Graceful Shutdown

Production services should handle shutdown signals.

Common signals:

- `SIGTERM`
- `SIGINT`

On shutdown, a service should:

- stop accepting new requests
- finish in-flight requests if possible
- close database connections
- close Redis/Kafka clients
- flush logs
- exit cleanly

This matters in Kubernetes because pods are frequently restarted or replaced.

## Common Node.js Backend Mistakes

- blocking the event loop with CPU-heavy work
- forgetting to handle rejected promises
- leaking database connections
- not validating environment variables
- logging secrets
- not handling shutdown
- using `any` around request bodies
- not using centralized error handling
- returning inconsistent API error shapes

## Interview Explanation

If asked "Why use Node.js for backend?", say:

> Node.js is a good fit for I/O-heavy backend APIs because its event loop and non-blocking I/O allow one process to handle many concurrent requests while waiting on databases, caches, queues, or external APIs. It is especially productive with TypeScript in full-stack systems. The tradeoff is that CPU-heavy work can block the event loop, so heavy computation should be moved to workers, queues, or specialized services.

## Connection To Artistry Cart

Node.js powers:

- Express service entrypoints under `apps/*/src/main.ts`
- API gateway proxying
- Prisma database access
- Stripe and OAuth API calls
- Kafka producers and consumers
- Redis helpers
- scripts under `tools/` and `scripts/`
- Vitest test execution

