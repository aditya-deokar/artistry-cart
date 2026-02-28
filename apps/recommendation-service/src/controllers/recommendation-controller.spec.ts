/**
 * Unit Tests for recommendation-controller
 *
 * Tests the getRecommendedProducts controller with its branching logic:
 *  - No userAnalytics → fallback last 10
 *  - actions.length < 50 → fallback last 10
 *  - Recently trained + cached → use cached recommendations
 *  - Stale/missing → call recommendProducts + update DB
 *  - Error handling → 500
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import {
  prismaMock,
  resetPrismaMock,
  mockRequest,
  mockResponse,
  mockNext,
  resetFactoryCounter,
} from '../../../../packages/test-utils';

// ── Hoisted mocks ──
const { mockRecommendProducts } = vi.hoisted(() => ({
  mockRecommendProducts: vi.fn(),
}));

// ── Module mocks ──
vi.mock('../../../../packages/libs/prisma', () => ({
  default: prismaMock,
}));

vi.mock('../services/recommendation-service', () => ({
  recommendProducts: mockRecommendProducts,
}));

import { getRecommendedProducts } from './recommendation-controller';

describe('getRecommendedProducts', () => {
  const sampleProducts = Array.from({ length: 15 }, (_, i) => ({
    id: `p${i + 1}`,
    title: `Product ${i + 1}`,
    Shop: { id: `shop-1`, name: 'Test Shop' },
  }));

  beforeEach(() => {
    resetPrismaMock();
    resetFactoryCounter();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});

    // Default: products query returns sample products
    prismaMock.products.findMany.mockResolvedValue(sampleProducts);
  });

  it('should return last 10 products when userAnalytics is null', async () => {
    prismaMock.userAnalytics.findUnique.mockResolvedValue(null);

    const req = mockRequest({ params: { userId: 'user-1' } });
    const res = mockResponse();

    await getRecommendedProducts(req, res, mockNext());

    expect(res.status).toHaveBeenCalledWith(200);
    const body = (res.json as Mock).mock.calls[0][0];
    expect(body.success).toBe(true);
    // Should slice last 10 from 15 products
    expect(body.recommendations).toHaveLength(10);
    expect(body.recommendations[0].id).toBe('p6'); // 15 - 10 + 1 = 6th
  });

  it('should return last 10 products when actions count < 50', async () => {
    prismaMock.userAnalytics.findUnique.mockResolvedValue({
      actions: Array.from({ length: 30 }, () => ({ productId: 'p1', action: 'VIEW' })),
      recommendations: [],
      lastTrained: null,
    } as any);

    const req = mockRequest({ params: { userId: 'user-1' } });
    const res = mockResponse();

    await getRecommendedProducts(req, res, mockNext());

    const body = (res.json as Mock).mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.recommendations).toHaveLength(10);
    expect(mockRecommendProducts).not.toHaveBeenCalled();
  });

  it('should use cached recommendations when lastTrained < 3 hours ago', async () => {
    const recentTime = new Date(Date.now() - 1 * 60 * 60 * 1000); // 1 hour ago
    prismaMock.userAnalytics.findUnique.mockResolvedValue({
      actions: Array.from({ length: 60 }, () => ({ productId: 'p1', action: 'VIEW' })),
      recommendations: ['p2', 'p5', 'p10'],
      lastTrained: recentTime,
    } as any);

    const req = mockRequest({ params: { userId: 'user-1' } });
    const res = mockResponse();

    await getRecommendedProducts(req, res, mockNext());

    const body = (res.json as Mock).mock.calls[0][0];
    expect(body.success).toBe(true);
    // Should filter products by cached recommendation IDs
    expect(body.recommendations.every((p: any) => ['p2', 'p5', 'p10'].includes(p.id))).toBe(true);
    expect(mockRecommendProducts).not.toHaveBeenCalled();
  });

  it('should call recommendProducts and update DB when stale/no cache', async () => {
    const oldTime = new Date(Date.now() - 5 * 60 * 60 * 1000); // 5 hours ago
    prismaMock.userAnalytics.findUnique.mockResolvedValue({
      actions: Array.from({ length: 60 }, () => ({ productId: 'p1', action: 'VIEW' })),
      recommendations: ['p1'],
      lastTrained: oldTime,
    } as any);
    prismaMock.userAnalytics.update.mockResolvedValue({} as any);

    const recommendedIds = ['p3', 'p7', 'p12'];
    mockRecommendProducts.mockResolvedValue(recommendedIds);

    const req = mockRequest({ params: { userId: 'user-1' } });
    const res = mockResponse();

    await getRecommendedProducts(req, res, mockNext());

    expect(mockRecommendProducts).toHaveBeenCalledWith('user-1', sampleProducts);

    // Should update userAnalytics with new recommendations
    expect(prismaMock.userAnalytics.update).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      data: expect.objectContaining({
        recommendations: recommendedIds,
      }),
    });

    const body = (res.json as Mock).mock.calls[0][0];
    expect(body.success).toBe(true);
  });

  it('should call recommendProducts when lastTrained is null (never trained)', async () => {
    prismaMock.userAnalytics.findUnique.mockResolvedValue({
      actions: Array.from({ length: 60 }, () => ({ productId: 'p1', action: 'VIEW' })),
      recommendations: [],
      lastTrained: null,
    } as any);
    prismaMock.userAnalytics.update.mockResolvedValue({} as any);
    mockRecommendProducts.mockResolvedValue(['p1', 'p2']);

    const req = mockRequest({ params: { userId: 'user-1' } });
    const res = mockResponse();

    await getRecommendedProducts(req, res, mockNext());

    expect(mockRecommendProducts).toHaveBeenCalled();
  });

  it('should return 500 on unexpected error', async () => {
    prismaMock.products.findMany.mockRejectedValue(new Error('DB failure'));

    const req = mockRequest({ params: { userId: 'user-1' } });
    const res = mockResponse();

    await getRecommendedProducts(req, res, mockNext());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Failed to fetch recommended products',
    });
  });

  it('should fetch all products with Shop include', async () => {
    prismaMock.userAnalytics.findUnique.mockResolvedValue(null);

    const req = mockRequest({ params: { userId: 'user-1' } });
    const res = mockResponse();

    await getRecommendedProducts(req, res, mockNext());

    expect(prismaMock.products.findMany).toHaveBeenCalledWith({
      include: { Shop: true },
    });
  });

  it('should handle non-array actions gracefully', async () => {
    prismaMock.userAnalytics.findUnique.mockResolvedValue({
      actions: 'invalid-string',
      recommendations: [],
      lastTrained: null,
    } as any);

    const req = mockRequest({ params: { userId: 'user-1' } });
    const res = mockResponse();

    await getRecommendedProducts(req, res, mockNext());

    // actions is not an array → Array.isArray returns false → actions = []
    // length < 50 → fallback
    const body = (res.json as Mock).mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.recommendations).toHaveLength(10);
  });
});
