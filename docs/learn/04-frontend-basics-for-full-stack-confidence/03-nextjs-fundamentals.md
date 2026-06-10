# Next.js Fundamentals

## What Next.js Is

Next.js is a React framework for building full-stack web applications.

It provides:

- routing
- layouts
- server rendering
- static generation
- API route handlers
- image/font optimization
- middleware
- build tooling
- deployment conventions

React is the UI library. Next.js is the application framework around React.

## App Router Mental Model

Modern Next.js uses filesystem routing under an `app/` directory.

Example:

```text
app/
  page.tsx
  layout.tsx
  products/
    page.tsx
  products/
    [id]/
      page.tsx
```

Routes:

```text
/                 app/page.tsx
/products          app/products/page.tsx
/products/123      app/products/[id]/page.tsx
```

## Layouts

Layouts wrap pages.

Example:

```tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

Use layouts for:

- navigation
- sidebars
- providers
- common shells
- dashboard structure

## Server Components

Server components render on the server.

They can:

- fetch data securely
- access server-only environment variables
- reduce client JavaScript
- render initial UI before it reaches browser

They cannot:

- use browser-only APIs
- use `useState`
- use `useEffect`
- attach event handlers directly

## Client Components

Client components run in the browser.

They are marked with:

```tsx
"use client";
```

Use client components for:

- interactivity
- local state
- event handlers
- browser APIs
- forms with live feedback
- modals, drawers, tabs, sliders

## Server Versus Client Components

Strong mental model:

```text
Server component: fetch and prepare data.
Client component: interact with the user.
```

Example:

```text
Product page server component fetches product.
Add to cart button client component handles click state.
```

## Route Handlers

Next.js can define HTTP route handlers.

Example:

```text
app/healthz/route.ts
```

This can expose:

```text
GET /healthz
```

In Artistry Cart, frontend apps include health/readiness route handlers for deployment checks.

## Middleware

Next.js middleware can run before a request reaches a route.

Common uses:

- auth redirects
- locale handling
- request rewriting
- route protection

Important:

> Middleware can improve UX, but backend services must still enforce authorization.

## Environment Variables In Next.js

Server-only variables:

```text
API_SECRET=...
```

Public browser variables:

```text
NEXT_PUBLIC_SERVER_URI=http://localhost:8080
```

Anything starting with `NEXT_PUBLIC_` can be exposed to the browser.

Never put secrets in `NEXT_PUBLIC_` variables.

## Rendering Strategies

Next.js supports:

- static rendering
- dynamic rendering
- server rendering
- client rendering
- incremental regeneration patterns

Choose based on:

- how often data changes
- whether data is user-specific
- whether SEO matters
- whether auth is required
- performance needs

## Buyer Storefront Versus Dashboard Rendering

Buyer storefront:

- SEO matters
- product pages may benefit from server rendering
- landing pages can be static or mostly static
- search and filters may be interactive

Seller dashboard:

- auth matters
- data is user-specific
- SEO usually does not matter
- tables/forms need client interactivity

## Interview Explanation

If asked "What is Next.js?", say:

> Next.js is a React framework that adds routing, layouts, server rendering, static generation, route handlers, middleware, and production build conventions. React builds components; Next.js organizes those components into a full web application and decides where rendering and data fetching happen.

## Connection To Artistry Cart

In this repo:

- `apps/user-ui` is the buyer-facing Next.js storefront.
- `apps/seller-ui` is the seller-facing Next.js dashboard.
- both use `app/` routes, layouts, providers, route handlers, and UI components.
- both connect to backend services through gateway/API utilities.

