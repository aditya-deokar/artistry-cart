/**
 * Auth Test Helpers
 *
 * Utilities for creating mock JWT tokens and auth headers for
 * integration tests (Supertest).
 */
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || 'test-access-token-secret-key-for-testing';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'test-refresh-token-secret-key-for-testing';

interface TokenPayload {
  id: string;
  role: 'user' | 'seller';
}

/**
 * Create a signed access token for testing.
 */
export function createMockAccessToken(payload: TokenPayload, expiresIn = '15m'): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn });
}

/**
 * Create a signed refresh token for testing.
 */
export function createMockRefreshToken(payload: TokenPayload, expiresIn = '7d'): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn });
}

/**
 * Create an expired access token for testing auth failures.
 */
export function createExpiredAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '0s' });
}

/**
 * Create a token signed with a wrong secret for testing invalid tokens.
 */
export function createInvalidAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, 'wrong-secret', { expiresIn: '15m' });
}

/**
 * Build a Cookie header string for Supertest requests.
 *
 * Usage:
 * ```ts
 * const token = createMockAccessToken({ id: 'user-123', role: 'user' });
 * await request(app)
 *   .get('/api/me')
 *   .set('Cookie', authCookies(token))
 *   .expect(200);
 * ```
 */
export function authCookies(accessToken: string, refreshToken?: string): string[] {
  const cookies = [`access_token=${accessToken}`];
  if (refreshToken) {
    cookies.push(`refresh_token=${refreshToken}`);
  }
  return cookies;
}

/**
 * Build an Authorization header for Bearer token auth.
 */
export function authHeaders(accessToken: string): { Authorization: string } {
  return { Authorization: `Bearer ${accessToken}` };
}
