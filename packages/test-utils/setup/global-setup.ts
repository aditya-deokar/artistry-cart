/**
 * Global Test Setup
 *
 * Sets common environment variables and suppresses noisy console output.
 * Reference from each service's vitest.config.ts via `setupFiles`.
 */
import { vi } from 'vitest';

// ── Environment Variables ──
process.env.NODE_ENV = 'test';
process.env.ACCESS_TOKEN_SECRET = 'test-access-token-secret-key-for-testing';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-token-secret-key-for-testing';
process.env.STRIPE_SECRETE_KEY = 'sk_test_dummy_stripe_key';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_dummy_webhook_secret';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.REDIS_ENABLED = 'false';
process.env.DATABASE_URL = 'mongodb://localhost:27017/artistry_cart_test';
process.env.IMAGEKIT_PUBLIC_API_KEY = 'test-ik-public';
process.env.IMAGEKIT_PRIVATE_API_KEY = 'test-ik-private';
process.env.KAFKA_BROKERS = 'localhost:9092';

// ── Suppress console output unless DEBUG is set ──
if (!process.env.DEBUG) {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
}
