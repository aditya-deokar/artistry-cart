/**
 * Unit Tests for Order Controller
 *
 * Tests for payment flows, order CRUD, cancellation, refunds,
 * seller earnings/payouts, and webhook handlers.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  prismaMock,
  resetPrismaMock,
  redisMock,
  resetRedisMock,
  setRedisKey,
  stripeMethodMocks,
  resetStripeMock,
  mockRequest,
  mockResponse,
  mockNext,
  createMockUser,
  createMockOrder,
  createMockPayment,
  createMockShop,
  createMockSeller,
  createMockPayout,
  createMockRefund,
  createMockOrderItem,
  resetFactoryCounter,
} from '../../../../packages/test-utils';

// ── Module-level mocks ──
vi.mock('stripe', () => {
  // StripeMockConstructor is already loaded by the time tests run.
  // We need a function that works as `new Stripe(...)`.
  const ctor = function (..._args: any[]) {
    return stripeMethodMocks;
  } as any;
  return { default: ctor };
});

vi.mock('ioredis', () => {
  return { default: function (..._args: any[]) { return redisMock; } };
});

vi.mock('../../../../packages/libs/prisma', () => ({
  default: prismaMock,
}));

vi.mock('../utils/send-email', () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

vi.mock('crypto', async (importOriginal) => {
  const actual = await importOriginal<typeof import('crypto')>();
  return {
    ...actual,
    randomUUID: vi.fn().mockReturnValue('mock-session-uuid'),
  };
});

// ── Import the controller AFTER mocks ──
import {
  createPaymentIntent,
  createPaymentSession,
  verifyingPaymentSession,
  createOrder,
  verifySessionAndCreateIntent,
  getUserOrders,
  getOrderDetails,
  getPaymentStatus,
  cancelOrder,
  requestRefund,
  handlePaymentFailed,
  handleChargeRefunded,
  handleAccountUpdated,
  handleTransferCreated,
  getSellerEarnings,
  getSellerPayouts,
  requestSellerPayout,
} from '../controllers/order.controller';

import { sendEmail } from '../utils/send-email';

// ─── Setup / Teardown ──────────────────────────────────────────────────

beforeEach(() => {
  resetPrismaMock();
  resetRedisMock();
  resetStripeMock();
  resetFactoryCounter();
  vi.mocked(sendEmail).mockClear();
  // Restore default stripe mock resolved values
  stripeMethodMocks.paymentIntents.create.mockResolvedValue({
    id: 'pi_test_123',
    client_secret: 'pi_test_123_secret',
    amount: 5000,
    currency: 'usd',
    status: 'requires_payment_method',
  });
  stripeMethodMocks.paymentIntents.retrieve.mockResolvedValue({
    id: 'pi_test_123',
    amount: 5000,
    currency: 'usd',
    status: 'succeeded',
    metadata: { sessionId: 'sess-1', userId: 'user-1' },
  });
  stripeMethodMocks.refunds.create.mockResolvedValue({
    id: 're_test_123',
    amount: 5000,
    status: 'succeeded',
  });
  stripeMethodMocks.transfers.create.mockResolvedValue({
    id: 'tr_test_123',
    amount: 4500,
    destination: 'acct_test_123',
  });
  stripeMethodMocks.webhooks.constructEvent.mockReturnValue({
    id: 'evt_test_123',
    type: 'payment_intent.succeeded',
    data: { object: { id: 'pi_test_123' } },
  });
});

// ═══════════════════════════════════════════════════════════════════════
// createPaymentIntent
// ═══════════════════════════════════════════════════════════════════════

describe('createPaymentIntent', () => {
  it('should create a payment intent with platform fee', async () => {
    const req = mockRequest({
      body: { amount: 100, sellerStripeAccountId: 'acct_seller', sessionId: 'sess-1' },
      user: { id: 'user-1' },
    });
    const res = mockResponse();
    const next = mockNext();

    await createPaymentIntent(req, res, next);

    expect(stripeMethodMocks.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 10000, // 100 * 100
        currency: 'usd',
        payment_method_types: ['card'],
        application_fee_amount: 1000, // 10%
        transfer_data: { destination: 'acct_seller' },
        metadata: expect.objectContaining({ sessionId: 'sess-1', userId: 'user-1' }),
      }),
    );
    expect(res.send).toHaveBeenCalledWith({ clientSecret: 'pi_test_123_secret' });
  });

  it('should pass stripe errors to next()', async () => {
    stripeMethodMocks.paymentIntents.create.mockRejectedValueOnce(new Error('Stripe fail'));
    const req = mockRequest({
      body: { amount: 50, sellerStripeAccountId: 'acct_1', sessionId: 's-1' },
      user: { id: 'u-1' },
    });
    const res = mockResponse();
    const next = mockNext();

    await createPaymentIntent(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ═══════════════════════════════════════════════════════════════════════
// createPaymentSession
// ═══════════════════════════════════════════════════════════════════════

describe('createPaymentSession', () => {
  const cart = [
    { id: 'p1', quantity: 2, sale_price: 50, shopId: 'shop-1', selectedoptions: {} },
  ];
  const validBody = { cart, selectedAddressId: 'addr-1', coupon: null };

  it('should create a session in Redis and return sessionId', async () => {
    prismaMock.shops.findMany.mockResolvedValueOnce([
      { id: 'shop-1', sellerId: 'seller-1', sellers: { stripeId: 'acct_s1' } },
    ]);

    const req = mockRequest({ body: validBody, user: { id: 'user-1' } });
    const res = mockResponse();
    const next = mockNext();

    await createPaymentSession(req, res, next);

    expect(redisMock.setex).toHaveBeenCalledWith(
      expect.stringContaining('payment-session:'),
      600,
      expect.any(String),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ sessionId: expect.any(String) });
  });

  it('should return ValidationError when cart is empty', async () => {
    const req = mockRequest({ body: { cart: [] }, user: { id: 'user-1' } });
    const res = mockResponse();
    const next = mockNext();

    await createPaymentSession(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Cart') }));
  });

  it('should return ValidationError when cart is missing', async () => {
    const req = mockRequest({ body: {}, user: { id: 'user-1' } });
    const res = mockResponse();
    const next = mockNext();

    await createPaymentSession(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return existing session if cart matches', async () => {
    // Seed redis with existing session
    const existingData = JSON.stringify({
      userId: 'user-1',
      cart: [{ id: 'p1', quantity: 2, sale_price: 50, shopId: 'shop-1', selectedoptions: {} }],
      sellers: [],
      totalAmount: 100,
      shippingAddressId: null,
      coupon: null,
    });
    setRedisKey('payment-session:existing-id', existingData);

    const req = mockRequest({ body: validBody, user: { id: 'user-1' } });
    const res = mockResponse();
    const next = mockNext();

    await createPaymentSession(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ sessionId: 'existing-id' });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// verifyingPaymentSession
// ═══════════════════════════════════════════════════════════════════════

describe('verifyingPaymentSession', () => {
  it('should return session data if found in Redis', async () => {
    const sessionData = { userId: 'u1', cart: [{ id: 'p1' }], totalAmount: 100 };
    setRedisKey('payment-session:sess-1', JSON.stringify(sessionData));

    const req = mockRequest({ query: { sessionId: 'sess-1' } });
    const res = mockResponse();
    const next = mockNext();

    await verifyingPaymentSession(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, session: sessionData });
  });

  it('should return 400 when sessionId is missing', async () => {
    const req = mockRequest({ query: {} });
    const res = mockResponse();
    const next = mockNext();

    await verifyingPaymentSession(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 404 when session is expired/missing', async () => {
    const req = mockRequest({ query: { sessionId: 'nonexistent' } });
    const res = mockResponse();
    const next = mockNext();

    await verifyingPaymentSession(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// verifySessionAndCreateIntent
// ═══════════════════════════════════════════════════════════════════════

describe('verifySessionAndCreateIntent', () => {
  it('should return clientSecret and session on success', async () => {
    const session = {
      totalAmount: 100,
      sellers: [{ shopId: 'sh-1', sellerId: 'se-1', stripeAccountId: 'acct_real' }],
    };
    setRedisKey('payment-session:sess-1', JSON.stringify(session));

    const req = mockRequest({ query: { sessionId: 'sess-1' }, user: { id: 'user-1' } });
    const res = mockResponse();
    const next = mockNext();

    await verifySessionAndCreateIntent(req, res, next);

    expect(stripeMethodMocks.paymentIntents.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        clientSecret: 'pi_test_123_secret',
        session,
      }),
    );
  });

  it('should return 400 when sessionId is missing', async () => {
    const req = mockRequest({ query: {}, user: { id: 'u1' } });
    const res = mockResponse();
    const next = mockNext();

    await verifySessionAndCreateIntent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 404 when session not found', async () => {
    const req = mockRequest({ query: { sessionId: 'expired' }, user: { id: 'u1' } });
    const res = mockResponse();
    const next = mockNext();

    await verifySessionAndCreateIntent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should return 400 when seller has no Stripe account', async () => {
    const session = {
      totalAmount: 100,
      sellers: [{ shopId: 'sh-1', sellerId: 'se-1', stripeAccountId: null }],
    };
    setRedisKey('payment-session:sess-2', JSON.stringify(session));

    const req = mockRequest({ query: { sessionId: 'sess-2' }, user: { id: 'u1' } });
    const res = mockResponse();
    const next = mockNext();

    await verifySessionAndCreateIntent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should skip transfer_data for test seed accounts', async () => {
    const session = {
      totalAmount: 50,
      sellers: [{ shopId: 'sh-1', sellerId: 'se-1', stripeAccountId: 'acct_test_seed' }],
    };
    setRedisKey('payment-session:sess-3', JSON.stringify(session));

    const req = mockRequest({ query: { sessionId: 'sess-3' }, user: { id: 'u1' } });
    const res = mockResponse();
    const next = mockNext();

    await verifySessionAndCreateIntent(req, res, next);

    const callArgs = stripeMethodMocks.paymentIntents.create.mock.calls[0][0];
    expect(callArgs.transfer_data).toBeUndefined();
    expect(callArgs.application_fee_amount).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════
// createOrder (webhook handler)
// ═══════════════════════════════════════════════════════════════════════

describe('createOrder', () => {
  const paymentIntent = {
    id: 'pi_test_123',
    metadata: { sessionId: 'sess-1', userId: 'user-1' },
    latest_charge: 'ch_test_1',
    currency: 'usd',
    payment_method_types: ['card'],
  };

  beforeEach(() => {
    stripeMethodMocks.webhooks.constructEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: { object: paymentIntent },
    });
  });

  it('should return 400 when stripe-signature is missing', async () => {
    const req = mockRequest({ headers: {} });
    const res = mockResponse();
    const next = mockNext();

    await createOrder(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Missing Stripe Signature');
  });

  it('should create order, update analytics, send email and notifications', async () => {
    const sessionData = {
      cart: [{ id: 'p1', quantity: 2, sale_price: 50, shopId: 'shop-1', title: 'Art Piece' }],
      totalAmount: 100,
      shippingAddressId: 'addr-1',
      coupon: null,
    };
    setRedisKey('payment-session:sess-1', JSON.stringify(sessionData));

    const user = createMockUser({ id: 'user-1', name: 'Test', email: 'test@e.com' });
    prismaMock.users.findUnique.mockResolvedValueOnce(user);
    prismaMock.orders.create.mockResolvedValueOnce(createMockOrder({ id: 'order-1' }));
    prismaMock.products.update.mockResolvedValue({});
    prismaMock.productAnalytics.upsert.mockResolvedValue({});
    prismaMock.userAnalytics.findUnique.mockResolvedValueOnce(null);
    prismaMock.userAnalytics.create.mockResolvedValue({});
    prismaMock.shops.findMany.mockResolvedValueOnce([
      { id: 'shop-1', sellerId: 'seller-1', name: 'Art Shop' },
    ]);
    prismaMock.notification.create.mockResolvedValue({});

    const req = mockRequest({
      headers: { 'stripe-signature': 'sig_test' },
      rawBody: Buffer.from('raw'),
    });
    const res = mockResponse();
    const next = mockNext();

    await createOrder(req, res, next);

    expect(prismaMock.orders.create).toHaveBeenCalled();
    expect(prismaMock.products.update).toHaveBeenCalled();
    expect(prismaMock.productAnalytics.upsert).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledWith(
      'test@e.com',
      expect.stringContaining('Order Confirmation'),
      'order-confirmation',
      expect.any(Object),
    );
    expect(prismaMock.notification.create).toHaveBeenCalled();
    expect(redisMock.del).toHaveBeenCalledWith('payment-session:sess-1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });

  it('should return 200 with skip message when session data missing', async () => {
    // No redis data seeded
    const req = mockRequest({
      headers: { 'stripe-signature': 'sig_test' },
      rawBody: Buffer.from('raw'),
    });
    const res = mockResponse();
    const next = mockNext();

    await createOrder(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(expect.stringContaining('Skipping'));
  });

  it('should apply coupon discount when applicable', async () => {
    const sessionData = {
      cart: [{ id: 'p1', quantity: 1, sale_price: 100, shopId: 'shop-1', title: 'Item' }],
      totalAmount: 100,
      shippingAddressId: null,
      coupon: { discountedProductId: 'p1', discountPercent: 20, discountAmount: 0, code: 'SAVE20' },
    };
    setRedisKey('payment-session:sess-1', JSON.stringify(sessionData));

    prismaMock.users.findUnique.mockResolvedValueOnce(createMockUser({ id: 'user-1' }));
    prismaMock.orders.create.mockResolvedValueOnce(createMockOrder());
    prismaMock.products.update.mockResolvedValue({});
    prismaMock.productAnalytics.upsert.mockResolvedValue({});
    prismaMock.userAnalytics.findUnique.mockResolvedValueOnce(null);
    prismaMock.userAnalytics.create.mockResolvedValue({});
    prismaMock.shops.findMany.mockResolvedValueOnce([]);
    prismaMock.notification.create.mockResolvedValue({});

    const req = mockRequest({
      headers: { 'stripe-signature': 'sig_test' },
      rawBody: Buffer.from('raw'),
    });
    const res = mockResponse();
    const next = mockNext();

    await createOrder(req, res, next);

    // Verify order was created with discounted amount
    const createArgs = prismaMock.orders.create.mock.calls[0][0];
    expect(createArgs.data.totalAmount).toBe(80); // 100 - 20%
    expect(createArgs.data.couponCode).toBe('SAVE20');
  });

  it('should update existing user analytics instead of creating new', async () => {
    const sessionData = {
      cart: [{ id: 'p1', quantity: 1, sale_price: 50, shopId: 'shop-1', title: 'X' }],
      totalAmount: 50,
      shippingAddressId: null,
      coupon: null,
    };
    setRedisKey('payment-session:sess-1', JSON.stringify(sessionData));

    prismaMock.users.findUnique.mockResolvedValueOnce(
      createMockUser({ id: 'user-1' }),
    );
    prismaMock.orders.create.mockResolvedValueOnce(createMockOrder());
    prismaMock.products.update.mockResolvedValue({});
    prismaMock.productAnalytics.upsert.mockResolvedValue({});
    prismaMock.userAnalytics.findUnique.mockResolvedValueOnce({
      userId: 'user-1',
      actions: [{ productId: 'old', action: 'view' }],
    });
    prismaMock.userAnalytics.update.mockResolvedValue({});
    prismaMock.shops.findMany.mockResolvedValueOnce([]);
    prismaMock.notification.create.mockResolvedValue({});

    const req = mockRequest({
      headers: { 'stripe-signature': 'sig_test' },
      rawBody: Buffer.from('raw'),
    });
    const res = mockResponse();
    const next = mockNext();

    await createOrder(req, res, next);

    expect(prismaMock.userAnalytics.update).toHaveBeenCalled();
    expect(prismaMock.userAnalytics.create).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════
// getUserOrders
// ═══════════════════════════════════════════════════════════════════════

describe('getUserOrders', () => {
  it('should return paginated orders', async () => {
    const orders = [createMockOrder(), createMockOrder()];
    prismaMock.orders.findMany.mockResolvedValueOnce(orders);
    prismaMock.orders.count.mockResolvedValueOnce(2);

    const req = mockRequest({ user: { id: 'user-1' }, query: { page: '1', limit: '10' } });
    const res = mockResponse();
    const next = mockNext();

    await getUserOrders(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ orders, total: 2, page: 1, totalPages: 1 }),
    );
  });

  it('should filter by status when provided', async () => {
    prismaMock.orders.findMany.mockResolvedValueOnce([]);
    prismaMock.orders.count.mockResolvedValueOnce(0);

    const req = mockRequest({ user: { id: 'user-1' }, query: { status: 'paid' } });
    const res = mockResponse();
    const next = mockNext();

    await getUserOrders(req, res, next);

    const findArgs = prismaMock.orders.findMany.mock.calls[0][0];
    expect(findArgs.where.status).toBe('PAID');
  });

  it('should not add status filter when status is "all"', async () => {
    prismaMock.orders.findMany.mockResolvedValueOnce([]);
    prismaMock.orders.count.mockResolvedValueOnce(0);

    const req = mockRequest({ user: { id: 'user-1' }, query: { status: 'all' } });
    const res = mockResponse();
    const next = mockNext();

    await getUserOrders(req, res, next);

    const findArgs = prismaMock.orders.findMany.mock.calls[0][0];
    expect(findArgs.where.status).toBeUndefined();
  });

  it('should pass errors to next()', async () => {
    prismaMock.orders.findMany.mockRejectedValueOnce(new Error('DB error'));

    const req = mockRequest({ user: { id: 'user-1' }, query: {} });
    const res = mockResponse();
    const next = mockNext();

    await getUserOrders(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ═══════════════════════════════════════════════════════════════════════
// getOrderDetails
// ═══════════════════════════════════════════════════════════════════════

describe('getOrderDetails', () => {
  it('should return order when found', async () => {
    const order = createMockOrder({ id: 'ord-1', userId: 'user-1' });
    prismaMock.orders.findFirst.mockResolvedValueOnce(order);

    const req = mockRequest({ params: { orderId: 'ord-1' }, user: { id: 'user-1' } });
    const res = mockResponse();
    const next = mockNext();

    await getOrderDetails(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ order });
  });

  it('should return 404 when order not found', async () => {
    prismaMock.orders.findFirst.mockResolvedValueOnce(null);

    const req = mockRequest({ params: { orderId: 'nope' }, user: { id: 'user-1' } });
    const res = mockResponse();
    const next = mockNext();

    await getOrderDetails(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should only find orders belonging to the requesting user', async () => {
    prismaMock.orders.findFirst.mockResolvedValueOnce(null);

    const req = mockRequest({ params: { orderId: 'ord-1' }, user: { id: 'other-user' } });
    const res = mockResponse();
    const next = mockNext();

    await getOrderDetails(req, res, next);

    const findArgs = prismaMock.orders.findFirst.mock.calls[0][0];
    expect(findArgs.where.userId).toBe('other-user');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// getPaymentStatus
// ═══════════════════════════════════════════════════════════════════════

describe('getPaymentStatus', () => {
  it('should return payment status with order', async () => {
    const mockPayment = createMockPayment({
      stripePaymentIntent: 'pi_test_123',
      order: createMockOrder(),
    });
    prismaMock.payments.findUnique.mockResolvedValueOnce(mockPayment);

    const req = mockRequest({ query: { payment_intent: 'pi_test_123' } });
    const res = mockResponse();
    const next = mockNext();

    await getPaymentStatus(req, res, next);

    expect(stripeMethodMocks.paymentIntents.retrieve).toHaveBeenCalledWith('pi_test_123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'succeeded', amount: 50, currency: 'usd' }),
    );
  });

  it('should return 400 when payment_intent is missing', async () => {
    const req = mockRequest({ query: {} });
    const res = mockResponse();
    const next = mockNext();

    await getPaymentStatus(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// cancelOrder
// ═══════════════════════════════════════════════════════════════════════

describe('cancelOrder', () => {
  it('should cancel order and process refund when payment succeeded', async () => {
    const payment = createMockPayment({ id: 'pay-1', status: 'SUCCEEDED', stripePaymentIntent: 'pi_1', amount: 100 });
    const order = createMockOrder({ id: 'ord-1', userId: 'user-1', status: 'PAID', payment });
    prismaMock.orders.findFirst.mockResolvedValueOnce(order);
    prismaMock.refunds.create.mockResolvedValueOnce(createMockRefund());
    prismaMock.payments.update.mockResolvedValueOnce({});
    prismaMock.orders.update.mockResolvedValueOnce({});
    prismaMock.orderItem.findMany.mockResolvedValueOnce([
      createMockOrderItem({ productId: 'p1', quantity: 2 }),
    ]);
    prismaMock.products.update.mockResolvedValue({});

    const req = mockRequest({
      params: { orderId: 'ord-1' },
      user: { id: 'user-1' },
      body: { reason: 'Changed my mind' },
    });
    const res = mockResponse();
    const next = mockNext();

    await cancelOrder(req, res, next);

    expect(stripeMethodMocks.refunds.create).toHaveBeenCalledWith(
      expect.objectContaining({ payment_intent: 'pi_1', reason: 'requested_by_customer' }),
    );
    expect(prismaMock.refunds.create).toHaveBeenCalled();
    expect(prismaMock.orders.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: 'CANCELLED', deliveryStatus: 'Cancelled' },
      }),
    );
    // Stock restored
    expect(prismaMock.products.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { stock: { increment: 2 }, totalSales: { decrement: 2 } },
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: expect.stringContaining('cancelled') });
  });

  it('should return 404 when order not found', async () => {
    prismaMock.orders.findFirst.mockResolvedValueOnce(null);

    const req = mockRequest({ params: { orderId: 'nope' }, user: { id: 'u1' }, body: {} });
    const res = mockResponse();
    const next = mockNext();

    await cancelOrder(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should return 400 when order status is DELIVERED', async () => {
    const order = createMockOrder({ id: 'ord-1', userId: 'u1', status: 'DELIVERED' });
    prismaMock.orders.findFirst.mockResolvedValueOnce(order);

    const req = mockRequest({ params: { orderId: 'ord-1' }, user: { id: 'u1' }, body: {} });
    const res = mockResponse();
    const next = mockNext();

    await cancelOrder(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should cancel PENDING order without refund when no payment', async () => {
    const order = createMockOrder({ id: 'ord-1', userId: 'u1', status: 'PENDING', payment: null });
    prismaMock.orders.findFirst.mockResolvedValueOnce(order);
    prismaMock.orders.update.mockResolvedValueOnce({});
    prismaMock.orderItem.findMany.mockResolvedValueOnce([]);

    const req = mockRequest({ params: { orderId: 'ord-1' }, user: { id: 'u1' }, body: {} });
    const res = mockResponse();
    const next = mockNext();

    await cancelOrder(req, res, next);

    expect(stripeMethodMocks.refunds.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return 500 when stripe refund fails', async () => {
    const payment = createMockPayment({ status: 'SUCCEEDED', stripePaymentIntent: 'pi_1' });
    const order = createMockOrder({ id: 'ord-1', userId: 'u1', status: 'PAID', payment });
    prismaMock.orders.findFirst.mockResolvedValueOnce(order);
    stripeMethodMocks.refunds.create.mockRejectedValueOnce(new Error('Stripe down'));

    const req = mockRequest({ params: { orderId: 'ord-1' }, user: { id: 'u1' }, body: {} });
    const res = mockResponse();
    const next = mockNext();

    await cancelOrder(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// requestRefund
// ═══════════════════════════════════════════════════════════════════════

describe('requestRefund', () => {
  it('should create full refund when no itemIds specified', async () => {
    const payment = createMockPayment({ id: 'pay-1', amount: 200, stripePaymentIntent: 'pi_1' });
    const order = createMockOrder({
      id: 'ord-1',
      userId: 'u1',
      payment,
      items: [createMockOrderItem()],
    });
    prismaMock.orders.findFirst.mockResolvedValueOnce(order);
    prismaMock.refunds.create.mockResolvedValueOnce(createMockRefund());
    prismaMock.payments.update.mockResolvedValueOnce({});
    prismaMock.orders.update.mockResolvedValueOnce({});

    const req = mockRequest({ body: { orderId: 'ord-1' }, user: { id: 'u1' } });
    const res = mockResponse();
    const next = mockNext();

    await requestRefund(req, res, next);

    expect(stripeMethodMocks.refunds.create).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_intent: 'pi_1',
        amount: 20000, // 200 * 100
        reason: 'requested_by_customer',
      }),
    );
    expect(prismaMock.payments.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'REFUNDED' } }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('should create partial refund when itemIds are provided', async () => {
    const items = [
      createMockOrderItem({ id: 'item-1', price: 50, quantity: 1 }),
      createMockOrderItem({ id: 'item-2', price: 30, quantity: 2 }),
    ];
    const payment = createMockPayment({ id: 'pay-1', amount: 110, stripePaymentIntent: 'pi_1' });
    const order = createMockOrder({ id: 'ord-1', userId: 'u1', payment, items });
    prismaMock.orders.findFirst.mockResolvedValueOnce(order);
    prismaMock.refunds.create.mockResolvedValueOnce(createMockRefund());
    prismaMock.payments.update.mockResolvedValueOnce({});
    prismaMock.orders.update.mockResolvedValueOnce({});

    const req = mockRequest({
      body: { orderId: 'ord-1', itemIds: ['item-1'], reason: 'Damaged' },
      user: { id: 'u1' },
    });
    const res = mockResponse();
    const next = mockNext();

    await requestRefund(req, res, next);

    expect(stripeMethodMocks.refunds.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 5000 }), // 50 * 1 * 100
    );
    expect(prismaMock.payments.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'PARTIALLY_REFUNDED' } }),
    );
  });

  it('should return 404 when order not found', async () => {
    prismaMock.orders.findFirst.mockResolvedValueOnce(null);

    const req = mockRequest({ body: { orderId: 'nope' }, user: { id: 'u1' } });
    const res = mockResponse();
    const next = mockNext();

    await requestRefund(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should return 400 when no payment exists', async () => {
    const order = createMockOrder({ id: 'ord-1', userId: 'u1', payment: null, items: [] });
    prismaMock.orders.findFirst.mockResolvedValueOnce(order);

    const req = mockRequest({ body: { orderId: 'ord-1' }, user: { id: 'u1' } });
    const res = mockResponse();
    const next = mockNext();

    await requestRefund(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Webhook handlers
// ═══════════════════════════════════════════════════════════════════════

describe('handlePaymentFailed', () => {
  it('should update existing payment record to FAILED', async () => {
    const existingPayment = createMockPayment({ id: 'pay-1' });
    prismaMock.payments.findUnique.mockResolvedValueOnce(existingPayment);
    prismaMock.payments.update.mockResolvedValueOnce({});
    prismaMock.users.findUnique.mockResolvedValueOnce(createMockUser({ id: 'user-1' }));
    prismaMock.notification.create.mockResolvedValueOnce({});

    await handlePaymentFailed({
      id: 'pi_test',
      metadata: { sessionId: 'sess-1', userId: 'user-1' },
      last_payment_error: { message: 'Card declined' },
    } as any);

    expect(prismaMock.payments.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'FAILED' }) }),
    );
    expect(prismaMock.notification.create).toHaveBeenCalled();
  });

  it('should handle missing metadata gracefully', async () => {
    await handlePaymentFailed({ id: 'pi_test', metadata: {} } as any);

    expect(prismaMock.payments.findUnique).not.toHaveBeenCalled();
  });
});

describe('handleChargeRefunded', () => {
  it('should create refund record and update payment status for full refund', async () => {
    const payment = createMockPayment({
      id: 'pay-1',
      order: createMockOrder({ id: 'ord-1', userId: 'u1' }),
    });
    prismaMock.payments.findUnique.mockResolvedValueOnce(payment);
    prismaMock.refunds.findUnique.mockResolvedValueOnce(null);
    prismaMock.refunds.create.mockResolvedValueOnce({});
    prismaMock.payments.update.mockResolvedValueOnce({});
    prismaMock.orders.update.mockResolvedValueOnce({});

    await handleChargeRefunded({
      payment_intent: 'pi_test',
      amount_refunded: 5000,
      amount: 5000,
      refunds: { data: [{ id: 're_1' }] },
      id: 'ch_1',
    } as any);

    expect(prismaMock.refunds.create).toHaveBeenCalled();
    expect(prismaMock.payments.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'REFUNDED' } }),
    );
  });

  it('should set PARTIALLY_REFUNDED for partial refund', async () => {
    const payment = createMockPayment({
      id: 'pay-1',
      order: createMockOrder({ id: 'ord-1', userId: 'u1' }),
    });
    prismaMock.payments.findUnique.mockResolvedValueOnce(payment);
    prismaMock.refunds.findUnique.mockResolvedValueOnce(null);
    prismaMock.refunds.create.mockResolvedValueOnce({});
    prismaMock.payments.update.mockResolvedValueOnce({});
    prismaMock.orders.update.mockResolvedValueOnce({});

    await handleChargeRefunded({
      payment_intent: 'pi_test',
      amount_refunded: 2000,
      amount: 5000,
      refunds: { data: [{ id: 're_partial' }] },
      id: 'ch_2',
    } as any);

    expect(prismaMock.payments.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'PARTIALLY_REFUNDED' } }),
    );
  });

  it('should return early when no payment_intent', async () => {
    await handleChargeRefunded({ payment_intent: null, id: 'ch_1' } as any);

    expect(prismaMock.payments.findUnique).not.toHaveBeenCalled();
  });

  it('should skip duplicate refund records', async () => {
    const payment = createMockPayment({ id: 'pay-1', order: createMockOrder() });
    prismaMock.payments.findUnique.mockResolvedValueOnce(payment);
    prismaMock.refunds.findUnique.mockResolvedValueOnce(createMockRefund()); // already exists
    prismaMock.payments.update.mockResolvedValueOnce({});
    prismaMock.orders.update.mockResolvedValueOnce({});

    await handleChargeRefunded({
      payment_intent: 'pi_test',
      amount_refunded: 5000,
      amount: 5000,
      refunds: { data: [{ id: 're_existing' }] },
      id: 'ch_3',
    } as any);

    expect(prismaMock.refunds.create).not.toHaveBeenCalled();
  });
});

describe('handleAccountUpdated', () => {
  it('should update seller onboarding status to complete', async () => {
    const seller = createMockSeller({ id: 'seller-1' });
    prismaMock.sellers.findFirst.mockResolvedValueOnce(seller);
    prismaMock.sellers.update.mockResolvedValueOnce({});

    await handleAccountUpdated({
      id: 'acct_1',
      charges_enabled: true,
      payouts_enabled: true,
    } as any);

    expect(prismaMock.sellers.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { stripeOnboardingComplete: true } }),
    );
  });

  it('should set onboarding to false when not fully enabled', async () => {
    const seller = createMockSeller({ id: 'seller-1' });
    prismaMock.sellers.findFirst.mockResolvedValueOnce(seller);
    prismaMock.sellers.update.mockResolvedValueOnce({});

    await handleAccountUpdated({
      id: 'acct_1',
      charges_enabled: true,
      payouts_enabled: false,
    } as any);

    expect(prismaMock.sellers.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { stripeOnboardingComplete: false } }),
    );
  });

  it('should skip when seller not found', async () => {
    prismaMock.sellers.findFirst.mockResolvedValueOnce(null);

    await handleAccountUpdated({ id: 'acct_unknown' } as any);

    expect(prismaMock.sellers.update).not.toHaveBeenCalled();
  });
});

describe('handleTransferCreated', () => {
  it('should create payout record', async () => {
    prismaMock.payouts.findUnique.mockResolvedValueOnce(null);
    prismaMock.payouts.create.mockResolvedValueOnce({});

    await handleTransferCreated({
      id: 'tr_1',
      metadata: { sellerId: 'seller-1' },
      amount: 4500,
      currency: 'usd',
    } as any);

    expect(prismaMock.payouts.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sellerId: 'seller-1',
          stripeTransferId: 'tr_1',
          amount: 45, // 4500 / 100
          status: 'COMPLETED',
        }),
      }),
    );
  });

  it('should skip when payout already exists', async () => {
    prismaMock.payouts.findUnique.mockResolvedValueOnce(createMockPayout());

    await handleTransferCreated({
      id: 'tr_existing',
      metadata: { sellerId: 'seller-1' },
      amount: 4500,
      currency: 'usd',
    } as any);

    expect(prismaMock.payouts.create).not.toHaveBeenCalled();
  });

  it('should return early when no sellerId in metadata', async () => {
    await handleTransferCreated({ id: 'tr_1', metadata: {} } as any);

    expect(prismaMock.payouts.findUnique).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Seller Earnings & Payouts
// ═══════════════════════════════════════════════════════════════════════

describe('getSellerEarnings', () => {
  it('should return earnings summary', async () => {
    const seller = createMockSeller({
      id: 'seller-1',
      shop: createMockShop({ id: 'shop-1' }),
      stripeOnboardingComplete: true,
    });
    prismaMock.sellers.findUnique.mockResolvedValueOnce(seller);

    const orders = [
      createMockOrder({ payment: createMockPayment({ sellerAmount: 90 }) }),
      createMockOrder({ payment: createMockPayment({ sellerAmount: 180 }) }),
    ];
    prismaMock.orders.findMany
      .mockResolvedValueOnce(orders) // first call — earnings
      .mockResolvedValueOnce(orders); // second call — recent orders (earningsByMonth)

    prismaMock.payouts.findMany.mockResolvedValueOnce([
      createMockPayout({ amount: 50 }),
    ]);
    prismaMock.payouts.findFirst.mockResolvedValueOnce(createMockPayout({ amount: 50 }));

    const req = mockRequest({ user: { id: 'seller-1' } });
    const res = mockResponse();
    const next = mockNext();

    await getSellerEarnings(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        totalEarnings: 270,
        pendingPayout: 220,
        totalPaidOut: 50,
        stripeOnboardingComplete: true,
      }),
    );
  });

  it('should return 404 when seller has no shop', async () => {
    prismaMock.sellers.findUnique.mockResolvedValueOnce(
      createMockSeller({ shop: null }),
    );

    const req = mockRequest({ user: { id: 'seller-1' } });
    const res = mockResponse();
    const next = mockNext();

    await getSellerEarnings(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('getSellerPayouts', () => {
  it('should return paginated payouts', async () => {
    const payouts = [createMockPayout(), createMockPayout()];
    prismaMock.payouts.findMany.mockResolvedValueOnce(payouts);
    prismaMock.payouts.count.mockResolvedValueOnce(2);

    const req = mockRequest({ user: { id: 'seller-1' }, query: { page: '1', limit: '10' } });
    const res = mockResponse();
    const next = mockNext();

    await getSellerPayouts(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ payouts, total: 2, page: 1 }),
    );
  });
});

describe('requestSellerPayout', () => {
  it('should create Stripe transfer and payout record', async () => {
    const seller = createMockSeller({
      id: 'seller-1',
      stripeId: 'acct_connected',
      stripeOnboardingComplete: true,
      shop: createMockShop({ id: 'shop-1' }),
    });
    prismaMock.sellers.findUnique.mockResolvedValueOnce(seller);
    prismaMock.orders.findMany.mockResolvedValueOnce([
      createMockOrder({ payment: createMockPayment({ sellerAmount: 500 }) }),
    ]);
    prismaMock.payouts.findMany.mockResolvedValueOnce([]);
    prismaMock.payouts.create.mockResolvedValueOnce(createMockPayout({ id: 'payout-1' }));

    const req = mockRequest({ user: { id: 'seller-1' }, body: { amount: 100 } });
    const res = mockResponse();
    const next = mockNext();

    await requestSellerPayout(req, res, next);

    expect(stripeMethodMocks.transfers.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 10000, // 100 * 100
        currency: 'usd',
        destination: 'acct_connected',
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('should return 404 when seller not found', async () => {
    prismaMock.sellers.findUnique.mockResolvedValueOnce(null);

    const req = mockRequest({ user: { id: 'x' }, body: {} });
    const res = mockResponse();
    const next = mockNext();

    await requestSellerPayout(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should return 400 when no Stripe account', async () => {
    prismaMock.sellers.findUnique.mockResolvedValueOnce(
      createMockSeller({ stripeId: null }),
    );

    const req = mockRequest({ user: { id: 'x' }, body: {} });
    const res = mockResponse();
    const next = mockNext();

    await requestSellerPayout(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 400 when onboarding incomplete', async () => {
    prismaMock.sellers.findUnique.mockResolvedValueOnce(
      createMockSeller({ stripeId: 'acct_1', stripeOnboardingComplete: false }),
    );

    const req = mockRequest({ user: { id: 'x' }, body: {} });
    const res = mockResponse();
    const next = mockNext();

    await requestSellerPayout(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 400 when amount exceeds balance', async () => {
    const seller = createMockSeller({
      stripeId: 'acct_1',
      stripeOnboardingComplete: true,
      shop: createMockShop({ id: 'shop-1' }),
    });
    prismaMock.sellers.findUnique.mockResolvedValueOnce(seller);
    prismaMock.orders.findMany.mockResolvedValueOnce([
      createMockOrder({ payment: createMockPayment({ sellerAmount: 100 }) }),
    ]);
    prismaMock.payouts.findMany.mockResolvedValueOnce([]);

    const req = mockRequest({ user: { id: 'x' }, body: { amount: 200 } });
    const res = mockResponse();
    const next = mockNext();

    await requestSellerPayout(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 400 when amount below minimum $10', async () => {
    const seller = createMockSeller({
      stripeId: 'acct_1',
      stripeOnboardingComplete: true,
      shop: createMockShop({ id: 'shop-1' }),
    });
    prismaMock.sellers.findUnique.mockResolvedValueOnce(seller);
    prismaMock.orders.findMany.mockResolvedValueOnce([
      createMockOrder({ payment: createMockPayment({ sellerAmount: 100 }) }),
    ]);
    prismaMock.payouts.findMany.mockResolvedValueOnce([]);

    const req = mockRequest({ user: { id: 'x' }, body: { amount: 5 } });
    const res = mockResponse();
    const next = mockNext();

    await requestSellerPayout(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 500 when Stripe transfer fails', async () => {
    const seller = createMockSeller({
      stripeId: 'acct_1',
      stripeOnboardingComplete: true,
      shop: createMockShop({ id: 'shop-1' }),
    });
    prismaMock.sellers.findUnique.mockResolvedValueOnce(seller);
    prismaMock.orders.findMany.mockResolvedValueOnce([
      createMockOrder({ payment: createMockPayment({ sellerAmount: 100 }) }),
    ]);
    prismaMock.payouts.findMany.mockResolvedValueOnce([]);
    stripeMethodMocks.transfers.create.mockRejectedValueOnce(new Error('Stripe fail'));

    const req = mockRequest({ user: { id: 'x' }, body: { amount: 50 } });
    const res = mockResponse();
    const next = mockNext();

    await requestSellerPayout(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
