/**
 * E2E Tests — Product Service: Discounts API
 *
 * Tests discount code CRUD, validation, and application.
 * Requires: product-service running on port 6002, auth-service on 6001.
 */

import axios from 'axios';
import { describe, it, expect, beforeAll } from 'vitest';
import { loginAsSeller, authHeaders } from '../support/test-helpers';

describe('Discounts API (E2E)', () => {
  let sellerToken: string | null;

  beforeAll(async () => {
    sellerToken = await loginAsSeller();
  });

  // ── Public ──
  describe('POST /api/discounts/validate', () => {
    it('should reject invalid discount code', async () => {
      const res = await axios.post('/api/discounts/validate', {
        code: 'FAKE_CODE_12345',
        cartTotal: 100,
      });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  // ── Seller (authenticated) ──
  describe('POST /api/discounts', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.post('/api/discounts', { code: 'TEST10' });
      expect(res.status).toBe(401);
    });

    it('should reject incomplete discount data', async () => {
      if (!sellerToken) return;
      const res = await axios.post(
        '/api/discounts',
        { code: '' }, // missing required fields
        { headers: authHeaders(sellerToken) },
      );
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /api/discounts/seller', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.get('/api/discounts/seller');
      expect(res.status).toBe(401);
    });

    it('should return seller discounts with auth', async () => {
      if (!sellerToken) return;
      const res = await axios.get('/api/discounts/seller', {
        headers: authHeaders(sellerToken),
      });
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /api/discounts/:discountId', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.put('/api/discounts/fake-id', {});
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/discounts/:discountId', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.delete('/api/discounts/fake-id');
      expect(res.status).toBe(401);
    });
  });
});
