/**
 * Unit Tests for search.controller.ts
 *
 * Covers: liveSearch, fullSearch, searchProducts, searchEvents,
 *   searchShops, getSearchSuggestions, sellerSearch
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks ──
const { prismaMock } = vi.hoisted(() => {
  const prismaMock = {
    products: {
      findMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
      aggregate: vi.fn(),
    },
    shops: { findMany: vi.fn(), count: vi.fn() },
    events: { findMany: vi.fn(), count: vi.fn() },
    discount_codes: { findMany: vi.fn() },
  };
  return { prismaMock };
});

vi.mock('../../../../packages/libs/prisma', () => ({
  __esModule: true,
  default: prismaMock,
}));

import {
  liveSearch,
  fullSearch,
  searchProducts,
  searchEvents,
  searchShops,
  getSearchSuggestions,
  sellerSearch,
} from './search.controller';

import { mockRequest, mockResponse, mockNext } from '../../../../packages/test-utils';

function req(data: Record<string, unknown> = {}) { return mockRequest(data); }
function res() { return mockResponse(); }
function next() { return mockNext(); }

// ═══════════════════════════════════════════════
// liveSearch
// ═══════════════════════════════════════════════
describe('liveSearch', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty arrays when query is too short', async () => {
    const r = res();
    await liveSearch(req({ query: { q: 'a' } }), r, next());
    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      data: { products: [], shops: [], events: [] },
    }));
    expect(prismaMock.products.findMany).not.toHaveBeenCalled();
  });

  it('returns empty arrays when query is absent', async () => {
    const r = res();
    await liveSearch(req({ query: {} }), r, next());
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      data: { products: [], shops: [], events: [] },
    }));
  });

  it('returns products, shops, events for valid query', async () => {
    prismaMock.products.findMany.mockResolvedValue([{ id: 'p1' }]);
    prismaMock.shops.findMany.mockResolvedValue([{ id: 's1' }]);
    prismaMock.events.findMany.mockResolvedValue([{ id: 'e1' }]);

    const r = res();
    await liveSearch(req({ query: { q: 'painting' } }), r, next());

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        products: [{ id: 'p1' }],
        shops: [{ id: 's1' }],
        events: [{ id: 'e1' }],
      },
    }));
  });

  it('forwards errors to next()', async () => {
    prismaMock.products.findMany.mockRejectedValue(new Error('DB'));
    const n = next();
    await liveSearch(req({ query: { q: 'art' } }), res(), n);
    expect(n).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ═══════════════════════════════════════════════
// fullSearch
// ═══════════════════════════════════════════════
describe('fullSearch', () => {
  beforeEach(() => vi.clearAllMocks());

  const stubFullSearch = () => {
    prismaMock.products.findMany.mockResolvedValue([]);
    prismaMock.products.count.mockResolvedValue(0);
    prismaMock.products.groupBy.mockResolvedValue([]);
    prismaMock.products.aggregate.mockResolvedValue({
      _min: { current_price: 0 },
      _max: { current_price: 100 },
    });
    prismaMock.shops.findMany.mockResolvedValue([]);
  };

  it('returns 400 when query is empty', async () => {
    const r = res();
    await fullSearch(req({ query: {} }), r, next());
    expect(r.status).toHaveBeenCalledWith(400);
  });

  it('returns paginated products, facets, and suggestions', async () => {
    stubFullSearch();

    const r = res();
    await fullSearch(req({ query: { q: 'art', page: '1' } }), r, next());

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        products: [],
        facets: expect.any(Object),
        pagination: expect.objectContaining({ currentPage: 1 }),
        searchQuery: 'art',
      }),
    }));
  });

  it('applies price range filter', async () => {
    stubFullSearch();
    await fullSearch(
      req({ query: { q: 'test', minPrice: '10', maxPrice: '50' } }),
      res(),
      next(),
    );

    expect(prismaMock.products.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          current_price: { gte: 10, lte: 50 },
        }),
      }),
    );
  });

  it('applies onSale filter', async () => {
    stubFullSearch();
    await fullSearch(
      req({ query: { q: 'test', onSale: 'true' } }),
      res(),
      next(),
    );

    expect(prismaMock.products.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ is_on_discount: true }),
      }),
    );
  });

  it('applies category filter (ignores "all")', async () => {
    stubFullSearch();
    await fullSearch(
      req({ query: { q: 'test', category: 'Paintings' } }),
      res(),
      next(),
    );

    expect(prismaMock.products.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ category: 'Paintings' }),
      }),
    );
  });

  it('forwards errors to next()', async () => {
    prismaMock.products.findMany.mockRejectedValue(new Error('fail'));
    const n = next();
    await fullSearch(req({ query: { q: 'test' } }), res(), n);
    expect(n).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ═══════════════════════════════════════════════
// searchProducts
// ═══════════════════════════════════════════════
describe('searchProducts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when query is empty', async () => {
    const r = res();
    await searchProducts(req({ query: {} }), r, next());
    expect(r.status).toHaveBeenCalledWith(400);
  });

  it('returns matching products', async () => {
    prismaMock.products.findMany.mockResolvedValue([{ id: 'p1', title: 'Canvas' }]);

    const r = res();
    await searchProducts(req({ query: { q: 'canvas' } }), r, next());
    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      data: { products: [expect.objectContaining({ id: 'p1' })] },
    }));
  });

  it('forwards errors to next()', async () => {
    prismaMock.products.findMany.mockRejectedValue(new Error('fail'));
    const n = next();
    await searchProducts(req({ query: { q: 'x' } }), res(), n);
    expect(n).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ═══════════════════════════════════════════════
// searchEvents
// ═══════════════════════════════════════════════
describe('searchEvents', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when query is empty', async () => {
    const r = res();
    await searchEvents(req({ query: {} }), r, next());
    expect(r.status).toHaveBeenCalledWith(400);
  });

  it('returns paginated events', async () => {
    prismaMock.events.findMany.mockResolvedValue([{ id: 'e1' }]);
    prismaMock.events.count.mockResolvedValue(1);

    const r = res();
    await searchEvents(req({ query: { q: 'flash', page: '1' } }), r, next());

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        events: [{ id: 'e1' }],
        pagination: expect.objectContaining({ total: 1 }),
      }),
    }));
  });

  it('applies eventType filter', async () => {
    prismaMock.events.findMany.mockResolvedValue([]);
    prismaMock.events.count.mockResolvedValue(0);

    await searchEvents(
      req({ query: { q: 'sale', eventType: 'FLASH_SALE' } }),
      res(),
      next(),
    );

    expect(prismaMock.events.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ event_type: 'FLASH_SALE' }),
      }),
    );
  });

  it('forwards errors to next()', async () => {
    prismaMock.events.findMany.mockRejectedValue(new Error('fail'));
    const n = next();
    await searchEvents(req({ query: { q: 'x' } }), res(), n);
    expect(n).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ═══════════════════════════════════════════════
// searchShops
// ═══════════════════════════════════════════════
describe('searchShops', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when query is empty', async () => {
    const r = res();
    await searchShops(req({ query: {} }), r, next());
    expect(r.status).toHaveBeenCalledWith(400);
  });

  it('returns paginated shops', async () => {
    prismaMock.shops.findMany.mockResolvedValue([{ id: 's1' }]);
    prismaMock.shops.count.mockResolvedValue(1);

    const r = res();
    await searchShops(req({ query: { q: 'gallery' } }), r, next());

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        shops: [{ id: 's1' }],
        pagination: expect.objectContaining({ total: 1 }),
      }),
    }));
  });

  it('applies category filter', async () => {
    prismaMock.shops.findMany.mockResolvedValue([]);
    prismaMock.shops.count.mockResolvedValue(0);

    await searchShops(
      req({ query: { q: 'gallery', category: 'Art' } }),
      res(),
      next(),
    );

    expect(prismaMock.shops.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ category: 'Art' }),
      }),
    );
  });

  it('forwards errors to next()', async () => {
    prismaMock.shops.findMany.mockRejectedValue(new Error('fail'));
    const n = next();
    await searchShops(req({ query: { q: 'x' } }), res(), n);
    expect(n).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ═══════════════════════════════════════════════
// getSearchSuggestions
// ═══════════════════════════════════════════════
describe('getSearchSuggestions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns popular items when query is empty', async () => {
    prismaMock.products.findMany.mockResolvedValue([{ title: 'Art', slug: 'art', category: 'Paintings' }]);
    prismaMock.products.groupBy.mockResolvedValue([]);

    const r = res();
    await getSearchSuggestions(req({ query: {} }), r, next());

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        suggestions: [],
        popular: expect.any(Array),
      }),
    }));
  });

  it('returns typed suggestions when query is provided', async () => {
    prismaMock.products.findMany.mockResolvedValue([
      { title: 'Canvas Art', slug: 'canvas-art', category: 'Paintings', images: [] },
    ]);
    prismaMock.products.groupBy.mockResolvedValue([]);
    prismaMock.shops.findMany.mockResolvedValue([]);

    const r = res();
    await getSearchSuggestions(req({ query: { q: 'canvas' } }), r, next());

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        suggestions: expect.any(Array),
        query: 'canvas',
      }),
    }));
  });

  it('forwards errors to next()', async () => {
    prismaMock.products.findMany.mockRejectedValue(new Error('fail'));
    const n = next();
    await getSearchSuggestions(req({ query: { q: 'x' } }), res(), n);
    expect(n).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ═══════════════════════════════════════════════
// sellerSearch
// ═══════════════════════════════════════════════
describe('sellerSearch', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when seller is not authenticated', async () => {
    const r = res();
    await sellerSearch(req({ query: { q: 'test' } }), r, next());
    expect(r.status).toHaveBeenCalledWith(401);
  });

  it('returns empty results when query is too short', async () => {
    const r = res();
    await sellerSearch(
      req({ user: { shop: { id: 'shop1' } }, query: { q: 'a' } }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      data: { results: [] },
    }));
  });

  it('returns products, events and discounts for valid query', async () => {
    prismaMock.products.findMany.mockResolvedValue([
      { id: 'p1', title: 'Canvas', slug: 'canvas', images: [], current_price: 50, status: 'Active', stock: 10, category: 'Art' },
    ]);
    prismaMock.events.findMany.mockResolvedValue([]);
    prismaMock.discount_codes.findMany.mockResolvedValue([]);

    const r = res();
    await sellerSearch(
      req({ user: { shop: { id: 'shop1' } }, query: { q: 'canvas' } }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        results: expect.any(Array),
        total: expect.any(Number),
        query: 'canvas',
      }),
    }));
  });

  it('filters by category when specified', async () => {
    prismaMock.events.findMany.mockResolvedValue([]);

    const r = res();
    await sellerSearch(
      req({ user: { shop: { id: 'shop1' } }, query: { q: 'test', category: 'events' } }),
      r,
      next(),
    );

    // Only events.findMany should be called (not products or discount_codes)
    expect(prismaMock.products.findMany).not.toHaveBeenCalled();
    expect(prismaMock.events.findMany).toHaveBeenCalled();
    expect(prismaMock.discount_codes.findMany).not.toHaveBeenCalled();
  });

  it('forwards errors to next()', async () => {
    prismaMock.products.findMany.mockRejectedValue(new Error('fail'));
    const n = next();
    await sellerSearch(
      req({ user: { shop: { id: 'shop1' } }, query: { q: 'test' } }),
      res(),
      n,
    );
    expect(n).toHaveBeenCalledWith(expect.any(Error));
  });
});
