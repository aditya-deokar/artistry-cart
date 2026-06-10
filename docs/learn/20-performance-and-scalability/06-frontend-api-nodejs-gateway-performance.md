# Frontend, API, Node.js, And Gateway Performance

## Frontend Performance

Frontend performance is what users feel first.

Important signals:

- page load time
- time to first byte
- largest contentful paint
- interaction latency
- JavaScript bundle size
- image size
- API waterfall behavior

For ecommerce, slow pages directly hurt browsing and checkout.

## Core Web Vitals

Common user-facing metrics:

- LCP: largest contentful paint
- INP: interaction to next paint
- CLS: cumulative layout shift

Simple meanings:

```text
LCP = main content appears fast
INP = interactions respond quickly
CLS = layout does not jump around
```

## Frontend Data Fetching

Repeated API calls can slow the UI and overload services.

Useful patterns:

- server-state caching
- stale time
- pagination
- debounced search
- prefetching
- avoiding request waterfalls
- loading skeletons
- optimistic updates where safe

Artistry Cart uses React Query patterns, including stale-time behavior, to reduce repeated fetch pressure.

## Image Performance

Commerce platforms are image-heavy.

Good image practices:

- serve correctly sized images
- use modern formats where possible
- lazy load below-the-fold media
- use CDN delivery
- avoid layout shift with stable dimensions
- avoid unoptimized massive uploads

## API Performance

Backend API performance depends on:

- route logic
- database queries
- cache use
- payload size
- downstream calls
- validation cost
- serialization
- error handling

API responses should return what the frontend needs, not everything the database knows.

## API Gateway Performance

The gateway is a useful central boundary, but it adds a hop.

Gateway responsibilities in Artistry Cart:

- single backend entry point
- CORS setup
- body parsing
- cookie parsing
- rate limiting
- proxy routing

Gateway performance concerns:

- proxy timeout behavior
- request body size limits
- downstream service latency
- rate-limit overhead
- trace/request ID propagation
- avoiding domain-heavy work in the gateway

## Rate Limiting

Rate limiting protects services from abuse or accidental overload.

It can return:

```text
429 Too Many Requests
```

Good rate limits are different for:

- anonymous users
- authenticated users
- expensive AI routes
- login or OTP routes
- payment webhook routes

## Node.js Performance

Node.js is strong for I/O-heavy workloads, but CPU-heavy work can block the event loop.

Good for:

- HTTP APIs
- proxying
- database calls
- cache calls
- queue producers

Risky for:

- heavy synchronous CPU work
- large JSON processing
- image processing in request path
- ML inference in request path

If CPU work grows, consider:

- worker threads
- separate worker service
- queue-based processing
- external model serving
- precomputation

## Strong Interview Answer

If asked "How do you improve full-stack performance?", say:

> I look at the whole user path: frontend loading, API waterfalls, gateway latency, backend route latency, database queries, cache hit rate, external calls, and payload sizes. On the frontend I reduce bundle, image, and fetch overhead. On the backend I optimize query shape, caching, async work, rate limits, and avoid CPU-heavy request paths in Node.js.

## Artistry Cart Connection

Artistry Cart has two Next.js frontends, an API gateway, Express backend services, React Query caching, rate limiting, and higher-latency AI/recommendation flows. That makes end-to-end performance more important than optimizing one service in isolation.
