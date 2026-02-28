/**
 * E2E Tests — Order Service: Stripe Webhooks
 *
 * Tests the webhook endpoint with various Stripe event types.
 * Requires: order-service running on port 6004.
 *
 * NOTE: These tests send raw webhook payloads without valid Stripe
 * signatures, so they verify the endpoint rejects unsigned requests.
 * Full webhook testing requires Stripe CLI in forwarding mode.
 */

import axios from 'axios';
import { describe, it, expect } from 'vitest';

describe('Webhooks API (E2E)', () => {
  describe('POST /order/api/webhooks', () => {
    it('should reject requests without Stripe signature', async () => {
      const res = await axios.post(
        '/order/api/webhooks',
        JSON.stringify({ type: 'payment_intent.succeeded' }),
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
      expect(res.status).toBe(400);
    });

    it('should reject requests with invalid Stripe signature', async () => {
      const res = await axios.post(
        '/order/api/webhooks',
        JSON.stringify({ type: 'payment_intent.succeeded' }),
        {
          headers: {
            'Content-Type': 'application/json',
            'stripe-signature': 'invalid_signature_value',
          },
        },
      );
      expect(res.status).toBe(400);
    });
  });

  describe('POST /order/api/create-order (legacy webhook)', () => {
    it('should reject requests without valid payload', async () => {
      const res = await axios.post(
        '/order/api/create-order',
        JSON.stringify({}),
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('should reject malformed JSON', async () => {
      const res = await axios.post(
        '/order/api/create-order',
        'not-json',
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });
});
