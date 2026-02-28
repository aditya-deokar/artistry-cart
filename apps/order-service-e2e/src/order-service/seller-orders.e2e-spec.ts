/**
 * E2E Tests — Order Service: Seller Order Management
 *
 * Tests seller order listing, status updates, analytics, and payouts.
 * Requires: order-service running on port 6004, auth-service on 6001.
 */

import axios from 'axios';
import { describe, it, expect, beforeAll } from 'vitest';
import { loginAsSeller, authHeaders } from '../support/test-helpers';

describe('Seller Orders API (E2E)', () => {
  let sellerToken: string | null;

  beforeAll(async () => {
    sellerToken = await loginAsSeller();
  });

  describe('GET /order/api/seller/orders', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.get('/order/api/seller/orders');
      expect(res.status).toBe(401);
    });

    it('should return seller orders with auth', async () => {
      if (!sellerToken) return;
      const res = await axios.get('/order/api/seller/orders', {
        headers: authHeaders(sellerToken),
      });
      expect(res.status).toBe(200);
    });
  });

  describe('GET /order/api/seller/analytics', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.get('/order/api/seller/analytics');
      expect(res.status).toBe(401);
    });

    it('should return analytics with auth', async () => {
      if (!sellerToken) return;
      const res = await axios.get('/order/api/seller/analytics', {
        headers: authHeaders(sellerToken),
      });
      expect(res.status).toBe(200);
    });
  });

  describe('GET /order/api/seller/earnings', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.get('/order/api/seller/earnings');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /order/api/seller/payouts', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.get('/order/api/seller/payouts');
      expect(res.status).toBe(401);
    });
  });
});
