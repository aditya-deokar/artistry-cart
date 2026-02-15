/**
 * Unit Tests for isAuthenticated Middleware
 * 
 * Tests for JWT token validation and user authentication.
 */

import { Response, NextFunction } from 'express';
import isAuthenticated from './isAuthenticated';

// Create mock prisma
const prismaMock = {
  users: {
    findUnique: jest.fn(),
  },
  sellers: {
    findUnique: jest.fn(),
  },
};

// Mock dependencies
jest.mock('../libs/prisma', () => ({
  __esModule: true,
  default: prismaMock,
}));
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  TokenExpiredError: class TokenExpiredError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'TokenExpiredError';
    }
  },
  JsonWebTokenError: class JsonWebTokenError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'JsonWebTokenError';
    }
  },
}));

// Helper to create mock user
const createMockUser = (overrides: any = {}) => ({
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedpassword123',
  avatar: null,
  role: 'user',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Helper to create mock seller
const createMockSeller = (overrides: any = {}) => ({
  id: 'seller-123',
  name: 'Test Seller',
  email: 'seller@example.com',
  password: 'hashedpassword123',
  phone_number: '+1234567890',
  country: 'US',
  stripeId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Helper to create mock request/response/next
const mockRequest = (data: any = {}): any => ({
  body: {},
  cookies: {},
  headers: {},
  params: {},
  query: {},
  ...data,
});

const mockResponse = (): any => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('isAuthenticated Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNext.mockClear();
    prismaMock.users.findUnique.mockReset();
    prismaMock.sellers.findUnique.mockReset();
  });

  describe('Token Validation', () => {
    it('should return 401 if no token provided', async () => {
      const req = mockRequest({
        cookies: {},
        headers: {},
      });
      const res = mockResponse();

      await isAuthenticated(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unauthorized! Token missing.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token is in cookie but empty', async () => {
      const req = mockRequest({
        cookies: { access_token: '' },
        headers: {},
      });
      const res = mockResponse();

      await isAuthenticated(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unauthorized! Token missing.',
      });
    });

    it('should accept token from Authorization header', async () => {
      const req = mockRequest({
        cookies: {},
        headers: { authorization: 'Bearer valid-token' },
      });
      const res = mockResponse();

      const jwt = require('jsonwebtoken');
      jwt.verify.mockReturnValueOnce({ id: 'user-123', role: 'user' });
      prismaMock.users.findUnique.mockResolvedValueOnce(createMockUser());

      await isAuthenticated(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.role).toBe('user');
    });

    it('should accept token from cookies', async () => {
      const req = mockRequest({
        cookies: { access_token: 'valid-token' },
        headers: {},
      });
      const res = mockResponse();

      const jwt = require('jsonwebtoken');
      jwt.verify.mockReturnValueOnce({ id: 'user-123', role: 'user' });
      prismaMock.users.findUnique.mockResolvedValueOnce(createMockUser());

      await isAuthenticated(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.user).toBeDefined();
    });

    it('should prefer cookie token over header token', async () => {
      const req = mockRequest({
        cookies: { access_token: 'cookie-token' },
        headers: { authorization: 'Bearer header-token' },
      });
      const res = mockResponse();

      const jwt = require('jsonwebtoken');
      jwt.verify.mockReturnValueOnce({ id: 'user-123', role: 'user' });
      prismaMock.users.findUnique.mockResolvedValueOnce(createMockUser());

      await isAuthenticated(req, res, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith('cookie-token', expect.any(String));
    });
  });

  describe('User Authentication', () => {
    it('should set req.user and req.role for valid user token', async () => {
      const req = mockRequest({
        cookies: { access_token: 'valid-token' },
        headers: {},
      });
      const res = mockResponse();

      const mockUser = createMockUser();
      const jwt = require('jsonwebtoken');
      jwt.verify.mockReturnValueOnce({ id: 'user-123', role: 'user' });
      prismaMock.users.findUnique.mockResolvedValueOnce(mockUser);

      await isAuthenticated(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.user).toEqual(mockUser);
      expect(req.role).toBe('user');
    });

    it('should return 401 if user not found in database', async () => {
      const req = mockRequest({
        cookies: { access_token: 'valid-token' },
        headers: {},
      });
      const res = mockResponse();

      const jwt = require('jsonwebtoken');
      jwt.verify.mockReturnValueOnce({ id: 'nonexistent', role: 'user' });
      prismaMock.users.findUnique.mockResolvedValueOnce(null);

      await isAuthenticated(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Account not found!',
      });
    });
  });

  describe('Seller Authentication', () => {
    it('should set req.user and req.role for valid seller token', async () => {
      const req = mockRequest({
        cookies: { access_token: 'valid-token' },
        headers: {},
      });
      const res = mockResponse();

      const mockSeller = createMockSeller();
      const jwt = require('jsonwebtoken');
      jwt.verify.mockReturnValueOnce({ id: 'seller-123', role: 'seller' });
      prismaMock.sellers.findUnique.mockResolvedValueOnce(mockSeller);

      await isAuthenticated(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.user).toEqual(mockSeller);
      expect(req.role).toBe('seller');
    });

    it('should include shop data for seller', async () => {
      const req = mockRequest({
        cookies: { access_token: 'valid-token' },
        headers: {},
      });
      const res = mockResponse();

      const mockSeller = createMockSeller();
      const mockShop = { id: 'shop-123', name: 'Test Shop' };
      const jwt = require('jsonwebtoken');
      jwt.verify.mockReturnValueOnce({ id: 'seller-123', role: 'seller' });
      prismaMock.sellers.findUnique.mockResolvedValueOnce({
        ...mockSeller,
        shop: mockShop,
      });

      await isAuthenticated(req, res, mockNext);

      expect(prismaMock.sellers.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { shop: true },
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should return 401 for expired token', async () => {
      const req = mockRequest({
        cookies: { access_token: 'expired-token' },
        headers: {},
      });
      const res = mockResponse();

      const jwt = require('jsonwebtoken');
      const { TokenExpiredError } = jwt;
      jwt.verify.mockImplementationOnce(() => {
        throw new TokenExpiredError('Token expired');
      });

      await isAuthenticated(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unauthorized! Token has expired.',
      });
    });

    it('should return 401 for invalid token', async () => {
      const req = mockRequest({
        cookies: { access_token: 'invalid-token' },
        headers: {},
      });
      const res = mockResponse();

      const jwt = require('jsonwebtoken');
      const { JsonWebTokenError } = jwt;
      jwt.verify.mockImplementationOnce(() => {
        throw new JsonWebTokenError('Invalid token');
      });

      await isAuthenticated(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unauthorized! Invalid token.',
      });
    });

    it('should call next with error for unexpected errors', async () => {
      const req = mockRequest({
        cookies: { access_token: 'valid-token' },
        headers: {},
      });
      const res = mockResponse();

      const jwt = require('jsonwebtoken');
      jwt.verify.mockImplementationOnce(() => {
        throw new Error('Unexpected error');
      });

      await isAuthenticated(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
