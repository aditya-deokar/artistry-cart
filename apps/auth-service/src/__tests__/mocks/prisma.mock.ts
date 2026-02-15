/**
 * Prisma Mock
 * 
 * Mock implementation for Prisma client used in unit tests.
 * Provides mock functions for all database operations.
 */

/// <reference types="jest" />

// Create a mock factory for Prisma
export const createPrismaMock = () => ({
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
});

// Default mock instance
export const prismaMock = createPrismaMock();

// Helper to reset all mocks between tests
export const resetPrismaMock = () => {
  Object.values(prismaMock.users).forEach((fn: any) => {
    if (typeof fn?.mockReset === 'function') fn.mockReset();
  });
  Object.values(prismaMock.sellers).forEach((fn: any) => {
    if (typeof fn?.mockReset === 'function') fn.mockReset();
  });
  Object.values(prismaMock.shops).forEach((fn: any) => {
    if (typeof fn?.mockReset === 'function') fn.mockReset();
  });
  Object.values(prismaMock.orders).forEach((fn: any) => {
    if (typeof fn?.mockReset === 'function') fn.mockReset();
  });
  Object.values(prismaMock.addresses).forEach((fn: any) => {
    if (typeof fn?.mockReset === 'function') fn.mockReset();
  });
};

// Helper to create mock user data
export const createMockUser = (overrides: Partial<any> = {}) => ({
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
export const createMockSeller = (overrides: Partial<any> = {}) => ({
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
export const createMockShop = (overrides: Partial<any> = {}) => ({
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
