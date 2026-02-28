/**
 * Unit Tests for User Controller
 * 
 * Tests for profile management, orders, and address operations.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import {
  getCurrentUser,
  updateUserDetails,
  updateUserAvatar,
  getUserOrders,
  getOrderDetails,
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from './user.controller';
import { prismaMock, createMockUser, resetPrismaMock } from '../__tests__/mocks/prisma.mock';

// Mock dependencies
vi.mock('../../../../packages/libs/prisma', async () => {
  const { prismaMock } = await import('../__tests__/mocks/prisma.mock');
  return { default: prismaMock };
});
vi.mock('../../../../packages/libs/imageKit', () => ({
  imagekit: {
    upload: vi.fn().mockResolvedValue({
      url: 'https://imagekit.io/test/avatar.jpg',
      fileId: 'file_123',
    }),
  },
}));

// Helper to create mock request/response/next
const mockRequest = (data: any = {}): any => ({
  body: {},
  cookies: {},
  headers: {},
  params: {},
  query: {},
  user: { id: 'user-123' },
  ...data,
});

const mockResponse = (): any => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.cookie = vi.fn().mockReturnValue(res);
  res.clearCookie = vi.fn().mockReturnValue(res);
  return res;
};

const mockNext = vi.fn();

describe('User Controller', () => {
  beforeEach(() => {
    resetPrismaMock();
    vi.clearAllMocks();
    mockNext.mockClear();
  });

  describe('getCurrentUser', () => {
    it('should return current user details', async () => {
      const mockUser = createMockUser();
      const req = mockRequest({ user: { id: 'user-123' } });
      const res = mockResponse();

      prismaMock.users.findUnique.mockResolvedValueOnce(mockUser);

      await getCurrentUser(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
        }),
      });
    });

    it('should call next on error', async () => {
      const req = mockRequest({ user: { id: 'user-123' } });
      const res = mockResponse();

      prismaMock.users.findUnique.mockRejectedValueOnce(new Error('Database error'));

      await getCurrentUser(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('updateUserDetails', () => {
    it('should update user name and email', async () => {
      const req = mockRequest({
        user: { id: 'user-123' },
        body: {
          name: 'Updated Name',
          email: 'updated@example.com',
        },
      });
      const res = mockResponse();

      const updatedUser = createMockUser({
        name: 'Updated Name',
        email: 'updated@example.com',
      });
      prismaMock.users.update.mockResolvedValueOnce(updatedUser);

      await updateUserDetails(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: expect.objectContaining({
          name: 'Updated Name',
          email: 'updated@example.com',
        }),
      });
    });

    it('should call next on error', async () => {
      const req = mockRequest({
        user: { id: 'user-123' },
        body: { name: 'Updated Name' },
      });
      const res = mockResponse();

      prismaMock.users.update.mockRejectedValueOnce(new Error('Database error'));

      await updateUserDetails(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('updateUserAvatar', () => {
    it('should update user avatar', async () => {
      const req = mockRequest({
        user: { id: 'user-123' },
        file: {
          buffer: Buffer.from('test-image'),
        },
      });
      const res = mockResponse();

      const updatedUser = createMockUser({
        avatar: { url: 'https://imagekit.io/test/avatar.jpg', file_id: 'file_123' },
      });
      prismaMock.users.update.mockResolvedValueOnce(updatedUser);

      await updateUserAvatar(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: expect.any(Object),
      });
    });

    it('should return 400 if no file uploaded', async () => {
      const req = mockRequest({
        user: { id: 'user-123' },
        file: null,
      });
      const res = mockResponse();

      await updateUserAvatar(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No file uploaded.',
      });
    });
  });

  describe('getUserOrders', () => {
    it('should return paginated orders for user', async () => {
      const req = mockRequest({
        user: { id: 'user-123' },
        query: { page: '1' },
      });
      const res = mockResponse();

      const mockOrders = [
        { id: 'order-1', userId: 'user-123', items: [], createdAt: new Date() },
        { id: 'order-2', userId: 'user-123', items: [], createdAt: new Date() },
      ];
      
      prismaMock.orders.findMany.mockResolvedValueOnce(mockOrders as any);
      prismaMock.orders.count.mockResolvedValueOnce(2);

      await getUserOrders(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        orders: mockOrders,
        pagination: {
          total: 2,
          currentPage: 1,
          totalPages: 1,
        },
      });
    });

    it('should handle pagination correctly', async () => {
      const req = mockRequest({
        user: { id: 'user-123' },
        query: { page: '2' },
      });
      const res = mockResponse();

      prismaMock.orders.findMany.mockResolvedValueOnce([]);
      prismaMock.orders.count.mockResolvedValueOnce(15);

      await getUserOrders(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: {
            total: 15,
            currentPage: 2,
            totalPages: 2,
          },
        })
      );
    });
  });

  describe('getOrderDetails', () => {
    it('should return order details for user', async () => {
      const req = mockRequest({
        user: { id: 'user-123' },
        params: { orderId: 'order-123' },
      });
      const res = mockResponse();

      const mockOrder = {
        id: 'order-123',
        userId: 'user-123',
        items: [
          { id: 'item-1', product: { id: 'product-1', name: 'Product 1' } },
        ],
      };
      
      prismaMock.orders.findFirst.mockResolvedValueOnce(mockOrder as any);

      await getOrderDetails(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        order: mockOrder,
      });
    });

    it('should return 404 if order not found', async () => {
      const req = mockRequest({
        user: { id: 'user-123' },
        params: { orderId: 'nonexistent' },
      });
      const res = mockResponse();

      prismaMock.orders.findFirst.mockResolvedValueOnce(null);

      await getOrderDetails(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Order not found.',
      });
    });
  });

  describe('getUserAddresses', () => {
    it('should return all addresses for user', async () => {
      const req = mockRequest({ user: { id: 'user-123' } });
      const res = mockResponse();

      const mockAddresses = [
        { id: 'addr-1', userId: 'user-123', street: '123 Main St' },
        { id: 'addr-2', userId: 'user-123', street: '456 Oak Ave' },
      ];
      
      prismaMock.addresses.findMany.mockResolvedValueOnce(mockAddresses as any);

      await getUserAddresses(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        addresses: mockAddresses,
      });
    });
  });

  describe('createAddress', () => {
    it('should create new address for user', async () => {
      const req = mockRequest({
        user: { id: 'user-123' },
        body: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
      });
      const res = mockResponse();

      const newAddress = {
        id: 'addr-123',
        userId: 'user-123',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      };
      
      prismaMock.addresses.create.mockResolvedValueOnce(newAddress as any);

      await createAddress(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        address: newAddress,
      });
    });
  });

  describe('updateAddress', () => {
    it('should update address for user', async () => {
      const req = mockRequest({
        user: { id: 'user-123' },
        params: { addressId: 'addr-123' },
        body: {
          street: '456 Updated St',
          city: 'Boston',
        },
      });
      const res = mockResponse();

      prismaMock.addresses.updateMany.mockResolvedValueOnce({ count: 1 });

      await updateAddress(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Address updated.',
      });
    });

    it('should return 404 if address not found', async () => {
      const req = mockRequest({
        user: { id: 'user-123' },
        params: { addressId: 'nonexistent' },
        body: { street: 'Updated St' },
      });
      const res = mockResponse();

      prismaMock.addresses.updateMany.mockResolvedValueOnce({ count: 0 });

      await updateAddress(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Address not found or you do not have permission to edit it.',
      });
    });
  });

  describe('deleteAddress', () => {
    it('should delete address for user', async () => {
      const req = mockRequest({
        user: { id: 'user-123' },
        params: { addressId: 'addr-123' },
      });
      const res = mockResponse();

      prismaMock.addresses.deleteMany.mockResolvedValueOnce({ count: 1 });

      await deleteAddress(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Address deleted.',
      });
    });

    it('should return 404 if address not found', async () => {
      const req = mockRequest({
        user: { id: 'user-123' },
        params: { addressId: 'nonexistent' },
      });
      const res = mockResponse();

      prismaMock.addresses.deleteMany.mockResolvedValueOnce({ count: 0 });

      await deleteAddress(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Address not found or you do not have permission to delete it.',
      });
    });
  });
});
