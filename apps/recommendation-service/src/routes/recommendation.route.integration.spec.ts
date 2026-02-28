/**
 * Integration Tests for Recommendation Service Routes
 *
 * Uses Supertest to exercise Express routes end-to-end.
 * Builds a lightweight Express app mirroring main.ts setup
 * with mocked dependencies (Prisma, TensorFlow, auth middleware).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// ── Hoisted mocks ──
const { prismaMock, authState, mockRecommendProducts } = vi.hoisted(() => {
  function mm() {
    return {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
    };
  }
  const prismaMock = {
    users: mm(), products: mm(), userAnalytics: mm(),
    $transaction: vi.fn(async (cb: any) => cb(prismaMock)),
  };

  const authState: { user: any } = { user: null };

  const mockRecommendProducts = vi.fn().mockResolvedValue([]);

  return { prismaMock, authState, mockRecommendProducts };
});

// ── Module mocks ──
vi.mock('../../../../packages/libs/prisma', () => ({
  __esModule: true,
  default: prismaMock,
}));

vi.mock('../../../../packages/middleware/isAuthenticated', () => ({
  __esModule: true,
  default: vi.fn((req: any, res: any, next: any) => {
    if (!authState.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = authState.user;
    next();
  }),
}));

vi.mock('../services/recommendation-service', () => ({
  recommendProducts: mockRecommendProducts,
}));

// ── Build Express app (mirror main.ts but no listen) ──
import express from 'express';
import cookieParser from 'cookie-parser';
import router from './recommendation.routes';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use('/api', router);
  return app;
}

describe('Recommendation Routes (Integration)', () => {
  const sampleProducts = Array.from({ length: 12 }, (_, i) => ({
    id: `p${i + 1}`,
    title: `Product ${i + 1}`,
    Shop: { id: 'shop-1', name: 'Art Shop' },
  }));

  let app: ReturnType<typeof buildApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = null;
    prismaMock.products.findMany.mockResolvedValue(sampleProducts);
    prismaMock.userAnalytics.findUnique.mockResolvedValue(null);
    mockRecommendProducts.mockResolvedValue([]);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    app = buildApp();
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request(app).get('/api/recommendations/user-1');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Unauthorized');
  });

  it('should return 200 with recommendations when authenticated', async () => {
    authState.user = { id: 'user-1', role: 'user' };

    const res = await request(app).get('/api/recommendations/user-1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.recommendations)).toBe(true);
  });

  it('should return fallback last 10 products when no analytics', async () => {
    authState.user = { id: 'user-1', role: 'user' };
    prismaMock.userAnalytics.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/recommendations/user-1');

    expect(res.status).toBe(200);
    expect(res.body.recommendations).toHaveLength(10);
  });

  it('should use cached recommendations when recently trained', async () => {
    authState.user = { id: 'user-1', role: 'user' };
    const recent = new Date(Date.now() - 1 * 60 * 60 * 1000); // 1 hour ago
    prismaMock.userAnalytics.findUnique.mockResolvedValue({
      actions: Array.from({ length: 60 }, () => ({ productId: 'p1', action: 'VIEW' })),
      recommendations: ['p1', 'p3'],
      lastTrained: recent,
    } as any);

    const res = await request(app).get('/api/recommendations/user-1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockRecommendProducts).not.toHaveBeenCalled();
  });

  it('should call recommendProducts when training is stale', async () => {
    authState.user = { id: 'user-1', role: 'user' };
    const old = new Date(Date.now() - 5 * 60 * 60 * 1000); // 5 hours ago
    prismaMock.userAnalytics.findUnique.mockResolvedValue({
      actions: Array.from({ length: 60 }, () => ({ productId: 'p1', action: 'VIEW' })),
      recommendations: ['p1'],
      lastTrained: old,
    } as any);
    prismaMock.userAnalytics.update.mockResolvedValue({} as any);
    mockRecommendProducts.mockResolvedValue(['p2', 'p5']);

    const res = await request(app).get('/api/recommendations/user-1');

    expect(res.status).toBe(200);
    expect(mockRecommendProducts).toHaveBeenCalledWith('user-1', sampleProducts);
  });

  it('should return 500 when an error occurs', async () => {
    authState.user = { id: 'user-1', role: 'user' };
    prismaMock.products.findMany.mockRejectedValue(new Error('DB down'));

    const res = await request(app).get('/api/recommendations/user-1');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to fetch recommended products');
  });
});
