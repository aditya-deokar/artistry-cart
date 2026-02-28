/**
 * Unit Tests for shop.controller.ts
 *
 * Covers: getAllShops, getShopBySlug, getProductsForShop,
 *   getReviewsForShop, createShopReview, getShopCategories
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks ──
const { prismaMock } = vi.hoisted(() => {
  const prismaMock = {
    shops: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
    products: { findMany: vi.fn(), count: vi.fn() },
    shopReviews: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
      aggregate: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  return { prismaMock };
});

vi.mock('../../../../packages/libs/prisma', () => ({
  __esModule: true,
  default: prismaMock,
}));

import {
  getAllShops,
  getShopBySlug,
  getProductsForShop,
  getReviewsForShop,
  createShopReview,
  getShopCategories,
} from './shop.controller';

import { mockRequest, mockResponse, mockNext } from '../../../../packages/test-utils';

function req(data: Record<string, unknown> = {}) { return mockRequest(data); }
function res() { return mockResponse(); }
function next() { return mockNext(); }

// ═══════════════════════════════════════════════
// getAllShops
// ═══════════════════════════════════════════════
describe('getAllShops', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns paginated shops with 200', async () => {
    prismaMock.shops.findMany.mockResolvedValue([{ id: 's1', name: 'Gallery' }]);
    prismaMock.shops.count.mockResolvedValue(1);

    const r = res();
    await getAllShops(req({ query: {} }), r, next());

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        shops: [expect.objectContaining({ id: 's1' })],
        pagination: expect.objectContaining({ total: 1, currentPage: 1 }),
      }),
    }));
  });

  it('applies category filter (ignores "all")', async () => {
    prismaMock.shops.findMany.mockResolvedValue([]);
    prismaMock.shops.count.mockResolvedValue(0);

    await getAllShops(req({ query: { category: 'Paintings' } }), res(), next());

    expect(prismaMock.shops.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ category: 'Paintings' }),
      }),
    );
  });

  it('applies search filter', async () => {
    prismaMock.shops.findMany.mockResolvedValue([]);
    prismaMock.shops.count.mockResolvedValue(0);

    await getAllShops(req({ query: { search: 'modern' } }), res(), next());

    expect(prismaMock.shops.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ name: expect.any(Object) }),
          ]),
        }),
      }),
    );
  });

  it('respects sortBy parameter', async () => {
    prismaMock.shops.findMany.mockResolvedValue([]);
    prismaMock.shops.count.mockResolvedValue(0);

    await getAllShops(req({ query: { sortBy: 'name' } }), res(), next());

    expect(prismaMock.shops.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { name: 'asc' } }),
    );
  });

  it('forwards errors to next()', async () => {
    prismaMock.shops.findMany.mockRejectedValue(new Error('DB'));
    const n = next();
    await getAllShops(req({ query: {} }), res(), n);
    expect(n).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ═══════════════════════════════════════════════
// getShopBySlug
// ═══════════════════════════════════════════════
describe('getShopBySlug', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns shop with featured products for valid slug', async () => {
    const shop = { id: 's1', slug: 'gallery', name: 'Gallery' };
    prismaMock.shops.findUnique.mockResolvedValue(shop);
    prismaMock.products.findMany.mockResolvedValue([]);

    const r = res();
    await getShopBySlug(req({ params: { slug: 'gallery' } }), r, next());

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        shop: expect.objectContaining({ id: 's1', featuredProducts: [] }),
      }),
    }));
  });

  it('returns 400 when slug is missing', async () => {
    const r = res();
    await getShopBySlug(req({ params: {} }), r, next());
    expect(r.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when shop not found', async () => {
    prismaMock.shops.findUnique.mockResolvedValue(null);

    const r = res();
    await getShopBySlug(req({ params: { slug: 'nonexistent' } }), r, next());
    expect(r.status).toHaveBeenCalledWith(404);
  });

  it('forwards errors to next()', async () => {
    prismaMock.shops.findUnique.mockRejectedValue(new Error('fail'));
    const n = next();
    await getShopBySlug(req({ params: { slug: 'x' } }), res(), n);
    expect(n).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ═══════════════════════════════════════════════
// getProductsForShop
// ═══════════════════════════════════════════════
describe('getProductsForShop', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns paginated products for a shop', async () => {
    prismaMock.products.findMany.mockResolvedValue([{ id: 'p1' }]);
    prismaMock.products.count.mockResolvedValue(1);

    const r = res();
    await getProductsForShop(
      req({ params: { shopId: 'shop1' }, query: {} }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        products: [{ id: 'p1' }],
        pagination: expect.objectContaining({ total: 1 }),
      }),
    }));
  });

  it('applies search filter', async () => {
    prismaMock.products.findMany.mockResolvedValue([]);
    prismaMock.products.count.mockResolvedValue(0);

    await getProductsForShop(
      req({ params: { shopId: 'shop1' }, query: { search: 'canvas' } }),
      res(),
      next(),
    );

    expect(prismaMock.products.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.any(Array),
        }),
      }),
    );
  });

  it('applies onSale filter', async () => {
    prismaMock.products.findMany.mockResolvedValue([]);
    prismaMock.products.count.mockResolvedValue(0);

    await getProductsForShop(
      req({ params: { shopId: 'shop1' }, query: { onSale: 'true' } }),
      res(),
      next(),
    );

    expect(prismaMock.products.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ is_on_discount: true }),
      }),
    );
  });

  it('respects sortBy parameter', async () => {
    prismaMock.products.findMany.mockResolvedValue([]);
    prismaMock.products.count.mockResolvedValue(0);

    await getProductsForShop(
      req({ params: { shopId: 'shop1' }, query: { sortBy: 'price-asc' } }),
      res(),
      next(),
    );

    expect(prismaMock.products.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { current_price: 'asc' } }),
    );
  });

  it('forwards errors to next()', async () => {
    prismaMock.products.findMany.mockRejectedValue(new Error('fail'));
    const n = next();
    await getProductsForShop(req({ params: { shopId: 'x' }, query: {} }), res(), n);
    expect(n).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ═══════════════════════════════════════════════
// getReviewsForShop
// ═══════════════════════════════════════════════
describe('getReviewsForShop', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns paginated reviews with rating stats', async () => {
    prismaMock.shopReviews.findMany.mockResolvedValue([{ id: 'r1', rating: 5 }]);
    prismaMock.shopReviews.count.mockResolvedValue(1);
    prismaMock.shopReviews.groupBy.mockResolvedValue([
      { rating: 5, _count: { rating: 1 } },
    ]);

    const r = res();
    await getReviewsForShop(
      req({ params: { shopId: 'shop1' }, query: {} }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        reviews: expect.any(Array),
        ratingsStats: expect.any(Array),
        pagination: expect.objectContaining({ total: 1 }),
      }),
    }));
  });

  it('filters by rating', async () => {
    prismaMock.shopReviews.findMany.mockResolvedValue([]);
    prismaMock.shopReviews.count.mockResolvedValue(0);
    prismaMock.shopReviews.groupBy.mockResolvedValue([]);

    await getReviewsForShop(
      req({ params: { shopId: 'shop1' }, query: { rating: '5' } }),
      res(),
      next(),
    );

    expect(prismaMock.shopReviews.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ rating: 5 }),
      }),
    );
  });

  it('forwards errors to next()', async () => {
    prismaMock.shopReviews.findMany.mockRejectedValue(new Error('fail'));
    const n = next();
    await getReviewsForShop(req({ params: { shopId: 'x' }, query: {} }), res(), n);
    expect(n).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ═══════════════════════════════════════════════
// createShopReview
// ═══════════════════════════════════════════════
describe('createShopReview', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates a review and returns 201', async () => {
    const review = { id: 'rev1', rating: 5 };
    prismaMock.shopReviews.findFirst.mockResolvedValue(null);
    prismaMock.shops.findUnique.mockResolvedValue({ id: 'shop1' });
    prismaMock.$transaction.mockImplementation(async (cb: any) => {
      const tx = {
        shopReviews: {
          create: vi.fn().mockResolvedValue(review),
          aggregate: vi.fn().mockResolvedValue({ _avg: { rating: 4.5 } }),
        },
        shops: { update: vi.fn().mockResolvedValue({}) },
      };
      return cb(tx);
    });

    const r = res();
    await createShopReview(
      req({
        user: { id: 'u1' },
        body: { shopId: 'shop1', rating: 5, review: 'Great' },
      }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(201);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: 'Review created successfully',
    }));
  });

  it('returns 401 when user is not authenticated', async () => {
    const r = res();
    await createShopReview(
      req({ body: { shopId: 'shop1', rating: 5 } }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 for an existing review', async () => {
    prismaMock.shopReviews.findFirst.mockResolvedValue({ id: 'existing' });

    const r = res();
    await createShopReview(
      req({
        user: { id: 'u1' },
        body: { shopId: 'shop1', rating: 5 },
      }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when shop not found', async () => {
    prismaMock.shopReviews.findFirst.mockResolvedValue(null);
    prismaMock.shops.findUnique.mockResolvedValue(null);

    const r = res();
    await createShopReview(
      req({
        user: { id: 'u1' },
        body: { shopId: 'nonexistent', rating: 5 },
      }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(404);
  });

  it('returns 400 for invalid Zod data (e.g. rating out of range)', async () => {
    const r = res();
    await createShopReview(
      req({
        user: { id: 'u1' },
        body: { shopId: 'shop1', rating: 10 }, // > 5
      }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(400);
  });
});

// ═══════════════════════════════════════════════
// getShopCategories
// ═══════════════════════════════════════════════
describe('getShopCategories', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns distinct categories with product counts', async () => {
    prismaMock.shops.findMany.mockResolvedValue([
      { category: 'Art', _count: { products: 5 } },
      { category: 'Crafts', _count: { products: 3 } },
    ]);

    const r = res();
    await getShopCategories(req(), r, next());

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.arrayContaining([
        expect.objectContaining({ category: 'Art' }),
      ]),
    }));
  });

  it('forwards errors to next()', async () => {
    prismaMock.shops.findMany.mockRejectedValue(new Error('fail'));
    const n = next();
    await getShopCategories(req(), res(), n);
    expect(n).toHaveBeenCalledWith(expect.any(Error));
  });
});
