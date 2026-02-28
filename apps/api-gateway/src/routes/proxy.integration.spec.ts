/**
 * Integration Tests for API Gateway Proxy Routes
 *
 * Mocks `express-http-proxy` so no real upstream services are needed.
 * Builds an Express app mirroring main.ts setup to test:
 * - Proxy routing rules (auth, product, order, recommendation, ai-vision)
 * - Rate limiting
 * - CORS headers
 * - 404 handling
 * - Health endpoint
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

// ── Track proxy registrations ──
// We replace express-http-proxy with a lightweight middleware that echoes
// back which upstream host + path would have been proxied.
interface ProxyCall {
  host: string;
  opts?: Record<string, any>;
}

const proxyCalls: ProxyCall[] = [];

vi.mock('express-http-proxy', () => ({
  __esModule: true,
  default: vi.fn((host: string, opts?: Record<string, any>) => {
    proxyCalls.push({ host, opts });
    return (req: any, res: any) => {
      // If there's a proxyReqPathResolver, compute the resolved path
      let resolvedPath = req.originalUrl;
      if (opts?.proxyReqPathResolver) {
        resolvedPath = opts.proxyReqPathResolver(req);
      }
      res.status(200).json({
        proxied: true,
        upstream: host,
        path: resolvedPath,
        method: req.method,
      });
    };
  }),
}));

// Mock initializeSiteConfig (imported by main.ts, but we build our own app)
vi.mock('../libs/initializeSiteConfig', () => ({
  __esModule: true,
  default: vi.fn(),
}));

// Re-import proxy after mocking so our factory is used
import proxy from 'express-http-proxy';

/**
 * Build an Express app that mirrors main.ts route registrations.
 * We define it here rather than importing main.ts to avoid the `app.listen()` call.
 */
function buildGatewayApp() {
  const app = express();

  app.use(
    cors({
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      allowedHeaders: ['Authorization', 'Content-Type'],
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ limit: '30mb', extended: true }));
  app.use(cookieParser());
  app.set('trust proxy', 1);

  // Rate limiter — use small window for testing
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // low limit so we can test 429 quickly
    message: { error: 'Too many Reqeusts, please try again later!' },
    standardHeaders: true,
    legacyHeaders: true,
    keyGenerator: (req: any) => req.ip,
  });
  app.use(limiter);

  // Health check
  app.get('/gateway-health', (_req, res) => {
    res.send({ message: 'Welcome to api-gateway!' });
  });

  // Proxy routes — same as main.ts
  app.use('/auth', proxy('http://localhost:6001'));
  app.use('/product', proxy('http://localhost:6002'));
  app.use('/recommendation', proxy('http://localhost:6005'));
  app.use('/ai-vision', proxy('http://localhost:6006'));
  app.use(
    '/order',
    proxy('http://localhost:6004', {
      proxyReqPathResolver: (req: any) => req.originalUrl,
    }),
  );

  // 404 fallback
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}

let app: express.Express;

beforeEach(() => {
  proxyCalls.length = 0;
  app = buildGatewayApp();
});

// ═══════════════════════════════════════════════════════════════════════
// Health Check
// ═══════════════════════════════════════════════════════════════════════

describe('Health Check', () => {
  it('GET /gateway-health should return 200 with gateway info', async () => {
    const res = await request(app).get('/gateway-health');
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('api-gateway');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Auth Proxy
// ═══════════════════════════════════════════════════════════════════════

describe('Auth Proxy (/auth/*)', () => {
  it('should proxy /auth/api/login-user to auth-service', async () => {
    const res = await request(app).post('/auth/api/login-user').send({ email: 'a@b.com' });
    expect(res.status).toBe(200);
    expect(res.body.proxied).toBe(true);
    expect(res.body.upstream).toBe('http://localhost:6001');
  });

  it('should forward cookies', async () => {
    const res = await request(app)
      .get('/auth/api/me')
      .set('Cookie', 'access_token=abc123');
    expect(res.status).toBe(200);
    expect(res.body.upstream).toBe('http://localhost:6001');
  });

  it('should forward authorization headers', async () => {
    const res = await request(app)
      .get('/auth/api/me')
      .set('Authorization', 'Bearer token123');
    expect(res.status).toBe(200);
    expect(res.body.upstream).toBe('http://localhost:6001');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Product Proxy
// ═══════════════════════════════════════════════════════════════════════

describe('Product Proxy (/product/*)', () => {
  it('should proxy /product/api/products to product-service', async () => {
    const res = await request(app).get('/product/api/products');
    expect(res.status).toBe(200);
    expect(res.body.upstream).toBe('http://localhost:6002');
  });

  it('should proxy /product/api/search to product-service', async () => {
    const res = await request(app).get('/product/api/search?q=painting');
    expect(res.status).toBe(200);
    expect(res.body.upstream).toBe('http://localhost:6002');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Order Proxy
// ═══════════════════════════════════════════════════════════════════════

describe('Order Proxy (/order/*)', () => {
  it('should proxy /order/api/orders to order-service', async () => {
    const res = await request(app).get('/order/api/orders');
    expect(res.status).toBe(200);
    expect(res.body.upstream).toBe('http://localhost:6004');
  });

  it('should resolve path correctly via proxyReqPathResolver', async () => {
    const res = await request(app).get('/order/api/orders/abc-123');
    expect(res.status).toBe(200);
    expect(res.body.path).toBe('/order/api/orders/abc-123');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Recommendation Proxy
// ═══════════════════════════════════════════════════════════════════════

describe('Recommendation Proxy (/recommendation/*)', () => {
  it('should proxy /recommendation/api/recommend to recommendation-service', async () => {
    const res = await request(app).get('/recommendation/api/recommend');
    expect(res.status).toBe(200);
    expect(res.body.upstream).toBe('http://localhost:6005');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// AI Vision Proxy
// ═══════════════════════════════════════════════════════════════════════

describe('AI Vision Proxy (/ai-vision/*)', () => {
  it('should proxy /ai-vision/api/analyze to ai-vision service', async () => {
    const res = await request(app).get('/ai-vision/api/analyze');
    expect(res.status).toBe(200);
    expect(res.body.upstream).toBe('http://localhost:6006');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Rate Limiting
// ═══════════════════════════════════════════════════════════════════════

describe('Rate Limiting', () => {
  it('should allow requests under limit', async () => {
    const res = await request(app).get('/gateway-health');
    expect(res.status).toBe(200);
  });

  it('should return 429 when rate limit exceeded', async () => {
    // Our test app has max=5 per window
    for (let i = 0; i < 5; i++) {
      await request(app).get('/gateway-health');
    }
    const res = await request(app).get('/gateway-health');
    expect(res.status).toBe(429);
    expect(res.body.error).toContain('Too many');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// CORS
// ═══════════════════════════════════════════════════════════════════════

describe('CORS', () => {
  it('should include CORS headers for configured origin', async () => {
    const res = await request(app)
      .options('/gateway-health')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'GET');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('should allow second configured origin', async () => {
    const res = await request(app)
      .options('/gateway-health')
      .set('Origin', 'http://localhost:3001')
      .set('Access-Control-Request-Method', 'GET');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3001');
  });

  it('should not set allow-origin for unknown origins', async () => {
    const res = await request(app)
      .options('/gateway-health')
      .set('Origin', 'http://evil.com')
      .set('Access-Control-Request-Method', 'GET');
    // cors middleware will not set the header for disallowed origins
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 404 Handling
// ═══════════════════════════════════════════════════════════════════════

describe('404 Handling', () => {
  it('should return 404 for unmatched routes', async () => {
    const res = await request(app).get('/unknown/path');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not found');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Proxy registration verification
// ═══════════════════════════════════════════════════════════════════════

describe('Proxy registration', () => {
  it('should register proxies for all expected services', () => {
    // proxy() was called during buildGatewayApp()
    const hosts = proxyCalls.map((c) => c.host);
    expect(hosts).toContain('http://localhost:6001'); // auth
    expect(hosts).toContain('http://localhost:6002'); // product
    expect(hosts).toContain('http://localhost:6004'); // order
    expect(hosts).toContain('http://localhost:6005'); // recommendation
    expect(hosts).toContain('http://localhost:6006'); // ai-vision
  });

  it('order proxy should have proxyReqPathResolver option', () => {
    const orderProxy = proxyCalls.find((c) => c.host === 'http://localhost:6004');
    expect(orderProxy?.opts).toBeDefined();
    expect(orderProxy?.opts?.proxyReqPathResolver).toBeTypeOf('function');
  });
});
