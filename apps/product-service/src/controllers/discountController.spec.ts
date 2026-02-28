/**
 * Unit Tests for discountController.ts
 *
 * Covers: createDiscountCode, getSellerDiscountCodes, updateDiscountCode,
 *   deleteDiscountCode, validateDiscountCode, applyDiscountCode, getDiscountUsageStats
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks ──
const { prismaMock } = vi.hoisted(() => {
  const prismaMock = {
    discount_codes: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    products: { count: vi.fn() },
    orders: { findFirst: vi.fn(), update: vi.fn() },
    discount_usage: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    $transaction: vi.fn((fn: any) => fn(prismaMock)),
  };
  return { prismaMock };
});

vi.mock('../../../../packages/libs/prisma', () => ({
  __esModule: true,
  default: prismaMock,
}));

vi.mock('../../../../packages/error-handler', () => ({
  ValidationError: class ValidationError extends Error {
    constructor(msg: string) { super(msg); this.name = 'ValidationError'; }
  },
}));

import {
  createDiscountCode,
  getSellerDiscountCodes,
  updateDiscountCode,
  deleteDiscountCode,
  validateDiscountCode,
  applyDiscountCode,
  getDiscountUsageStats,
} from './discountController';

import { mockRequest, mockResponse, mockNext } from '../../../../packages/test-utils';

function req(data: Record<string, unknown> = {}) { return mockRequest(data); }
function res() { return mockResponse(); }
function next() { return mockNext(); }

const sellerAuth = { user: { id: 'seller1', shop: { id: 'shop1' } } };

// ═══════════════════════════════════════════════
// createDiscountCode
// ═══════════════════════════════════════════════
describe('createDiscountCode', () => {
  const validBody = {
    publicName: 'Summer Sale',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    discountCode: 'SUMMER20',
    applicableToAll: true,
  };

  beforeEach(() => vi.clearAllMocks());

  it('creates a discount code and returns 201', async () => {
    prismaMock.discount_codes.findUnique.mockResolvedValue(null);
    prismaMock.discount_codes.create.mockResolvedValue({ id: 'd1', ...validBody });

    const r = res();
    await createDiscountCode(req({ body: validBody, ...sellerAuth }), r, next());

    expect(r.status).toHaveBeenCalledWith(201);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('returns 401 when not authenticated', async () => {
    const r = res();
    await createDiscountCode(req({ body: validBody, user: {} }), r, next());
    expect(r.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 when discount code already exists', async () => {
    prismaMock.discount_codes.findUnique.mockResolvedValue({ id: 'existing' });

    const r = res();
    await createDiscountCode(req({ body: validBody, ...sellerAuth }), r, next());
    expect(r.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for invalid body (Zod error)', async () => {
    const r = res();
    await createDiscountCode(
      req({ body: { discountType: 'INVALID' }, ...sellerAuth }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when validUntil is before validFrom', async () => {
    prismaMock.discount_codes.findUnique.mockResolvedValue(null);

    const r = res();
    await createDiscountCode(
      req({
        body: {
          ...validBody,
          validFrom: '2026-06-01T00:00:00Z',
          validUntil: '2026-01-01T00:00:00Z',
        },
        ...sellerAuth,
      }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(400);
  });
});

// ═══════════════════════════════════════════════
// getSellerDiscountCodes
// ═══════════════════════════════════════════════
describe('getSellerDiscountCodes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns paginated discount codes', async () => {
    prismaMock.discount_codes.findMany.mockResolvedValue([{ id: 'd1' }]);
    prismaMock.discount_codes.count.mockResolvedValue(1);

    const r = res();
    await getSellerDiscountCodes(req({ query: {}, ...sellerAuth }), r, next());

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ pagination: expect.any(Object) }),
    }));
  });

  it('returns 401 when not authenticated', async () => {
    const r = res();
    await getSellerDiscountCodes(req({ query: {}, user: {} }), r, next());
    expect(r.status).toHaveBeenCalledWith(401);
  });

  it('applies status filter "active"', async () => {
    prismaMock.discount_codes.findMany.mockResolvedValue([]);
    prismaMock.discount_codes.count.mockResolvedValue(0);

    await getSellerDiscountCodes(
      req({ query: { status: 'active' }, ...sellerAuth }),
      res(),
      next(),
    );

    const call = prismaMock.discount_codes.findMany.mock.calls[0][0];
    expect(call.where.AND).toBeDefined();
  });

  it('applies search filter', async () => {
    prismaMock.discount_codes.findMany.mockResolvedValue([]);
    prismaMock.discount_codes.count.mockResolvedValue(0);

    await getSellerDiscountCodes(
      req({ query: { search: 'SUMMER' }, ...sellerAuth }),
      res(),
      next(),
    );

    const call = prismaMock.discount_codes.findMany.mock.calls[0][0];
    expect(call.where.AND).toBeDefined();
  });
});

// ═══════════════════════════════════════════════
// updateDiscountCode
// ═══════════════════════════════════════════════
describe('updateDiscountCode', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates discount code successfully', async () => {
    prismaMock.discount_codes.findFirst.mockResolvedValue({
      id: 'd1', discountCode: 'OLD', currentUsageCount: 0, validFrom: new Date(), validUntil: null,
    });
    prismaMock.discount_codes.update.mockResolvedValue({ id: 'd1', publicName: 'New Name' });

    const r = res();
    await updateDiscountCode(
      req({ params: { discountId: 'd1' }, body: { publicName: 'New Name' }, ...sellerAuth }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(200);
  });

  it('returns 401 when not authenticated', async () => {
    const r = res();
    await updateDiscountCode(
      req({ params: { discountId: 'd1' }, body: {}, user: {} }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when discount not found', async () => {
    prismaMock.discount_codes.findFirst.mockResolvedValue(null);

    const r = res();
    await updateDiscountCode(
      req({ params: { discountId: 'd1' }, body: { publicName: 'x' }, ...sellerAuth }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(404);
  });

  it('returns 400 when new code already exists', async () => {
    prismaMock.discount_codes.findFirst.mockResolvedValue({
      id: 'd1', discountCode: 'OLD', currentUsageCount: 0, validFrom: new Date(),
    });
    prismaMock.discount_codes.findUnique.mockResolvedValue({ id: 'd2' });

    const r = res();
    await updateDiscountCode(
      req({
        params: { discountId: 'd1' },
        body: { discountCode: 'TAKEN' },
        ...sellerAuth,
      }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when reducing usage limit below current count', async () => {
    prismaMock.discount_codes.findFirst.mockResolvedValue({
      id: 'd1', discountCode: 'X', currentUsageCount: 10, validFrom: new Date(),
    });

    const r = res();
    await updateDiscountCode(
      req({
        params: { discountId: 'd1' },
        body: { usageLimit: 5 },
        ...sellerAuth,
      }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(400);
  });
});

// ═══════════════════════════════════════════════
// deleteDiscountCode
// ═══════════════════════════════════════════════
describe('deleteDiscountCode', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deletes unused discount code', async () => {
    prismaMock.discount_codes.findFirst.mockResolvedValue({ id: 'd1', currentUsageCount: 0 });
    prismaMock.discount_codes.delete.mockResolvedValue({});

    const r = res();
    await deleteDiscountCode(
      req({ params: { discountId: 'd1' }, ...sellerAuth }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(200);
    expect(prismaMock.discount_codes.delete).toHaveBeenCalledWith({ where: { id: 'd1' } });
  });

  it('returns 401 when not authenticated', async () => {
    const r = res();
    await deleteDiscountCode(req({ params: { discountId: 'd1' }, user: {} }), r, next());
    expect(r.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when discount not found', async () => {
    prismaMock.discount_codes.findFirst.mockResolvedValue(null);

    const r = res();
    await deleteDiscountCode(req({ params: { discountId: 'd1' }, ...sellerAuth }), r, next());
    expect(r.status).toHaveBeenCalledWith(404);
  });

  it('returns 400 when discount has been used', async () => {
    prismaMock.discount_codes.findFirst.mockResolvedValue({ id: 'd1', currentUsageCount: 5 });

    const r = res();
    await deleteDiscountCode(req({ params: { discountId: 'd1' }, ...sellerAuth }), r, next());
    expect(r.status).toHaveBeenCalledWith(400);
  });
});

// ═══════════════════════════════════════════════
// validateDiscountCode
// ═══════════════════════════════════════════════
describe('validateDiscountCode', () => {
  beforeEach(() => vi.clearAllMocks());

  it('validates and calculates discount for percentage type', async () => {
    prismaMock.discount_codes.findUnique.mockResolvedValue({
      id: 'd1',
      discountCode: 'SAVE20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      isActive: true,
      validFrom: new Date('2020-01-01'),
      validUntil: new Date('2099-12-31'),
      currentUsageCount: 0,
      usageLimit: 100,
      minimumOrderAmount: null,
      maximumDiscountAmount: 50,
      shopId: 'shop1',
      applicableToAll: true,
    });

    const r = res();
    await validateDiscountCode(
      req({
        body: {
          discountCode: 'save20',
          cartItems: [{ price: 100, quantity: 2 }],
        },
      }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({
        discountAmount: 40, // 20% of 200, max 50 → 40
        cartTotal: 200,
        finalAmount: 160,
      }),
    }));
  });

  it('caps percentage discount at maximumDiscountAmount', async () => {
    prismaMock.discount_codes.findUnique.mockResolvedValue({
      id: 'd1',
      discountType: 'PERCENTAGE',
      discountValue: 50,
      isActive: true,
      validFrom: new Date('2020-01-01'),
      validUntil: new Date('2099-12-31'),
      currentUsageCount: 0,
      usageLimit: null,
      minimumOrderAmount: null,
      maximumDiscountAmount: 30,
      shopId: 'shop1',
    });

    const r = res();
    await validateDiscountCode(
      req({ body: { discountCode: 'HALF', cartItems: [{ price: 200, quantity: 1 }] } }),
      r,
      next(),
    );

    const call = (r.json as any).mock.calls[0][0];
    expect(call.data.discountAmount).toBe(30);
  });

  it('returns 400 when discountCode missing', async () => {
    const r = res();
    await validateDiscountCode(
      req({ body: { cartItems: [] } }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when cartItems missing', async () => {
    const r = res();
    await validateDiscountCode(
      req({ body: { discountCode: 'X' } }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when code not found', async () => {
    prismaMock.discount_codes.findUnique.mockResolvedValue(null);

    const r = res();
    await validateDiscountCode(
      req({ body: { discountCode: 'NOPE', cartItems: [] } }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(404);
  });

  it('returns 400 when code expired', async () => {
    prismaMock.discount_codes.findUnique.mockResolvedValue({
      isActive: true,
      validFrom: new Date('2020-01-01'),
      validUntil: new Date('2020-12-31'),
      currentUsageCount: 0,
      usageLimit: 100,
      shopId: 'shop1',
    });

    const r = res();
    await validateDiscountCode(
      req({ body: { discountCode: 'OLD', cartItems: [{ price: 10, quantity: 1 }] } }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when shop mismatch', async () => {
    prismaMock.discount_codes.findUnique.mockResolvedValue({
      isActive: true,
      validFrom: new Date('2020-01-01'),
      validUntil: new Date('2099-12-31'),
      currentUsageCount: 0,
      usageLimit: null,
      shopId: 'shop1',
    });

    const r = res();
    await validateDiscountCode(
      req({
        body: {
          discountCode: 'X',
          cartItems: [{ price: 10, quantity: 1 }],
          shopId: 'shop2',
        },
      }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when minimum order not met', async () => {
    prismaMock.discount_codes.findUnique.mockResolvedValue({
      isActive: true,
      validFrom: new Date('2020-01-01'),
      validUntil: new Date('2099-12-31'),
      currentUsageCount: 0,
      usageLimit: null,
      minimumOrderAmount: 500,
      shopId: 'shop1',
    });

    const r = res();
    await validateDiscountCode(
      req({
        body: { discountCode: 'BIG', cartItems: [{ price: 10, quantity: 1 }] },
      }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(400);
  });
});

// ═══════════════════════════════════════════════
// applyDiscountCode
// ═══════════════════════════════════════════════
describe('applyDiscountCode', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const r = res();
    await applyDiscountCode(
      req({ body: { discountCode: 'X', orderId: 'o1' }, user: {} }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 when discountCode is missing', async () => {
    const r = res();
    await applyDiscountCode(
      req({ body: { orderId: 'o1' }, user: { id: 'u1' } }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when orderId is missing', async () => {
    const r = res();
    await applyDiscountCode(
      req({ body: { discountCode: 'X' }, user: { id: 'u1' } }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when discount code not found', async () => {
    prismaMock.discount_codes.findUnique.mockResolvedValue(null);

    const r = res();
    await applyDiscountCode(
      req({ body: { discountCode: 'NOPE', orderId: 'o1' }, user: { id: 'u1' } }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(404);
  });

  it('returns 404 when order not found', async () => {
    prismaMock.discount_codes.findUnique.mockResolvedValue({
      id: 'd1', discountCode: 'X', shopId: 'shop1', isActive: true,
      validFrom: new Date('2020-01-01'), validUntil: new Date('2099-12-31'),
      currentUsageCount: 0, usageLimit: 100,
    });
    prismaMock.orders.findFirst.mockResolvedValue(null);

    const r = res();
    await applyDiscountCode(
      req({ body: { discountCode: 'X', orderId: 'o1' }, user: { id: 'u1' } }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(404);
  });
});

// ═══════════════════════════════════════════════
// getDiscountUsageStats
// ═══════════════════════════════════════════════
describe('getDiscountUsageStats', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns usage stats for a discount', async () => {
    prismaMock.discount_codes.findFirst.mockResolvedValue({
      id: 'd1', usageLimit: 100, currentUsageCount: 5,
    });
    prismaMock.discount_usage.findMany.mockResolvedValue([]);
    prismaMock.discount_usage.aggregate.mockResolvedValue({
      _sum: { discountAmount: 250 },
      _count: { id: 5 },
    });

    const r = res();
    await getDiscountUsageStats(
      req({ params: { discountId: 'd1' }, ...sellerAuth }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        stats: expect.objectContaining({ totalUsages: 5 }),
      }),
    }));
  });

  it('returns 401 when not authenticated', async () => {
    const r = res();
    await getDiscountUsageStats(
      req({ params: { discountId: 'd1' }, user: {} }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when discount not found', async () => {
    prismaMock.discount_codes.findFirst.mockResolvedValue(null);

    const r = res();
    await getDiscountUsageStats(
      req({ params: { discountId: 'd1' }, ...sellerAuth }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(404);
  });
});
