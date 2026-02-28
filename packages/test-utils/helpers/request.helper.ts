/**
 * Request / Response / Next helpers for Express controller unit tests.
 *
 * Usage:
 * ```ts
 * const req = mockRequest({ body: { email: 'a@b.com' }, params: { id: '123' } });
 * const res = mockResponse();
 * const next = mockNext();
 * await myController(req, res, next);
 * expect(res.status).toHaveBeenCalledWith(200);
 * ```
 */
import { vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

interface MockRequestData {
  body?: Record<string, unknown>;
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  headers?: Record<string, unknown>;
  cookies?: Record<string, unknown>;
  user?: Record<string, unknown>;
  role?: string;
  file?: unknown;
  files?: unknown[];
  ip?: string;
  method?: string;
  originalUrl?: string;
  path?: string;
  [key: string]: unknown;
}

/**
 * Create a mock Express Request object.
 * Pass overrides for body, params, query, headers, cookies, user, role, etc.
 */
export function mockRequest(data: MockRequestData = {}): Request {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    cookies: {},
    user: undefined,
    role: undefined,
    ip: '127.0.0.1',
    method: 'GET',
    originalUrl: '/',
    path: '/',
    get: vi.fn((name: string) => (data.headers as Record<string, string>)?.[name.toLowerCase()]),
    ...data,
  } as unknown as Request;
}

/**
 * Create a mock Express Response object with chainable methods.
 * All methods return `res` itself for chaining: res.status(200).json({...})
 */
export function mockResponse(): Response {
  const res: Record<string, unknown> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.sendStatus = vi.fn().mockReturnValue(res);
  res.set = vi.fn().mockReturnValue(res);
  res.header = vi.fn().mockReturnValue(res);
  res.cookie = vi.fn().mockReturnValue(res);
  res.clearCookie = vi.fn().mockReturnValue(res);
  res.redirect = vi.fn().mockReturnValue(res);
  res.type = vi.fn().mockReturnValue(res);
  res.end = vi.fn().mockReturnValue(res);
  return res as unknown as Response;
}

/**
 * Create a mock Express NextFunction.
 */
export function mockNext(): NextFunction & ReturnType<typeof vi.fn> {
  return vi.fn() as NextFunction & ReturnType<typeof vi.fn>;
}
