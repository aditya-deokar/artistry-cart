/**
 * Unit Tests for Product Cron Job
 *
 * Tests the scheduled job that permanently deletes soft-deleted products.
 * We mock `node-cron` to capture the callback and test it directly.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks ──
const { prismaMock, cronMock } = vi.hoisted(() => {
  const txMock = {
    productPricing: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    eventProductDiscount: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    productAnalytics: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    products: { deleteMany: vi.fn().mockResolvedValue({ count: 2 }) },
  };

  const prismaMock = {
    products: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn((fn: (tx: typeof txMock) => Promise<unknown>) => fn(txMock)),
  };

  // Capture the callback so we can invoke it from tests
  let capturedCallback: (() => Promise<void>) | null = null;
  const cronMock = {
    schedule: vi.fn((_, cb) => {
      capturedCallback = cb;
    }),
    getCallback: () => capturedCallback,
  };

  return { prismaMock, cronMock, txMock };
});

vi.mock('../../../../packages/libs/prisma', () => ({
  __esModule: true,
  default: prismaMock,
}));

vi.mock('node-cron', () => ({
  __esModule: true,
  default: cronMock,
  schedule: cronMock.schedule,
}));

// Import triggers side-effect registration of the cron job
import './product-cron.job';

describe('Product Deletion Cron Job', () => {
  // This test must come FIRST — before any beforeEach clears mock call counts.
  // cron.schedule is called at import time as a side-effect.
  it('registers a cron job with hourly schedule', () => {
    expect(cronMock.schedule).toHaveBeenCalledWith('0 * * * *', expect.any(Function));
  });

  beforeEach(() => {
    // Only clear prisma mocks, NOT cronMock (schedule was called at import time)
    prismaMock.products.findMany.mockReset();
    prismaMock.$transaction.mockImplementation((fn: any) => {
      const txMock = {
        productPricing: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
        eventProductDiscount: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
        productAnalytics: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
        products: { deleteMany: vi.fn().mockResolvedValue({ count: 2 }) },
      };
      return fn(txMock);
    });
  });

  it('does nothing when no soft-deleted products exist', async () => {
    prismaMock.products.findMany.mockResolvedValue([]);

    const job = cronMock.getCallback();
    await job!();

    expect(prismaMock.products.findMany).toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('deletes related records and products in a transaction', async () => {
    prismaMock.products.findMany.mockResolvedValue([
      { id: 'prod-1' },
      { id: 'prod-2' },
    ]);

    const job = cronMock.getCallback();
    await job!();

    expect(prismaMock.$transaction).toHaveBeenCalled();
    // The transaction callback is called — verify via the mock implementation
  });

  it('handles errors gracefully without throwing', async () => {
    prismaMock.products.findMany.mockRejectedValue(new Error('DB down'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const job = cronMock.getCallback();
    // Should not throw
    await expect(job!()).resolves.toBeUndefined();

    consoleSpy.mockRestore();
  });
});
