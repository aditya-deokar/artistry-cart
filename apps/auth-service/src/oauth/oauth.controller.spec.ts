/**
 * Unit Tests for OAuth Controller
 * 
 * Tests for Google, GitHub, and Facebook OAuth authentication flows.
 */

import { Request, Response, NextFunction } from 'express';
import {
  googleLogin,
  googleCallback,
  githubLogin,
  githubCallback,
  facebookLogin,
  facebookCallback,
  getOAuthStatus,
} from './oauth.controller';
import { prismaMock, createMockUser, resetPrismaMock } from '../__tests__/mocks/prisma.mock';

// Mock dependencies
jest.mock('../../../../packages/libs/prisma', () => ({
  __esModule: true,
  default: prismaMock,
}));
jest.mock('./providers', () => ({
  getGoogleProvider: jest.fn().mockResolvedValue({
    createAuthorizationURL: jest.fn().mockReturnValue(new URL('https://accounts.google.com/oauth?state=test')),
    validateAuthorizationCode: jest.fn().mockResolvedValue({
      accessToken: () => 'mock-access-token',
    }),
  }),
  getGitHubProvider: jest.fn().mockResolvedValue({
    createAuthorizationURL: jest.fn().mockReturnValue(new URL('https://github.com/login/oauth?state=test')),
    validateAuthorizationCode: jest.fn().mockResolvedValue({
      accessToken: () => 'mock-access-token',
    }),
  }),
  getFacebookProvider: jest.fn().mockResolvedValue({
    createAuthorizationURL: jest.fn().mockReturnValue(new URL('https://facebook.com/oauth?state=test')),
    validateAuthorizationCode: jest.fn().mockResolvedValue({
      accessToken: () => 'mock-access-token',
    }),
  }),
  generateState: jest.fn().mockResolvedValue('test-state'),
  generateCodeVerifier: jest.fn().mockResolvedValue('test-code-verifier'),
}));
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
}));

// Mock undici fetch
const mockFetch = jest.fn();
jest.mock('undici', () => ({
  fetch: (...args: any[]) => mockFetch(...args),
}));

// Helper to create mock request/response/next
const mockRequest = (data: any = {}): any => ({
  body: {},
  cookies: {},
  headers: {},
  params: {},
  query: {},
  ...data,
});

const mockResponse = (): any => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('OAuth Controller', () => {
  beforeEach(() => {
    resetPrismaMock();
    jest.clearAllMocks();
    mockNext.mockClear();
    mockFetch.mockReset();
  });

  describe('getOAuthStatus', () => {
    it('should return OAuth provider status', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await getOAuthStatus(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        providers: expect.objectContaining({
          google: expect.any(Boolean),
          github: expect.any(Boolean),
          facebook: expect.any(Boolean),
        }),
      });
    });
  });

  describe('googleLogin', () => {
    it('should redirect to Google OAuth URL with state cookie', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await googleLogin(req, res, mockNext);

      expect(res.cookie).toHaveBeenCalledWith(
        'oauth_state',
        'test-state',
        expect.objectContaining({
          httpOnly: true,
          path: '/',
        })
      );
      expect(res.redirect).toHaveBeenCalled();
    });

    it('should redirect with error on configuration error', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const { getGoogleProvider } = require('./providers');
      getGoogleProvider.mockRejectedValueOnce(new Error('Config error'));

      await googleLogin(req, res, mockNext);

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining('error=oauth_error')
      );
    });
  });

  describe('googleCallback', () => {
    it('should handle OAuth denied error', async () => {
      const req = mockRequest({
        query: { error: 'access_denied' },
        cookies: { oauth_state: 'test-state' },
      });
      const res = mockResponse();

      await googleCallback(req, res, mockNext);

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining('error=oauth_denied')
      );
    });

    it('should handle invalid code', async () => {
      const req = mockRequest({
        query: { state: 'test-state' },
        cookies: { oauth_state: 'test-state' },
      });
      const res = mockResponse();

      await googleCallback(req, res, mockNext);

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining('error=oauth_error')
      );
    });

    it('should handle CSRF validation failure', async () => {
      const req = mockRequest({
        query: { code: 'test-code', state: 'wrong-state' },
        cookies: { oauth_state: 'test-state' },
      });
      const res = mockResponse();

      await googleCallback(req, res, mockNext);

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining('error=csrf_error')
      );
    });

    it('should create new user on successful OAuth', async () => {
      const req = mockRequest({
        query: { code: 'test-code', state: 'test-state' },
        cookies: { 
          oauth_state: 'test-state',
          oauth_code_verifier: 'test-verifier',
        },
      });
      const res = mockResponse();

      // Mock Google API response
      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          id: 'google-123',
          email: 'test@gmail.com',
          name: 'Test User',
          picture: 'https://example.com/avatar.jpg',
        }),
      });

      prismaMock.users.findUnique.mockResolvedValueOnce(null);
      prismaMock.users.create.mockResolvedValueOnce(createMockUser({
        email: 'test@gmail.com',
        oauthProvider: 'google',
      }));

      await googleCallback(req, res, mockNext);

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining('login=success')
      );
    });

    it('should update existing user on OAuth login', async () => {
      const req = mockRequest({
        query: { code: 'test-code', state: 'test-state' },
        cookies: { 
          oauth_state: 'test-state',
          oauth_code_verifier: 'test-verifier',
        },
      });
      const res = mockResponse();

      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          id: 'google-123',
          email: 'existing@example.com',
          name: 'Existing User',
          picture: 'https://example.com/avatar.jpg',
        }),
      });

      const existingUser = createMockUser({
        email: 'existing@example.com',
        oauthProvider: null,
      });
      prismaMock.users.findUnique.mockResolvedValueOnce(existingUser);
      prismaMock.users.update.mockResolvedValueOnce({
        ...existingUser,
        oauthProvider: 'google',
      });

      await googleCallback(req, res, mockNext);

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining('login=success')
      );
    });
  });

  describe('githubLogin', () => {
    it('should redirect to GitHub OAuth URL with state cookie', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await githubLogin(req, res, mockNext);

      expect(res.cookie).toHaveBeenCalledWith(
        'oauth_state',
        'test-state',
        expect.objectContaining({
          httpOnly: true,
          path: '/',
        })
      );
      expect(res.redirect).toHaveBeenCalled();
    });

    it('should redirect with error on configuration error', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const { getGitHubProvider } = require('./providers');
      getGitHubProvider.mockRejectedValueOnce(new Error('Config error'));

      await githubLogin(req, res, mockNext);

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining('error=oauth_error')
      );
    });
  });

  describe('githubCallback', () => {
    it('should handle OAuth denied error', async () => {
      const req = mockRequest({
        query: { error: 'access_denied' },
        cookies: { oauth_state: 'test-state' },
      });
      const res = mockResponse();

      await githubCallback(req, res, mockNext);

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining('error=oauth_denied')
      );
    });

    it('should handle CSRF validation failure', async () => {
      const req = mockRequest({
        query: { code: 'test-code', state: 'wrong-state' },
        cookies: { oauth_state: 'test-state' },
      });
      const res = mockResponse();

      await githubCallback(req, res, mockNext);

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining('error=csrf_error')
      );
    });

    it('should create new user on successful OAuth', async () => {
      const req = mockRequest({
        query: { code: 'test-code', state: 'test-state' },
        cookies: { oauth_state: 'test-state' },
      });
      const res = mockResponse();

      // Mock GitHub API responses
      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          json: async () => ({
            id: 12345,
            login: 'testuser',
            name: 'Test User',
            email: 'test@github.com',
            avatar_url: 'https://github.com/avatar.jpg',
          }),
        });

      prismaMock.users.findUnique.mockResolvedValueOnce(null);
      prismaMock.users.create.mockResolvedValueOnce(createMockUser({
        email: 'test@github.com',
        oauthProvider: 'github',
      }));

      await githubCallback(req, res, mockNext);

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining('login=success')
      );
    });
  });

  describe('facebookLogin', () => {
    it('should redirect to Facebook OAuth URL with state cookie', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await facebookLogin(req, res, mockNext);

      expect(res.cookie).toHaveBeenCalledWith(
        'oauth_state',
        'test-state',
        expect.objectContaining({
          httpOnly: true,
          path: '/',
        })
      );
      expect(res.redirect).toHaveBeenCalled();
    });

    it('should redirect with error on configuration error', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const { getFacebookProvider } = require('./providers');
      getFacebookProvider.mockRejectedValueOnce(new Error('Config error'));

      await facebookLogin(req, res, mockNext);

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining('error=oauth_error')
      );
    });
  });

  describe('facebookCallback', () => {
    it('should handle OAuth denied error', async () => {
      const req = mockRequest({
        query: { error: 'access_denied' },
        cookies: { oauth_state: 'test-state' },
      });
      const res = mockResponse();

      await facebookCallback(req, res, mockNext);

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining('error=oauth_denied')
      );
    });

    it('should handle CSRF validation failure', async () => {
      const req = mockRequest({
        query: { code: 'test-code', state: 'wrong-state' },
        cookies: { oauth_state: 'test-state' },
      });
      const res = mockResponse();

      await facebookCallback(req, res, mockNext);

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining('error=csrf_error')
      );
    });

    it('should create new user on successful OAuth', async () => {
      const req = mockRequest({
        query: { code: 'test-code', state: 'test-state' },
        cookies: { oauth_state: 'test-state' },
      });
      const res = mockResponse();

      // Mock Facebook Graph API response
      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          id: 'fb-123',
          name: 'Test User',
          email: 'test@facebook.com',
          picture: {
            data: {
              url: 'https://facebook.com/avatar.jpg',
              is_silhouette: false,
            },
          },
        }),
      });

      prismaMock.users.findUnique.mockResolvedValueOnce(null);
      prismaMock.users.create.mockResolvedValueOnce(createMockUser({
        email: 'test@facebook.com',
        oauthProvider: 'facebook',
      }));

      await facebookCallback(req, res, mockNext);

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining('login=success')
      );
    });
  });
});
