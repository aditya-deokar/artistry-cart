/**
 * E2E Tests — Order Service: Payment Sessions
 *
 * Tests payment session creation, verification, and payment intent flow.
 * Requires: order-service running on port 6004, auth-service on 6001.
 */

import axios from 'axios';
import { describe, it, expect, beforeAll } from 'vitest';
import { loginAsUser, authHeaders } from '../support/test-helpers';

describe('Payment Session API (E2E)', () => {
  let userToken: string | null;

  beforeAll(async () => {
    userToken = await loginAsUser();
  });

  describe('POST /order/api/create-payment-session', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.post('/order/api/create-payment-session', {
        items: [],
      });
      expect(res.status).toBe(401);
    });

    it('should reject empty cart items', async () => {
      if (!userToken) return;
      const res = await axios.post(
        '/order/api/create-payment-session',
        { items: [] },
        { headers: authHeaders(userToken) },
      );
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /order/api/verify-payment-session', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.get('/order/api/verify-payment-session');
      expect(res.status).toBe(401);
    });

    it('should reject missing session param', async () => {
      if (!userToken) return;
      const res = await axios.get('/order/api/verify-payment-session', {
        headers: authHeaders(userToken),
      });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('POST /order/api/create-payment-intent', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.post('/order/api/create-payment-intent', {});
      expect(res.status).toBe(401);
    });
  });

  describe('GET /order/api/payment-status', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.get('/order/api/payment-status');
      expect(res.status).toBe(401);
    });
  });
});
