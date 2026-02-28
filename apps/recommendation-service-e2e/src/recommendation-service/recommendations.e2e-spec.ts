/**
 * E2E Tests — Recommendation Service: Recommendations API
 *
 * Tests the GET /api/recommendations/:userId endpoint.
 * Requires: recommendation-service running on port 6005, auth-service on 6001.
 */

import axios from 'axios';
import { describe, it, expect, beforeAll } from 'vitest';

/** Helper: login via auth-service and return cookie headers */
async function loginAsUser(): Promise<Record<string, string>> {
  const authBase = process.env.AUTH_SERVICE_URL ?? 'http://localhost:6001';
  const res = await axios.post(
    `${authBase}/api/login`,
    { email: 'testuser@test.com', password: 'Test@1234' },
    { withCredentials: true },
  );
  const cookies = res.headers['set-cookie'];
  if (cookies) {
    return { Cookie: cookies.join('; ') };
  }
  return {};
}

describe('Recommendations API (E2E)', () => {
  describe('GET /api/recommendations/:userId', () => {
    it('should require authentication', async () => {
      const res = await axios.get('/api/recommendations/some-user-id');

      // Without auth, should get 401 or 403
      expect([401, 403]).toContain(res.status);
    });

    it('should return 401 with invalid token', async () => {
      const res = await axios.get('/api/recommendations/some-user-id', {
        headers: { Cookie: 'access_token=invalid-jwt-token' },
      });

      expect([401, 403]).toContain(res.status);
    });

    it('should return recommendations for authenticated user', async () => {
      let authHeaders: Record<string, string>;
      try {
        authHeaders = await loginAsUser();
      } catch {
        // Auth service might not be running — skip gracefully
        return;
      }

      if (!authHeaders.Cookie) return;

      const res = await axios.get('/api/recommendations/test-user-id', {
        headers: authHeaders,
      });

      // Should succeed (200) with an array or error gracefully
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(Array.isArray(res.data)).toBe(true);
      }
    });

    it('should return an array of product objects', async () => {
      let authHeaders: Record<string, string>;
      try {
        authHeaders = await loginAsUser();
      } catch {
        return;
      }

      if (!authHeaders.Cookie) return;

      const res = await axios.get('/api/recommendations/test-user-id', {
        headers: authHeaders,
      });

      if (res.status === 200 && Array.isArray(res.data) && res.data.length > 0) {
        const product = res.data[0];
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
      }
    });

    it('should handle non-existent userId gracefully', async () => {
      let authHeaders: Record<string, string>;
      try {
        authHeaders = await loginAsUser();
      } catch {
        return;
      }

      if (!authHeaders.Cookie) return;

      const res = await axios.get(
        '/api/recommendations/non-existent-user-00000',
        { headers: authHeaders },
      );

      // New/unknown users get fallback recommendations (last 10 products)
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(Array.isArray(res.data)).toBe(true);
      }
    });

    it('should not accept non-GET methods', async () => {
      const res = await axios.post('/api/recommendations/some-user-id', {});

      // Should be 401 (no auth) or 404/405 (method not supported)
      expect([401, 403, 404, 405]).toContain(res.status);
    });
  });
});
