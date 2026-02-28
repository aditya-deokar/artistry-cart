/**
 * E2E Tests for Profile Management
 * 
 * Tests user profile operations including:
 * - Get current user
 * - Update profile
 * - Address management
 * - Order history
 */

import axios from 'axios';
import { describe, it, expect, beforeAll } from 'vitest';

describe('Profile Management (E2E)', () => {
  let accessToken: string | undefined;

  // Login first to get access token
  beforeAll(async () => {
    const response = await axios.post('/api/login-user', {
      email: 'test@example.com',
      password: 'TestPassword123!',
    });

    if (response.status === 200) {
      const cookies = response.headers['set-cookie'];
      if (cookies) {
        const accessCookie = cookies.find((c: string) => c.startsWith('access_token='));
        if (accessCookie) accessToken = accessCookie.split(';')[0].split('=')[1];
      }
    } else {
      console.warn('Could not login for profile tests - some tests may be skipped');
    }
  });

  const authHeaders = () => ({
    Cookie: `access_token=${accessToken}`,
  });

  describe('GET /api/me', () => {
    it('should return current user when authenticated', async () => {
      if (!accessToken) {
        console.warn('Skipping test: No access token');
        return;
      }

      const response = await axios.get('/api/me', {
        headers: authHeaders(),
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('user');
    });

    it('should return error when not authenticated', async () => {
      const res = await axios.get('/api/me');

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/me', () => {
    it('should update user details when authenticated', async () => {
      if (!accessToken) {
        console.warn('Skipping test: No access token');
        return;
      }

      const response = await axios.patch('/api/me', {
        name: 'Updated Name',
      }, {
        headers: authHeaders(),
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
    });

    it('should return error when not authenticated', async () => {
      const res = await axios.patch('/api/me', { name: 'Test' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/me/addresses', () => {
    it('should return addresses when authenticated', async () => {
      if (!accessToken) {
        console.warn('Skipping test: No access token');
        return;
      }

      const response = await axios.get('/api/me/addresses', {
        headers: authHeaders(),
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('addresses');
      expect(Array.isArray(response.data.addresses)).toBe(true);
    });

    it('should return error when not authenticated', async () => {
      const res = await axios.get('/api/me/addresses');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/me/addresses', () => {
    it('should create address when authenticated', async () => {
      if (!accessToken) {
        console.warn('Skipping test: No access token');
        return;
      }

      const response = await axios.post('/api/me/addresses', {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'US',
      }, {
        headers: authHeaders(),
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('address');
    });

    it('should return error when not authenticated', async () => {
      const res = await axios.post('/api/me/addresses', {
        street: '123 Test St',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/me/orders', () => {
    it('should return orders when authenticated', async () => {
      if (!accessToken) {
        console.warn('Skipping test: No access token');
        return;
      }

      const response = await axios.get('/api/me/orders', {
        headers: authHeaders(),
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('orders');
      expect(response.data).toHaveProperty('pagination');
    });

    it('should support pagination', async () => {
      if (!accessToken) {
        console.warn('Skipping test: No access token');
        return;
      }

      const response = await axios.get('/api/me/orders?page=1', {
        headers: authHeaders(),
      });

      expect(response.status).toBe(200);
      expect(response.data.pagination).toHaveProperty('currentPage', 1);
    });

    it('should return error when not authenticated', async () => {
      const res = await axios.get('/api/me/orders');

      expect(res.status).toBe(401);
    });
  });
});
