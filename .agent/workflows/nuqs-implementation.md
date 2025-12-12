---
description: Implementation guide for Type-safe Search Params using nuqs
---

# nuqs: Type-safe URL Query State Management

This document outlines the problem, solution, and implementation details of integrating `nuqs` (Next.js URL Query Strings) into the Artistry Cart frontend.

## The Problem

In modern Next.js applications (App Router), managing state that should be reflected in the URL (like search filters, pagination, sorting) is often verbose and error-prone.

Common issues include:
1.  **Serialization/Deserialization**: Manually encoding and decoding strings, numbers, and arrays from `URLSearchParams`.
2.  **Type Safety**: `searchParams` are always strings. Casting them to numbers or booleans manually is risky.
3.  **Synchronization**: Keeping React state (`useState`) in sync with the URL often leads to `useEffect` spaghetti code or double rendering.
4.  **History Management**: Deciding when to `push` (add new history entry) vs `replace` (update current entry) requires boilerplate logic.
5.  **Server Component Integration**: Passing URL params effectively between Server Components and Client Components.

## The Solution: `nuqs`

`nuqs` (formerly `next-usequerystate`) provides a simple hook-based API `useQueryState` that mimics `React.useState`, but stores the state in the URL query string instead of memory.

### Key Benefits
*   **Type Safety**: define parsers (`parseAsInteger`, `parseAsString`, `parseAsBoolean`) that automatically validate and transform URL values.
*   **Deep Integration**: Works seamlessly with Next.js App Router (`useSearchParams`, `useRouter`).
*   **Performance**: Updates URL shallowly without triggering full page reloads (unless desired).
*   **Developer Experience**: Use it exactly like `useState`. `const [page, setPage] = useQueryState('page', parseAsInteger)`.

## Implementation Details

We have implemented `nuqs` in the Search Results page (`/search`) to manage filtering and pagination state.

### 1. Installation

```bash
pnpm add nuqs
```

### 2. Usage Example (`SearchResultsView.tsx`)

Instead of complex `useEffect` and `router.push` logic:

```tsx
// Before (Standard React State)
const [page, setPage] = useState(1);
// State is lost on refresh, not shareable

// After (nuqs)
import { useQueryState, parseAsInteger } from 'nuqs';

const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
// URL becomes: /search?page=1
// setPage(2) -> URL: /search?page=2
// Refreshing keeps page 2
```

### 3. Advanced Usage (Multiple Parsers)

For complex filter objects, `useQueryStates` allows managing multiple params at once, returning a single state object.

```tsx
import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs';

const [filters, setFilters] = useQueryStates({
  page: parseAsInteger.withDefault(1),
  sortBy: parseAsString.withDefault('relevance'),
  category: parseAsString.withDefault('all'),
});
```

### Files Affected
*   `apps/user-ui/src/components/search/SearchResultsView.tsx`: Refactored to use `nuqs`.
*   `apps/user-ui/src/components/search/SearchFilters.tsx`: Updated to be compatible with type-safe filter setters.

## Best Practices
1.  **Suspense**: Always wrap components using `useQueryState` in a `<Suspense>` boundary (usually in `page.tsx`).
2.  **Defaults**: Use `.withDefault()` to handle missing params gracefully.
3.  **Shallow Routing**: `nuqs` uses `replace` by default with `shallow: true` (in Next.js terms) which is performant. Use `history: 'push'` in options if you want back-button navigation for every filter change.
