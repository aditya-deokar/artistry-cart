/**
 * Integration Tests for Order Service Routes
 *
 * Uses Supertest to exercise Express routes end-to-end.
 * Builds a lightweight Express app mirroring main.ts setup
 * with mocked dependencies (Prisma, Stripe, Redis, auth middleware).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// ── Hoisted mocks ──
const { prismaMock, redisMockInstance, stripeMocks, authState } = vi.hoisted(() => {
  // Minimal prisma mock inline (integration tests only need the models exercised by routes)
  function mm() {
    return {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
      aggregate: vi.fn().mockResolvedValue({ _sum: { totalAmount: null } }),
      groupBy: vi.fn(),
    };
  }
  const prismaMock = {
    users: mm(), sellers: mm(), shops: mm(), products: mm(),
    orders: mm(), orderItem: mm(), addresses: mm(),
    payments: mm(), payouts: mm(), refunds: mm(),
    productAnalytics: mm(), userAnalytics: mm(),
    notification: mm(),
    $transaction: vi.fn(async (cb: any) => cb(prismaMock)),
  };

  // Redis mock (in-memory)
  const store = new Map<string, string>();
  const redisMockInstance = {
    get: vi.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    set: vi.fn((key: string, value: string) => { store.set(key, value); return Promise.resolve('OK'); }),
    setex: vi.fn((key: string, _sec: number, value: string) => { store.set(key, value); return Promise.resolve('OK'); }),
    del: vi.fn((key: string) => { store.delete(key); return Promise.resolve(1); }),
    keys: vi.fn((pattern: string) => {
      if (pattern === '*') return Promise.resolve(Array.from(store.keys()));
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return Promise.resolve(Array.from(store.keys()).filter((k) => regex.test(k)));
    }),
    _store: store,
  };

  // Stripe mock
  const stripeMocks = {
    paymentIntents: {
      create: vi.fn().mockResolvedValue({
        id: 'pi_test_int',
        client_secret: 'pi_test_int_secret',
        amount: 5000,
        currency: 'usd',
        status: 'requires_payment_method',
      }),
      retrieve: vi.fn().mockResolvedValue({
        id: 'pi_test_int',
        amount: 5000,
        currency: 'usd',
        status: 'succeeded',
        metadata: { sessionId: 'sess-1' },
      }),
    },
    refunds: {
      create: vi.fn().mockResolvedValue({ id: 're_test', amount: 5000, status: 'succeeded' }),
    },
    transfers: {
      create: vi.fn().mockResolvedValue({ id: 'tr_test', amount: 4500, destination: 'acct_test' }),
    },
    webhooks: {
      constructEvent: vi.fn().mockReturnValue({
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_test_int' } },
      }),
    },
  };

  const authState: { user: any; role: string } = { user: null, role: 'user' };

  return { prismaMock, redisMockInstance, stripeMocks, authState };
});

// ── Module mocks ──

vi.mock('../../../../packages/libs/prisma', () => ({
  __esModule: true,
  default: prismaMock,
}));

vi.mock('stripe', () => ({
  __esModule: true,
  default: function (..._args: any[]) { return stripeMocks; },
}));

vi.mock('ioredis', () => ({
  __esModule: true,
  default: function (..._args: any[]) { return redisMockInstance; },
}));

vi.mock('../utils/send-email', () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

vi.mock('crypto', async (importOriginal) => {
  const actual = await importOriginal<typeof import('crypto')>();
  return {
    ...actual,
    randomUUID: vi.fn().mockReturnValue('int-test-session-uuid'),
  };
});

vi.mock('../../../../packages/error-handler', () => {
  class AppError extends Error {
    statusCode: number;
    constructor(msg: string, code = 500) { super(msg); this.statusCode = code; }
  }
  return {
    __esModule: true,
    default: AppError,
    AppError,
    ValidationError: class extends AppError {
      constructor(msg: string) { super(msg, 400); }
    },
    AuthError: class extends AppError {
      constructor(msg: string) { super(msg, 401); }
    },
    NotFoundError: class extends AppError {
      constructor(msg: string) { super(msg, 404); }
    },
    ForbiddenError: class extends AppError {
      constructor(msg: string) { super(msg, 403); }
    },
  };
});

vi.mock('../../../../packages/error-handler/error-middelware', () => ({
  __esModule: true,
  errorMiddleware: (err: any, _req: any, res: any, _next: any) => {
    const status = err.statusCode || 500;
    res.status(status).json({ success: false, message: err.message });
  },
}));

vi.mock('../../../../packages/middleware/isAuthenticated', () => ({
  __esModule: true,
  default: vi.fn((req: any, res: any, next: any) => {
    if (!authState.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = authState.user;
    req.role = authState.role;
    next();
  }),
}));

vi.mock('../../../../packages/middleware/authorizedRoles', () => ({
  __esModule: true,
  isSeller: vi.fn((req: any, res: any, next: any) => {
    if (req.role !== 'seller') {
      return res.status(403).json({ message: 'Seller access only' });
    }
    next();
  }),
  authorizedRoles: vi.fn((...roles: string[]) => (req: any, res: any, next: any) => {
    if (!roles.includes(req.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  }),
}));

// ── Build Express app matching main.ts route registration ──
import express from 'express';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from '../../../../packages/error-handler/error-middelware';
import router from '../routes/order.route';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.get('/', (_req, res) => res.send({ message: 'Welcome to order-service!' }));
  app.use('/order/api', router);
  app.use(errorMiddleware);
  return app;
}

const app = buildApp();

// ── Helpers ──
function asUser(id = 'user-1') {
  authState.user = { id };
  authState.role = 'user';
}

function asSeller(id = 'seller-1') {
  authState.user = { id };
  authState.role = 'seller';
}

// ── Reset ──
beforeEach(() => {
  authState.user = null;
  authState.role = 'user';
  redisMockInstance._store.clear();

  // Reset all prisma model mocks
  for (const model of Object.values(prismaMock)) {
    if (model && typeof model === 'object') {
      for (const fn of Object.values(model as Record<string, any>)) {
        if (typeof fn?.mockReset === 'function') fn.mockReset();
      }
    }
  }
  // Reset stripe mocks
  for (const ns of Object.values(stripeMocks)) {
    for (const fn of Object.values(ns as Record<string, any>)) {
      if (typeof fn?.mockReset === 'function') fn.mockReset();
    }
  }
  // Restore defaults
  stripeMocks.paymentIntents.create.mockResolvedValue({
    id: 'pi_test_int', client_secret: 'pi_test_int_secret',
    amount: 5000, currency: 'usd', status: 'requires_payment_method',
  });
  stripeMocks.paymentIntents.retrieve.mockResolvedValue({
    id: 'pi_test_int', amount: 5000, currency: 'usd', status: 'succeeded',
    metadata: { sessionId: 'sess-1' },
  });
  stripeMocks.refunds.create.mockResolvedValue({ id: 're_test', amount: 5000, status: 'succeeded' });
  stripeMocks.transfers.create.mockResolvedValue({ id: 'tr_test', amount: 4500, destination: 'acct_test' });
  prismaMock.orders.count.mockResolvedValue(0);
  prismaMock.orders.aggregate.mockResolvedValue({ _sum: { totalAmount: null } });
});

// ═══════════════════════════════════════════════════════════════════════
// Health / Root
// ═══════════════════════════════════════════════════════════════════════

describe('GET /', () => {
  it('should return welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('order-service');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Auth guard
// ═══════════════════════════════════════════════════════════════════════

describe('Authentication guard', () => {
  it('should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/order/api/orders');
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Payment Session Routes
// ═══════════════════════════════════════════════════════════════════════

describe('POST /order/api/create-payment-session', () => {
  it('should create a payment session', async () => {
    asUser();
    prismaMock.shops.findMany.mockResolvedValueOnce([
      { id: 'shop-1', sellerId: 'sel-1', sellers: { stripeId: 'acct_1' } },
    ]);

    const res = await request(app)
      .post('/order/api/create-payment-session')
      .send({
        cart: [{ id: 'p1', quantity: 1, sale_price: 50, shopId: 'shop-1' }],
        selectedAddressId: null,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('sessionId');
  });

  it('should return 400 for empty cart', async () => {
    asUser();
    const res = await request(app)
      .post('/order/api/create-payment-session')
      .send({ cart: [] });

    expect(res.status).toBe(400);
  });
});

describe('GET /order/api/verify-payment-session', () => {
  it('should return session data when valid', async () => {
    asUser();
    const sessionData = { userId: 'u1', cart: [{ id: 'p1' }], totalAmount: 50 };
    redisMockInstance._store.set('payment-session:sess-1', JSON.stringify(sessionData));

    const res = await request(app)
      .get('/order/api/verify-payment-session')
      .query({ sessionId: 'sess-1' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.session).toEqual(sessionData);
  });

  it('should return 400 without sessionId', async () => {
    asUser();
    const res = await request(app).get('/order/api/verify-payment-session');
    expect(res.status).toBe(400);
  });

  it('should return 404 for expired session', async () => {
    asUser();
    const res = await request(app)
      .get('/order/api/verify-payment-session')
      .query({ sessionId: 'expired' });
    expect(res.status).toBe(404);
  });
});

describe('GET /order/api/verify-session-and-create-intent', () => {
  it('should return client secret on success', async () => {
    asUser();
    const session = {
      totalAmount: 100,
      sellers: [{ shopId: 'sh-1', sellerId: 'se-1', stripeAccountId: 'acct_real' }],
    };
    redisMockInstance._store.set('payment-session:sess-1', JSON.stringify(session));

    const res = await request(app)
      .get('/order/api/verify-session-and-create-intent')
      .query({ sessionId: 'sess-1' });

    expect(res.status).toBe(200);
    expect(res.body.clientSecret).toBe('pi_test_int_secret');
  });

  it('should return 400 when seller has no stripe account', async () => {
    asUser();
    const session = {
      totalAmount: 100,
      sellers: [{ shopId: 'sh-1', sellerId: 'se-1', stripeAccountId: null }],
    };
    redisMockInstance._store.set('payment-session:no-stripe', JSON.stringify(session));

    const res = await request(app)
      .get('/order/api/verify-session-and-create-intent')
      .query({ sessionId: 'no-stripe' });

    expect(res.status).toBe(400);
  });
});

describe('POST /order/api/create-payment-intent', () => {
  it('should create payment intent', async () => {
    asUser();
    const res = await request(app)
      .post('/order/api/create-payment-intent')
      .send({ amount: 100, sellerStripeAccountId: 'acct_s1', sessionId: 'sess-1' });

    expect(res.status).toBe(200);
    expect(res.body.clientSecret).toBe('pi_test_int_secret');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Order Management Routes
// ═══════════════════════════════════════════════════════════════════════

describe('GET /order/api/orders', () => {
  it('should return paginated user orders', async () => {
    asUser();
    const orders = [{ id: 'ord-1' }, { id: 'ord-2' }];
    prismaMock.orders.findMany.mockResolvedValueOnce(orders);
    prismaMock.orders.count.mockResolvedValueOnce(2);

    const res = await request(app).get('/order/api/orders').query({ page: '1', limit: '10' });

    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(2);
    expect(res.body.total).toBe(2);
  });
});

describe('GET /order/api/orders/:orderId', () => {
  it('should return order details', async () => {
    asUser();
    const order = { id: 'ord-1', userId: 'user-1', totalAmount: 99 };
    prismaMock.orders.findFirst.mockResolvedValueOnce(order);

    const res = await request(app).get('/order/api/orders/ord-1');

    expect(res.status).toBe(200);
    expect(res.body.order.id).toBe('ord-1');
  });

  it('should return 404 when not found', async () => {
    asUser();
    prismaMock.orders.findFirst.mockResolvedValueOnce(null);

    const res = await request(app).get('/order/api/orders/missing');

    expect(res.status).toBe(404);
  });
});

describe('POST /order/api/orders/:orderId/cancel', () => {
  it('should cancel a PENDING order', async () => {
    asUser();
    const order = { id: 'ord-1', userId: 'user-1', status: 'PENDING', payment: null };
    prismaMock.orders.findFirst.mockResolvedValueOnce(order);
    prismaMock.orders.update.mockResolvedValueOnce({});
    prismaMock.orderItem.findMany.mockResolvedValueOnce([]);

    const res = await request(app)
      .post('/order/api/orders/ord-1/cancel')
      .send({ reason: 'Changed mind' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 for non-cancellable status', async () => {
    asUser();
    prismaMock.orders.findFirst.mockResolvedValueOnce({
      id: 'ord-1', userId: 'user-1', status: 'SHIPPED',
    });

    const res = await request(app).post('/order/api/orders/ord-1/cancel');

    expect(res.status).toBe(400);
  });
});

describe('POST /order/api/refunds/request', () => {
  it('should process a refund request', async () => {
    asUser();
    const payment = { id: 'pay-1', amount: 100, stripePaymentIntent: 'pi_1' };
    const order = {
      id: 'ord-1', userId: 'user-1', payment,
      items: [{ id: 'item-1', price: 100, quantity: 1 }],
    };
    prismaMock.orders.findFirst.mockResolvedValueOnce(order);
    prismaMock.refunds.create.mockResolvedValueOnce({ id: 'ref-1' });
    prismaMock.payments.update.mockResolvedValueOnce({});
    prismaMock.orders.update.mockResolvedValueOnce({});

    const res = await request(app)
      .post('/order/api/refunds/request')
      .send({ orderId: 'ord-1', reason: 'Defective' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 when no payment found', async () => {
    asUser();
    prismaMock.orders.findFirst.mockResolvedValueOnce({
      id: 'ord-1', userId: 'user-1', payment: null, items: [],
    });

    const res = await request(app)
      .post('/order/api/refunds/request')
      .send({ orderId: 'ord-1' });

    expect(res.status).toBe(400);
  });
});

describe('GET /order/api/payment-status', () => {
  it('should return payment status', async () => {
    asUser();
    prismaMock.payments.findUnique.mockResolvedValueOnce({
      order: { id: 'ord-1', items: [] },
    });

    const res = await request(app)
      .get('/order/api/payment-status')
      .query({ payment_intent: 'pi_test_int' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('succeeded');
    expect(res.body.amount).toBe(50);
  });

  it('should return 400 without payment_intent query', async () => {
    asUser();
    const res = await request(app).get('/order/api/payment-status');
    expect(res.status).toBe(400);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Seller Routes (require seller role)
// ═══════════════════════════════════════════════════════════════════════

describe('Seller route access control', () => {
  it('should reject non-seller users with 403', async () => {
    // With no auth token, the isAuthenticated mock returns 401
    // With auth but wrong role, isSeller returns 403
    asSeller(); // Actually set as seller to pass isAuthenticated
    authState.role = 'user'; // But override role to non-seller
    const res = await request(app).get('/order/api/seller/orders');
    expect(res.status).toBe(403);
  });
});

describe('GET /order/api/seller/orders', () => {
  it('should return seller orders', async () => {
    asSeller();
    prismaMock.shops.findUnique.mockResolvedValueOnce({ id: 'shop-1', sellerId: 'seller-1' });
    prismaMock.orders.findMany.mockResolvedValueOnce([{ id: 'ord-1' }]);
    prismaMock.orders.count.mockResolvedValueOnce(1);

    const res = await request(app).get('/order/api/seller/orders');

    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(1);
  });
});

describe('PUT /order/api/seller/orders/:orderId/status', () => {
  it('should update order status', async () => {
    asSeller();
    prismaMock.shops.findUnique.mockResolvedValueOnce({ id: 'shop-1', sellerId: 'seller-1' });
    prismaMock.orders.findFirst.mockResolvedValueOnce({ id: 'ord-1' });
    prismaMock.orders.update.mockResolvedValueOnce({ id: 'ord-1', status: 'SHIPPED' });

    const res = await request(app)
      .put('/order/api/seller/orders/ord-1/status')
      .send({ status: 'SHIPPED' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /order/api/seller/analytics', () => {
  it('should return analytics for seller', async () => {
    asSeller();
    prismaMock.shops.findUnique.mockResolvedValueOnce({ id: 'shop-1', sellerId: 'seller-1' });
    prismaMock.orders.count.mockResolvedValueOnce(10);
    prismaMock.orders.aggregate.mockResolvedValueOnce({ _sum: { totalAmount: 2500 } });

    const res = await request(app).get('/order/api/seller/analytics');

    expect(res.status).toBe(200);
    expect(res.body.totalOrders).toBe(10);
    expect(res.body.totalRevenue).toBe(2500);
  });
});

describe('GET /order/api/seller/orders/:orderId', () => {
  it('should return seller order details', async () => {
    asSeller();
    prismaMock.shops.findUnique.mockResolvedValueOnce({ id: 'shop-1', sellerId: 'seller-1' });
    prismaMock.orders.findFirst.mockResolvedValueOnce({
      id: 'ord-1', shippingAddressId: 'addr-1',
    });
    prismaMock.addresses.findUnique.mockResolvedValueOnce({
      id: 'addr-1', addressLine1: '123 St',
    });

    const res = await request(app).get('/order/api/seller/orders/ord-1');

    expect(res.status).toBe(200);
    expect(res.body.order.shippingAddress).toBeDefined();
  });
});

describe('GET /order/api/seller/earnings', () => {
  it('should return seller earnings', async () => {
    asSeller();
    prismaMock.sellers.findUnique.mockResolvedValueOnce({
      id: 'seller-1',
      shop: { id: 'shop-1' },
      stripeOnboardingComplete: true,
    });
    prismaMock.orders.findMany
      .mockResolvedValueOnce([{ payment: { sellerAmount: 90 } }])
      .mockResolvedValueOnce([{ payment: { sellerAmount: 90 }, createdAt: new Date() }]);
    prismaMock.payouts.findMany.mockResolvedValueOnce([]);
    prismaMock.payouts.findFirst.mockResolvedValueOnce(null);

    const res = await request(app).get('/order/api/seller/earnings');

    expect(res.status).toBe(200);
    expect(res.body.totalEarnings).toBe(90);
  });
});

describe('GET /order/api/seller/payouts', () => {
  it('should return seller payout history', async () => {
    asSeller();
    prismaMock.payouts.findMany.mockResolvedValueOnce([{ id: 'p1', amount: 50 }]);
    prismaMock.payouts.count.mockResolvedValueOnce(1);

    const res = await request(app).get('/order/api/seller/payouts');

    expect(res.status).toBe(200);
    expect(res.body.payouts).toHaveLength(1);
  });
});

describe('POST /order/api/seller/payouts/request', () => {
  it('should process payout request', async () => {
    asSeller();
    prismaMock.sellers.findUnique.mockResolvedValueOnce({
      id: 'seller-1',
      stripeId: 'acct_1',
      stripeOnboardingComplete: true,
      shop: { id: 'shop-1' },
    });
    prismaMock.orders.findMany.mockResolvedValueOnce([
      { payment: { sellerAmount: 500 } },
    ]);
    prismaMock.payouts.findMany.mockResolvedValueOnce([]);
    prismaMock.payouts.create.mockResolvedValueOnce({ id: 'payout-1' });

    const res = await request(app)
      .post('/order/api/seller/payouts/request')
      .send({ amount: 100 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 below minimum payout', async () => {
    asSeller();
    prismaMock.sellers.findUnique.mockResolvedValueOnce({
      id: 'seller-1',
      stripeId: 'acct_1',
      stripeOnboardingComplete: true,
      shop: { id: 'shop-1' },
    });
    prismaMock.orders.findMany.mockResolvedValueOnce([
      { payment: { sellerAmount: 100 } },
    ]);
    prismaMock.payouts.findMany.mockResolvedValueOnce([]);

    const res = await request(app)
      .post('/order/api/seller/payouts/request')
      .send({ amount: 5 });

    expect(res.status).toBe(400);
  });
});
