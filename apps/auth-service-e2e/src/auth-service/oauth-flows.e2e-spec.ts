/**
 * E2E Tests for OAuth Flows
 * 
 * Tests OAuth authentication flows for Google, GitHub, and Facebook.
 */

import axios from 'axios';

describe('OAuth Flows (E2E)', () => {
  describe('GET /api/oauth/status', () => {
    it('should return OAuth provider status', async () => {
      const response = await axios.get('/api/oauth/status');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('providers');
      expect(response.data.providers).toHaveProperty('google');
      expect(response.data.providers).toHaveProperty('github');
      expect(response.data.providers).toHaveProperty('facebook');
    });
  });

  describe('GET /api/oauth/google', () => {
    it('should redirect to Google OAuth', async () => {
      try {
        await axios.get('/api/oauth/google', {
          maxRedirects: 0,
        });
      } catch (error: any) {
        // Expecting a redirect response (3xx)
        expect(error.response.status).toBeGreaterThanOrEqual(300);
        expect(error.response.status).toBeLessThan(400);
        expect(error.response.headers.location).toContain('accounts.google.com');
      }
    });
  });

  describe('GET /api/oauth/github', () => {
    it('should redirect to GitHub OAuth', async () => {
      try {
        await axios.get('/api/oauth/github', {
          maxRedirects: 0,
        });
      } catch (error: any) {
        // Expecting a redirect response (3xx)
        expect(error.response.status).toBeGreaterThanOrEqual(300);
        expect(error.response.status).toBeLessThan(400);
        expect(error.response.headers.location).toContain('github.com');
      }
    });
  });

  describe('GET /api/oauth/facebook', () => {
    it('should redirect to Facebook OAuth', async () => {
      try {
        await axios.get('/api/oauth/facebook', {
          maxRedirects: 0,
        });
      } catch (error: any) {
        // Expecting a redirect response (3xx)
        expect(error.response.status).toBeGreaterThanOrEqual(300);
        expect(error.response.status).toBeLessThan(400);
        expect(error.response.headers.location).toContain('facebook.com');
      }
    });
  });

  describe('GET /api/oauth/google/callback', () => {
    it('should handle missing authorization code', async () => {
      try {
        await axios.get('/api/oauth/google/callback');
        fail('Should have thrown an error');
      } catch (error: any) {
        // Should redirect with error
        expect(error.response.status).toBeGreaterThanOrEqual(300);
        expect(error.response.status).toBeLessThan(400);
        expect(error.response.headers.location).toContain('error');
      }
    });

    it('should handle OAuth denied', async () => {
      try {
        await axios.get('/api/oauth/google/callback?error=access_denied');
        fail('Should have thrown an error');
      } catch (error: any) {
        // Should redirect with error
        expect(error.response.status).toBeGreaterThanOrEqual(300);
        expect(error.response.status).toBeLessThan(400);
        expect(error.response.headers.location).toContain('oauth_denied');
      }
    });
  });

  describe('GET /api/oauth/github/callback', () => {
    it('should handle missing authorization code', async () => {
      try {
        await axios.get('/api/oauth/github/callback');
        fail('Should have thrown an error');
      } catch (error: any) {
        // Should redirect with error
        expect(error.response.status).toBeGreaterThanOrEqual(300);
        expect(error.response.status).toBeLessThan(400);
        expect(error.response.headers.location).toContain('error');
      }
    });
  });

  describe('GET /api/oauth/facebook/callback', () => {
    it('should handle missing authorization code', async () => {
      try {
        await axios.get('/api/oauth/facebook/callback');
        fail('Should have thrown an error');
      } catch (error: any) {
        // Should redirect with error
        expect(error.response.status).toBeGreaterThanOrEqual(300);
        expect(error.response.status).toBeLessThan(400);
        expect(error.response.headers.location).toContain('error');
      }
    });
  });
});
