/**
 * Unit Tests for offers.controller.ts
 *
 * Covers: getOffersPageData, getUserOffers, getDealsByCategory,
 *   getLimitedTimeOffers, getSeasonalOffers, getOfferStatistics
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks ──
const { prismaMock } = vi.hoisted(() => {
  const prismaMock = {
    banners: { findMany: vi.fn() },
    discount_codes: { findMany: vi.fn(), count: vi.fn() },
    products: {
      findMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
      aggregate: vi.fn(),
    },
    events: { findMany: vi.fn(), count: vi.fn() },
  };
  return { prismaMock };
});

vi.mock('../../../../packages/libs/prisma', () => ({
  __esModule: true,
  default: prismaMock,
}));

import {
  getOffersPageData,
  getUserOffers,
  getDealsByCategory,
  getLimitedTimeOffers,
  getSeasonalOffers,
  getOfferStatistics,
} from './offers.controller';

import { mockRequest, mockResponse, mockNext } from '../../../../packages/test-utils';

function req(data: Record<string, unknown> = {}) { return mockRequest(data); }
function res() { return mockResponse(); }
function next() { return mockNext(); }

// ═══════════════════════════════════════════════
// getOffersPageData
// ═══════════════════════════════════════════════
describe('getOffersPageData', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns combined offers page data with 200', async () => {
    prismaMock.banners.findMany.mockResolvedValue([]);
    prismaMock.discount_codes.findMany.mockResolvedValue([]);
    prismaMock.products.findMany.mockResolvedValue([]);
    prismaMock.products.groupBy.mockResolvedValue([]);
    prismaMock.events.findMany
      .mockResolvedValueOnce([]) // flash sales
      .mockResolvedValueOnce([]); // trending events

    const r = res();
    await getOffersPageData(req(), r, next());

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({
        banners: expect.any(Array),
        coupons: expect.any(Array),
        weeklyDeals: expect.any(Array),
        stats: expect.any(Object),
      }),
    }));
  });

  it('forwards errors to next()', async () => {
    prismaMock.banners.findMany.mockRejectedValue(new Error('fail'));
    const n = next();
    await getOffersPageData(req(), res(), n);
    expect(n).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ═══════════════════════════════════════════════
// getUserOffers
// ═══════════════════════════════════════════════
describe('getUserOffers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns events, banners, and coupons', async () => {
    prismaMock.events.findMany.mockResolvedValue([]);
    prismaMock.banners.findMany.mockResolvedValue([]);
    prismaMock.discount_codes.findMany.mockResolvedValue([]);

    const r = res();
    await getUserOffers(req(), r, next());

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({
        events: expect.any(Array),
        banners: expect.any(Array),
        coupons: expect.any(Array),
      }),
    }));
  });

  it('forwards errors to next()', async () => {
    prismaMock.events.findMany.mockRejectedValue(new Error('DB error'));
    const n = next();
    await getUserOffers(req(), res(), n);
    expect(n).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ═══════════════════════════════════════════════
// getDealsByCategory
// ═══════════════════════════════════════════════
describe('getDealsByCategory', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns paginated deals for a category', async () => {
    prismaMock.products.findMany.mockResolvedValue([{ id: 'p1', category: 'Paintings' }]);
    prismaMock.products.count.mockResolvedValue(1);

    const r = res();
    await getDealsByCategory(
      req({ params: { category: 'Paintings' }, query: {} }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        category: 'Paintings',
        pagination: expect.any(Object),
      }),
    }));
  });

  it('applies sortBy parameter', async () => {
    prismaMock.products.findMany.mockResolvedValue([]);
    prismaMock.products.count.mockResolvedValue(0);

    await getDealsByCategory(
      req({ params: { category: 'Art' }, query: { sortBy: 'price-asc' } }),
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
    await getDealsByCategory(req({ params: { category: 'x' }, query: {} }), res(), n);
    expect(n).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ═══════════════════════════════════════════════
// getLimitedTimeOffers
// ═══════════════════════════════════════════════
describe('getLimitedTimeOffers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns events ending within 24 hours', async () => {
    prismaMock.events.findMany.mockResolvedValue([]);

    const r = res();
    await getLimitedTimeOffers(req(), r, next());

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ urgentDeals: expect.any(Array) }),
    }));
  });

  it('forwards errors to next()', async () => {
    prismaMock.events.findMany.mockRejectedValue(new Error('fail'));
    const n = next();
    await getLimitedTimeOffers(req(), res(), n);
    expect(n).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ═══════════════════════════════════════════════
// getSeasonalOffers
// ═══════════════════════════════════════════════
describe('getSeasonalOffers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns seasonal events', async () => {
    prismaMock.events.findMany.mockResolvedValue([]);

    const r = res();
    await getSeasonalOffers(req({ query: {} }), r, next());

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ season: 'all' }),
    }));
  });

  it('passes season query param', async () => {
    prismaMock.events.findMany.mockResolvedValue([]);

    const r = res();
    await getSeasonalOffers(req({ query: { season: 'winter' } }), r, next());

    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ season: 'winter' }),
    }));
  });
});

// ═══════════════════════════════════════════════
// getOfferStatistics
// ═══════════════════════════════════════════════
describe('getOfferStatistics', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns aggregated offer statistics', async () => {
    prismaMock.events.count.mockResolvedValue(5);
    prismaMock.discount_codes.count.mockResolvedValue(10);
    prismaMock.products.count.mockResolvedValue(50);
    prismaMock.products.groupBy.mockResolvedValue([]);
    prismaMock.events.findMany.mockResolvedValue([]);

    const r = res();
    await getOfferStatistics(req(), r, next());

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        statistics: expect.objectContaining({
          totalActiveEvents: 5,
          totalDiscountCodes: 10,
          totalDiscountedProducts: 50,
        }),
      }),
    }));
  });

  it('forwards errors to next()', async () => {
    prismaMock.events.count.mockRejectedValue(new Error('fail'));
    const n = next();
    await getOfferStatistics(req(), res(), n);
    expect(n).toHaveBeenCalledWith(expect.any(Error));
  });
});
