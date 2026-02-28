/**
 * E2E Tests — Product Service: Products API
 *
 * Tests product CRUD, public listing, and seller product management.
 * Requires: product-service running on port 6002, auth-service on 6001.
 */

import axios from 'axios';
import { describe, it, expect, beforeAll } from 'vitest';
import { loginAsSeller, loginAsUser, authHeaders } from '../support/test-helpers';

describe('Products API (E2E)', () => {
  let sellerToken: string | null;
  let userToken: string | null;

  beforeAll(async () => {
    sellerToken = await loginAsSeller();
    userToken = await loginAsUser();
  });

  // ── Health ──
  describe('GET /', () => {
    it('should return service health info', async () => {
      const res = await axios.get('/');
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('status', 'healthy');
      expect(res.data).toHaveProperty('endpoints');
    });
  });

  // ── Public product listing ──
  describe('GET /api/products', () => {
    it('should return product list (public)', async () => {
      const res = await axios.get('/api/products');
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('success', true);
    });

    it('should support pagination', async () => {
      const res = await axios.get('/api/products?page=1&limit=5');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/product/:slug', () => {
    it('should return 404 for non-existent slug', async () => {
      const res = await axios.get('/api/product/non-existent-slug-12345');
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /api/categories', () => {
    it('should return categories list', async () => {
      const res = await axios.get('/api/categories');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/products/by-ids', () => {
    it('should return empty when no IDs given', async () => {
      const res = await axios.get('/api/products/by-ids');
      expect(res.status).toBe(200);
    });
  });

  // ── Coupon validation ──
  describe('POST /api/coupon/validate', () => {
    it('should reject invalid coupon code', async () => {
      const res = await axios.post('/api/coupon/validate', {
        code: 'INVALID_CODE_XYZ',
        productId: 'non-existent',
      });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  // ── Seller routes (authenticated) ──
  describe('GET /api/seller/products', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.get('/api/seller/products');
      expect(res.status).toBe(401);
    });

    it('should return seller products with auth', async () => {
      if (!sellerToken) return;
      const res = await axios.get('/api/seller/products', {
        headers: authHeaders(sellerToken),
      });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('success', true);
    });
  });

  describe('GET /api/seller/products/summary', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.get('/api/seller/products/summary');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/products', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.post('/api/products', { title: 'Test' });
      expect(res.status).toBe(401);
    });

    it('should reject incomplete product data with auth', async () => {
      if (!sellerToken) return;
      const res = await axios.post(
        '/api/products',
        { title: '' },
        { headers: authHeaders(sellerToken) },
      );
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('PUT /api/products/:productId', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.put('/api/products/fake-id', {});
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/products/:productId', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.delete('/api/products/fake-id');
      expect(res.status).toBe(401);
    });
  });

  // ── 404 catch-all ──
  describe('unknown route', () => {
    it('should return 404 for unknown path', async () => {
      const res = await axios.get('/api/does-not-exist');
      expect(res.status).toBe(404);
    });
  });
});
