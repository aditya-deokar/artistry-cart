/**
 * E2E Tests for User Registration Flow
 * 
 * Tests the complete user registration flow including:
 * - Registration request
 * - OTP verification
 * - User creation
 */

import axios from 'axios';
import { describe, it, expect } from 'vitest';

describe('User Registration Flow (E2E)', () => {
  const testUser = {
    name: 'E2E Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
  };

  describe('POST /api/user-registration', () => {
    it('should initiate registration and send OTP', async () => {
      const response = await axios.post('/api/user-registration', {
        name: testUser.name,
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.data).toEqual({
        message: 'OTP sent to email. Please verify your account.',
      });
    });

    it('should return error for duplicate email', async () => {
      const res = await axios.post('/api/user-registration', {
        name: testUser.name,
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(400);
    });

    it('should return error for invalid email format', async () => {
      const res = await axios.post('/api/user-registration', {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
      });

      expect(res.status).toBe(400);
    });

    it('should return error for missing fields', async () => {
      const res = await axios.post('/api/user-registration', {
        name: 'Test User',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/verify-user', () => {
    it('should return error for missing fields', async () => {
      const res = await axios.post('/api/verify-user', {
        email: testUser.email,
      });

      expect(res.status).toBe(400);
    });

    it('should return error for invalid OTP', async () => {
      const res = await axios.post('/api/verify-user', {
        email: testUser.email,
        otp: '0000',
        password: testUser.password,
        name: testUser.name,
      });

      expect(res.status).toBe(400);
    });
  });
});
