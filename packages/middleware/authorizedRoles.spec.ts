/**
 * Unit Tests for authorizedRoles Middleware
 *
 * Tests isSeller and isUser role-based guards.
 * These rely on req.role being set by isAuthenticated.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isSeller, isUser } from './authorizedRoles';

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockRequest = (data: any = {}): any => ({
  role: undefined,
  ...data,
});

const mockResponse = (): any => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const mockNext = vi.fn();

// ── isSeller ─────────────────────────────────────────────────────────────────

describe('isSeller middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call next() when req.role is "seller"', async () => {
    const req = mockRequest({ role: 'seller' });
    const res = mockResponse();

    await isSeller(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should call next with AuthError when req.role is "user"', async () => {
    const req = mockRequest({ role: 'user' });
    const res = mockResponse();

    await isSeller(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Seller Only'),
      })
    );
  });

  it('should call next with AuthError when req.role is undefined', async () => {
    const req = mockRequest({ role: undefined });
    const res = mockResponse();

    await isSeller(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
      })
    );
  });

  it('should call next with AuthError when req.role is an arbitrary string', async () => {
    const req = mockRequest({ role: 'admin' });
    const res = mockResponse();

    await isSeller(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Seller Only'),
      })
    );
  });
});

// ── isUser ───────────────────────────────────────────────────────────────────

describe('isUser middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call next() when req.role is "user"', async () => {
    const req = mockRequest({ role: 'user' });
    const res = mockResponse();

    await isUser(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should call next with AuthError when req.role is "seller"', async () => {
    const req = mockRequest({ role: 'seller' });
    const res = mockResponse();

    await isUser(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('User Only'),
      })
    );
  });

  it('should call next with AuthError when req.role is undefined', async () => {
    const req = mockRequest({ role: undefined });
    const res = mockResponse();

    await isUser(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
      })
    );
  });
});
