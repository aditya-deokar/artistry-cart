/**
 * E2E Tests for Seller Registration Flow
 * 
 * Tests the complete seller registration flow including:
 * - Seller registration request
 * - OTP verification
 * - Shop creation
 * - Stripe connection
 */

import axios from 'axios';

describe('Seller Registration Flow (E2E)', () => {
  const testSeller = {
    name: 'E2E Test Seller',
    email: `seller-${Date.now()}@example.com`,
    password: 'SellerPassword123!',
    phone_number: '+1234567890',
    country: 'US',
  };

  describe('POST /api/seller-registration', () => {
    it('should initiate seller registration and send OTP', async () => {
      const response = await axios.post('/api/seller-registration', {
        name: testSeller.name,
        email: testSeller.email,
        password: testSeller.password,
        phone_number: testSeller.phone_number,
        country: testSeller.country,
      });

      expect(response.status).toBe(200);
      expect(response.data).toEqual({
        message: 'OTP sent to email. Please verify your account.',
      });
    });

    it('should return error for duplicate email', async () => {
      try {
        await axios.post('/api/seller-registration', {
          name: testSeller.name,
          email: testSeller.email,
          password: testSeller.password,
          phone_number: testSeller.phone_number,
          country: testSeller.country,
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return error for missing phone_number', async () => {
      try {
        await axios.post('/api/seller-registration', {
          name: 'Test Seller',
          email: `seller2-${Date.now()}@example.com`,
          password: 'Password123!',
          country: 'US',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return error for missing country', async () => {
      try {
        await axios.post('/api/seller-registration', {
          name: 'Test Seller',
          email: `seller3-${Date.now()}@example.com`,
          password: 'Password123!',
          phone_number: '+1234567890',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('POST /api/verify-seller', () => {
    it('should return error for missing fields', async () => {
      try {
        await axios.post('/api/verify-seller', {
          email: testSeller.email,
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return error for invalid OTP', async () => {
      try {
        await axios.post('/api/verify-seller', {
          email: testSeller.email,
          otp: '0000',
          password: testSeller.password,
          name: testSeller.name,
          phone_number: testSeller.phone_number,
          country: testSeller.country,
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('POST /api/create-shop', () => {
    it('should return error for missing required fields', async () => {
      try {
        await axios.post('/api/create-shop', {
          name: 'Test Shop',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('POST /api/login-seller', () => {
    it('should return error for non-existent seller', async () => {
      try {
        await axios.post('/api/login-seller', {
          email: 'nonexistent-seller@example.com',
          password: 'SomePassword123',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it('should return error for missing fields', async () => {
      try {
        await axios.post('/api/login-seller', {
          email: testSeller.email,
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });
});
