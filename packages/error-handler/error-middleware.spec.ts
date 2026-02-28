/**
 * Unit Tests for errorMiddleware (packages/error-handler/error-middelware.ts)
 *
 * Validates the central Express error handler:
 *  - AppError subclass responses
 *  - Prisma error mapping
 *  - Zod validation error shaping
 *  - ECONNREFUSED / AggregateError → 503
 *  - Unknown errors → 500
 *  - Production mode hides details
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { errorMiddleware } from './error-middelware';
import {
  AppError,
  NotFoundError,
  ValidationError,
  AuthError,
  ForbiddenError,
  RateLimitError,
} from './index';

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockRequest = (overrides: Partial<Request> = {}): Request =>
  ({
    path: '/test',
    method: 'GET',
    ...overrides,
  } as Request);

const mockResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

const mockNext: NextFunction = vi.fn();

// ── Test Suite ───────────────────────────────────────────────────────────────

describe('errorMiddleware', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  // ─ AppError subclass handling ─────────────────────────────────────────────

  describe('AppError handling', () => {
    it('should handle AppError with correct shape { success, error: { code, message } }', () => {
      const err = new AppError('Something broke', 500, 'CUSTOM');
      const req = mockRequest();
      const res = mockResponse();

      errorMiddleware(err, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'CUSTOM',
          message: 'Something broke',
        },
      });
    });

    it('should handle NotFoundError → 404', () => {
      const err = new NotFoundError('Product not found');
      const req = mockRequest();
      const res = mockResponse();

      errorMiddleware(err, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Product not found',
        },
      });
    });

    it('should handle ValidationError → 400 with details', () => {
      const details = [{ field: 'email', message: 'invalid' }];
      const err = new ValidationError('Bad input', details);
      const req = mockRequest();
      const res = mockResponse();

      errorMiddleware(err, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Bad input',
          details,
        },
      });
    });

    it('should handle AuthError → 401', () => {
      const err = new AuthError('Token expired');
      const req = mockRequest();
      const res = mockResponse();

      errorMiddleware(err, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token expired',
        },
      });
    });

    it('should handle ForbiddenError → 403', () => {
      const err = new ForbiddenError();
      const req = mockRequest();
      const res = mockResponse();

      errorMiddleware(err, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Forbidden access',
        },
      });
    });

    it('should handle RateLimitError → 429', () => {
      const err = new RateLimitError();
      const req = mockRequest();
      const res = mockResponse();

      errorMiddleware(err, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'RATE_LIMIT_EXCEEDED' }),
        })
      );
    });

    it('should omit details key when AppError has no details', () => {
      const err = new NotFoundError('gone');
      const req = mockRequest();
      const res = mockResponse();

      errorMiddleware(err, req, res, mockNext);

      const body = (res.json as any).mock.calls[0][0];
      expect(body.error).not.toHaveProperty('details');
    });
  });

  // ─ Prisma error handling ──────────────────────────────────────────────────

  describe('Prisma error handling', () => {
    it('should handle PrismaClientKnownRequestError P2002 → duplicate record', () => {
      const err: any = new Error('Unique constraint failed');
      err.name = 'PrismaClientKnownRequestError';
      err.code = 'P2002';

      const req = mockRequest();
      const res = mockResponse();

      errorMiddleware(err, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'DUPLICATE_RECORD',
          message: 'A record with this unique field already exists',
        },
      });
    });

    it('should handle PrismaClientKnownRequestError P2025 → not found', () => {
      const err: any = new Error('Record not found');
      err.name = 'PrismaClientKnownRequestError';
      err.code = 'P2025';

      const req = mockRequest();
      const res = mockResponse();

      errorMiddleware(err, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Record not found',
        },
      });
    });

    it('should handle PrismaClientKnownRequestError with unknown code', () => {
      const err: any = new Error('DB error');
      err.name = 'PrismaClientKnownRequestError';
      err.code = 'P9999';

      const req = mockRequest();
      const res = mockResponse();

      errorMiddleware(err, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'A database error occurred',
        },
      });
    });

    it('should handle PrismaClientInitializationError → 503', () => {
      const err: any = new Error('Cannot connect');
      err.name = 'PrismaClientInitializationError';

      const req = mockRequest();
      const res = mockResponse();

      errorMiddleware(err, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'DATABASE_INIT_ERROR',
          message: expect.stringContaining('database connection'),
        },
      });
    });
  });

  // ─ ZodError handling ──────────────────────────────────────────────────────

  describe('ZodError handling', () => {
    it('should handle ZodError → 400 with field errors', () => {
      const err: any = new Error('Validation');
      err.name = 'ZodError';
      err.errors = [
        { path: ['email'], message: 'Invalid email' },
        { path: ['name', 'first'], message: 'Required' },
      ];

      const req = mockRequest();
      const res = mockResponse();

      errorMiddleware(err, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: [
            { path: 'email', message: 'Invalid email' },
            { path: 'name.first', message: 'Required' },
          ],
        },
      });
    });

    it('should handle ZodError with no errors array gracefully', () => {
      const err: any = new Error('Validation');
      err.name = 'ZodError';
      err.errors = undefined;

      const req = mockRequest();
      const res = mockResponse();

      errorMiddleware(err, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
        }),
      });
    });
  });

  // ─ Connection / availability errors ───────────────────────────────────────

  describe('Connection errors', () => {
    it('should handle ECONNREFUSED → 503', () => {
      const err = new Error('connect ECONNREFUSED 127.0.0.1:27017');
      const req = mockRequest();
      const res = mockResponse();

      errorMiddleware(err, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: expect.stringContaining('Database connection failed'),
        },
      });
    });

    it('should handle AggregateError → 503', () => {
      const err: any = new Error('Connection failures');
      err.name = 'AggregateError';

      const req = mockRequest();
      const res = mockResponse();

      errorMiddleware(err, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({ code: 'DATABASE_UNAVAILABLE' }),
      });
    });
  });

  // ─ Unknown / generic errors ───────────────────────────────────────────────

  describe('Unknown errors', () => {
    it('should handle unknown errors → 500 with message in non-production', () => {
      process.env.NODE_ENV = 'development';
      const err = new Error('Something unexpected');
      const req = mockRequest();
      const res = mockResponse();

      errorMiddleware(err, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Something unexpected',
        },
      });
    });

    it('should not expose error details in production (NODE_ENV=production)', () => {
      process.env.NODE_ENV = 'production';
      const err = new Error('secret internal detail');
      const req = mockRequest();
      const res = mockResponse();

      errorMiddleware(err, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      });
    });

    it('should return 500 for an error with no name/code', () => {
      const err = new Error('oops');
      const req = mockRequest();
      const res = mockResponse();

      errorMiddleware(err, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
