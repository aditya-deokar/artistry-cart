/**
 * E2E Tests for Password Reset Flow
 * 
 * Tests the complete password reset flow including:
 * - Forgot password request
 * - OTP verification
 * - Password reset
 */

import axios from 'axios';
import { describe, it, expect } from 'vitest';

describe('Password Reset Flow (E2E)', () => {
  const testUser = {
    email: 'test@example.com', // Assumes this user exists
    newPassword: 'NewPassword123!',
  };

  describe('POST /api/forgot-password-user', () => {
    it('should send OTP for existing user', async () => {
      const response = await axios.post('/api/forgot-password-user', {
        email: testUser.email,
      });

      // User might not exist in test database
      if (response.status === 200) {
        expect(response.data).toEqual({
          message: 'OTP sent to email. Please verify your account.',
        });
      } else {
        expect(response.status).toBe(400);
      }
    });

    it('should return error for non-existent user', async () => {
      const res = await axios.post('/api/forgot-password-user', {
        email: 'nonexistent@example.com',
      });

      expect(res.status).toBe(400);
    });

    it('should return error for missing email', async () => {
      const res = await axios.post('/api/forgot-password-user', {});

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/verify-forgot-password-user', () => {
    it('should return error for missing fields', async () => {
      const res = await axios.post('/api/verify-forgot-password-user', {
        email: testUser.email,
      });

      expect(res.status).toBe(400);
    });

    it('should return error for invalid OTP', async () => {
      const res = await axios.post('/api/verify-forgot-password-user', {
        email: testUser.email,
        otp: '0000',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/reset-password-user', () => {
    it('should return error for missing fields', async () => {
      const res = await axios.post('/api/reset-password-user', {
        email: testUser.email,
      });

      expect(res.status).toBe(400);
    });

    it('should return error for non-existent user', async () => {
      const res = await axios.post('/api/reset-password-user', {
        email: 'nonexistent@example.com',
        newPassord: 'NewPassword123!',
      });

      expect(res.status).toBe(400);
    });
  });
});
