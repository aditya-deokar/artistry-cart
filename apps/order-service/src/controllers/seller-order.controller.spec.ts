/**
 * Unit Tests for Seller Order Controller
 *
 * Tests for seller order management: listing, status updates, analytics, details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  prismaMock,
  resetPrismaMock,
  mockRequest,
  mockResponse,
  mockNext,
  createMockShop,
  createMockOrder,
  resetFactoryCounter,
} from '../../../../packages/test-utils';

// ── Module mocks ──
vi.mock('../../../../packages/libs/prisma', () => ({
  default: prismaMock,
}));

import {
  getSellerOrders,
  updateOrderStatus,
  getSellerAnalytics,
  getSellerOrderDetails,
} from '../controllers/seller-order.controller';

beforeEach(() => {
  resetPrismaMock();
  resetFactoryCounter();
});

// ═══════════════════════════════════════════════════════════════════════
// getSellerOrders
// ═══════════════════════════════════════════════════════════════════════

describe('getSellerOrders', () => {
  it('should return paginated orders for seller shop', async () => {
    const shop = createMockShop({ id: 'shop-1', sellerId: 'seller-1' });
    prismaMock.shops.findUnique.mockResolvedValueOnce(shop);

    const orders = [createMockOrder(), createMockOrder()];
    prismaMock.orders.findMany.mockResolvedValueOnce(orders);
    prismaMock.orders.count.mockResolvedValueOnce(2);

    const req = mockRequest({ user: { id: 'seller-1' }, query: {} });
    const res = mockResponse();
    const next = mockNext();

    await getSellerOrders(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ orders, total: 2, page: 1, totalPages: 1 }),
    );
  });

  it('should filter by status when provided', async () => {
    const shop = createMockShop({ id: 'shop-1', sellerId: 'seller-1' });
    prismaMock.shops.findUnique.mockResolvedValueOnce(shop);
    prismaMock.orders.findMany.mockResolvedValueOnce([]);
    prismaMock.orders.count.mockResolvedValueOnce(0);

    const req = mockRequest({ user: { id: 'seller-1' }, query: { status: 'paid' } });
    const res = mockResponse();
    const next = mockNext();

    await getSellerOrders(req, res, next);

    const findArgs = prismaMock.orders.findMany.mock.calls[0][0];
    expect(findArgs.where.status).toBe('PAID');
  });

  it('should not add status filter when status is "all"', async () => {
    const shop = createMockShop({ id: 'shop-1', sellerId: 'seller-1' });
    prismaMock.shops.findUnique.mockResolvedValueOnce(shop);
    prismaMock.orders.findMany.mockResolvedValueOnce([]);
    prismaMock.orders.count.mockResolvedValueOnce(0);

    const req = mockRequest({ user: { id: 'seller-1' }, query: { status: 'all' } });
    const res = mockResponse();
    const next = mockNext();

    await getSellerOrders(req, res, next);

    const findArgs = prismaMock.orders.findMany.mock.calls[0][0];
    expect(findArgs.where.status).toBeUndefined();
  });

  it('should return 404 when seller has no shop', async () => {
    prismaMock.shops.findUnique.mockResolvedValueOnce(null);

    const req = mockRequest({ user: { id: 'seller-1' }, query: {} });
    const res = mockResponse();
    const next = mockNext();

    await getSellerOrders(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should handle pagination correctly', async () => {
    const shop = createMockShop({ id: 'shop-1', sellerId: 'seller-1' });
    prismaMock.shops.findUnique.mockResolvedValueOnce(shop);
    prismaMock.orders.findMany.mockResolvedValueOnce([createMockOrder()]);
    prismaMock.orders.count.mockResolvedValueOnce(15);

    const req = mockRequest({ user: { id: 'seller-1' }, query: { page: '2', limit: '5' } });
    const res = mockResponse();
    const next = mockNext();

    await getSellerOrders(req, res, next);

    const findArgs = prismaMock.orders.findMany.mock.calls[0][0];
    expect(findArgs.skip).toBe(5); // (2-1)*5
    expect(findArgs.take).toBe(5);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, totalPages: 3 }),
    );
  });

  it('should pass errors to next()', async () => {
    prismaMock.shops.findUnique.mockRejectedValueOnce(new Error('DB down'));

    const req = mockRequest({ user: { id: 'seller-1' }, query: {} });
    const res = mockResponse();
    const next = mockNext();

    await getSellerOrders(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ═══════════════════════════════════════════════════════════════════════
// updateOrderStatus
// ═══════════════════════════════════════════════════════════════════════

describe('updateOrderStatus', () => {
  it('should update order status and delivery status', async () => {
    const shop = createMockShop({ id: 'shop-1', sellerId: 'seller-1' });
    prismaMock.shops.findUnique.mockResolvedValueOnce(shop);
    const order = createMockOrder({ id: 'ord-1', shopId: 'shop-1' });
    prismaMock.orders.findFirst.mockResolvedValueOnce(order);
    const updatedOrder = { ...order, status: 'SHIPPED', deliveryStatus: 'Shipped' };
    prismaMock.orders.update.mockResolvedValueOnce(updatedOrder);

    const req = mockRequest({
      params: { orderId: 'ord-1' },
      body: { status: 'SHIPPED', deliveryStatus: 'Shipped' },
      user: { id: 'seller-1' },
    });
    const res = mockResponse();
    const next = mockNext();

    await updateOrderStatus(req, res, next);

    expect(prismaMock.orders.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ord-1' },
        data: { status: 'SHIPPED', deliveryStatus: 'Shipped' },
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, order: updatedOrder }),
    );
  });

  it('should update only status when deliveryStatus not provided', async () => {
    const shop = createMockShop({ id: 'shop-1', sellerId: 'seller-1' });
    prismaMock.shops.findUnique.mockResolvedValueOnce(shop);
    prismaMock.orders.findFirst.mockResolvedValueOnce(createMockOrder());
    prismaMock.orders.update.mockResolvedValueOnce({});

    const req = mockRequest({
      params: { orderId: 'ord-1' },
      body: { status: 'DELIVERED' },
      user: { id: 'seller-1' },
    });
    const res = mockResponse();
    const next = mockNext();

    await updateOrderStatus(req, res, next);

    const updateArgs = prismaMock.orders.update.mock.calls[0][0];
    expect(updateArgs.data.status).toBe('DELIVERED');
    expect(updateArgs.data.deliveryStatus).toBeUndefined();
  });

  it('should return 404 when shop not found', async () => {
    prismaMock.shops.findUnique.mockResolvedValueOnce(null);

    const req = mockRequest({
      params: { orderId: 'ord-1' },
      body: { status: 'SHIPPED' },
      user: { id: 'seller-1' },
    });
    const res = mockResponse();
    const next = mockNext();

    await updateOrderStatus(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should return 404 when order not in seller shop', async () => {
    prismaMock.shops.findUnique.mockResolvedValueOnce(createMockShop({ id: 'shop-1' }));
    prismaMock.orders.findFirst.mockResolvedValueOnce(null);

    const req = mockRequest({
      params: { orderId: 'ord-wrong' },
      body: { status: 'SHIPPED' },
      user: { id: 'seller-1' },
    });
    const res = mockResponse();
    const next = mockNext();

    await updateOrderStatus(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// getSellerAnalytics
// ═══════════════════════════════════════════════════════════════════════

describe('getSellerAnalytics', () => {
  it('should return total orders and revenue', async () => {
    const shop = createMockShop({ id: 'shop-1', sellerId: 'seller-1' });
    prismaMock.shops.findUnique.mockResolvedValueOnce(shop);
    prismaMock.orders.count.mockResolvedValueOnce(25);
    prismaMock.orders.aggregate.mockResolvedValueOnce({ _sum: { totalAmount: 5000 } });

    const req = mockRequest({ user: { id: 'seller-1' } });
    const res = mockResponse();
    const next = mockNext();

    await getSellerAnalytics(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      totalOrders: 25,
      totalRevenue: 5000,
    });
  });

  it('should return 0 revenue when no PAID orders', async () => {
    prismaMock.shops.findUnique.mockResolvedValueOnce(createMockShop());
    prismaMock.orders.count.mockResolvedValueOnce(0);
    prismaMock.orders.aggregate.mockResolvedValueOnce({ _sum: { totalAmount: null } });

    const req = mockRequest({ user: { id: 'seller-1' } });
    const res = mockResponse();
    const next = mockNext();

    await getSellerAnalytics(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ totalOrders: 0, totalRevenue: 0 });
  });

  it('should return 404 when shop not found', async () => {
    prismaMock.shops.findUnique.mockResolvedValueOnce(null);

    const req = mockRequest({ user: { id: 'seller-1' } });
    const res = mockResponse();
    const next = mockNext();

    await getSellerAnalytics(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// getSellerOrderDetails
// ═══════════════════════════════════════════════════════════════════════

describe('getSellerOrderDetails', () => {
  it('should return order with shipping address', async () => {
    const shop = createMockShop({ id: 'shop-1', sellerId: 'seller-1' });
    prismaMock.shops.findUnique.mockResolvedValueOnce(shop);
    const order = createMockOrder({ id: 'ord-1', shippingAddressId: 'addr-1' });
    prismaMock.orders.findFirst.mockResolvedValueOnce(order);
    prismaMock.addresses.findUnique.mockResolvedValueOnce({
      id: 'addr-1',
      addressLine1: '123 St',
    });

    const req = mockRequest({ params: { orderId: 'ord-1' }, user: { id: 'seller-1' } });
    const res = mockResponse();
    const next = mockNext();

    await getSellerOrderDetails(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      order: expect.objectContaining({
        shippingAddress: expect.objectContaining({ id: 'addr-1' }),
      }),
    });
  });

  it('should return order with null shipping address when not set', async () => {
    prismaMock.shops.findUnique.mockResolvedValueOnce(createMockShop());
    const order = createMockOrder({ id: 'ord-1', shippingAddressId: null });
    prismaMock.orders.findFirst.mockResolvedValueOnce(order);

    const req = mockRequest({ params: { orderId: 'ord-1' }, user: { id: 'seller-1' } });
    const res = mockResponse();
    const next = mockNext();

    await getSellerOrderDetails(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      order: expect.objectContaining({ shippingAddress: null }),
    });
  });

  it('should return 404 when shop not found', async () => {
    prismaMock.shops.findUnique.mockResolvedValueOnce(null);

    const req = mockRequest({ params: { orderId: 'ord-1' }, user: { id: 'seller-1' } });
    const res = mockResponse();
    const next = mockNext();

    await getSellerOrderDetails(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should return 404 when order not found in seller shop', async () => {
    prismaMock.shops.findUnique.mockResolvedValueOnce(createMockShop());
    prismaMock.orders.findFirst.mockResolvedValueOnce(null);

    const req = mockRequest({ params: { orderId: 'unknown' }, user: { id: 'seller-1' } });
    const res = mockResponse();
    const next = mockNext();

    await getSellerOrderDetails(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
