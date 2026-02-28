/**
 * E2E Tests — Product Service: Shops API
 *
 * Tests public shop listing, slug lookup, and shop reviews.
 * Requires: product-service running on port 6002, auth-service on 6001.
 */

import axios from 'axios';
import { describe, it, expect, beforeAll } from 'vitest';
import { loginAsUser, authHeaders } from '../support/test-helpers';

describe('Shops API (E2E)', () => {
  let userToken: string | null;

  beforeAll(async () => {
    userToken = await loginAsUser();
  });

  describe('GET /api/shops', () => {
    it('should return list of shops', async () => {
      const res = await axios.get('/api/shops');
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('success', true);
    });
  });

  describe('GET /api/shops/categories', () => {
    it('should return shop categories', async () => {
      const res = await axios.get('/api/shops/categories');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/shops/:slug', () => {
    it('should return 404 for non-existent shop slug', async () => {
      const res = await axios.get('/api/shops/non-existent-shop-xyz');
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /api/shops/:shopId/products', () => {
    it('should return products for a shop (or empty)', async () => {
      const res = await axios.get('/api/shops/fake-shop-id/products');
      // May return empty array or 404 depending on implementation
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('GET /api/shops/:shopId/reviews', () => {
    it('should return reviews (possibly empty)', async () => {
      const res = await axios.get('/api/shops/fake-shop-id/reviews');
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('POST /api/shops/reviews', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.post('/api/shops/reviews', {
        shopId: 'test',
        rating: 5,
        comment: 'Great shop!',
      });
      expect(res.status).toBe(401);
    });

    it('should reject incomplete review data', async () => {
      if (!userToken) return;
      const res = await axios.post(
        '/api/shops/reviews',
        { rating: 5 }, // missing shopId
        { headers: authHeaders(userToken) },
      );
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });
});
