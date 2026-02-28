/**
 * E2E Tests — Product Service: Search API
 *
 * Tests live search, full search, suggestions, and entity search.
 * Requires: product-service running on port 6002.
 */

import axios from 'axios';
import { describe, it, expect } from 'vitest';

describe('Search API (E2E)', () => {
  describe('GET /api/search/live', () => {
    it('should return live search results', async () => {
      const res = await axios.get('/api/search/live?q=art');
      expect(res.status).toBe(200);
    });

    it('should handle empty query', async () => {
      const res = await axios.get('/api/search/live');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/search/suggestions', () => {
    it('should return search suggestions', async () => {
      const res = await axios.get('/api/search/suggestions?q=paint');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/search', () => {
    it('should return full search results', async () => {
      const res = await axios.get('/api/search?q=art');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/search/products', () => {
    it('should search products', async () => {
      const res = await axios.get('/api/search/products?q=painting');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/search/events', () => {
    it('should search events', async () => {
      const res = await axios.get('/api/search/events?q=sale');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/search/shops', () => {
    it('should search shops', async () => {
      const res = await axios.get('/api/search/shops?q=gallery');
      expect(res.status).toBe(200);
    });
  });
});
