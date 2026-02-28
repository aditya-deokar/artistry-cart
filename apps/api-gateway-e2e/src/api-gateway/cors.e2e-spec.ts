/**
 * E2E Tests — API Gateway: CORS
 *
 * Tests that the gateway responds with correct CORS headers.
 * Requires: api-gateway running on port 8080.
 */

import axios from 'axios';
import { describe, it, expect } from 'vitest';

describe('CORS (E2E)', () => {
  it('should respond to OPTIONS preflight with CORS headers', async () => {
    const res = await axios.options('/gateway-health', {
      headers: {
        Origin: 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
      },
    });

    // Should not be a server error
    expect(res.status).toBeLessThan(500);

    // CORS headers
    expect(res.headers).toHaveProperty('access-control-allow-origin');
  });

  it('should include credentials header when origin is allowed', async () => {
    const res = await axios.options('/gateway-health', {
      headers: {
        Origin: 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });

    expect(res.status).toBeLessThan(500);
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('should list allowed methods in CORS response', async () => {
    const res = await axios.options('/gateway-health', {
      headers: {
        Origin: 'http://localhost:3000',
        'Access-Control-Request-Method': 'DELETE',
      },
    });

    const allowedMethods = res.headers['access-control-allow-methods'];
    expect(allowedMethods).toBeDefined();
    expect(allowedMethods).toMatch(/GET|POST|PUT|DELETE|PATCH/);
  });
});
