# Interview Questions And Answer Patterns

This file gives interview-ready answers for Node.js and Express backend topics.

## Question: What Is Node.js?

Strong answer:

> Node.js is a JavaScript runtime for running JavaScript outside the browser. It is commonly used for backend APIs, scripts, and workers. It uses an event loop and non-blocking I/O, which makes it strong for I/O-heavy services like APIs that wait on databases, caches, queues, and external APIs.

## Question: Why Use Node.js For Backend APIs?

Strong answer:

> Node.js is productive for JSON APIs and I/O-heavy workloads. It lets teams use TypeScript across frontend and backend, has a large package ecosystem, and handles concurrent I/O efficiently. The main tradeoff is that CPU-heavy work can block the event loop, so expensive computation should move to workers, queues, or specialized services.

## Question: What Is Express?

Strong answer:

> Express is a minimal Node.js web framework for building HTTP servers and APIs. It provides routing, middleware support, request/response helpers, and error handling conventions, while leaving architecture decisions to the developer.

## Question: How Does An Express Request Flow Work?

Strong answer:

> A request enters the Express app and passes through middleware in registration order. Middleware can parse JSON, read cookies, handle CORS, log requests, authenticate users, or validate input. Then Express matches the route and runs the handler or controller. If an error occurs, it is passed to centralized error middleware.

## Question: What Is Middleware?

Strong answer:

> Middleware is a function in the request pipeline. It can inspect or modify the request, end the response, pass control to the next middleware, or pass an error. It is used for cross-cutting concerns like JSON parsing, auth, CORS, logging, validation, rate limiting, and error handling.

## Question: Why Does Middleware Order Matter?

Strong answer:

> Express runs middleware in the order it is registered. If routes run before `express.json()`, the body may not be parsed. If auth runs before cookie parsing, tokens may not be available. If error middleware is registered before routes, it will not catch route errors correctly.

## Question: How Do You Structure An Express App?

Strong answer:

> I usually separate routes, middleware, controllers, services, validators, and data access. Routes map methods and paths. Controllers translate HTTP requests into service calls. Services contain business logic. Repositories or clients handle database and external API access. Error middleware centralizes failure responses.

## Question: Controller Versus Service?

Strong answer:

> A controller handles HTTP concerns: params, query, body, status codes, and response shape. A service handles business logic and coordinates database or external clients. Keeping them separate makes code easier to test and avoids large route handlers.

## Question: Why Validate Request Input If We Use TypeScript?

Strong answer:

> TypeScript checks code at compile time, but request data is runtime data from outside the system. A client can send anything. We validate request bodies, params, query strings, headers, webhooks, and Kafka messages at the boundary before business logic uses them.

## Question: How Do You Handle Errors In Express?

Strong answer:

> I use custom error classes for expected application errors and centralized error middleware registered after routes. Async controllers pass errors to `next(error)`. The error middleware maps known errors to proper HTTP status codes and safe response bodies, while logging internal details for debugging.

## Question: What Is The Difference Between 400, 401, 403, 404, And 500?

Answer:

```text
400 Bad Request: invalid request input
401 Unauthenticated: missing or invalid identity
403 Forbidden: authenticated but not allowed
404 Not Found: resource or route not found
500 Internal Server Error: unexpected server failure
```

## Question: How Do You Log In A Backend Service?

Strong answer:

> I use structured logs with timestamp, level, service name, method, path, status code, duration, request id, and safe user context. I avoid logging secrets, tokens, passwords, or sensitive payment data. In distributed systems, request ids or trace ids are important for following a request across services.

## Question: What Are Health Checks?

Strong answer:

> Health checks are endpoints used by CI, load balancers, or orchestrators to know whether a service is alive or ready. Liveness checks confirm the process is running. Readiness checks confirm the service can receive traffic, often after required config and dependencies are initialized.

## Question: What Makes An API Production-Ready?

Strong answer:

> A production-ready API has validated inputs, centralized error handling, secure auth and CORS configuration, request size limits, timeouts, health/readiness endpoints, structured logging, graceful shutdown, safe environment configuration, and observability through logs, metrics, and traces.

## Question: How Would You Debug A Slow Node.js API?

Strong answer:

> I would check whether the delay is in the app, database, downstream service, or event loop. I would inspect request logs, response times, database query duration, external API latency, CPU usage, memory, and whether any synchronous CPU-heavy work is blocking the event loop. Then I would optimize the bottleneck or move expensive work off the request path.

## Question: How Does This Apply To Artistry Cart?

Strong answer:

> Artistry Cart uses Express services for auth, product, order, recommendations, AI Vision, Kafka-related service behavior, and the API gateway. The gateway receives frontend requests and routes them to domain services. Shared packages provide middleware, error handling, Prisma, Redis, Kafka utilities, and test helpers. This is a practical Node.js service-oriented backend inside an Nx monorepo.

## Best Short Project Pitch For This Topic

> The backend is built with Node.js and Express services. Each service exposes HTTP routes, uses middleware for cross-cutting concerns, keeps controllers focused on HTTP translation, puts business logic in services, and relies on shared packages for error handling, auth middleware, Prisma, Redis, Kafka, and tests. Production concerns like validation, logging, health checks, configuration, and graceful failure are as important as writing the route handlers.

