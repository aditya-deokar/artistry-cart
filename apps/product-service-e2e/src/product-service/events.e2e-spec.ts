/**
 * E2E Tests — Product Service: Events API
 *
 * Tests event listing, creation, and seller event management.
 * Requires: product-service running on port 6002, auth-service on 6001.
 */

import axios from 'axios';
import { describe, it, expect, beforeAll } from 'vitest';
import { loginAsSeller, loginAsUser, authHeaders } from '../support/test-helpers';

describe('Events API (E2E)', () => {
  let sellerToken: string | null;
  let userToken: string | null;

  beforeAll(async () => {
    sellerToken = await loginAsSeller();
    userToken = await loginAsUser();
  });

  // ── Public ──
  describe('GET /api/events', () => {
    it('should return events list', async () => {
      const res = await axios.get('/api/events');
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('success', true);
    });
  });

  describe('GET /api/events/:eventId', () => {
    it('should return 404 for non-existent event', async () => {
      const res = await axios.get('/api/events/non-existent-event-id');
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /api/events/type/:eventType', () => {
    it('should filter events by type', async () => {
      const res = await axios.get('/api/events/type/SALE');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/events/shop/:shopId', () => {
    it('should return events for a shop', async () => {
      const res = await axios.get('/api/events/shop/fake-shop-id');
      expect(res.status).toBe(200);
    });
  });

  // ── Seller (authenticated) ──
  describe('POST /api/events', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.post('/api/events', { title: 'Test Event' });
      expect(res.status).toBe(401);
    });

    it('should reject incomplete event data', async () => {
      if (!sellerToken) return;
      const res = await axios.post(
        '/api/events',
        { title: '' },
        { headers: authHeaders(sellerToken) },
      );
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /api/events/seller/events', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.get('/api/events/seller/events');
      expect(res.status).toBe(401);
    });

    it('should return seller events with auth', async () => {
      if (!sellerToken) return;
      const res = await axios.get('/api/events/seller/events', {
        headers: authHeaders(sellerToken),
      });
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /api/events/:eventId', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.put('/api/events/fake-id', { title: 'Updated' });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/events/:eventId', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.delete('/api/events/fake-id');
      expect(res.status).toBe(401);
    });
  });
});
