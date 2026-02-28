/**
 * Unit Tests for Error Classes (packages/error-handler/index.ts)
 *
 * Validates every custom error class: status codes, error codes,
 * default messages, isOperational flag, details propagation.
 */

import { describe, it, expect } from 'vitest';
import {
  AppError,
  NotFoundError,
  ValidationError,
  AuthError,
  ForbiddenError,
  DatabaseError,
  RateLimitError,
  InternalServerError,
} from './index';

// ── AppError (base class) ────────────────────────────────────────────────────

describe('AppError', () => {
  it('should set statusCode, message, code, and isOperational', () => {
    const err = new AppError('Something went wrong', 500, 'CUSTOM_CODE', true);

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err.message).toBe('Something went wrong');
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('CUSTOM_CODE');
    expect(err.isOperational).toBe(true);
  });

  it('should default isOperational to true', () => {
    const err = new AppError('oops', 400);
    expect(err.isOperational).toBe(true);
  });

  it('should allow isOperational = false for programmer errors', () => {
    const err = new AppError('critical', 500, 'CRITICAL', false);
    expect(err.isOperational).toBe(false);
  });

  it('should auto-generate code from class name when code is omitted', () => {
    const err = new AppError('test', 500);
    expect(err.code).toBe('APP');
  });

  it('should attach details when provided', () => {
    const details = { field: 'email', reason: 'invalid' };
    const err = new AppError('bad', 400, 'BAD', true, details);
    expect(err.details).toEqual(details);
  });

  it('should have a proper stack trace', () => {
    const err = new AppError('stack test', 500);
    expect(err.stack).toBeDefined();
    // Stack trace should point back to the test file where it was created
    expect(err.stack).toContain('index.spec.ts');
  });
});

// ── NotFoundError ────────────────────────────────────────────────────────────

describe('NotFoundError', () => {
  it('should set statusCode 404 and code NOT_FOUND', () => {
    const err = new NotFoundError();
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.isOperational).toBe(true);
  });

  it('should use default message "Resource not found"', () => {
    const err = new NotFoundError();
    expect(err.message).toBe('Resource not found');
  });

  it('should accept a custom message', () => {
    const err = new NotFoundError('User not found');
    expect(err.message).toBe('User not found');
  });

  it('should accept details', () => {
    const err = new NotFoundError('missing', { id: '123' });
    expect(err.details).toEqual({ id: '123' });
  });

  it('should be an instance of AppError and Error', () => {
    const err = new NotFoundError();
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(Error);
  });
});

// ── ValidationError ──────────────────────────────────────────────────────────

describe('ValidationError', () => {
  it('should set statusCode 400 and code VALIDATION_ERROR', () => {
    const err = new ValidationError();
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
  });

  it('should use default message "Invalid request data"', () => {
    const err = new ValidationError();
    expect(err.message).toBe('Invalid request data');
  });

  it('should accept details array for field-level errors', () => {
    const details = [
      { field: 'email', message: 'required' },
      { field: 'name', message: 'too short' },
    ];
    const err = new ValidationError('Validation failed', details);
    expect(err.details).toEqual(details);
  });
});

// ── AuthError ────────────────────────────────────────────────────────────────

describe('AuthError', () => {
  it('should set statusCode 401 and code UNAUTHORIZED', () => {
    const err = new AuthError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });

  it('should use default message "Unauthorized"', () => {
    const err = new AuthError();
    expect(err.message).toBe('Unauthorized');
  });

  it('should accept a custom message', () => {
    const err = new AuthError('Token expired');
    expect(err.message).toBe('Token expired');
  });
});

// ── ForbiddenError ───────────────────────────────────────────────────────────

describe('ForbiddenError', () => {
  it('should set statusCode 403 and code FORBIDDEN', () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });

  it('should use default message "Forbidden access"', () => {
    const err = new ForbiddenError();
    expect(err.message).toBe('Forbidden access');
  });
});

// ── DatabaseError ────────────────────────────────────────────────────────────

describe('DatabaseError', () => {
  it('should set statusCode 500 and code DATABASE_ERROR', () => {
    const err = new DatabaseError();
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('DATABASE_ERROR');
  });

  it('should use default message "Database error"', () => {
    const err = new DatabaseError();
    expect(err.message).toBe('Database error');
  });

  it('should accept custom message and details', () => {
    const err = new DatabaseError('Connection lost', { host: 'db.local' });
    expect(err.message).toBe('Connection lost');
    expect(err.details).toEqual({ host: 'db.local' });
  });
});

// ── RateLimitError ───────────────────────────────────────────────────────────

describe('RateLimitError', () => {
  it('should set statusCode 429 and code RATE_LIMIT_EXCEEDED', () => {
    const err = new RateLimitError();
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('should have a user-friendly default message', () => {
    const err = new RateLimitError();
    expect(err.message).toContain('Too many requests');
  });
});

// ── InternalServerError ──────────────────────────────────────────────────────

describe('InternalServerError', () => {
  it('should set statusCode 500 and code INTERNAL_ERROR', () => {
    const err = new InternalServerError();
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('INTERNAL_ERROR');
  });

  it('should use default message "Internal server error"', () => {
    const err = new InternalServerError();
    expect(err.message).toBe('Internal server error');
  });

  it('should accept custom message', () => {
    const err = new InternalServerError('Memory limit exceeded');
    expect(err.message).toBe('Memory limit exceeded');
  });
});
