# Buyer UI, Seller Dashboard, And Full-Stack Architecture

## Why Different Frontends Exist

Different user personas need different interfaces.

In Artistry Cart:

- buyers need a storefront
- sellers need an operations dashboard

These are different products inside the same platform.

## Buyer UI

Buyer-facing UI focuses on:

- discovery
- product browsing
- search
- recommendations
- cart
- wishlist
- checkout
- profile
- order history
- AI-assisted discovery

Important qualities:

- fast first load
- clear product display
- SEO where useful
- smooth checkout
- strong mobile experience
- simple auth experience

## Seller Dashboard

Seller-facing UI focuses on:

- product management
- inventory
- orders
- events
- discounts
- offers
- shop setup
- analytics

Important qualities:

- dense information
- efficient workflows
- tables and filters
- forms and validation
- protected routes
- reliable mutation feedback

## Storefront Versus Dashboard Design

Storefront:

```text
visual browsing
SEO
conversion
consumer trust
fast navigation
```

Dashboard:

```text
productivity
data density
repeat workflows
tables
forms
status tracking
```

This difference affects component design, routing, data fetching, and state management.

## Backend Contracts

Both frontends depend on backend APIs.

Buyer examples:

```text
GET /product/products
POST /order/checkout
GET /recommendation
POST /ai-vision/...
```

Seller examples:

```text
POST /product/products
PATCH /product/products/:id
GET /order/seller
POST /product/discounts
POST /product/events
```

Backend services must enforce permissions for each flow.

## Frontend Architecture Layers

Good frontend structure:

```text
app routes
  -> page/layout components
  -> feature components
  -> shared UI components
  -> hooks
  -> API client
  -> backend API
```

This keeps route files from becoming too large.

## Component Types

### Page Components

Own route-level layout and data needs.

### Feature Components

Represent domain workflows:

- checkout form
- product grid
- discount table
- event creator

### Shared UI Components

Reusable primitives:

- button
- input
- dialog
- table
- badge
- tabs

### Hooks

Reusable stateful logic:

- `useUser`
- `useProducts`
- `useOrders`
- `useDebounce`

### API Clients

Typed functions for backend calls:

- `getProducts`
- `createOrder`
- `updateDiscount`

## Full-Stack Flow Example: Seller Creates Product

```text
1. Seller opens dashboard.
2. Frontend verifies seller auth state.
3. Seller fills product form.
4. Frontend validates required fields.
5. Frontend sends request to gateway.
6. Gateway routes to product-service.
7. Backend auth middleware verifies seller.
8. Product service validates input and ownership.
9. Product is saved to MongoDB.
10. Frontend shows success and updates product list.
```

## Full-Stack Flow Example: Buyer Checkout

```text
1. Buyer reviews cart.
2. Frontend validates address/payment form.
3. Frontend sends checkout request.
4. Gateway routes to order-service.
5. Order service validates items and totals.
6. Order service talks to Stripe.
7. Order/payment state is saved.
8. Frontend shows payment/confirmation state.
9. Stripe webhook later confirms final payment state.
```

## Interview Explanation

If asked "How do buyer and seller UIs differ?", say:

> A buyer UI optimizes for discovery, product presentation, search, checkout, and conversion. A seller dashboard optimizes for authenticated operations: tables, forms, filters, product management, orders, discounts, and analytics. They may share backend services and UI primitives, but their workflows, rendering needs, and state patterns are different.

## Connection To Artistry Cart

Repo examples:

- `apps/user-ui/src/app` contains buyer routes.
- `apps/user-ui/src/components` contains storefront, product, cart, profile, support, AI Vision, and search components.
- `apps/seller-ui/src/app` and dashboard folders contain seller routes.
- `apps/seller-ui/src/components/dashboard` contains operational seller components.
- shared frontend API utilities connect these apps to backend services.

