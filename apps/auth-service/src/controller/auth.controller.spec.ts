/**
 * Unit Tests for Auth Controller
 * 
 * Tests for user/seller registration, login, logout, and token management.
 */

import { Request, Response } from 'express';

// Mock dependencies - must be before imports that use them
jest.mock('../../../../packages/libs/redis', () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  expire: jest.fn(),
  ttl: jest.fn(),
  incr: jest.fn(),
  decr: jest.fn(),
  keys: jest.fn(),
  flushall: jest.fn(),
}));

jest.mock('../../../../packages/libs/prisma', () => ({
  __esModule: true,
  default: {
    users: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    sellers: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    shops: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    orders: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    addresses: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn((promises: any[]) => Promise.all(promises)),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}));

jest.mock('../utils/sendMail', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../utils/auth.helper', () => ({
  validationRegistrationData: jest.fn(),
  checkOTPRestrctions: jest.fn(),
  trackOTPRequests: jest.fn(),
  sendOTP: jest.fn(),
  verifyOTP: jest.fn(),
  handleForgotPassword: jest.fn(),
  verifyForgotPasswordOTP: jest.fn(),
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('$2a$10$hashedpassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ id: 'user-123', role: 'user' }),
}));

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    accounts: {
      create: jest.fn().mockResolvedValue({ id: 'acct_test123' }),
    },
    accountLinks: {
      create: jest.fn().mockResolvedValue({ url: 'https://stripe.com/connect' }),
    },
  }));
});

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
import _prisma from '../../../../packages/libs/prisma';
import _redis from '../../../../packages/libs/redis';

// Define mock function type
type MockFunction<T extends (...args: any[]) => any> = T & {
  mockResolvedValueOnce: ReturnType<typeof jest.fn>['mockResolvedValueOnce'];
  mockResolvedValue: ReturnType<typeof jest.fn>['mockResolvedValue'];
  mockReturnValueOnce: ReturnType<typeof jest.fn>['mockReturnValueOnce'];
  mockReturnValue: ReturnType<typeof jest.fn>['mockReturnValue'];
  mockReset: ReturnType<typeof jest.fn>['mockReset'];
  mockClear: ReturnType<typeof jest.fn>['mockClear'];
};

// Define mock prisma type
type MockPrisma = {
  users: {
    findUnique: MockFunction<any>;
    findFirst: MockFunction<any>;
    findMany: MockFunction<any>;
    create: MockFunction<any>;
    update: MockFunction<any>;
    delete: MockFunction<any>;
    deleteMany: MockFunction<any>;
  };
  sellers: {
    findUnique: MockFunction<any>;
    findFirst: MockFunction<any>;
    findMany: MockFunction<any>;
    create: MockFunction<any>;
    update: MockFunction<any>;
    delete: MockFunction<any>;
    deleteMany: MockFunction<any>;
  };
  shops: {
    findUnique: MockFunction<any>;
    findFirst: MockFunction<any>;
    findMany: MockFunction<any>;
    create: MockFunction<any>;
    update: MockFunction<any>;
    delete: MockFunction<any>;
  };
  orders: {
    findUnique: MockFunction<any>;
    findFirst: MockFunction<any>;
    findMany: MockFunction<any>;
    create: MockFunction<any>;
    update: MockFunction<any>;
    delete: MockFunction<any>;
    count: MockFunction<any>;
  };
  addresses: {
    findUnique: MockFunction<any>;
    findMany: MockFunction<any>;
    create: MockFunction<any>;
    update: MockFunction<any>;
    updateMany: MockFunction<any>;
    delete: MockFunction<any>;
    deleteMany: MockFunction<any>;
  };
  $transaction: MockFunction<any>;
  $connect: MockFunction<any>;
  $disconnect: MockFunction<any>;
};

// Cast imports as mocks
const prisma = _prisma as unknown as MockPrisma;
const redis = _redis as any;

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
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('Auth Controller', () => {
  beforeEach(() => {
    resetPrismaMock();
    resetRedisMock();
    jest.clearAllMocks();
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
      
      const { verifyOTP } = require('../utils/auth.helper');
      verifyOTP.mockResolvedValueOnce(undefined);
      
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
      
      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValueOnce(true);
      
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
      
      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValueOnce(false);
      
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
      
      const jwt = require('jsonwebtoken');
      jwt.verify.mockReturnValueOnce({ id: 'user-123', role: 'user' });
      
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
      
      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValueOnce(false);
      bcrypt.hash.mockResolvedValueOnce('$2a$10$newhashedpassword');
      
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
      
      const { validationRegistrationData } = require('../utils/auth.helper');
      validationRegistrationData.mockReturnValueOnce(undefined);
      
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
      
      const { validationRegistrationData } = require('../utils/auth.helper');
      validationRegistrationData.mockReturnValueOnce(undefined);
      
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
      
      const { verifyOTP } = require('../utils/auth.helper');
      verifyOTP.mockResolvedValueOnce(undefined);
      
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
      
      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValueOnce(true);
      
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
