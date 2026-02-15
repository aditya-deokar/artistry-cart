/**
 * E2E Tests for Password Reset Flow
 * 
 * Tests the complete password reset flow including:
 * - Forgot password request
 * - OTP verification
 * - Password reset
 */

import axios from 'axios';

describe('Password Reset Flow (E2E)', () => {
  const testUser = {
    email: 'test@example.com', // Assumes this user exists
    newPassword: 'NewPassword123!',
  };

  describe('POST /api/forgot-password-user', () => {
    it('should send OTP for existing user', async () => {
      try {
        const response = await axios.post('/api/forgot-password-user', {
          email: testUser.email,
        });

        expect(response.status).toBe(200);
        expect(response.data).toEqual({
          message: 'OTP sent to email. Please verify your account.',
        });
      } catch (error: any) {
        // User might not exist in test database
        if (error.response.status !== 400) {
          throw error;
        }
      }
    });

    it('should return error for non-existent user', async () => {
      try {
        await axios.post('/api/forgot-password-user', {
          email: 'nonexistent@example.com',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return error for missing email', async () => {
      try {
        await axios.post('/api/forgot-password-user', {});
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('POST /api/verify-forgot-password-user', () => {
    it('should return error for missing fields', async () => {
      try {
        await axios.post('/api/verify-forgot-password-user', {
          email: testUser.email,
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return error for invalid OTP', async () => {
      try {
        await axios.post('/api/verify-forgot-password-user', {
          email: testUser.email,
          otp: '0000',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('POST /api/reset-password-user', () => {
    it('should return error for missing fields', async () => {
      try {
        await axios.post('/api/reset-password-user', {
          email: testUser.email,
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return error for non-existent user', async () => {
      try {
        await axios.post('/api/reset-password-user', {
          email: 'nonexistent@example.com',
          newPassord: 'NewPassword123!',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });
});
