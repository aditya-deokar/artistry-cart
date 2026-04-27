# User UI

## Overview

`user-ui` is the buyer-facing Next.js application. It combines storefront browsing, product detail pages, checkout, profile flows, search, shops, artisans, support content, and a substantial AI Vision experience.

This app is the richest user-facing surface in the repository.

## Responsibilities

- landing and discovery experience
- storefront browsing and product detail
- cart, wishlist, checkout, and payment confirmation flows
- user auth screens
- profile management and order history
- shop and artisan browsing
- support and static content flows
- AI Vision experience, including concept and generation screens

## Route Structure

Major route areas include:

- root landing page
- auth routes: `/login`, `/signup`, `/forgot-password`
- buyer commerce routes under `(pages)` such as cart, checkout, product, shops, events, search, and profile
- support routes: `/support`, `/support/faq`, `/support/contact`, `/support/shipping`, `/support/returns`
- artisan routes: `/artisans`, `/artisans/[id]`
- AI Vision routes: `/ai-vision` and `/ai-vision/concept/[id]`
- about route: `/about`

## State And Data Strategy

Key client-side patterns:

- React Query for server-state fetching and caching
- `NuqsAdapter` for query-state management
- `LocationProvider` for location-aware behavior
- local stores such as `authStore` and `aivisionStore`
- custom hooks for auth, recommendations, location/device tracking, artisans, and AI Vision behavior

## Runtime Behavior

- Next.js App Router application
- default local port `3000`
- custom rewrites route auth, product, order, and AI Vision API traffic through `NEXT_PUBLIC_SERVER_URI`
- route-protection middleware uses an allowlist strategy and redirects unauthenticated users for protected areas
- global layout includes theme support, view transitions, smooth scrolling, and a richer visual shell than the seller UI

## Integration Points

- gateway-backed auth, product, order, and AI Vision APIs
- Stripe public key for checkout
- recommendation flows
- AI Vision API base configuration

## Internal Structure

Key folders:

- `src/app`
- `src/components`
- `src/hooks`
- `src/lib`
- `src/store`
- `src/actions`
- `src/context`

The component surface is broad, with distinct clusters for navigation, landing, products, support, artisans, search, profile, and AI Vision.

## Strengths

- clear separation of route clusters by experience area
- React Query foundation for data fetching
- AI Vision is integrated as a first-class product experience rather than bolted on
- route middleware centralizes basic client-side access protection

## Tradeoffs

- the app has a large surface area and can become hard to navigate without strong documentation
- auth, commerce, content, and AI experiences all coexist in one frontend, which raises complexity
- protected-route logic in middleware depends on path conventions and can drift if routes evolve quickly

## Future Hardening

- document server/client component boundaries more explicitly
- standardize state ownership across hooks, stores, and React Query
- add a dedicated frontend architecture doc for rendering, caching, and route-group conventions
