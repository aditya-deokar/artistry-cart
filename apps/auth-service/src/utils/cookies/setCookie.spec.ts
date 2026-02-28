/**
 * Unit Tests for Cookie Utilities
 * 
 * Tests for HTTP cookie setting functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { Response } from 'express';
import { setCookie } from './setCookie';

describe('Cookie Utilities', () => {
  let mockRes: Partial<Response>;
  let mockCookie: Mock;

  beforeEach(() => {
    mockCookie = vi.fn();
    mockRes = {
      cookie: mockCookie,
    };
    // Reset NODE_ENV for each test
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('setCookie', () => {
    it('should set cookie with correct name and value', () => {
      setCookie(mockRes as Response, 'access_token', 'token123');
      
      expect(mockCookie).toHaveBeenCalledWith(
        'access_token',
        'token123',
        expect.any(Object)
      );
    });

    it('should set cookie with HTTPOnly flag', () => {
      setCookie(mockRes as Response, 'access_token', 'token123');
      
      expect(mockCookie).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
        })
      );
    });

    it('should set cookie with secure false in development', () => {
      process.env.NODE_ENV = 'development';
      
      setCookie(mockRes as Response, 'access_token', 'token123');
      
      expect(mockCookie).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          secure: false,
        })
      );
    });

    it('should set cookie with secure true in production', () => {
      process.env.NODE_ENV = 'production';
      
      setCookie(mockRes as Response, 'access_token', 'token123');
      
      expect(mockCookie).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          secure: true,
        })
      );
    });

    it('should set sameSite to lax in development', () => {
      process.env.NODE_ENV = 'development';
      
      setCookie(mockRes as Response, 'access_token', 'token123');
      
      expect(mockCookie).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          sameSite: 'lax',
        })
      );
    });

    it('should set sameSite to none in production', () => {
      process.env.NODE_ENV = 'production';
      
      setCookie(mockRes as Response, 'access_token', 'token123');
      
      expect(mockCookie).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          sameSite: 'none',
        })
      );
    });

    it('should set maxAge to 7 days in milliseconds', () => {
      setCookie(mockRes as Response, 'access_token', 'token123');
      
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      
      expect(mockCookie).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          maxAge: sevenDaysInMs,
        })
      );
    });

    it('should set path to root', () => {
      setCookie(mockRes as Response, 'access_token', 'token123');
      
      expect(mockCookie).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          path: '/',
        })
      );
    });

    it('should set refresh_token cookie', () => {
      setCookie(mockRes as Response, 'refresh_token', 'refresh123');
      
      expect(mockCookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh123',
        expect.any(Object)
      );
    });

    it('should handle empty token value', () => {
      setCookie(mockRes as Response, 'access_token', '');
      
      expect(mockCookie).toHaveBeenCalledWith(
        'access_token',
        '',
        expect.any(Object)
      );
    });

    it('should handle long token values', () => {
      const longToken = 'a'.repeat(1000);
      
      setCookie(mockRes as Response, 'access_token', longToken);
      
      expect(mockCookie).toHaveBeenCalledWith(
        'access_token',
        longToken,
        expect.any(Object)
      );
    });

    it('should set all expected cookie options in development', () => {
      process.env.NODE_ENV = 'development';
      
      setCookie(mockRes as Response, 'access_token', 'token123');
      
      expect(mockCookie).toHaveBeenCalledWith('access_token', 'token123', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });
    });

    it('should set all expected cookie options in production', () => {
      process.env.NODE_ENV = 'production';
      
      setCookie(mockRes as Response, 'access_token', 'token123');
      
      expect(mockCookie).toHaveBeenCalledWith('access_token', 'token123', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });
    });
  });
});
