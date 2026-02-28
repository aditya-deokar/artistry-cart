/**
 * Unit Tests for Auth Controller
 * 
 * Tests for user/seller registration, login, logout, and token management.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

// Hoist all mock values so they're available inside vi.mock() factories
const mocks = vi.hoisted(() => {
  const mockRedis = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    exists: vi.fn(),
    expire: vi.fn(),
    ttl: vi.fn(),
    incr: vi.fn(),
    decr: vi.fn(),
    keys: vi.fn(),
    flushall: vi.fn(),
  };

  const mockPrisma = {
    users: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    sellers: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    shops: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    orders: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    addresses: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn((promises: any[]) => Promise.all(promises)),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  };

  const mockSendEmail = vi.fn().mockResolvedValue(undefined);

  const mockAuthHelper = {
    validationRegistrationData: vi.fn(),
    checkOTPRestrictions: vi.fn(),
    trackOTPRequests: vi.fn(),
    sendOTP: vi.fn(),
    verifyOTP: vi.fn(),
    handleForgotPassword: vi.fn(),
    verifyForgotPasswordOTP: vi.fn(),
  };

  const mockBcrypt = {
    hash: vi.fn().mockResolvedValue('$2a$10$hashedpassword'),
    compare: vi.fn().mockResolvedValue(true),
  };

  const mockJwt = {
    sign: vi.fn().mockReturnValue('mock-jwt-token'),
    verify: vi.fn().mockReturnValue({ id: 'user-123', role: 'user' }),
  };

  const mockStripeInstance = {
    accounts: {
      create: vi.fn().mockResolvedValue({ id: 'acct_test123' }),
    },
    accountLinks: {
      create: vi.fn().mockResolvedValue({ url: 'https://stripe.com/connect' }),
    },
  };
  const mockStripe = vi.fn(function () { return mockStripeInstance; });

  return { mockRedis, mockPrisma, mockSendEmail, mockAuthHelper, mockBcrypt, mockJwt, mockStripe, mockStripeInstance };
});

// Mock dependencies using hoisted values
vi.mock('../../../../packages/libs/redis', () => mocks.mockRedis);

vi.mock('../../../../packages/libs/prisma', () => ({
  default: mocks.mockPrisma,
}));

vi.mock('../utils/sendMail', () => ({
  sendEmail: mocks.mockSendEmail,
}));

vi.mock('../utils/auth.helper', () => mocks.mockAuthHelper);

vi.mock('bcryptjs', () => ({
  default: mocks.mockBcrypt,
  ...mocks.mockBcrypt,
}));

vi.mock('jsonwebtoken', () => ({
  default: mocks.mockJwt,
  ...mocks.mockJwt,
  JsonWebTokenError: class JsonWebTokenError extends Error {},
  TokenExpiredError: class TokenExpiredError extends Error {},
}));

vi.mock('stripe', () => ({
  default: mocks.mockStripe,
}));

// Import after mocks
import {
  userRegistration,
  verifyUser,
  loginUser,
  logoutUser,
  refreshToken,
  getUser,
  resetUserPassword,
  registerSeller,
  verifySeller,
  createShop,
  loginSeller,
  getSeller,
} from './auth.controller';
import { ValidationError, AuthError } from '../../../../packages/error-handler';

// Use hoisted mocks directly
const prisma = mocks.mockPrisma;
const redis = mocks.mockRedis;

// Helper to create mock user data
const createMockUser = (overrides: Partial<any> = {}) => ({
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

// Helper to create mock seller data
const createMockSeller = (overrides: Partial<any> = {}) => ({
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

// Helper to create mock shop data
const createMockShop = (overrides: Partial<any> = {}) => ({
  id: 'shop-123',
  name: 'Test Shop',
  slug: 'test-shop',
  bio: 'A test shop',
  address: '123 Test St',
  opening_hours: '9-5',
  category: 'art',
  sellerId: 'seller-123',
  website: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Helper to reset all mocks between tests
const resetPrismaMock = () => {
  Object.values(prisma.users).forEach((fn: any) => {
    if (typeof fn?.mockReset === 'function') fn.mockReset();
  });
  Object.values(prisma.sellers).forEach((fn: any) => {
    if (typeof fn?.mockReset === 'function') fn.mockReset();
  });
  Object.values(prisma.shops).forEach((fn: any) => {
    if (typeof fn?.mockReset === 'function') fn.mockReset();
  });
  Object.values(prisma.orders).forEach((fn: any) => {
    if (typeof fn?.mockReset === 'function') fn.mockReset();
  });
  Object.values(prisma.addresses).forEach((fn: any) => {
    if (typeof fn?.mockReset === 'function') fn.mockReset();
  });
};

// Helper to reset Redis mocks between tests
const resetRedisMock = () => {
  Object.values(redis).forEach((fn: any) => {
    if (typeof fn?.mockClear === 'function') fn.mockClear();
  });
};

// Helper to create mock request/response/next
interface MockRequest extends Partial<Request> {
  user?: any;
}

const mockRequest = (data: MockRequest = {}): MockRequest => ({
  body: {},
  cookies: {},
  headers: {},
  params: {},
  query: {},
  ...data,
});

const mockResponse = (): Partial<Response> => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.cookie = vi.fn().mockReturnValue(res);
  res.clearCookie = vi.fn().mockReturnValue(res);
  res.redirect = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
};

const mockNext = vi.fn();

describe('Auth Controller', () => {
  beforeEach(() => {
    resetPrismaMock();
    resetRedisMock();
    vi.clearAllMocks();
    mockNext.mockClear();
  });

  describe('userRegistration', () => {
    it('should send OTP for new user registration', async () => {
      const req = mockRequest({
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        },
      }) as Request;
      const res = mockResponse() as Response;

      prisma.users.findUnique.mockResolvedValueOnce(null);
      
      await userRegistration(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'OTP sent to email. Please verify your account.',
      });
    });

    it('should throw error if user already exists', async () => {
      const req = mockRequest({
        body: {
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123',
        },
      }) as Request;
      const res = mockResponse() as Response;

      prisma.users.findUnique.mockResolvedValueOnce(createMockUser());
      
      await userRegistration(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('verifyUser', () => {
    it('should create user after OTP verification', async () => {
      const req = mockRequest({
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          otp: '1234',
        },
      }) as Request;
      const res = mockResponse() as Response;

      prisma.users.findUnique.mockResolvedValueOnce(null);
      prisma.users.create.mockResolvedValueOnce(createMockUser());
      
      mocks.mockAuthHelper.verifyOTP.mockResolvedValueOnce(undefined);
      
      await verifyUser(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User Registered Successfully!',
      });
    });

    it('should throw error for missing fields', async () => {
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          otp: '1234',
        },
      }) as Request;
      const res = mockResponse() as Response;

      await verifyUser(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should throw error if user already exists', async () => {
      const req = mockRequest({
        body: {
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123',
          otp: '1234',
        },
      }) as Request;
      const res = mockResponse() as Response;

      prisma.users.findUnique.mockResolvedValueOnce(createMockUser());
      
      await verifyUser(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('loginUser', () => {
    it('should login user with valid credentials', async () => {
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      }) as Request;
      const res = mockResponse() as Response;

      const mockUser = createMockUser();
      prisma.users.findUnique.mockResolvedValueOnce(mockUser);
      
      mocks.mockBcrypt.compare.mockResolvedValueOnce(true);
      
      await loginUser(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          meassage: 'Login successfull!',
          user: expect.objectContaining({
            id: mockUser.id,
            email: mockUser.email,
          }),
        })
      );
    });

    it('should throw error for missing credentials', async () => {
      const req = mockRequest({
        body: {
          email: 'test@example.com',
        },
      }) as Request;
      const res = mockResponse() as Response;

      await loginUser(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should throw error for non-existent user', async () => {
      const req = mockRequest({
        body: {
          email: 'nonexistent@example.com',
          password: 'password123',
        },
      }) as Request;
      const res = mockResponse() as Response;

      prisma.users.findUnique.mockResolvedValueOnce(null);
      
      await loginUser(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
    });

    it('should throw error for invalid password', async () => {
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
      }) as Request;
      const res = mockResponse() as Response;

      prisma.users.findUnique.mockResolvedValueOnce(createMockUser());
      
      mocks.mockBcrypt.compare.mockResolvedValueOnce(false);
      
      await loginUser(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
    });
  });

  describe('logoutUser', () => {
    it('should clear cookies and return success', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;

      await logoutUser(req, res, mockNext);

      expect(res.clearCookie).toHaveBeenCalledWith('access_token', expect.any(Object));
      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logout successful!',
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens for valid refresh token', async () => {
      const req = mockRequest({
        cookies: { refresh_token: 'valid-refresh-token' },
      }) as any;
      const res = mockResponse() as Response;

      prisma.users.findUnique.mockResolvedValueOnce(createMockUser());
      
      mocks.mockJwt.verify.mockReturnValueOnce({ id: 'user-123', role: 'user' });
      
      await refreshToken(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Tokens refreshed successfully.',
      });
    });

    it('should return 401 for missing refresh token', async () => {
      const req = mockRequest({
        cookies: {},
      }) as any;
      const res = mockResponse() as Response;

      await refreshToken(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('getUser', () => {
    it('should return logged in user', async () => {
      const mockUser = createMockUser();
      const req = mockRequest({
        user: mockUser,
      }) as any;
      const res = mockResponse() as Response;

      await getUser(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: mockUser,
      });
    });
  });

  describe('resetUserPassword', () => {
    it('should reset password successfully', async () => {
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          newPassord: 'newpassword123',
        },
      }) as Request;
      const res = mockResponse() as Response;

      const mockUser = createMockUser();
      prisma.users.findUnique.mockResolvedValueOnce(mockUser);
      prisma.users.update.mockResolvedValueOnce({ ...mockUser, password: '$2a$10$newhashedpassword' });
      
      mocks.mockBcrypt.compare.mockResolvedValueOnce(false);
      mocks.mockBcrypt.hash.mockResolvedValueOnce('$2a$10$newhashedpassword');
      
      await resetUserPassword(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password reset successfully',
      });
    });

    it('should throw error for missing fields', async () => {
      const req = mockRequest({
        body: {
          email: 'test@example.com',
        },
      }) as Request;
      const res = mockResponse() as Response;

      await resetUserPassword(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should throw error if user not found', async () => {
      const req = mockRequest({
        body: {
          email: 'nonexistent@example.com',
          newPassord: 'newpassword123',
        },
      }) as Request;
      const res = mockResponse() as Response;

      prisma.users.findUnique.mockResolvedValueOnce(null);
      
      await resetUserPassword(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('registerSeller', () => {
    it('should send OTP for new seller registration', async () => {
      const req = mockRequest({
        body: {
          name: 'Test Seller',
          email: 'seller@example.com',
          password: 'password123',
          phone_number: '+1234567890',
          country: 'US',
        },
      }) as Request;
      const res = mockResponse() as Response;

      prisma.sellers.findUnique.mockResolvedValueOnce(null);
      
      mocks.mockAuthHelper.validationRegistrationData.mockReturnValueOnce(undefined);
      
      await registerSeller(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'OTP sent to email. Please verify your account.',
      });
    });

    it('should throw error if seller already exists', async () => {
      const req = mockRequest({
        body: {
          name: 'Test Seller',
          email: 'existing@example.com',
          password: 'password123',
          phone_number: '+1234567890',
          country: 'US',
        },
      }) as Request;
      const res = mockResponse() as Response;

      prisma.sellers.findUnique.mockResolvedValueOnce(createMockSeller());
      
      mocks.mockAuthHelper.validationRegistrationData.mockReturnValueOnce(undefined);
      
      await registerSeller(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('verifySeller', () => {
    it('should create seller after OTP verification', async () => {
      const req = mockRequest({
        body: {
          name: 'Test Seller',
          email: 'seller@example.com',
          password: 'password123',
          phone_number: '+1234567890',
          country: 'US',
          otp: '1234',
        },
      }) as Request;
      const res = mockResponse() as Response;

      prisma.sellers.findUnique.mockResolvedValueOnce(null);
      prisma.sellers.create.mockResolvedValueOnce(createMockSeller());
      
      mocks.mockAuthHelper.verifyOTP.mockResolvedValueOnce(undefined);
      
      await verifySeller(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should throw error for missing fields', async () => {
      const req = mockRequest({
        body: {
          email: 'seller@example.com',
          otp: '1234',
        },
      }) as Request;
      const res = mockResponse() as Response;

      await verifySeller(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('createShop', () => {
    it('should create shop with valid data', async () => {
      const req = mockRequest({
        body: {
          name: 'Test Shop',
          bio: 'A test shop',
          address: '123 Test St',
          opening_hours: '9-5',
          category: 'art',
          sellerId: 'seller-123',
        },
      }) as Request;
      const res = mockResponse() as Response;

      prisma.shops.create.mockResolvedValueOnce(createMockShop());
      
      await createShop(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        shop: expect.any(Object),
      });
    });

    it('should throw error for missing required fields', async () => {
      const req = mockRequest({
        body: {
          name: 'Test Shop',
          bio: 'A test shop',
        },
      }) as Request;
      const res = mockResponse() as Response;

      await createShop(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('loginSeller', () => {
    it('should login seller with valid credentials', async () => {
      const req = mockRequest({
        body: {
          email: 'seller@example.com',
          password: 'password123',
        },
      }) as Request;
      const res = mockResponse() as Response;

      const mockSeller = createMockSeller();
      prisma.sellers.findUnique.mockResolvedValueOnce(mockSeller);
      
      mocks.mockBcrypt.compare.mockResolvedValueOnce(true);
      
      await loginSeller(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          meassage: 'Login successfull!',
          seller: expect.objectContaining({
            id: mockSeller.id,
            email: mockSeller.email,
          }),
        })
      );
    });

    it('should throw error for non-existent seller', async () => {
      const req = mockRequest({
        body: {
          email: 'nonexistent@example.com',
          password: 'password123',
        },
      }) as Request;
      const res = mockResponse() as Response;

      prisma.sellers.findUnique.mockResolvedValueOnce(null);
      
      await loginSeller(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
    });
  });

  describe('getSeller', () => {
    it('should return logged in seller', async () => {
      const mockSeller = createMockSeller();
      const req = mockRequest({
        user: mockSeller,
      }) as any;
      const res = mockResponse() as Response;

      await getSeller(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        seller: mockSeller,
      });
    });
  });
});
