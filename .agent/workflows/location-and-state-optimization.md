---
description: Documentation of recent architectural optimizations for State Management and Geolocation
---

# Architectural Optimizations: State Management & Performance

This document outlines the recent technical challenges faced in the `apps/user-ui` application and the solutions implemented to resolve them.

## 1. URL State Synchronization (Search & Filters)

### The Problem
Managing filters (pagination, categories, sorting, pricing) in a client-side application often leads to a disconnect between the UI state and the URL.
*   **No Deep Linking**: Users couldn't share a link to a specific filtered view.
*   **Broken Back Button**: Browser navigation didn't restore the previous filter state.
*   **Complex Prop Drilling**: Passing filter state and setters down through multiple component layers (e.g., `ProductPage` -> `FilterSidebar`).
*   **Type Safety**: URL parameters are always strings, requiring manual parsing and validation (e.g., converting `"priceRange=0,500"` to `[0, 500]`).

### The Solution: `nuqs` (Type-safe Search Params)
We integrated `nuqs` to synchronize React state directly with the URL query string.

*   **Implementation**:
    *   Replaced `useState` with `useQueryState` / `useQueryStates`.
    *   Added `NuqsAdapter` to `Providers.tsx` to interface with Next.js App Router.
*   **Benefits**:
    *   **Automatic Serialization**: State changes (`setFilters`) automatically update the URL.
    *   **Type Safety**: Parsers like `parseAsInteger` and `parseAsArrayOf` ensure data integrity.
    *   **Bookmarking**: A URL like `/product?category=paintings&priceRange=100,500` now loads the page in the exact expected state.

## 2. Geolocation API Rate Limiting

### The Problem
**Error Observed**: `net::ERR_HTTP2_SERVER_REFUSED_STREAM` (and HTTP 429 Too Many Requests).

**Cause**:
The `useLocationTracking` hook was designed to fetch the user's location via the Nominatim (OpenStreetMap) API. However, this hook was instantiated individually inside every `ProductCard` component.
*   When a grid of 12+ products loaded, 12+ simultaneous requests were fired to the geolocation API.
*   This violated Nominatim's **Usage Policy** (max 1 request per second), leading to the server blocking our requests.

### The Solution: Singleton `LocationContext`
We moved the location logic from a local hook to a global React Context.

*   **Implementation**:
    *   **`LocationContext.tsx`**: Created a provider that fetches the location **only once** when the application loads.
    *   **`useLocation` Hook**: Updated to allow components to *consume* the already-fetched data from the context, rather than triggering a new fetch.
    *   **Global Provider**: Wrapped the application in `LocationProvider` within `Providers.tsx`.

*   **Benefits**:
    *   **Performance**: Reduced N network requests to exactly 1 request per session.
    *   **Stability**: Eliminates API rate-limit errors.
    *   **Efficiency**: Components like `ProductCard` now render instantly without waiting for individual location lookups.
