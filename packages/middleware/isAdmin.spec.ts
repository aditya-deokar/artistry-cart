/**
 * Unit Tests for isAdmin Middleware
 *
 * Tests admin role authorization gate.
 * Must be used after isAuthenticated sets req.user.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isAdmin } from './isAdmin';

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockRequest = (data: any = {}): any => ({
  user: undefined,
  ...data,
});

const mockResponse = (): any => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const mockNext = vi.fn();

// ── Tests ────────────────────────────────────────────────────────────────────

describe('isAdmin middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call next() when user.role is ADMIN', () => {
    const req = mockRequest({ user: { id: 'admin-1', role: 'ADMIN' } });
    const res = mockResponse();

    isAdmin(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 403 when user.role is USER', () => {
    const req = mockRequest({ user: { id: 'user-1', role: 'USER' } });
    const res = mockResponse();

    isAdmin(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('Admin'),
      })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 when user.role is SELLER', () => {
    const req = mockRequest({ user: { id: 'seller-1', role: 'SELLER' } });
    const res = mockResponse();

    isAdmin(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  it('should return 403 when user.role is undefined', () => {
    const req = mockRequest({ user: { id: 'x' } }); // no role property
    const res = mockResponse();

    isAdmin(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should return 401 when req.user is missing', () => {
    const req = mockRequest({ user: undefined });
    const res = mockResponse();

    isAdmin(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('Authentication required'),
      })
    );
  });

  it('should return 401 when req.user is null', () => {
    const req = mockRequest({ user: null });
    const res = mockResponse();

    isAdmin(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should call next with AuthError on unexpected exception', () => {
    // Trigger an error by making req.user a getter that throws
    const req: any = {
      get user() {
        throw new Error('boom');
      },
    };
    const res = mockResponse();

    isAdmin(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Admin authorization failed' })
    );
  });
});
