/**
 * E2E Tests — Product Service: Offers API
 *
 * Tests public offers listing, category deals, and seasonal/limited-time offers.
 * Requires: product-service running on port 6002.
 */

import axios from 'axios';
import { describe, it, expect } from 'vitest';

describe('Offers API (E2E)', () => {
  describe('GET /api/offers', () => {
    it('should return offers page data', async () => {
      const res = await axios.get('/api/offers');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/offers/user', () => {
    it('should return user offers', async () => {
      const res = await axios.get('/api/offers/user');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/offers/category/:category', () => {
    it('should return deals by category', async () => {
      const res = await axios.get('/api/offers/category/art');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/offers/limited-time', () => {
    it('should return limited-time offers', async () => {
      const res = await axios.get('/api/offers/limited-time');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/offers/seasonal', () => {
    it('should return seasonal offers', async () => {
      const res = await axios.get('/api/offers/seasonal');
      expect(res.status).toBe(200);
    });
  });
});
