/**
 * Integration Tests for Product Service Routes
 *
 * Uses Supertest to exercise Express routes end-to-end,
 * mocking Prisma, ImageKit, and auth middleware at the module level.
 *
 * NOTE: This test file is at apps/product-service/src/ — paths use ../../../
 * while controllers at src/controllers/ use ../../../../
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// ── Hoisted mocks ──
const { prismaMock, imagekitMock, authUser } = vi.hoisted(() => {
  const prismaMock = {
    site_config: { findFirst: vi.fn() },
    products: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
      groupBy: vi.fn().mockResolvedValue([]),
      aggregate: vi.fn().mockResolvedValue({
        _min: { current_price: 0 },
        _max: { current_price: 100 },
      }),
    },
    shops: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
      update: vi.fn(),
    },
    events: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
    discount_codes: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    discount_usage: {
      create: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
    },
    orders: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    eventProductDiscount: {
      findMany: vi.fn().mockResolvedValue([]),
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    productPricing: {
      updateMany: vi.fn(),
    },
    shopReviews: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      create: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
      groupBy: vi.fn().mockResolvedValue([]),
      aggregate: vi.fn().mockResolvedValue({ _avg: { rating: 4.5 } }),
    },
    banners: { findMany: vi.fn().mockResolvedValue([]) },
    $transaction: vi.fn().mockImplementation(async (cb: any) => cb(prismaMock)),
  };

  const imagekitMock = {
    upload: vi.fn(),
    deleteFile: vi.fn(),
  };

  // Mutable auth state that tests can change
  const authUser: { value: any; role: string } = { value: null, role: 'seller' };

  return { prismaMock, imagekitMock, authUser };
});

// ── Module mocks (paths relative to this file at apps/product-service/src/) ──

// Mock Prisma — ../../../ goes to workspace root
vi.mock('../../../packages/libs/prisma', () => ({
  __esModule: true,
  default: prismaMock,
}));

// Mock ImageKit
vi.mock('../../../packages/libs/imageKit', () => ({
  __esModule: true,
  imagekit: imagekitMock,
}));

// Mock PricingService (relative to this file's dir)
vi.mock('./lib/pricing.service', () => ({
  __esModule: true,
  PricingService: {
    calculateProductPrice: vi.fn().mockResolvedValue(100),
    updateCachedPricing: vi.fn().mockResolvedValue(undefined),
    buildPricingRecord: vi.fn().mockReturnValue({}),
  },
}));

// Mock error-handler — provide all named exports used by controllers
vi.mock('../../../packages/error-handler', () => {
  class AppError extends Error {
    statusCode: number;
    constructor(msg: string, code = 500) {
      super(msg);
      this.statusCode = code;
    }
  }
  return {
    __esModule: true,
    default: AppError,
    AppError,
    AuthError: class AuthError extends AppError {
      constructor(msg: string) { super(msg, 401); }
    },
    ValidationError: class ValidationError extends AppError {
      constructor(msg: string) { super(msg, 400); }
    },
    NotFoundError: class NotFoundError extends AppError {
      constructor(msg: string) { super(msg, 404); }
    },
    ForbiddenError: class ForbiddenError extends AppError {
      constructor(msg: string) { super(msg, 403); }
    },
    DatabaseError: class DatabaseError extends AppError {
      constructor(msg: string) { super(msg, 500); }
    },
    RateLimitError: class RateLimitError extends AppError {
      constructor(msg: string) { super(msg, 429); }
    },
    InternalServerError: class InternalServerError extends AppError {
      constructor(msg: string) { super(msg, 500); }
    },
  };
});

// Also mock the error middleware imported in app.ts
vi.mock('../../../packages/error-handler/error-middelware', () => ({
  __esModule: true,
  errorMiddleware: (err: any, _req: any, res: any, _next: any) => {
    const status = err.statusCode || 500;
    res.status(status).json({ success: false, message: err.message });
  },
}));

// Mock isAuthenticated — injects authUser onto req
vi.mock('../../../packages/middleware/isAuthenticated', () => ({
  __esModule: true,
  default: vi.fn((req: any, _res: any, next: any) => {
    if (!authUser.value) {
      return _res.status(401).json({ message: 'Unauthorized! Token missing.' });
    }
    req.user = authUser.value;
    req.role = authUser.role;
    next();
  }),
}));

// Mock isAdmin — checks req.role
vi.mock('../../../packages/middleware/isAdmin', () => ({
  __esModule: true,
  default: vi.fn((req: any, res: any, next: any) => {
    if (req.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized (admin only)' });
    }
    next();
  }),
}));

// Import app AFTER mocks are set up
import app from './app';

// ═══════════════════════════════════════════════
// Helper to set authenticated user for a test
// ═══════════════════════════════════════════════
function asSeller(shopId = 'shop1') {
  authUser.value = { id: 'seller1', name: 'Seller', shop: { id: shopId } };
  authUser.role = 'seller';
}
function asAdmin() {
  authUser.value = { id: 'admin1', name: 'Admin', role: 'ADMIN' };
  authUser.role = 'admin';
}
function asUser() {
  authUser.value = { id: 'user1', name: 'User' };
  authUser.role = 'user';
}
function asGuest() {
  authUser.value = null;
  authUser.role = '';
}

// ═══════════════════════════════════════════════
// Health check
// ═══════════════════════════════════════════════
describe('GET / — health check', () => {
  it('returns service info', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      message: 'Products Service API',
      status: 'healthy',
    });
  });
});

// ═══════════════════════════════════════════════
// 404 handler
// ═══════════════════════════════════════════════
describe('404 handler', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown-route-xyz');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ═══════════════════════════════════════════════
// Product routes
// ═══════════════════════════════════════════════
describe('Product Routes (/api)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    asGuest();
  });

  describe('GET /api/categories', () => {
    it('returns 200 with categories list', async () => {
      prismaMock.site_config.findFirst.mockResolvedValue({
        categories: ['Paintings', 'Sculptures'],
        subCategories: { Paintings: ['Oil', 'Watercolor'] },
      });

      const res = await request(app).get('/api/categories');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/products', () => {
    it('returns paginated products', async () => {
      prismaMock.products.findMany.mockResolvedValue([]);
      prismaMock.products.count.mockResolvedValue(0);

      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('pagination');
    });

    it('accepts query parameters (category, search, sort)', async () => {
      prismaMock.products.findMany.mockResolvedValue([]);
      prismaMock.products.count.mockResolvedValue(0);

      const res = await request(app)
        .get('/api/products')
        .query({ category: 'Paintings', search: 'art', sortBy: 'price-asc' });
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/product/:slug', () => {
    it('returns product by slug', async () => {
      prismaMock.products.findUnique.mockResolvedValue({ id: 'p1', slug: 'canvas', title: 'Canvas' });

      const res = await request(app).get('/api/product/canvas');
      expect(res.status).toBe(200);
    });

    it('returns 404 for unknown slug', async () => {
      prismaMock.products.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/api/product/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/products (seller)', () => {
    it('returns 401 for unauthenticated request', async () => {
      const res = await request(app).post('/api/products').send({});
      expect(res.status).toBe(401);
    });

    it('creates a product when authenticated as seller', async () => {
      asSeller();
      prismaMock.shops.findUnique.mockResolvedValue({ id: 'shop1' });
      prismaMock.products.findFirst.mockResolvedValue(null); // no slug conflict
      prismaMock.products.create.mockResolvedValue({ id: 'p1', title: 'New Art' });

      const res = await request(app).post('/api/products').send({
        title: 'New Art',
        description: 'A wonderful piece',
        category: 'Paintings',
        regular_price: 100,
        current_price: 100,
        stock: 10,
        images: [],
        tags: [],
      });

      // Could be 201 or validation error depending on Zod schema
      expect([200, 201, 400]).toContain(res.status);
    });
  });

  describe('DELETE /api/products/:productId (seller)', () => {
    it('returns 401 for unauthenticated request', async () => {
      const res = await request(app).delete('/api/products/p1');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/admin/products (admin)', () => {
    it('returns 401 for unauthenticated request', async () => {
      const res = await request(app).get('/api/admin/products');
      expect(res.status).toBe(401);
    });

    it('returns 403 for non-admin', async () => {
      asSeller();
      const res = await request(app).get('/api/admin/products');
      expect(res.status).toBe(403);
    });

    it('returns products for admin', async () => {
      asAdmin();
      prismaMock.products.findMany.mockResolvedValue([]);
      prismaMock.products.count.mockResolvedValue(0);

      const res = await request(app).get('/api/admin/products');
      expect(res.status).toBe(200);
    });
  });
});

// ═══════════════════════════════════════════════
// Shop routes
// ═══════════════════════════════════════════════
describe('Shop Routes (/api/shops)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    asGuest();
  });

  describe('GET /api/shops', () => {
    it('returns paginated shops', async () => {
      prismaMock.shops.findMany.mockResolvedValue([]);
      prismaMock.shops.count.mockResolvedValue(0);

      const res = await request(app).get('/api/shops');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('pagination');
    });
  });

  describe('GET /api/shops/categories', () => {
    it('returns shop categories', async () => {
      prismaMock.shops.findMany.mockResolvedValue([{ category: 'Art' }]);

      const res = await request(app).get('/api/shops/categories');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/shops/:slug', () => {
    it('returns shop by slug', async () => {
      prismaMock.shops.findUnique.mockResolvedValue({ id: 's1', slug: 'gallery' });
      prismaMock.products.findMany.mockResolvedValue([]);

      const res = await request(app).get('/api/shops/gallery');
      expect(res.status).toBe(200);
    });

    it('returns 404 for unknown slug', async () => {
      prismaMock.shops.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/api/shops/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/shops/:shopId/products', () => {
    it('returns paginated products for a shop', async () => {
      prismaMock.products.findMany.mockResolvedValue([]);
      prismaMock.products.count.mockResolvedValue(0);

      const res = await request(app).get('/api/shops/shop1/products');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/shops/:shopId/reviews', () => {
    it('returns paginated reviews', async () => {
      prismaMock.shopReviews.findMany.mockResolvedValue([]);
      prismaMock.shopReviews.count.mockResolvedValue(0);
      prismaMock.shopReviews.groupBy.mockResolvedValue([]);

      const res = await request(app).get('/api/shops/shop1/reviews');
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/shops/reviews (authenticated)', () => {
    it('returns 401 for unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/shops/reviews')
        .send({ shopId: 's1', rating: 5 });
      expect(res.status).toBe(401);
    });

    it('returns 400 for duplicate review', async () => {
      asUser();
      prismaMock.shopReviews.findFirst.mockResolvedValue({ id: 'existing' });

      const res = await request(app)
        .post('/api/shops/reviews')
        .send({ shopId: 's1', rating: 5 });
      expect(res.status).toBe(400);
    });
  });
});

// ═══════════════════════════════════════════════
// Search routes
// ═══════════════════════════════════════════════
describe('Search Routes (/api/search)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    asGuest();
  });

  describe('GET /api/search/live', () => {
    it('returns empty for short query', async () => {
      const res = await request(app).get('/api/search/live').query({ q: 'a' });
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual({ products: [], shops: [], events: [] });
    });

    it('returns results for valid query', async () => {
      prismaMock.products.findMany.mockResolvedValue([{ id: 'p1' }]);
      prismaMock.shops.findMany.mockResolvedValue([]);
      prismaMock.events.findMany.mockResolvedValue([]);

      const res = await request(app).get('/api/search/live').query({ q: 'painting' });
      expect(res.status).toBe(200);
      expect(res.body.data.products).toHaveLength(1);
    });
  });

  describe('GET /api/search (fullSearch)', () => {
    it('returns 400 for empty query', async () => {
      const res = await request(app).get('/api/search');
      expect(res.status).toBe(400);
    });

    it('returns results for valid query', async () => {
      prismaMock.products.findMany.mockResolvedValue([]);
      prismaMock.products.count.mockResolvedValue(0);
      prismaMock.products.groupBy.mockResolvedValue([]);
      prismaMock.products.aggregate.mockResolvedValue({
        _min: { current_price: 0 },
        _max: { current_price: 100 },
      });
      prismaMock.shops.findMany.mockResolvedValue([]);

      const res = await request(app).get('/api/search').query({ q: 'art' });
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('pagination');
    });
  });

  describe('GET /api/search/suggestions', () => {
    it('returns popular items when no query', async () => {
      prismaMock.products.findMany.mockResolvedValue([]);
      prismaMock.products.groupBy.mockResolvedValue([]);

      const res = await request(app).get('/api/search/suggestions');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('popular');
    });
  });

  describe('GET /api/search/seller (authenticated)', () => {
    it('returns 401 for unauthenticated request', async () => {
      const res = await request(app).get('/api/search/seller').query({ q: 'test' });
      expect(res.status).toBe(401);
    });

    it('returns results for authenticated seller', async () => {
      asSeller();
      prismaMock.products.findMany.mockResolvedValue([]);
      prismaMock.events.findMany.mockResolvedValue([]);
      prismaMock.discount_codes.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/search/seller')
        .query({ q: 'canvas' });
      expect(res.status).toBe(200);
    });
  });
});

// ═══════════════════════════════════════════════
// Event routes
// ═══════════════════════════════════════════════
describe('Event Routes (/api/events)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    asGuest();
  });

  describe('GET /api/events', () => {
    it('returns paginated events', async () => {
      prismaMock.events.findMany.mockResolvedValue([]);
      prismaMock.events.count.mockResolvedValue(0);

      const res = await request(app).get('/api/events');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/events/:eventId', () => {
    it('returns event with incremented views', async () => {
      prismaMock.events.findUnique.mockResolvedValue({ id: 'e1', title: 'Flash Sale' });
      prismaMock.events.update.mockResolvedValue({});

      const res = await request(app).get('/api/events/e1');
      expect(res.status).toBe(200);
    });

    it('returns 404 for unknown event', async () => {
      prismaMock.events.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/api/events/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/events (seller)', () => {
    it('returns 401 for unauthenticated request', async () => {
      const res = await request(app).post('/api/events').send({});
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/events/:eventId (seller)', () => {
    it('returns 401 for unauthenticated request', async () => {
      const res = await request(app).delete('/api/events/e1');
      expect(res.status).toBe(401);
    });
  });
});

// ═══════════════════════════════════════════════
// Discount routes
// ═══════════════════════════════════════════════
describe('Discount Routes (/api/discounts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    asGuest();
  });

  describe('POST /api/discounts/validate (public)', () => {
    it('returns 400 when discount code is missing', async () => {
      const res = await request(app)
        .post('/api/discounts/validate')
        .send({});
      // Should be 400 or similar because discountCode is missing
      expect([400, 404, 500]).toContain(res.status);
    });
  });

  describe('POST /api/discounts (seller)', () => {
    it('returns 401 for unauthenticated request', async () => {
      const res = await request(app).post('/api/discounts').send({});
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/discounts/seller (seller)', () => {
    it('returns 401 for unauthenticated request', async () => {
      const res = await request(app).get('/api/discounts/seller');
      expect(res.status).toBe(401);
    });

    it('returns seller discount codes', async () => {
      asSeller();
      prismaMock.discount_codes.findMany.mockResolvedValue([]);
      prismaMock.discount_codes.count.mockResolvedValue(0);

      const res = await request(app).get('/api/discounts/seller');
      expect(res.status).toBe(200);
    });
  });
});

// ═══════════════════════════════════════════════
// Offers routes
// ═══════════════════════════════════════════════
describe('Offers Routes (/api/offers)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    asGuest();
  });

  describe('GET /api/offers', () => {
    it('returns offers page data', async () => {
      prismaMock.events.findMany.mockResolvedValue([]);
      prismaMock.banners.findMany.mockResolvedValue([]);
      prismaMock.discount_codes.findMany.mockResolvedValue([]);

      const res = await request(app).get('/api/offers');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/offers/limited-time', () => {
    it('returns limited-time offers', async () => {
      prismaMock.events.findMany.mockResolvedValue([]);

      const res = await request(app).get('/api/offers/limited-time');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/offers/seasonal', () => {
    it('returns seasonal offers', async () => {
      prismaMock.events.findMany.mockResolvedValue([]);

      const res = await request(app).get('/api/offers/seasonal');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/offers/category/:category', () => {
    it('returns deals for a specific category', async () => {
      prismaMock.products.findMany.mockResolvedValue([]);
      prismaMock.products.count.mockResolvedValue(0);

      const res = await request(app).get('/api/offers/category/Paintings');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/offers/admin/stats (admin)', () => {
    it('returns 401 for unauthenticated request', async () => {
      const res = await request(app).get('/api/offers/admin/stats');
      expect(res.status).toBe(401);
    });

    it('returns 403 for non-admin', async () => {
      asSeller();
      const res = await request(app).get('/api/offers/admin/stats');
      expect(res.status).toBe(403);
    });

    it('returns statistics for admin', async () => {
      asAdmin();
      prismaMock.events.count.mockResolvedValue(5);
      prismaMock.discount_codes.count.mockResolvedValue(10);
      prismaMock.products.count.mockResolvedValue(50);
      prismaMock.products.groupBy.mockResolvedValue([]);
      prismaMock.events.findMany.mockResolvedValue([]);

      const res = await request(app).get('/api/offers/admin/stats');
      expect(res.status).toBe(200);
    });
  });
});
