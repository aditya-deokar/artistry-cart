/**
 * Unit Tests for Slugify Utilities
 * 
 * Tests for slug generation and uniqueness checking.
 */

import { PrismaClient } from '@prisma/client';
import { generateSlug, createUniqueSlug } from './slugify';

// Create a minimal mock for PrismaClient that only includes what we need
const mockPrisma = {
  shops: {
    findUnique: jest.fn(),
  },
} as unknown as PrismaClient;

describe('Slugify Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSlug', () => {
    it('should generate slug from simple text', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
    });

    it('should convert to lowercase', () => {
      expect(generateSlug('HELLO WORLD')).toBe('hello-world');
    });

    it('should trim whitespace', () => {
      expect(generateSlug('  hello world  ')).toBe('hello-world');
    });

    it('should replace multiple spaces with single hyphen', () => {
      expect(generateSlug('hello    world')).toBe('hello-world');
    });

    it('should remove special characters', () => {
      expect(generateSlug('hello!@#$%world')).toBe('helloworld');
    });

    it('should replace multiple hyphens with single hyphen', () => {
      expect(generateSlug('hello---world')).toBe('hello-world');
    });

    it('should trim hyphens from start and end', () => {
      expect(generateSlug('---hello-world---')).toBe('hello-world');
    });

    it('should handle empty string', () => {
      expect(generateSlug('')).toBe('');
    });

    it('should handle string with only special characters', () => {
      expect(generateSlug('!@#$%')).toBe('');
    });

    it('should handle unicode characters', () => {
      // Note: The current implementation removes non-word chars
      expect(generateSlug('café')).toBe('caf');
    });

    it('should handle numbers in text', () => {
      expect(generateSlug('Shop 123')).toBe('shop-123');
    });

    it('should handle mixed case and special characters', () => {
      expect(generateSlug('My Awesome Shop!')).toBe('my-awesome-shop');
    });

    it('should handle single word', () => {
      expect(generateSlug('Shop')).toBe('shop');
    });

    it('should preserve hyphens in correct positions', () => {
      expect(generateSlug('my-shop-name')).toBe('my-shop-name');
    });

    it('should handle tabs and newlines', () => {
      expect(generateSlug('hello\tworld\ntest')).toBe('hello-world-test');
    });
  });

  describe('createUniqueSlug', () => {
    it('should return base slug if unique', async () => {
      (mockPrisma.shops.findUnique as jest.Mock).mockResolvedValueOnce(null);
      
      const result = await createUniqueSlug('my-shop', mockPrisma);
      
      expect(result).toBe('my-shop');
      expect(mockPrisma.shops.findUnique).toHaveBeenCalledWith({
        where: { slug: 'my-shop' },
      });
    });

    it('should append counter if slug exists', async () => {
      (mockPrisma.shops.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: '1', slug: 'my-shop' }) // First call: exists
        .mockResolvedValueOnce(null); // Second call: unique
      
      const result = await createUniqueSlug('my-shop', mockPrisma);
      
      expect(result).toBe('my-shop-1');
    });

    it('should increment counter until unique slug found', async () => {
      (mockPrisma.shops.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: '1', slug: 'my-shop' })
        .mockResolvedValueOnce({ id: '2', slug: 'my-shop-1' })
        .mockResolvedValueOnce({ id: '3', slug: 'my-shop-2' })
        .mockResolvedValueOnce(null);
      
      const result = await createUniqueSlug('my-shop', mockPrisma);
      
      expect(result).toBe('my-shop-3');
    });

    it('should handle multiple concurrent slug checks', async () => {
      // Simulate a race condition scenario
      let callCount = 0;
      (mockPrisma.shops.findUnique as jest.Mock).mockImplementation(async () => {
        callCount++;
        if (callCount <= 5) {
          return { id: `${callCount}`, slug: `my-shop${callCount > 1 ? `-${callCount - 1}` : ''}` };
        }
        return null;
      });
      
      const result = await createUniqueSlug('my-shop', mockPrisma);
      
      expect(result).toBe('my-shop-5');
    });

    it('should handle empty base slug', async () => {
      (mockPrisma.shops.findUnique as jest.Mock).mockResolvedValueOnce(null);
      
      const result = await createUniqueSlug('', mockPrisma);
      
      expect(result).toBe('');
    });
  });
});
