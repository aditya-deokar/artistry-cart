/**
 * E2E Tests for User Login Flow
 * 
 * Tests the complete user login flow including:
 * - Login with credentials
 * - Token refresh
 * - Logout
 * - Protected routes
 */

import axios from 'axios';
import { describe, it, expect } from 'vitest';

describe('User Login Flow (E2E)', () => {
  // Test user credentials (assumes user exists from previous tests or seed data)
  const testUser = {
    email: 'test@example.com',
    password: 'TestPassword123!',
  };

  let accessToken: string | undefined;
  let refreshToken: string | undefined;

  describe('POST /api/login-user', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await axios.post('/api/login-user', {
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('meassage', 'Login successfull!');
      expect(response.data).toHaveProperty('user');
      expect(response.data.user).toHaveProperty('email', testUser.email);

      // Extract tokens from cookies
      const cookies = response.headers['set-cookie'];
      if (cookies) {
        const accessCookie = cookies.find((c: string) => c.startsWith('access_token='));
        const refreshCookie = cookies.find((c: string) => c.startsWith('refresh_token='));
        if (accessCookie) accessToken = accessCookie.split(';')[0].split('=')[1];
        if (refreshCookie) refreshToken = refreshCookie.split(';')[0].split('=')[1];
      }
    });

    it('should return error for invalid credentials', async () => {
      const res = await axios.post('/api/login-user', {
        email: testUser.email,
        password: 'WrongPassword123',
      });

      expect(res.status).toBe(401);
    });

    it('should return error for non-existent user', async () => {
      const res = await axios.post('/api/login-user', {
        email: 'nonexistent@example.com',
        password: 'SomePassword123',
      });

      expect(res.status).toBe(401);
    });

    it('should return error for missing fields', async () => {
      const res = await axios.post('/api/login-user', {
        email: testUser.email,
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/logged-in-user', () => {
    it('should return user data when authenticated', async () => {
      if (!accessToken) {
        console.warn('Skipping test: No access token available');
        return;
      }

      const response = await axios.get('/api/logged-in-user', {
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('user');
    });

    it('should return error when not authenticated', async () => {
      const res = await axios.get('/api/logged-in-user');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/refresh-token', () => {
    it('should refresh tokens with valid refresh token', async () => {
      if (!refreshToken) {
        console.warn('Skipping test: No refresh token available');
        return;
      }

      const response = await axios.post('/api/refresh-token', {}, {
        headers: {
          Cookie: `refresh_token=${refreshToken}`,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('message', 'Tokens refreshed successfully.');
    });

    it('should return error without refresh token', async () => {
      const res = await axios.post('/api/refresh-token');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/logout-user', () => {
    it('should logout successfully', async () => {
      const response = await axios.get('/api/logout-user');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('message', 'Logout successful!');
    });
  });
});
