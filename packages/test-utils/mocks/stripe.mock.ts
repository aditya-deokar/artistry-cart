/**
 * Stripe Mock
 *
 * Mocks the Stripe SDK constructor and its most-used methods.
 * Use: vi.mock('stripe', () => ({ default: StripeMockConstructor }))
 */
import { vi } from 'vitest';

/** Individual method mocks — accessible for assertions */
export const stripeMethodMocks = {
  paymentIntents: {
    create: vi.fn().mockResolvedValue({
      id: 'pi_test_123',
      client_secret: 'pi_test_123_secret',
      amount: 5000,
      currency: 'usd',
      status: 'requires_payment_method',
    }),
    retrieve: vi.fn().mockResolvedValue({
      id: 'pi_test_123',
      amount: 5000,
      currency: 'usd',
      status: 'succeeded',
    }),
    confirm: vi.fn().mockResolvedValue({
      id: 'pi_test_123',
      status: 'succeeded',
    }),
    cancel: vi.fn().mockResolvedValue({
      id: 'pi_test_123',
      status: 'canceled',
    }),
  },
  accounts: {
    create: vi.fn().mockResolvedValue({ id: 'acct_test_123' }),
    retrieve: vi.fn().mockResolvedValue({
      id: 'acct_test_123',
      charges_enabled: true,
      payouts_enabled: true,
    }),
    del: vi.fn().mockResolvedValue({ id: 'acct_test_123', deleted: true }),
  },
  accountLinks: {
    create: vi.fn().mockResolvedValue({
      url: 'https://connect.stripe.com/setup/test',
      created: Date.now(),
      expires_at: Date.now() + 3600000,
    }),
  },
  checkout: {
    sessions: {
      create: vi.fn().mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      }),
      retrieve: vi.fn().mockResolvedValue({
        id: 'cs_test_123',
        payment_status: 'paid',
      }),
    },
  },
  refunds: {
    create: vi.fn().mockResolvedValue({
      id: 're_test_123',
      amount: 5000,
      status: 'succeeded',
    }),
  },
  transfers: {
    create: vi.fn().mockResolvedValue({
      id: 'tr_test_123',
      amount: 4500,
      destination: 'acct_test_123',
    }),
  },
  balance: {
    retrieve: vi.fn().mockResolvedValue({
      available: [{ amount: 10000, currency: 'usd' }],
      pending: [{ amount: 5000, currency: 'usd' }],
    }),
  },
  webhooks: {
    constructEvent: vi.fn().mockReturnValue({
      id: 'evt_test_123',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_test_123' } },
    }),
  },
};

/**
 * Stripe constructor mock — returns the method mocks above.
 * Usage in tests:
 * ```ts
 * vi.mock('stripe', () => ({
 *   default: StripeMockConstructor,
 * }));
 * ```
 */
export const StripeMockConstructor = vi.fn().mockImplementation(() => stripeMethodMocks);

/** Reset all Stripe mocks */
export function resetStripeMock(): void {
  function resetDeep(obj: Record<string, unknown>): void {
    for (const value of Object.values(obj)) {
      if (typeof (value as { mockReset?: () => void })?.mockReset === 'function') {
        (value as { mockReset: () => void }).mockReset();
      } else if (value && typeof value === 'object') {
        resetDeep(value as Record<string, unknown>);
      }
    }
  }
  resetDeep(stripeMethodMocks);
  StripeMockConstructor.mockClear();
}
