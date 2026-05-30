/**
 * Unit Tests for Product Cron Job
 *
 * Tests the scheduled job that permanently deletes soft-deleted products.
 * We mock `node-cron` to capture the callback and test it directly.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

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

  let capturedCallback: (() => Promise<void>) | null = null;
  const cronMock = {
    schedule: vi.fn((_: string, callback: () => Promise<void>) => {
      capturedCallback = callback;
    }),
    getCallback: () => capturedCallback,
  };

  return { prismaMock, cronMock };
});

vi.mock('@artistry-cart/libs/prisma', () => ({
  __esModule: true,
  default: prismaMock,
}));

vi.mock('node-cron', () => ({
  __esModule: true,
  default: cronMock,
  schedule: cronMock.schedule,
}));

import { registerProductCleanupCron } from './product-cron.job';

const loggerMock = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  child: vi.fn(),
};

describe('Product Deletion Cron Job', () => {
  beforeEach(() => {
    cronMock.schedule.mockClear();
    loggerMock.info.mockClear();
    loggerMock.warn.mockClear();
    loggerMock.error.mockClear();
    loggerMock.child.mockClear();
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

    registerProductCleanupCron(loggerMock as any);
  });

  it('registers a cron job with hourly schedule', () => {
    expect(cronMock.schedule).toHaveBeenCalledWith('0 * * * *', expect.any(Function));
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
  });

  it('handles errors gracefully without throwing', async () => {
    prismaMock.products.findMany.mockRejectedValue(new Error('DB down'));

    const job = cronMock.getCallback();
    await expect(job!()).resolves.toBeUndefined();
    expect(loggerMock.error).toHaveBeenCalledWith(
      'Error in product deletion cron job',
      expect.objectContaining({
        error: expect.any(Error),
      }),
    );
  });
});
