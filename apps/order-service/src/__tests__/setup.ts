/**
 * Order Service — Test Setup
 *
 * Additional environment variables specific to the order service.
 * Runs after global-setup.ts (which sets STRIPE_SECRETE_KEY, REDIS_URL, etc.).
 */

import { vi } from 'vitest';

// ── Order-service specific env vars ──
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_dummy_webhook_secret';
process.env.SMTP_HOST = 'smtp.test.com';
process.env.SMTP_PORT = '587';
process.env.SMTP_MAIL = 'test@artistry.com';
process.env.SMTP_PASSWORD = 'test-smtp-password';
