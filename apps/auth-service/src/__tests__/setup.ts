/**
 * Test Setup File
 * 
 * Global configuration for Vitest tests in the auth service.
 * This file runs before each test file.
 */

import { expect, vi } from 'vitest';

// Extend Vitest matchers
expect.extend({
  toBeValidJWT(received: string) {
    const parts = received.split('.');
    const pass = parts.length === 3 && parts.every(part => part.length > 0);
    return {
      pass,
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid JWT format`,
    };
  },
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    return {
      pass,
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid email`,
    };
  },
});

// Mock environment variables for testing
process.env.ACCESS_TOKEN_SECRET = 'test-access-token-secret-key-for-testing';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-token-secret-key-for-testing';
process.env.NODE_ENV = 'test';
process.env.STRIPE_SECRETE_KEY = 'sk_test_dummy_stripe_key';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Suppress console.log in tests unless DEBUG is set
if (!process.env.DEBUG) {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
}
