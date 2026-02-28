/**
 * Global Test Setup
 *
 * Sets common environment variables and suppresses noisy console output.
 * Reference from each service's vitest.config.ts via `setupFiles`.
 */
import { vi } from 'vitest';

// ── Environment Variables ──
const env = process.env as Record<string, string | undefined>;
env.NODE_ENV = 'test';
env.ACCESS_TOKEN_SECRET = 'test-access-token-secret-key-for-testing';
env.REFRESH_TOKEN_SECRET = 'test-refresh-token-secret-key-for-testing';
env.STRIPE_SECRETE_KEY = 'sk_test_dummy_stripe_key';
env.STRIPE_WEBHOOK_SECRET = 'whsec_test_dummy_webhook_secret';
env.FRONTEND_URL = 'http://localhost:3000';
env.REDIS_URL = 'redis://localhost:6379';
env.REDIS_ENABLED = 'false';
env.DATABASE_URL = 'mongodb://localhost:27017/artistry_cart_test';
env.IMAGEKIT_PUBLIC_API_KEY = 'test-ik-public';
env.IMAGEKIT_PRIVATE_API_KEY = 'test-ik-private';
env.KAFKA_BROKERS = 'localhost:9092';

// ── Suppress console output unless DEBUG is set ──
if (!process.env.DEBUG) {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
}
