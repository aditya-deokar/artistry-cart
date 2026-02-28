/**
 * Prisma Mock
 * 
 * Mock implementation for Prisma client used in unit tests.
 * Provides mock functions for all database operations.
 */

import { vi } from 'vitest';

// Create a mock factory for Prisma
export const createPrismaMock = () => ({
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
