/**
 * Prisma Mock Factory
 *
 * Comprehensive mock implementation for Prisma client.
 * Covers ALL models from the schema.prisma file.
 * Uses Vitest's vi.fn() for mock functions.
 */
import { vi } from 'vitest';

// Helper to create a full set of mock CRUD methods for a Prisma model
function createModelMock() {
  return {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
    groupBy: vi.fn(),
  };
}

/**
 * Create a fresh Prisma mock instance.
 * Call this in beforeEach() if you need a clean mock per test.
 */
export function createPrismaMock(): Record<string, any> {
  return {
    // Core models
    users: createModelMock(),
    sellers: createModelMock(),
    shops: createModelMock(),
    products: createModelMock(),
    orders: createModelMock(),
    orderItem: createModelMock(),
    addresses: createModelMock(),
    images: createModelMock(),

    // Payment models
    payments: createModelMock(),
    payouts: createModelMock(),
    refunds: createModelMock(),

    // Shop & Review models
    shopReviews: createModelMock(),
    shopAnalytics: createModelMock(),
    uniqueShopVisitor: createModelMock(),

    // Product related
    productPricing: createModelMock(),
    productAnalytics: createModelMock(),
    productEmbedding: createModelMock(),

    // Events & Discounts
    events: createModelMock(),
    eventProductDiscount: createModelMock(),
    discount_codes: createModelMock(),
    discount_usage: createModelMock(),

    // Site config
    site_config: createModelMock(),
    banners: createModelMock(),

    // User analytics & Notifications
    userAnalytics: createModelMock(),
    notification: createModelMock(),

    // AI Vision models
    visionSession: createModelMock(),
    concept: createModelMock(),
    conceptImage: createModelMock(),
    aIGeneratedProduct: createModelMock(),
    artisanMatch: createModelMock(),
    conceptCollection: createModelMock(),
    conceptComment: createModelMock(),
    rateLimitEntry: createModelMock(),
    aPIUsageLog: createModelMock(),

    // Prisma client methods
    $transaction: vi.fn((arg: unknown) => {
      if (typeof arg === 'function') {
        return arg(prismaMock);
      }
      return Promise.all(arg as Promise<unknown>[]);
    }),
    $connect: vi.fn().mockResolvedValue(undefined),
    $disconnect: vi.fn().mockResolvedValue(undefined),
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
  };
}

/** Default shared mock instance — import this in your tests */
export const prismaMock = createPrismaMock();

/**
 * Reset ALL mock functions across every model.
 * Call in beforeEach() or afterEach().
 */
export function resetPrismaMock(): void {
  const mock = prismaMock as Record<string, unknown>;
  for (const key of Object.keys(mock)) {
    const value = mock[key];
    if (value && typeof value === 'object') {
      for (const fn of Object.values(value as Record<string, unknown>)) {
        if (typeof (fn as { mockReset?: () => void })?.mockReset === 'function') {
          (fn as { mockReset: () => void }).mockReset();
        }
      }
    } else if (typeof (value as { mockReset?: () => void })?.mockReset === 'function') {
      (value as { mockReset: () => void }).mockReset();
    }
  }

  // Re-wire $transaction default implementation after reset
  prismaMock.$transaction.mockImplementation((arg: unknown) => {
    if (typeof arg === 'function') {
      return arg(prismaMock);
    }
    return Promise.all(arg as Promise<unknown>[]);
  });
}
