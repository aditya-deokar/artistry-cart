# Artistry Cart — Testing Implementation Plan

## Vitest + Supertest | Phase-wise Rollout

> **Date:** February 28, 2026
> **Stack:** Nx Monorepo · Express.js · Prisma (MongoDB) · Redis · Stripe · Kafka
> **Test Runner:** Vitest · **HTTP Testing:** Supertest · **Mocking:** vitest built-in (`vi`)

---

## Table of Contents

- [Why Vitest over Jest](#why-vitest-over-jest)
- [Testing Tiers](#testing-tiers)
- [New Dependencies](#new-dependencies)
- [Phase 0 — Infrastructure Setup](#phase-0--infrastructure-setup-foundation)
- [Phase 1 — Shared Packages](#phase-1--shared-packages-packagesmiddleware--error-handler)
- [Phase 2 — Product Service](#phase-2--product-service-unit--integration)
- [Phase 3 — Auth Service Migration](#phase-3--auth-service-jest--vitest-migration)
- [Phase 4 — Order Service](#phase-4--order-service-unit--integration)
- [Phase 5 — API Gateway](#phase-5--api-gateway-integration)
- [Phase 6 — Recommendation Service](#phase-6--recommendation-service)
- [Phase 7 — E2E Tests](#phase-7--e2e-tests-all-services)
- [Phase 8 — CI/CD & Coverage Gates](#phase-8--cicd--coverage-gates)
- [Appendix — File Inventory per Service](#appendix--file-inventory-per-service)

---

## Why Vitest over Jest

| Feature | Vitest | Jest (current) |
|---|---|---|
| **ESM native** | First-class, zero-config | Requires experimental flags / transforms |
| **Speed** | Uses Vite's transform — 2-5x faster on large projects | SWC helps but still slower on cold starts |
| **Watch mode** | Instant HMR-powered re-runs | Full re-transform on each run |
| **API compatibility** | Drop-in Jest-compatible (`describe`, `it`, `expect`) | N/A |
| **Mocking** | `vi.mock()`, `vi.fn()`, `vi.spyOn()` — same API shape as Jest | `jest.mock()`, `jest.fn()` |
| **TypeScript** | Native — no `ts-jest` or `@swc/jest` needed | Requires transform config |
| **In-source testing** | Supported | Not supported |
| **Workspace support** | Vitest workspaces align perfectly with Nx | Nx manages project detection |
| **Migration cost** | `jest.fn()` → `vi.fn()`, `jest.mock()` → `vi.mock()` — mechanical find/replace | N/A |

---

## Testing Tiers

| Tier | Tool | What it tests | External deps | Runs in CI |
|---|---|---|---|---|
| **Unit** | Vitest + `vi.fn()` | Individual controller functions, service methods, utils | ALL mocked (Prisma, Redis, Stripe, imageKit, Kafka) | ✅ Every PR |
| **Integration** | Vitest + Supertest | HTTP request → Express router → controller → mocked DB layer | Real Express app, mocked Prisma/Redis/Stripe | ✅ Every PR |
| **E2E** | Vitest + Axios | Full HTTP flow against running services with test DB | Real services, real DB (test), real Redis | ✅ Nightly / pre-deploy |

---

## New Dependencies

```bash
# Root-level install
pnpm add -D vitest @vitest/coverage-v8 supertest @types/supertest unplugin-swc
```

| Package | Purpose |
|---|---|
| `vitest` | Test runner replacing Jest |
| `@vitest/coverage-v8` | V8-based code coverage (faster than istanbul) |
| `supertest` | In-memory Express HTTP assertions for integration tests |
| `@types/supertest` | TypeScript types for supertest |
| `unplugin-swc` | Optional: use SWC transform in Vitest for even faster compilation |

### Packages to remove (after full migration)

```bash
pnpm remove @nx/jest @swc/jest @types/jest jest jest-environment-node ts-jest
```

> ⚠️ Remove only after Phase 3 (auth-service migration) is complete.

---

## Phase 0 — Infrastructure Setup (Foundation)

**Goal:** Configure Vitest at monorepo root + create reusable shared test utilities.

### 0.1 — Root Vitest Config

**Create:** `vitest.workspace.ts` (root)

```ts
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'apps/product-service',
  'apps/auth-service',
  'apps/order-service',
  'apps/api-gateway',
  'apps/recommendation-service',
  'packages/middleware',
  'packages/error-handler',
]);
```

### 0.2 — Shared Test Utilities Package

**Create:** `packages/test-utils/` — reusable across ALL services

```
packages/test-utils/
├── index.ts                  # barrel export
├── mocks/
│   ├── prisma.mock.ts        # Prisma mock factory (covers ALL models)
│   ├── redis.mock.ts         # Redis in-memory mock
│   ├── imagekit.mock.ts      # ImageKit upload/delete mock
│   ├── stripe.mock.ts        # Stripe mock (payment intents, accounts, etc.)
│   ├── kafka.mock.ts         # Kafka producer/consumer mock
│   └── nodemailer.mock.ts    # Email sending mock
├── helpers/
│   ├── request.helper.ts     # mockRequest(), mockResponse(), mockNext()
│   ├── auth.helper.ts        # createMockToken(), createAuthHeaders()
│   └── data-factories.ts     # createMockUser(), createMockProduct(), createMockOrder(), etc.
├── setup/
│   └── global-setup.ts       # env vars, console suppression, custom matchers
└── types.d.ts                # Custom matcher type declarations
```

### 0.3 — Shared Mock Details

**`packages/test-utils/mocks/prisma.mock.ts`**

Covers ALL Prisma models from schema: `users`, `sellers`, `shops`, `products`, `orders`, `OrderItem`, `payments`, `addresses`, `shopReviews`, `events`, `EventProductDiscount`, `discount_codes`, `discount_usage`, `pricing`, `productAnalytics`, `UserAnalytics`, `Notification`, `site_config`, `payouts`

Each model mock provides: `findUnique`, `findFirst`, `findMany`, `create`, `update`, `delete`, `count`, `aggregate`, `groupBy`, `updateMany`, `deleteMany`

Plus: `$transaction`, `$connect`, `$disconnect`

**`packages/test-utils/mocks/redis.mock.ts`**

In-memory `Map<string, string>` with: `get`, `set`, `del`, `exists`, `expire`, `ttl`, `incr`, `decr`, `keys`, `setex`, `flushall`, `isAvailable`

**`packages/test-utils/mocks/stripe.mock.ts`**

Mocks for: `paymentIntents.create`, `paymentIntents.retrieve`, `accounts.create`, `accountLinks.create`, `checkout.sessions.create`, `refunds.create`, `transfers.create`, `balance.retrieve`

**`packages/test-utils/helpers/data-factories.ts`**

Factories for every entity:
```ts
createMockUser(overrides?)       // → users record
createMockSeller(overrides?)     // → sellers record
createMockShop(overrides?)       // → shops record
createMockProduct(overrides?)    // → products record (with pricing, images)
createMockOrder(overrides?)      // → orders record (with items, payment)
createMockEvent(overrides?)      // → events record
createMockDiscount(overrides?)   // → discount_codes record
createMockAddress(overrides?)    // → addresses record
createMockPayment(overrides?)    // → payments record
```

### 0.4 — Nx Configuration Update

**Update `nx.json`:** Replace `@nx/jest/plugin` with custom Vitest targets or use `@nx/vite` plugin.

```jsonc
// Replace the @nx/jest/plugin entry with:
{
  "plugin": "@nx/vite/plugin",
  "options": {
    "testTargetName": "test"
  }
}
```

Or define targets manually in each project's `project.json` / `package.json`:

```jsonc
{
  "targets": {
    "test": {
      "command": "vitest run",
      "options": { "cwd": "apps/product-service" }
    },
    "test:watch": {
      "command": "vitest",
      "options": { "cwd": "apps/product-service" }
    },
    "test:coverage": {
      "command": "vitest run --coverage",
      "options": { "cwd": "apps/product-service" }
    }
  }
}
```

### 0.5 — Root Scripts

**Update `package.json`:**

```jsonc
{
  "scripts": {
    "test": "pnpm exec nx run-many --target=test --all",
    "test:unit": "pnpm exec nx run-many --target=test --all --exclude='*-e2e'",
    "test:e2e": "pnpm exec nx run-many --target=e2e --all",
    "test:coverage": "pnpm exec nx run-many --target=test:coverage --all",
    "test:affected": "pnpm exec nx affected --target=test"
  }
}
```

### Phase 0 Deliverables

| File | Action |
|---|---|
| `vitest.workspace.ts` | Create |
| `packages/test-utils/**` | Create (all shared mocks, helpers, factories, setup) |
| `nx.json` | Update (jest → vitest plugin) |
| `package.json` (root) | Update scripts, add devDependencies |
| Each service `vitest.config.ts` | Create (per-service config) |

### Estimated Effort: **1–2 days**

---

## Phase 1 — Shared Packages (`packages/middleware` & `error-handler`)

**Goal:** Test all shared middleware and error handling — these are foundational to every service.

### 1.1 — `packages/middleware` Vitest Config

**Create:** `packages/middleware/vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.spec.ts', '**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['*.ts'],
      exclude: ['*.spec.ts', '*.test.ts'],
    },
  },
});
```

### 1.2 — Migrate `isAuthenticated.spec.ts` (Jest → Vitest)

**Current file:** `packages/middleware/isAuthenticated.spec.ts` (326 lines, Jest)

**Migration steps (mechanical):**
1. Replace `jest.mock(...)` → `vi.mock(...)`
2. Replace `jest.fn(...)` → `vi.fn(...)`
3. Replace `jest.spyOn(...)` → `vi.spyOn(...)`
4. Replace `jest.requireActual(...)` → `vi.importActual(...)`
5. Replace `jest.clearAllMocks()` → `vi.clearAllMocks()`
6. Add `import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';`
7. Remove `@jest/globals` imports if any

### 1.3 — New Tests to Write

| File | Tests | Priority |
|---|---|---|
| `packages/middleware/isAuthenticated.spec.ts` | **Migrate existing** (326 lines) | 🔴 Critical |
| `packages/middleware/isAdmin.spec.ts` | **NEW** — test admin role check, 403 on non-admin | 🔴 Critical |
| `packages/middleware/authorizedRoles.spec.ts` | **NEW** — test `isSeller`, `isUser` guards | 🔴 Critical |
| `packages/error-handler/index.spec.ts` | **NEW** — test all error classes (AppError, NotFoundError, ValidationError, AuthError, ForbiddenError, DatabaseError, RateLimitError, InternalServerError) | 🟡 High |
| `packages/error-handler/error-middleware.spec.ts` | **NEW** — test error middleware response shapes for each error type, Prisma errors (P2002, P2025), ZodError, generic errors | 🟡 High |

### 1.3.1 — `isAdmin.spec.ts` Test Cases

```
describe('isAdmin middleware')
  ✓ should call next() when user.role is ADMIN
  ✓ should return 403 when user.role is USER
  ✓ should return 403 when user.role is undefined
  ✓ should return 403 when req.user is missing
```

### 1.3.2 — `authorizedRoles.spec.ts` Test Cases

```
describe('isSeller middleware')
  ✓ should call next() when req.role is "seller"
  ✓ should return 403 when req.role is "user"
  ✓ should return 403 when req.role is undefined

describe('isUser middleware')
  ✓ should call next() when req.role is "user"
  ✓ should return 403 when req.role is "seller"
```

### 1.3.3 — `error-handler/index.spec.ts` Test Cases

```
describe('Error Classes')
  describe('AppError')
    ✓ should set statusCode, message, code, isOperational
    ✓ should default isOperational to true

  describe('NotFoundError')
    ✓ should set statusCode 404 and code NOT_FOUND
    ✓ should accept custom message

  describe('ValidationError')
    ✓ should set statusCode 400 and accept details
    ✓ should default message

  describe('AuthError')
    ✓ should set statusCode 401

  describe('ForbiddenError')
    ✓ should set statusCode 403
    
  // ... same pattern for DatabaseError, RateLimitError, InternalServerError
```

### 1.3.4 — `error-handler/error-middleware.spec.ts` Test Cases

```
describe('errorMiddleware')
  ✓ should handle AppError with correct shape: { success: false, error: { code, message } }
  ✓ should handle NotFoundError → 404
  ✓ should handle ValidationError → 400 with details
  ✓ should handle AuthError → 401
  ✓ should handle PrismaClientKnownRequestError P2002 → 409 Conflict
  ✓ should handle PrismaClientKnownRequestError P2025 → 404 Not Found
  ✓ should handle PrismaClientInitializationError → 503
  ✓ should handle ZodError → 400 with field errors
  ✓ should handle ECONNREFUSED → 503
  ✓ should handle unknown errors → 500 with generic message
  ✓ should not expose error details in production (NODE_ENV=production)
```

### Phase 1 Deliverables

| File | Action | Tests |
|---|---|---|
| `packages/middleware/vitest.config.ts` | Create | — |
| `packages/middleware/isAuthenticated.spec.ts` | Migrate Jest → Vitest | ~20 tests |
| `packages/middleware/isAdmin.spec.ts` | Create NEW | 4 tests |
| `packages/middleware/authorizedRoles.spec.ts` | Create NEW | 5 tests |
| `packages/error-handler/vitest.config.ts` | Create | — |
| `packages/error-handler/index.spec.ts` | Create NEW | ~16 tests |
| `packages/error-handler/error-middleware.spec.ts` | Create NEW | ~11 tests |

### Estimated Effort: **1–2 days**

---

## Phase 2 — Product Service (Unit & Integration)

**Goal:** Full unit + integration test coverage for the largest service.

### 2.1 — Vitest Config

**Create:** `apps/product-service/vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    setupFiles: ['src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/__tests__/**', 'src/**/*.spec.ts', 'src/main.ts', 'src/assets/**'],
      thresholds: {
        branches: 70,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@test-utils': path.resolve(__dirname, '../../packages/test-utils'),
    },
  },
});
```

### 2.2 — Test Setup

**Create:** `apps/product-service/src/__tests__/setup.ts`

```ts
import { vi } from 'vitest';

// Environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '6002';
process.env.ACCESS_TOKEN_SECRET = 'test-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
process.env.IMAGEKIT_PUBLIC_KEY = 'test-ik-public';
process.env.IMAGEKIT_PRIVATE_KEY = 'test-ik-private';
process.env.IMAGEKIT_URL_ENDPOINT = 'https://ik.imagekit.io/test';

// Suppress console in tests
if (!process.env.DEBUG) {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
}
```

### 2.3 — Test File Structure

```
apps/product-service/src/
├── __tests__/
│   └── setup.ts
├── controllers/
│   ├── product.controller.spec.ts          ← UNIT (54 tests)
│   ├── discountController.spec.ts          ← UNIT (32 tests)
│   ├── eventsController.spec.ts            ← UNIT (38 tests)
│   ├── offers.controller.spec.ts           ← UNIT (18 tests)
│   ├── search.controller.spec.ts           ← UNIT (24 tests)
│   └── shop.controller.spec.ts             ← UNIT (20 tests)
├── lib/
│   └── pricing.service.spec.ts             ← UNIT (22 tests)
├── jobs/
│   └── product-cron.job.spec.ts            ← UNIT (6 tests)
└── routes/
    ├── product.route.integration.spec.ts   ← INTEGRATION (30 tests)
    ├── shop.route.integration.spec.ts      ← INTEGRATION (12 tests)
    ├── search.route.integration.spec.ts    ← INTEGRATION (14 tests)
    ├── events.route.integration.spec.ts    ← INTEGRATION (20 tests)
    ├── discounts.route.integration.spec.ts ← INTEGRATION (18 tests)
    └── offers.route.integration.spec.ts    ← INTEGRATION (12 tests)
```

### 2.4 — Unit Test Plans (per controller)

#### 2.4.1 — `product.controller.spec.ts`

**Mocks required:** `prisma`, `imagekit`, `redis`, `PricingService`

```
describe('getCategories')
  ✓ should return categories and subCategories
  ✓ should return 404 when no config found
  ✓ should call next(error) on Prisma failure

describe('uploadProductImage')
  ✓ should upload image and return file_url + file_id
  ✓ should return ValidationError when fileName missing
  ✓ should call next on imageKit failure

describe('deleteProductImage')
  ✓ should delete image by fileId
  ✓ should call next on failure

describe('getAllProducts')
  ✓ should return paginated products with default page=1, limit=10
  ✓ should apply category filter
  ✓ should apply subCategory filter
  ✓ should apply price range filter (minPrice, maxPrice)
  ✓ should apply search query filter (title contains)
  ✓ should apply sort: price-low, price-high, newest, oldest
  ✓ should return empty data when no products match
  ✓ should include product count and pagination metadata

describe('getProductBySlug')
  ✓ should return product with shop, pricing, analytics
  ✓ should return 404 for non-existent slug
  ✓ should increment view count in analytics

describe('getProductsByIds')
  ✓ should return products matching given IDs array
  ✓ should return empty array for no matches
  ✓ should handle invalid ObjectId gracefully

describe('createProduct')
  ✓ should create product with valid data + Zod validation passes
  ✓ should return ValidationError for missing required fields
  ✓ should return AuthError when seller has no shop
  ✓ should call PricingService.updateCachedPricing after creation
  ✓ should handle slug collision

describe('getSellerProducts')
  ✓ should return only products belonging to seller's shop
  ✓ should apply status filter (Active/Pending/Draft)
  ✓ should paginate results
  ✓ should return AuthError when seller has no shop

describe('updateProduct')
  ✓ should update product fields
  ✓ should verify seller owns the product
  ✓ should recalculate pricing on price change
  ✓ should return 404 for non-existent product
  ✓ should return 403 when seller doesn't own product

describe('deleteProduct')
  ✓ should soft-delete (set deletedAt)
  ✓ should return 404 for non-existent product
  ✓ should verify ownership

describe('restoreProduct')
  ✓ should clear deletedAt field
  ✓ should return 404 for non-existent product

describe('getAllProductsAdmin')
  ✓ should return all products regardless of seller
  ✓ should include pagination

describe('updateProductStatusAdmin')
  ✓ should update product status (Active/Pending/Draft)
  ✓ should return 404 for non-existent product

describe('validateCoupon')
  ✓ should validate a valid coupon code
  ✓ should return error for expired coupon
  ✓ should return error for non-existent coupon

describe('getSellerProductsSummary')
  ✓ should return total products, active, pending, draft counts
  ✓ should return AuthError when seller has no shop
```

#### 2.4.2 — `discountController.spec.ts`

**Mocks required:** `prisma`, `redis`

```
describe('createDiscountCode')
  ✓ should create discount code with valid data
  ✓ should validate required fields (code, discountType, value, startDate, endDate)
  ✓ should return error for duplicate code within same shop
  ✓ should return AuthError when seller has no shop

describe('getSellerDiscountCodes')
  ✓ should return discount codes for seller's shop
  ✓ should paginate results
  ✓ should filter by status (active/expired/upcoming)

describe('updateDiscountCode')
  ✓ should update discount code fields
  ✓ should verify seller owns the discount code
  ✓ should return 404 for non-existent discount

describe('deleteDiscountCode')
  ✓ should delete discount code
  ✓ should verify ownership
  ✓ should return 404 for non-existent discount

describe('validateDiscountCode')
  ✓ should validate code exists and is active
  ✓ should check expiry date
  ✓ should check usage limits
  ✓ should check minimum order amount
  ✓ should return error for exceeded usage per user

describe('applyDiscountCode')
  ✓ should apply percentage discount correctly
  ✓ should apply fixed discount correctly
  ✓ should cap at maxDiscountAmount
  ✓ should create discount_usage record
  ✓ should check user hasn't exceeded usage limit

describe('getDiscountUsageStats')
  ✓ should return total uses, unique users, total discount given
  ✓ should verify seller owns the discount code
```

#### 2.4.3 — `eventsController.spec.ts`

**Mocks required:** `prisma`, `redis`, `PricingService`

```
describe('createEvent')
  ✓ should create event with valid data
  ✓ should validate event type enum
  ✓ should validate dates (start < end, not in past)
  ✓ should return AuthError when seller has no shop

describe('getAllEvents')
  ✓ should return paginated events
  ✓ should filter by type (FLASH_SALE, SEASONAL, etc.)
  ✓ should filter by shop
  ✓ should filter by status (active/upcoming/ended)

describe('getSellerEvents')
  ✓ should return only seller's events
  ✓ should paginate and filter

describe('getEventById')
  ✓ should return event with products
  ✓ should return 404 for non-existent event

describe('updateEvent')
  ✓ should update event fields
  ✓ should verify seller owns the event
  ✓ should recalculate product pricing on discount changes
  ✓ should return 404 for non-existent event

describe('deleteEvent')
  ✓ should delete event and clean up product discounts
  ✓ should verify ownership
  ✓ should recalculate affected product pricing

describe('getSellerProductsForEvent')
  ✓ should return seller's products eligible for event
  ✓ should exclude already-assigned products if flag set

describe('updateEventProducts')
  ✓ should add products to event
  ✓ should remove products from event
  ✓ should recalculate pricing for affected products

describe('createEventWithProduct')
  ✓ should create event + assign products in one call
  ✓ should validate all products belong to seller's shop
  ✓ should rollback if any product assignment fails
```

#### 2.4.4 — `offers.controller.spec.ts`

```
describe('getUserOffers')
  ✓ should return active offers based on events

describe('getDealsByCategory')
  ✓ should return discounted products in category

describe('getLimitedTimeOffers')
  ✓ should return time-limited event products

describe('getSeasonalOffers')
  ✓ should return seasonal event products

describe('getOfferStatistics')
  ✓ should return total active offers, total discount value
```

#### 2.4.5 — `search.controller.spec.ts`

```
describe('liveSearch')
  ✓ should return matching products, shops, events (limit 5 each)
  ✓ should handle empty query
  ✓ should be case-insensitive

describe('fullSearch')
  ✓ should search across products, shops, events with pagination
  ✓ should apply category filter
  ✓ should apply price range filter

describe('searchProducts')
  ✓ should search products by title, description, tags
  ✓ should paginate results

describe('searchEvents')
  ✓ should search events by title
  ✓ should filter by event type

describe('searchShops')
  ✓ should search shops by name, category
  ✓ should include ratings filter

describe('getSearchSuggestions')
  ✓ should return autocomplete suggestions from products + shops
  ✓ should cache results in Redis
  ✓ should return cached results when available

describe('sellerSearch')
  ✓ should search only within seller's shop products
  ✓ should require authentication
```

#### 2.4.6 — `shop.controller.spec.ts`

```
describe('getAllShops')
  ✓ should return paginated shops
  ✓ should filter by category
  ✓ should sort by ratings

describe('getShopBySlug')
  ✓ should return shop with products count and rating
  ✓ should return 404 for non-existent slug

describe('getProductsForShop')
  ✓ should return paginated products for shop
  ✓ should filter by category/price

describe('getReviewsForShop')
  ✓ should return paginated reviews
  ✓ should include user info (name, avatar)

describe('createShopReview')
  ✓ should create review with rating and text
  ✓ should update shop aggregate rating
  ✓ should prevent duplicate reviews from same user

describe('getShopCategories')
  ✓ should return distinct categories from products in shop
```

#### 2.4.7 — `pricing.service.spec.ts`

```
describe('PricingService')
  describe('isEventActive')
    ✓ should return true for currently active event
    ✓ should return false for future event
    ✓ should return false for expired event
    ✓ should return false for null event
    ✓ should use referenceDate when provided

  describe('deriveEventDiscount')
    ✓ should calculate percentage discount correctly
    ✓ should calculate fixed discount correctly
    ✓ should return null when no active event
    ✓ should respect maxDiscountAmount cap

  describe('calculateProductPrice')
    ✓ should return originalPrice when no discounts
    ✓ should apply sale_price discount
    ✓ should apply event discount
    ✓ should pick best discount when multiple apply
    ✓ should include savings amount and percentage

  describe('updateCachedPricing')
    ✓ should create/update pricing record in DB
    ✓ should handle product not found

  describe('buildPricingRecord')
    ✓ should build correct create payload
    ✓ should include productUpdate with new prices

  describe('calculatePercent / roundPercent')
    ✓ should calculate percentage correctly
    ✓ should round to 2 decimal places
```

#### 2.4.8 — `product-cron.job.spec.ts`

```
describe('Product Cron Job')
  ✓ should delete products past grace period
  ✓ should delete related pricing, analytics, event discounts in transaction
  ✓ should not delete products within grace period
  ✓ should handle empty result (no products to delete)
  ✓ should handle transaction failure gracefully
  ✓ should log deletion count
```

### 2.5 — Integration Tests (Supertest)

Integration tests mount the real Express app (extracted from `main.ts`) and make HTTP requests via Supertest. Prisma and Redis are mocked at the module level.

**Prerequisite:** Extract Express app creation into a separate file:

**Create:** `apps/product-service/src/app.ts`

```ts
// Extract from main.ts — the app creation WITHOUT app.listen()
import express from 'express';
// ... all middleware and routes ...
const app = express();
// ... setup ...
export default app;
```

**Update:** `apps/product-service/src/main.ts`

```ts
import app from './app';
const server = app.listen(port, () => { ... });
```

This lets Supertest import `app` without starting a real server.

#### 2.5.1 — `product.route.integration.spec.ts`

```
describe('Product Routes Integration')
  describe('GET /api/products')
    ✓ should return 200 with paginated products
    ✓ should respect query params (page, limit, category)
    ✓ should return correct JSON shape

  describe('GET /api/product/:slug')
    ✓ should return 200 with product data
    ✓ should return 404 for unknown slug

  describe('GET /api/categories')
    ✓ should return 200 with categories array

  describe('POST /api/products (authenticated)')
    ✓ should return 401 without auth token
    ✓ should return 201 with valid product data + auth
    ✓ should return 400 with invalid data (Zod validation)

  describe('PUT /api/products/:productId (authenticated)')
    ✓ should return 401 without auth token
    ✓ should return 200 on successful update
    ✓ should return 404 for non-existent product

  describe('DELETE /api/products/:productId (authenticated)')
    ✓ should return 401 without auth token
    ✓ should return 200 on successful soft-delete

  describe('GET /api/admin/products (admin)')
    ✓ should return 403 for non-admin user
    ✓ should return 200 for admin user

  // ... similar for other endpoints
```

#### 2.5.2 — Similar integration specs for shop, search, events, discounts, offers routes

Each integration spec follows the same pattern:
1. Mock Prisma/Redis/external deps at module level
2. Import `app` from `../app`
3. Use `supertest(app).get('/api/...').expect(200)`
4. Verify response body shape and data

### Phase 2 Deliverables

| File | Action | Tests Count |
|---|---|---|
| `apps/product-service/vitest.config.ts` | Create | — |
| `apps/product-service/tsconfig.spec.json` | Create | — |
| `apps/product-service/src/__tests__/setup.ts` | Create | — |
| `apps/product-service/src/app.ts` | Create (extract from main.ts) | — |
| `apps/product-service/src/main.ts` | Update (import from app.ts) | — |
| `src/controllers/product.controller.spec.ts` | Create | ~54 tests |
| `src/controllers/discountController.spec.ts` | Create | ~32 tests |
| `src/controllers/eventsController.spec.ts` | Create | ~38 tests |
| `src/controllers/offers.controller.spec.ts` | Create | ~18 tests |
| `src/controllers/search.controller.spec.ts` | Create | ~24 tests |
| `src/controllers/shop.controller.spec.ts` | Create | ~20 tests |
| `src/lib/pricing.service.spec.ts` | Create | ~22 tests |
| `src/jobs/product-cron.job.spec.ts` | Create | ~6 tests |
| `src/routes/product.route.integration.spec.ts` | Create | ~30 tests |
| `src/routes/shop.route.integration.spec.ts` | Create | ~12 tests |
| `src/routes/search.route.integration.spec.ts` | Create | ~14 tests |
| `src/routes/events.route.integration.spec.ts` | Create | ~20 tests |
| `src/routes/discounts.route.integration.spec.ts` | Create | ~18 tests |
| `src/routes/offers.route.integration.spec.ts` | Create | ~12 tests |
| **Total** | | **~320 tests** |

### Estimated Effort: **5–7 days**

---

## Phase 3 — Auth Service (Jest → Vitest Migration)

**Goal:** Migrate 6 existing spec files from Jest to Vitest + add integration tests.

### 3.1 — Vitest Config

**Create:** `apps/auth-service/vitest.config.ts` (replacing `jest.config.ts`)

Same structure as product-service, with coverage thresholds matching existing config (70% branches, 80% functions/lines/statements).

### 3.2 — Migration Checklist (per file)

Each existing spec file needs these mechanical changes:

| Find | Replace |
|---|---|
| `import { jest } from '@jest/globals'` | `import { vi } from 'vitest'` |
| `import { expect } from '@jest/globals'` | `import { expect } from 'vitest'` |
| `jest.mock(` | `vi.mock(` |
| `jest.fn(` | `vi.fn(` |
| `jest.spyOn(` | `vi.spyOn(` |
| `jest.clearAllMocks()` | `vi.clearAllMocks()` |
| `jest.resetAllMocks()` | `vi.resetAllMocks()` |
| `jest.restoreAllMocks()` | `vi.restoreAllMocks()` |
| `jest.requireActual(` | `await vi.importActual(` |
| `jest.useFakeTimers()` | `vi.useFakeTimers()` |
| `jest.useRealTimers()` | `vi.useRealTimers()` |

### 3.3 — Files to Migrate

| File | Lines | Estimated Tests |
|---|---|---|
| `src/controller/auth.controller.spec.ts` | 795 | ~30 tests |
| `src/controller/user.controller.spec.ts` | 416 | ~18 tests |
| `src/oauth/oauth.controller.spec.ts` | 448 | ~15 tests |
| `src/utils/auth.helper.spec.ts` | 349 | ~20 tests |
| `src/utils/slugify.spec.ts` | 144 | ~10 tests |
| `src/utils/cookies/setCookie.spec.ts` | 193 | ~8 tests |

### 3.4 — Migrate Mock Files

| File | Changes |
|---|---|
| `src/__tests__/mocks/prisma.mock.ts` | `jest.fn()` → `vi.fn()` |
| `src/__tests__/mocks/redis.mock.ts` | `jest.fn()` → `vi.fn()` |
| `src/__tests__/setup.ts` | Remove `@jest/globals`, use `vi.spyOn`, update custom matchers to Vitest `expect.extend()` |
| `src/__tests__/types.d.ts` | Update matcher types for Vitest `Assertion` interface |

### 3.5 — New Integration Tests

**Create:** `apps/auth-service/src/app.ts` (extract from main.ts)

| File | Tests |
|---|---|
| `src/routes/auth.route.integration.spec.ts` | ~25 tests (registration, login, logout, OTP, password reset, seller flows) |
| `src/routes/user.route.integration.spec.ts` | ~15 tests (profile CRUD, addresses, orders) |
| `src/oauth/oauth.route.integration.spec.ts` | ~10 tests (OAuth login redirects, callback mocks) |

### 3.6 — Cleanup

| File | Action |
|---|---|
| `apps/auth-service/jest.config.ts` | **Delete** |
| `apps/auth-service/tsconfig.spec.json` | Update compiler options for Vitest |

### Phase 3 Deliverables

| Category | Count |
|---|---|
| Migrated unit test files | 6 files (~101 tests) |
| Migrated mock files | 2 files |
| Migrated setup files | 2 files |
| New integration test files | 3 files (~50 tests) |
| Config changes | 3 files |
| **Total** | **~151 tests (101 migrated + 50 new)** |

### Estimated Effort: **2–3 days**

---

## Phase 4 — Order Service (Unit & Integration)

**Goal:** Complete test coverage for payment flows, order management, and seller operations.

### 4.1 — Vitest Config + Setup

Same pattern as product-service. Additional env vars:

```ts
process.env.STRIPE_SECRETE_KEY = 'sk_test_mock_key';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';
process.env.REDIS_URL = 'redis://localhost:6379';
```

### 4.2 — Test File Structure

```
apps/order-service/src/
├── __tests__/
│   └── setup.ts
├── controllers/
│   ├── order.controller.spec.ts          ← UNIT (42 tests)
│   └── seller-order.controller.spec.ts   ← UNIT (12 tests)
├── utils/
│   └── send-email/
│       └── index.spec.ts                 ← UNIT (4 tests)
└── routes/
    └── order.route.integration.spec.ts   ← INTEGRATION (28 tests)
```

### 4.3 — `order.controller.spec.ts` Test Cases

**Mocks required:** `prisma`, `stripe`, `redis` (direct ioredis instance in controller), `nodemailer`

> **Note:** Order service uses direct `new Redis()` in controller — NOT the shared package. The mock must intercept the `ioredis` import.

```
describe('createPaymentIntent')
  ✓ should create Stripe payment intent with correct amount
  ✓ should include metadata (userId, orderId)
  ✓ should handle Stripe API errors

describe('createPaymentSession')
  ✓ should store session in Redis with cart items
  ✓ should set TTL (expiry) on session
  ✓ should validate cart items (product existence, stock check)
  ✓ should calculate correct total with discounts
  ✓ should return 400 for empty cart

describe('verifyingPaymentSession')
  ✓ should retrieve session from Redis
  ✓ should return 404 for expired/missing session
  ✓ should return session data with cart items

describe('createOrder')
  ✓ should create order from verified payment
  ✓ should create OrderItems for each cart item
  ✓ should create payment record
  ✓ should update product stock (decrement)
  ✓ should send order confirmation email
  ✓ should handle transaction failure (rollback)

describe('verifySessionAndCreateIntent')
  ✓ should verify session + create payment intent in one call
  ✓ should return 404 if session missing

describe('getUserOrders')
  ✓ should return paginated orders for authenticated user
  ✓ should include order items and payment status

describe('getOrderDetails')
  ✓ should return full order with items, product details, payment
  ✓ should verify order belongs to user
  ✓ should return 404 for non-existent order

describe('getPaymentStatus')
  ✓ should return payment status from Stripe

describe('cancelOrder')
  ✓ should cancel pending order
  ✓ should restore product stock
  ✓ should return error for already-shipped order
  ✓ should initiate Stripe refund

describe('requestRefund')
  ✓ should create refund request
  ✓ should validate order is eligible for refund

describe('getSellerEarnings')
  ✓ should return total earnings, pending, available
  ✓ should group by time period (weekly/monthly)

describe('getSellerPayouts')
  ✓ should return payout history

describe('requestSellerPayout')
  ✓ should create Stripe transfer to connected account
  ✓ should validate minimum payout amount
  ✓ should return error if Stripe onboarding not complete
```

### 4.4 — `seller-order.controller.spec.ts` Test Cases

```
describe('getSellerOrders')
  ✓ should return orders for seller's shop
  ✓ should filter by status
  ✓ should paginate

describe('updateOrderStatus')
  ✓ should update delivery status
  ✓ should verify seller owns the order's shop
  ✓ should return 404 for non-existent order

describe('getSellerAnalytics')
  ✓ should return total orders, revenue, average order value
  ✓ should filter by date range

describe('getSellerOrderDetails')
  ✓ should return order details
  ✓ should verify seller owns the order's shop
```

### 4.5 — Integration Tests

```
describe('Order Routes Integration')
  describe('POST /order/api/create-payment-session')
    ✓ should return 401 without auth
    ✓ should return 200 with valid session
    ✓ should return 400 with empty cart

  describe('GET /order/api/orders')
    ✓ should return 401 without auth
    ✓ should return 200 with user's orders

  describe('GET /order/api/orders/:orderId')
    ✓ should return 200 with order details
    ✓ should return 404 for non-existent order

  describe('POST /order/api/orders/:orderId/cancel')
    ✓ should return 200 on successful cancel
    ✓ should return 400 for non-cancellable order

  describe('Seller Routes')
    ✓ should return 403 for non-seller user
    ✓ GET /order/api/seller/orders should return 200
    ✓ PUT /order/api/seller/orders/:id/status should return 200
    ✓ GET /order/api/seller/earnings should return 200
    ✓ GET /order/api/seller/analytics should return 200

  describe('Webhook Routes')
    ✓ POST /order/api/webhooks should process payment_intent.succeeded
    ✓ POST /order/api/webhooks should process charge.refunded
    ✓ POST /order/api/webhooks should reject invalid signature
```

### Phase 4 Deliverables

| File | Tests |
|---|---|
| `controllers/order.controller.spec.ts` | ~42 tests |
| `controllers/seller-order.controller.spec.ts` | ~12 tests |
| `utils/send-email/index.spec.ts` | ~4 tests |
| `routes/order.route.integration.spec.ts` | ~28 tests |
| **Total** | **~86 tests** |

### Estimated Effort: **3–4 days**

---

## Phase 5 — API Gateway (Integration)

**Goal:** Test proxy routing, rate limiting, and site config initialization.

### 5.1 — Vitest Config

**Create:** `apps/api-gateway/vitest.config.ts`

### 5.2 — Test File Structure

```
apps/api-gateway/src/
├── __tests__/
│   └── setup.ts
├── libs/
│   └── initializeSiteConfig.spec.ts    ← UNIT (6 tests)
└── routes/
    └── proxy.integration.spec.ts       ← INTEGRATION (20 tests)
```

### 5.3 — `initializeSiteConfig.spec.ts`

```
describe('initializeConfig')
  ✓ should create site_config when none exists
  ✓ should not overwrite existing site_config
  ✓ should include all expected categories
  ✓ should include subCategories mapping
  ✓ should handle Prisma connection failure gracefully
  ✓ should log success message
```

### 5.4 — `proxy.integration.spec.ts`

**Approach:** Mock `express-http-proxy` to verify routing rules without real upstream services.

```
describe('API Gateway Proxy Routes')
  describe('Health Check')
    ✓ GET / should return 200 with gateway info

  describe('Auth Proxy (/auth/*)')
    ✓ should proxy /auth/api/login-user to auth-service
    ✓ should forward cookies
    ✓ should forward authorization headers

  describe('Product Proxy (/product/*)')
    ✓ should proxy /product/api/products to product-service
    ✓ should proxy /product/api/search to product-service

  describe('Order Proxy (/order/*)')
    ✓ should proxy /order/api/orders to order-service
    ✓ should resolve path correctly (proxyReqPathResolver)

  describe('Recommendation Proxy (/recommendation/*)')
    ✓ should proxy /recommendation/api/... to recommendation-service

  describe('Rate Limiting')
    ✓ should allow requests under limit
    ✓ should return 429 when rate limit exceeded

  describe('CORS')
    ✓ should include CORS headers
    ✓ should allow configured origins
    ✓ should reject unknown origins

  describe('404 Handling')
    ✓ should return 404 for unmatched routes
```

### Phase 5 Deliverables

| File | Tests |
|---|---|
| `libs/initializeSiteConfig.spec.ts` | ~6 tests |
| `routes/proxy.integration.spec.ts` | ~20 tests |
| **Total** | **~26 tests** |

### Estimated Effort: **1–2 days**

---

## Phase 6 — Recommendation Service

**Goal:** Test ML recommendation pipeline, user activity fetching, and data preprocessing.

### 6.1 — Vitest Config

**Create:** `apps/recommendation-service/vitest.config.ts`

### 6.2 — Test File Structure

```
apps/recommendation-service/src/
├── __tests__/
│   └── setup.ts
├── controllers/
│   └── recommendation-controller.spec.ts    ← UNIT (8 tests)
├── services/
│   ├── recommendation-service.spec.ts       ← UNIT (10 tests)
│   └── fetch-user-activity.spec.ts          ← UNIT (6 tests)
├── utils/
│   └── preprocessData.spec.ts               ← UNIT (8 tests)
└── routes/
    └── recommendation.route.integration.spec.ts  ← INTEGRATION (6 tests)
```

### 6.3 — Test Cases

#### `recommendation-controller.spec.ts`

```
describe('getRecommendedProducts')
  ✓ should return recommended products for user
  ✓ should fall back to popular products when no activity
  ✓ should limit to requested count
  ✓ should return 404 for non-existent user
  ✓ should handle TensorFlow model failure gracefully
  ✓ should cache results in Redis
  ✓ should return cached results when available
  ✓ should handle empty product catalog
```

#### `recommendation-service.spec.ts`

**Mock:** `@tensorflow/tfjs` (heavy dependency — must be fully mocked)

```
describe('recommendProducts')
  ✓ should return product IDs ranked by score
  ✓ should handle user with no interactions
  ✓ should handle single-product catalog
  ✓ should handle user with single interaction
  ✓ should return correct number of recommendations
  ✓ should not recommend already-purchased products
  ✓ should handle model training failure
  ✓ should normalize scores between 0 and 1
  ✓ should weight recent interactions higher
  ✓ should handle large product catalogs efficiently
```

#### `fetch-user-activity.spec.ts`

```
describe('getUserActivity')
  ✓ should return user analytics record
  ✓ should return null for non-existent user
  ✓ should include view, purchase, cart, wishlist actions
  ✓ should filter by date range if specified
  ✓ should handle Prisma errors
  ✓ should return empty actions array for new user
```

#### `preprocessData.spec.ts`

```
describe('preprocessData')
  ✓ should map view actions to interaction format
  ✓ should map purchase actions with higher weight
  ✓ should map cart actions with medium weight
  ✓ should filter out invalid product IDs
  ✓ should handle empty actions list
  ✓ should create user-product interaction matrix
  ✓ should normalize interaction scores
  ✓ should handle duplicate actions (aggregate)
```

#### `recommendation.route.integration.spec.ts`

```
describe('GET /api/recommendations/:userId')
  ✓ should return 401 without auth
  ✓ should return 200 with recommendations
  ✓ should return correct response shape
  ✓ should return 404 for non-existent user
  ✓ should handle service errors gracefully
  ✓ should respect limit query param
```

### Phase 6 Deliverables

| File | Tests |
|---|---|
| `controllers/recommendation-controller.spec.ts` | ~8 tests |
| `services/recommendation-service.spec.ts` | ~10 tests |
| `services/fetch-user-activity.spec.ts` | ~6 tests |
| `utils/preprocessData.spec.ts` | ~8 tests |
| `routes/recommendation.route.integration.spec.ts` | ~6 tests |
| **Total** | **~38 tests** |

### Estimated Effort: **2–3 days**

---

## Phase 7 — E2E Tests (All Services)

**Goal:** End-to-end tests against real running services with a test database.

### 7.1 — E2E Infrastructure

**Approach:** Keep existing `apps/*-e2e/` structure but migrate from Jest to Vitest.

**Create:** `docker-compose.test.yml` — spins up test MongoDB + Redis

```yaml
services:
  mongodb-test:
    image: mongo:7
    ports: ["27018:27017"]
    environment:
      MONGO_INITDB_DATABASE: artistry_cart_test

  redis-test:
    image: redis:7-alpine
    ports: ["6380:6379"]
```

**Create:** `.env.test` — test environment variables

```env
DATABASE_URL=mongodb://localhost:27018/artistry_cart_test
REDIS_URL=redis://localhost:6380
STRIPE_SECRETE_KEY=sk_test_...
ACCESS_TOKEN_SECRET=test-e2e-access-secret
REFRESH_TOKEN_SECRET=test-e2e-refresh-secret
```

### 7.2 — E2E Config Pattern (per service)

**Create:** `apps/product-service-e2e/vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.e2e-spec.ts', 'src/**/*.spec.ts'],
    setupFiles: ['src/support/test-setup.ts'],
    globalSetup: ['src/support/global-setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    sequence: { concurrent: false },
  },
});
```

**Update:** `apps/product-service-e2e/src/support/global-setup.ts`

```ts
// Start service before E2E tests
// Seed test database
// Wait for service to be healthy
```

**Update:** `apps/product-service-e2e/src/support/global-teardown.ts`

```ts
// Stop service
// Clean test database
// Kill ports
```

### 7.3 — E2E Test Files

#### `product-service-e2e`

```
apps/product-service-e2e/src/
├── product-service/
│   ├── products.e2e-spec.ts       (15 tests)
│   ├── shops.e2e-spec.ts          (8 tests)
│   ├── events.e2e-spec.ts         (10 tests)
│   ├── discounts.e2e-spec.ts      (8 tests)
│   ├── search.e2e-spec.ts         (6 tests)
│   └── offers.e2e-spec.ts         (5 tests)
└── support/
    ├── global-setup.ts
    ├── global-teardown.ts
    ├── test-setup.ts
    └── test-helpers.ts
```

#### `auth-service-e2e` (migrate existing)

```
apps/auth-service-e2e/src/
├── auth-service/
│   ├── auth-service.spec.ts              (health check)
│   ├── user-registration.e2e-spec.ts     (existing)
│   ├── user-login.e2e-spec.ts            (existing)
│   ├── seller-registration.e2e-spec.ts   (existing)
│   ├── password-reset.e2e-spec.ts        (existing)
│   ├── profile-management.e2e-spec.ts    (existing)
│   └── oauth-flows.e2e-spec.ts           (existing)
└── support/
    ├── global-setup.ts
    ├── global-teardown.ts
    ├── test-setup.ts
    └── test-helpers.ts
```

#### `order-service-e2e` (new)

```
apps/order-service-e2e/src/
├── order-service/
│   ├── payment-session.e2e-spec.ts    (6 tests)
│   ├── orders.e2e-spec.ts            (8 tests)
│   ├── seller-orders.e2e-spec.ts     (6 tests)
│   └── webhooks.e2e-spec.ts          (4 tests)
└── support/
    ├── global-setup.ts
    ├── global-teardown.ts
    ├── test-setup.ts
    └── test-helpers.ts
```

#### `api-gateway-e2e` (update existing)

```
apps/api-gateway-e2e/src/
├── api-gateway/
│   ├── proxy-routing.e2e-spec.ts    (10 tests)
│   ├── rate-limiting.e2e-spec.ts    (4 tests)
│   └── cors.e2e-spec.ts            (3 tests)
└── support/...
```

#### `recommendation-service-e2e` (update existing)

```
apps/recommendation-service-e2e/src/
├── recommendation-service/
│   └── recommendations.e2e-spec.ts  (6 tests)
└── support/...
```

### Phase 7 Deliverables

| Service E2E | Test Files | Tests |
|---|---|---|
| product-service-e2e | 6 files | ~52 tests |
| auth-service-e2e | 7 files (migrate) | ~40 tests |
| order-service-e2e | 4 files (new) | ~24 tests |
| api-gateway-e2e | 3 files | ~17 tests |
| recommendation-service-e2e | 1 file | ~6 tests |
| **Total** | **21 files** | **~139 tests** |

### Estimated Effort: **4–5 days**

---

## Phase 8 — CI/CD & Coverage Gates

**Goal:** Automate tests in GitHub Actions with coverage enforcement.

### 8.1 — GitHub Actions Workflow

**Create:** `.github/workflows/test.yml`

```yaml
name: Tests
on:
  pull_request:
    branches: [master, develop]
  push:
    branches: [master]

jobs:
  unit-integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec nx affected --target=test --base=origin/master
      - run: pnpm exec nx run-many --target=test:coverage --all
      - uses: codecov/codecov-action@v4

  e2e:
    runs-on: ubuntu-latest
    needs: unit-integration
    services:
      mongodb:
        image: mongo:7
        ports: ["27017:27017"]
      redis:
        image: redis:7-alpine
        ports: ["6379:6379"]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install --frozen-lockfile
      - run: npx prisma generate
      - run: pnpm exec nx run-many --target=e2e --all
```

### 8.2 — Coverage Thresholds

| Service | Branches | Functions | Lines | Statements |
|---|---|---|---|---|
| auth-service | 70% | 80% | 80% | 80% |
| product-service | 70% | 80% | 80% | 80% |
| order-service | 65% | 75% | 75% | 75% |
| api-gateway | 60% | 70% | 70% | 70% |
| recommendation-service | 60% | 70% | 70% | 70% |
| packages/middleware | 80% | 90% | 90% | 90% |
| packages/error-handler | 80% | 90% | 90% | 90% |

### 8.3 — Nx Caching for Tests

Update `nx.json` to cache test results:

```jsonc
{
  "targetDefaults": {
    "test": {
      "cache": true,
      "inputs": ["default", "^production"],
      "dependsOn": ["^build"]
    },
    "e2e": {
      "cache": false
    }
  }
}
```

### Phase 8 Deliverables

| File | Action |
|---|---|
| `.github/workflows/test.yml` | Create |
| `nx.json` | Update (cache config) |
| Each service `vitest.config.ts` | Update (thresholds) |
| Remove old Jest files | `jest.config.ts`, `jest.preset.js`, `tsconfig.spec.json` (root) |

### Estimated Effort: **1 day**

---

## Summary Timeline

| Phase | Scope | Tests | Effort |
|---|---|---|---|
| **Phase 0** | Infrastructure + shared test utils | 0 (setup) | 1–2 days |
| **Phase 1** | packages/middleware + error-handler | ~56 tests | 1–2 days |
| **Phase 2** | product-service (unit + integration) | ~320 tests | 5–7 days |
| **Phase 3** | auth-service (Jest→Vitest + new integration) | ~151 tests | 2–3 days |
| **Phase 4** | order-service (unit + integration) | ~86 tests | 3–4 days |
| **Phase 5** | api-gateway (integration) | ~26 tests | 1–2 days |
| **Phase 6** | recommendation-service | ~38 tests | 2–3 days |
| **Phase 7** | E2E tests (all services) | ~139 tests | 4–5 days |
| **Phase 8** | CI/CD + coverage gates | 0 (infra) | 1 day |
| **TOTAL** | | **~816 tests** | **~21–29 days** |

---

## Appendix — File Inventory per Service

### Complete Function Count

| Service | Controllers | Functions | Routes | Utils/Services |
|---|---|---|---|---|
| **auth-service** | 3 files | 31 functions | 24 endpoints | 9 helper functions |
| **product-service** | 6 files | 46 functions | 47 endpoints | 7 service methods + 1 cron |
| **order-service** | 2 files | 21 functions | 17 endpoints | 1 email util |
| **api-gateway** | 0 | 1 function | 5 proxy routes | 1 config initializer |
| **recommendation-service** | 1 file | 1 function | 1 endpoint | 3 service functions |
| **packages/middleware** | — | 4 functions | — | — |
| **packages/error-handler** | — | 8 error classes + 1 middleware | — | — |
| **TOTAL** | **12 files** | **113 functions** | **94 endpoints** | **—** |

### Mock Dependency Matrix

| Mock | auth | product | order | gateway | recommendation |
|---|---|---|---|---|---|
| Prisma | ✅ | ✅ | ✅ | ✅ | ✅ |
| Redis (shared) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Redis (ioredis direct) | ❌ | ❌ | ✅ | ❌ | ❌ |
| ImageKit | ✅ | ✅ | ❌ | ❌ | ❌ |
| Stripe | ✅ | ❌ | ✅ | ❌ | ❌ |
| Nodemailer | ✅ | ❌ | ✅ | ❌ | ❌ |
| Kafka | ❌ | ❌ | ❌ | ❌ | ❌ |
| TensorFlow.js | ❌ | ❌ | ❌ | ❌ | ✅ |
| jsonwebtoken | ✅ | ❌ | ❌ | ❌ | ❌ |
| bcryptjs | ✅ | ❌ | ❌ | ❌ | ❌ |
| express-http-proxy | ❌ | ❌ | ❌ | ✅ | ❌ |
| node-cron | ❌ | ✅ | ❌ | ❌ | ❌ |
| zod | ❌ | ❌ (real) | ❌ | ❌ | ❌ |

> **Note:** Zod is NOT mocked — it runs in real mode for validation tests to verify schema correctness.

---

## Naming Conventions

| Type | File Pattern | Example |
|---|---|---|
| Unit test | `*.spec.ts` | `product.controller.spec.ts` |
| Integration test | `*.integration.spec.ts` | `product.route.integration.spec.ts` |
| E2E test | `*.e2e-spec.ts` | `products.e2e-spec.ts` |
| Mock file | `*.mock.ts` | `prisma.mock.ts` |
| Test helper | `*.helper.ts` | `request.helper.ts` |
| Test setup | `setup.ts` | `__tests__/setup.ts` |
| Data factory | `data-factories.ts` | `test-utils/helpers/data-factories.ts` |
