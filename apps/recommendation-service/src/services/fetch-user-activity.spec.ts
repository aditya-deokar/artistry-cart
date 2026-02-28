/**
 * Unit Tests for fetch-user-activity service
 *
 * Tests the Prisma-backed user activity fetching logic.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  prismaMock,
  resetPrismaMock,
} from '../../../../packages/test-utils';

// ── Module mocks ──
vi.mock('../../../../packages/libs/prisma', async () => {
  const { prismaMock: pm } = await import('../../../../packages/test-utils/mocks/prisma.mock');
  return { default: pm };
});

import { getUserActivity } from './fetch-user-activity';

describe('getUserActivity', () => {
  beforeEach(() => {
    resetPrismaMock();
    vi.clearAllMocks();
  });

  it('should return actions array when user analytics exist', async () => {
    const mockActions = [
      { productId: 'p1', action: 'PRODUCT_VIEW' },
      { productId: 'p2', action: 'PURCHASE' },
    ];
    prismaMock.userAnalytics.findUnique.mockResolvedValue({
      actions: mockActions,
    } as any);

    const result = await getUserActivity('user-1');

    expect(prismaMock.userAnalytics.findUnique).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      select: { actions: true },
    });
    expect(result).toEqual(mockActions);
  });

  it('should return empty array when user analytics not found', async () => {
    prismaMock.userAnalytics.findUnique.mockResolvedValue(null);

    const result = await getUserActivity('non-existent');

    expect(result).toEqual([]);
  });

  it('should return empty array when actions field is null', async () => {
    prismaMock.userAnalytics.findUnique.mockResolvedValue({
      actions: null,
    } as any);

    const result = await getUserActivity('user-1');

    expect(result).toEqual([]);
  });

  it('should return empty array on Prisma error', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    prismaMock.userAnalytics.findUnique.mockRejectedValue(
      new Error('DB connection failed')
    );

    const result = await getUserActivity('user-1');

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error fetching user activity :',
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });

  it('should pass correct userId to Prisma query', async () => {
    prismaMock.userAnalytics.findUnique.mockResolvedValue({
      actions: [],
    } as any);

    await getUserActivity('specific-user-id');

    expect(prismaMock.userAnalytics.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'specific-user-id' },
      })
    );
  });

  it('should return the actions directly without modification', async () => {
    const complexActions = [
      { productId: 'p1', action: 'PRODUCT_VIEW', timestamp: '2024-01-01' },
      { productId: 'p2', action: 'ADD_TO_CART', quantity: 2 },
    ];
    prismaMock.userAnalytics.findUnique.mockResolvedValue({
      actions: complexActions,
    } as any);

    const result = await getUserActivity('user-1');

    expect(result).toBe(complexActions);
  });
});
