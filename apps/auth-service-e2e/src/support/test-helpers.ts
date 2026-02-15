/**
 * E2E Test Helpers
 * 
 * Shared utilities for E2E tests.
 */

import axios from 'axios';

export interface TestUser {
  name: string;
  email: string;
  password: string;
  id?: string;
}

export interface TestSeller {
  name: string;
  email: string;
  password: string;
  phone_number: string;
  country: string;
  id?: string;
}

/**
 * Generate a unique test email
 */
export function generateTestEmail(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}

/**
 * Create a test user object with unique email
 */
export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    name: 'Test User',
    email: generateTestEmail('user'),
    password: 'TestPassword123!',
    ...overrides,
  };
}

/**
 * Create a test seller object with unique email
 */
export function createTestSeller(overrides: Partial<TestSeller> = {}): TestSeller {
  return {
    name: 'Test Seller',
    email: generateTestEmail('seller'),
    password: 'SellerPassword123!',
    phone_number: '+1234567890',
    country: 'US',
    ...overrides,
  };
}

/**
 * Login a user and return the access token
 */
export async function loginUser(email: string, password: string): Promise<string | null> {
  try {
    const response = await axios.post('/api/login-user', { email, password });
    const cookies = response.headers['set-cookie'];
    if (cookies) {
      const accessCookie = cookies.find((c: string) => c.startsWith('access_token='));
      if (accessCookie) {
        return accessCookie.split(';')[0].split('=')[1];
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Login a seller and return the access token
 */
export async function loginSeller(email: string, password: string): Promise<string | null> {
  try {
    const response = await axios.post('/api/login-seller', { email, password });
    const cookies = response.headers['set-cookie'];
    if (cookies) {
      const accessCookie = cookies.find((c: string) => c.startsWith('access_token='));
      if (accessCookie) {
        return accessCookie.split(';')[0].split('=')[1];
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Create authorization headers from access token
 */
export function authHeaders(accessToken: string): { Cookie: string } {
  return {
    Cookie: `access_token=${accessToken}`,
  };
}

/**
 * Wait for a specified number of milliseconds
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extract OTP from mock email (for testing purposes)
 * In a real scenario, you would integrate with an email testing service
 */
export function extractOTPFromEmail(emailContent: string): string | null {
  const otpMatch = emailContent.match(/\b\d{4}\b/);
  return otpMatch ? otpMatch[0] : null;
}

/**
 * Generate a random 4-digit OTP (for testing)
 */
export function generateTestOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Clean up test data (to be called after tests)
 */
export async function cleanupTestData(userIds: string[]): Promise<void> {
  // This would typically call a cleanup endpoint or directly delete from database
  // Implementation depends on your test infrastructure
  console.log(`Cleaning up test data for users: ${userIds.join(', ')}`);
}
