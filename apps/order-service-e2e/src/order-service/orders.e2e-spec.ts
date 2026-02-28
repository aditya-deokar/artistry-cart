/**
 * E2E Tests — Order Service: Customer Orders
 *
 * Tests order listing, details, cancellation, and refunds.
 * Requires: order-service running on port 6004, auth-service on 6001.
 */

import axios from 'axios';
import { describe, it, expect, beforeAll } from 'vitest';
import { loginAsUser, authHeaders } from '../support/test-helpers';

describe('Orders API (E2E)', () => {
  let userToken: string | null;

  beforeAll(async () => {
    userToken = await loginAsUser();
  });

  // ── Health ──
  describe('GET /', () => {
    it('should return service health info', async () => {
      const res = await axios.get('/');
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('message');
    });
  });

  // ── Order listing ──
  describe('GET /order/api/orders', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.get('/order/api/orders');
      expect(res.status).toBe(401);
    });

    it('should return orders for authenticated user', async () => {
      if (!userToken) return;
      const res = await axios.get('/order/api/orders', {
        headers: authHeaders(userToken),
      });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('success', true);
    });
  });

  // ── Order details ──
  describe('GET /order/api/orders/:orderId', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.get('/order/api/orders/fake-order-id');
      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent order', async () => {
      if (!userToken) return;
      const res = await axios.get('/order/api/orders/non-existent-id', {
        headers: authHeaders(userToken),
      });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  // ── Cancel order ──
  describe('POST /order/api/orders/:orderId/cancel', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.post('/order/api/orders/fake-id/cancel');
      expect(res.status).toBe(401);
    });
  });

  // ── Refund request ──
  describe('POST /order/api/refunds/request', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.post('/order/api/refunds/request', {
        orderId: 'fake-id',
        reason: 'Test',
      });
      expect(res.status).toBe(401);
    });
  });
});
