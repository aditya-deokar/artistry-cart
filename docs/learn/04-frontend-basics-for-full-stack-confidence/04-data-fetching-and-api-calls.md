# Data Fetching And API Calls

## Why Frontends Fetch Data

Frontend apps need data from backend services.

Examples:

- products
- user profile
- cart
- orders
- recommendations
- seller inventory
- discounts
- AI Vision results

The frontend asks an API. The backend returns data.

## Basic Fetch Flow

```text
component/action
  -> API client
  -> HTTP request
  -> API gateway
  -> backend service
  -> response
  -> update UI
```

In Artistry Cart:

```text
user-ui -> api-gateway -> product-service
seller-ui -> api-gateway -> order-service
```

## `fetch`

Browser and Next.js environments support `fetch`.

Example:

```ts
const response = await fetch("/api/products");
const products = await response.json();
```

Always check response status:

```ts
if (!response.ok) {
  throw new Error("Failed to load products");
}
```

## Axios

Axios is another HTTP client.

It provides:

- request/response interceptors
- automatic JSON handling
- base URLs
- custom instances
- error objects

Example:

```ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URI,
  withCredentials: true,
});
```

This repo has axios instance utilities in the frontend apps.

## API Client Layer

Avoid scattering raw API calls across components.

Better:

```text
lib/api/products.ts
hooks/useProducts.ts
components/ProductGrid.tsx
```

Benefits:

- one place for endpoint paths
- consistent error handling
- easier testing
- easier refactoring
- typed response shapes

## Loading And Error States

Every API call needs UI states.

Example states:

```text
idle
loading
success
empty
error
unauthorized
```

Bad UX:

```text
click button -> nothing happens
```

Good UX:

```text
click button -> loading indicator -> success or clear error
```

## Server-Side Fetching

Server-side fetching is useful when:

- data is needed for initial page render
- SEO matters
- secret server config is needed
- you want less client JavaScript

Example:

```tsx
export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);
  return <ProductPageClient product={product} />;
}
```

## Client-Side Fetching

Client-side fetching is useful when:

- data changes after user interaction
- data is highly dynamic
- component needs browser state
- user applies filters/search
- dashboard tables need refresh

Example:

```tsx
"use client";

function ProductSearch() {
  const [query, setQuery] = useState("");
  // fetch when query changes
}
```

## Caching

Frontend caching can improve UX and performance.

Caching helps with:

- repeated reads
- product lists
- user profile data
- recommendations
- dashboard tables

But caching must handle:

- stale data
- invalidation after mutations
- auth-specific data
- pagination/filter keys

Tools like TanStack Query are often used for server-state caching.

## Mutations

A mutation changes data.

Examples:

- create product
- update profile
- place order
- add to wishlist
- create discount

Mutation flow:

```text
submit form
  -> validate client-side
  -> send API request
  -> backend validates and writes
  -> frontend shows success/error
  -> refresh or update cached data
```

## API Error Handling

Handle:

- `400` validation errors
- `401` unauthenticated
- `403` forbidden
- `404` not found
- `409` conflict
- `429` rate limit
- `500` server error

Frontend should show useful messages, but not expose internal server details.

## Interview Explanation

If asked "How does a frontend call a backend?", say:

> The frontend uses an HTTP client like fetch or Axios to call an API endpoint. In a well-structured app, calls are wrapped in an API client layer or hooks instead of being scattered across components. The UI handles loading, success, empty, and error states, and backend services still validate and authorize every request.

## Connection To Artistry Cart

Examples:

- buyer product pages call product APIs
- seller dashboard calls product/order/discount/event APIs
- checkout calls order/payment APIs
- recommendation UI calls recommendation APIs
- AI Vision UI calls AI Vision APIs
- auth flows call auth APIs and depend on cookies/tokens

