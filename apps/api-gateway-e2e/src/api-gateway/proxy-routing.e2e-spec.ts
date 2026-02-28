/**
 * E2E Tests — API Gateway: Proxy Routing
 *
 * Tests that the gateway correctly proxies requests to upstream services.
 * Requires: api-gateway on port 8080 + all upstream services running.
 */

import axios from 'axios';
import { describe, it, expect } from 'vitest';

describe('Proxy Routing (E2E)', () => {
  describe('Auth proxy (/auth)', () => {
    it('should proxy GET /auth/ to auth-service', async () => {
      const res = await axios.get('/auth/');
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('message');
    });

    it('should proxy POST /auth/api/login-user to auth-service', async () => {
      const res = await axios.post('/auth/api/login-user', {
        email: 'nonexistent@example.com',
        password: 'wrong',
      });
      // Auth service should respond (401 or 400), not a gateway error
      expect(res.status).toBeLessThan(500);
    });
  });

  describe('Product proxy (/product)', () => {
    it('should proxy GET /product/ to product-service', async () => {
      const res = await axios.get('/product/');
      expect(res.status).toBe(200);
    });

    it('should proxy GET /product/api/products to product-service', async () => {
      const res = await axios.get('/product/api/products');
      expect(res.status).toBe(200);
    });
  });

  describe('Order proxy (/order)', () => {
    it('should proxy GET /order/ to order-service', async () => {
      const res = await axios.get('/order/');
      expect(res.status).toBe(200);
    });

    it('should preserve path for order proxy', async () => {
      const res = await axios.get('/order/order/api/orders');
      // Should hit the order-service — either 401 (no auth) or proxied response
      expect(res.status).toBeLessThan(502);
    });
  });

  describe('Recommendation proxy (/recommendation)', () => {
    it('should proxy GET /recommendation/ to recommendation-service', async () => {
      const res = await axios.get('/recommendation/');
      expect(res.status).toBe(200);
    });
  });

  describe('Unknown routes', () => {
    it('should return 404 for unproxied path', async () => {
      const res = await axios.get('/nonexistent-service/api/test');
      expect(res.status).toBe(404);
    });

    it('should return gateway health on /gateway-health', async () => {
      const res = await axios.get('/gateway-health');
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('message', 'Welcome to api-gateway!');
    });
  });
});
