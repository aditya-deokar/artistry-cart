/**
 * Unit Tests for initializeSiteConfig
 *
 * Tests the one-time site_config seeder that runs on gateway startup.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted Prisma mock ──
const { prismaMock } = vi.hoisted(() => {
  const prismaMock = {
    site_config: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  };
  return { prismaMock };
});

vi.mock('@prisma/client', () => ({
  PrismaClient: function () { return prismaMock; },
}));

import initializeConfig from './initializeSiteConfig';

beforeEach(() => {
  prismaMock.site_config.findFirst.mockReset();
  prismaMock.site_config.create.mockReset();
  vi.restoreAllMocks();
});

describe('initializeConfig', () => {
  it('should create site_config when none exists', async () => {
    prismaMock.site_config.findFirst.mockResolvedValueOnce(null);
    prismaMock.site_config.create.mockResolvedValueOnce({ id: 'cfg-1' });

    await initializeConfig();

    expect(prismaMock.site_config.findFirst).toHaveBeenCalledOnce();
    expect(prismaMock.site_config.create).toHaveBeenCalledOnce();
  });

  it('should not overwrite existing site_config', async () => {
    prismaMock.site_config.findFirst.mockResolvedValueOnce({ id: 'existing' });

    await initializeConfig();

    expect(prismaMock.site_config.findFirst).toHaveBeenCalledOnce();
    expect(prismaMock.site_config.create).not.toHaveBeenCalled();
  });

  it('should include all expected categories', async () => {
    prismaMock.site_config.findFirst.mockResolvedValueOnce(null);
    prismaMock.site_config.create.mockResolvedValueOnce({ id: 'cfg-1' });

    await initializeConfig();

    const createArg = prismaMock.site_config.create.mock.calls[0][0];
    const categories: string[] = createArg.data.categories;

    expect(categories).toContain('Artwork');
    expect(categories).toContain('Paintings');
    expect(categories).toContain('Sculptures');
    expect(categories).toContain('Handmade Crafts');
    expect(categories).toContain('Ceramics & Pottery');
    expect(categories).toContain('Eco-Friendly Products');
    expect(categories.length).toBeGreaterThanOrEqual(19);
  });

  it('should include subCategories mapping', async () => {
    prismaMock.site_config.findFirst.mockResolvedValueOnce(null);
    prismaMock.site_config.create.mockResolvedValueOnce({ id: 'cfg-1' });

    await initializeConfig();

    const createArg = prismaMock.site_config.create.mock.calls[0][0];
    const subCategories = createArg.data.subCategories;

    expect(subCategories).toHaveProperty('Paintings');
    expect(subCategories['Paintings']).toContain('Oil Painting');
    expect(subCategories).toHaveProperty('Sculptures');
    expect(subCategories['Sculptures']).toContain('Bronze');
  });

  it('should handle Prisma connection failure gracefully', async () => {
    prismaMock.site_config.findFirst.mockRejectedValueOnce(new Error('Connection refused'));

    // Should not throw — error is caught internally
    await expect(initializeConfig()).resolves.not.toThrow();
  });

  it('should log error on Prisma failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    prismaMock.site_config.findFirst.mockRejectedValueOnce(new Error('DB down'));

    await initializeConfig();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error initializing site configs'),
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });
});
