/**
 * Unit Tests for PricingService
 *
 * Tests the static pricing calculation methods used across the product service.
 * Pure logic tests — no HTTP layer involved.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks ──
const { prismaMock } = vi.hoisted(() => {
  return {
    prismaMock: {
      products: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    },
  };
});

vi.mock('../../../../packages/libs/prisma', () => ({
  __esModule: true,
  default: prismaMock,
}));

import {
  PricingService,
  type EventDiscountContext,
  type DiscountComputationResult,
} from './pricing.service';

// ── Helpers ──
function makeProduct(overrides: Partial<EventDiscountContext['product']> = {}): EventDiscountContext['product'] {
  return {
    id: 'prod-1',
    regular_price: 100,
    sale_price: null,
    current_price: 100,
    ...overrides,
  };
}

function makeEvent(overrides: Partial<NonNullable<EventDiscountContext['event']>> = {}): NonNullable<EventDiscountContext['event']> {
  return {
    id: 'evt-1',
    title: 'Summer Sale',
    discount_percent: 20,
    max_discount: null,
    is_active: true,
    starting_date: new Date('2026-01-01T00:00:00Z'),
    ending_date: new Date('2026-12-31T23:59:59Z'),
    ...overrides,
  };
}

function makeProductDiscount(
  overrides: Partial<NonNullable<EventDiscountContext['productDiscount']>> = {},
): NonNullable<EventDiscountContext['productDiscount']> {
  return {
    productId: 'prod-1',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    maxDiscount: null,
    specialPrice: null,
    isActive: true,
    ...overrides,
  };
}

// ═══════════════════════════════════════════════
// isEventActive
// ═══════════════════════════════════════════════
describe('PricingService.isEventActive', () => {
  const refDate = new Date('2026-06-15T12:00:00Z');

  it('returns false when event is null', () => {
    expect(PricingService.isEventActive(null, refDate)).toBe(false);
  });

  it('returns false when event is undefined', () => {
    expect(PricingService.isEventActive(undefined, refDate)).toBe(false);
  });

  it('returns false when event is inactive', () => {
    const event = makeEvent({ is_active: false });
    expect(PricingService.isEventActive(event, refDate)).toBe(false);
  });

  it('returns false when reference date is before start', () => {
    const event = makeEvent({ starting_date: new Date('2027-01-01T00:00:00Z') });
    expect(PricingService.isEventActive(event, refDate)).toBe(false);
  });

  it('returns false when reference date is after end', () => {
    const event = makeEvent({ ending_date: new Date('2025-12-31T23:59:59Z') });
    expect(PricingService.isEventActive(event, refDate)).toBe(false);
  });

  it('returns true when event is active and within date range', () => {
    const event = makeEvent();
    expect(PricingService.isEventActive(event, refDate)).toBe(true);
  });

  it('returns true when reference date equals start date', () => {
    const event = makeEvent({ starting_date: refDate });
    expect(PricingService.isEventActive(event, refDate)).toBe(true);
  });

  it('returns false when reference date equals end date (exclusive)', () => {
    const event = makeEvent({ ending_date: refDate });
    expect(PricingService.isEventActive(event, refDate)).toBe(false);
  });

  it('uses current date as default reference', () => {
    const event = makeEvent({
      starting_date: new Date('2020-01-01T00:00:00Z'),
      ending_date: new Date('2099-12-31T23:59:59Z'),
    });
    expect(PricingService.isEventActive(event)).toBe(true);
  });
});

// ═══════════════════════════════════════════════
// deriveEventDiscount
// ═══════════════════════════════════════════════
describe('PricingService.deriveEventDiscount', () => {
  it('returns null when event is null', () => {
    const result = PricingService.deriveEventDiscount({
      product: makeProduct(),
      event: null,
    });
    expect(result).toBeNull();
  });

  it('returns null when event is inactive', () => {
    const result = PricingService.deriveEventDiscount({
      product: makeProduct(),
      event: makeEvent({ is_active: false }),
    });
    expect(result).toBeNull();
  });

  it('applies event-level percentage discount', () => {
    const result = PricingService.deriveEventDiscount({
      product: makeProduct({ regular_price: 200 }),
      event: makeEvent({ discount_percent: 25 }),
    });
    expect(result).not.toBeNull();
    expect(result!.basePrice).toBe(200);
    expect(result!.discountAmount).toBe(50);
    expect(result!.discountedPrice).toBe(150);
    expect(result!.discountPercent).toBe(25);
    expect(result!.sourceId).toBe('evt-1');
    expect(result!.sourceName).toBe('Summer Sale');
  });

  it('caps event discount at max_discount', () => {
    const result = PricingService.deriveEventDiscount({
      product: makeProduct({ regular_price: 500 }),
      event: makeEvent({ discount_percent: 50, max_discount: 100 }),
    });
    expect(result!.discountAmount).toBe(100);
    expect(result!.discountedPrice).toBe(400);
  });

  it('uses sale_price as base when available', () => {
    const result = PricingService.deriveEventDiscount({
      product: makeProduct({ regular_price: 200, sale_price: 150 }),
      event: makeEvent({ discount_percent: 10 }),
    });
    expect(result!.basePrice).toBe(150);
    expect(result!.discountAmount).toBe(15);
    expect(result!.discountedPrice).toBe(135);
  });

  it('returns null when event discount_percent is 0', () => {
    const result = PricingService.deriveEventDiscount({
      product: makeProduct(),
      event: makeEvent({ discount_percent: 0 }),
    });
    expect(result).toBeNull();
  });

  it('returns null when event discount_percent is null', () => {
    const result = PricingService.deriveEventDiscount({
      product: makeProduct(),
      event: makeEvent({ discount_percent: null as any }),
    });
    expect(result).toBeNull();
  });

  // ── Product-level discounts ──
  describe('with product-specific discount', () => {
    it('applies product percentage discount over event discount', () => {
      const result = PricingService.deriveEventDiscount({
        product: makeProduct({ regular_price: 200 }),
        event: makeEvent({ discount_percent: 10 }),
        productDiscount: makeProductDiscount({ discountType: 'PERCENTAGE', discountValue: 30 }),
      });
      expect(result!.discountAmount).toBe(60); // 30% of 200
      expect(result!.discountedPrice).toBe(140);
      expect(result!.discountPercent).toBe(30);
    });

    it('caps product percentage discount at maxDiscount', () => {
      const result = PricingService.deriveEventDiscount({
        product: makeProduct({ regular_price: 500 }),
        event: makeEvent(),
        productDiscount: makeProductDiscount({
          discountType: 'PERCENTAGE',
          discountValue: 50,
          maxDiscount: 100,
        }),
      });
      expect(result!.discountAmount).toBe(100);
      expect(result!.discountedPrice).toBe(400);
    });

    it('applies fixed amount discount', () => {
      const result = PricingService.deriveEventDiscount({
        product: makeProduct({ regular_price: 200 }),
        event: makeEvent(),
        productDiscount: makeProductDiscount({
          discountType: 'FIXED_AMOUNT',
          discountValue: 50,
        }),
      });
      expect(result!.discountAmount).toBe(50);
      expect(result!.discountedPrice).toBe(150);
    });

    it('caps fixed amount to not exceed base price', () => {
      const result = PricingService.deriveEventDiscount({
        product: makeProduct({ regular_price: 30 }),
        event: makeEvent(),
        productDiscount: makeProductDiscount({
          discountType: 'FIXED_AMOUNT',
          discountValue: 50,
        }),
      });
      expect(result!.discountAmount).toBe(30);
      expect(result!.discountedPrice).toBe(0);
    });

    it('applies special price override', () => {
      const result = PricingService.deriveEventDiscount({
        product: makeProduct({ regular_price: 200 }),
        event: makeEvent(),
        productDiscount: makeProductDiscount({ specialPrice: 120 }),
      });
      expect(result!.discountedPrice).toBe(120);
      expect(result!.discountAmount).toBe(80);
    });

    it('ignores inactive product discount and falls back to event', () => {
      const result = PricingService.deriveEventDiscount({
        product: makeProduct({ regular_price: 200 }),
        event: makeEvent({ discount_percent: 10 }),
        productDiscount: makeProductDiscount({ isActive: false, discountValue: 50 }),
      });
      // Should use event discount (10% of 200 = 20)
      expect(result!.discountAmount).toBe(20);
      expect(result!.discountedPrice).toBe(180);
    });
  });

  it('ensures discountedPrice is never negative', () => {
    const result = PricingService.deriveEventDiscount({
      product: makeProduct({ regular_price: 10 }),
      event: makeEvent(),
      productDiscount: makeProductDiscount({ specialPrice: -5 }),
    });
    // discountedPrice = max(-5, 0) = 0 but discountAmount = 10 - (-5) = 15 > 0
    expect(result!.discountedPrice).toBe(0);
  });
});

// ═══════════════════════════════════════════════
// calculateProductPrice (async — uses prisma)
// ═══════════════════════════════════════════════
describe('PricingService.calculateProductPrice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns pricing with no discount when product has no event', async () => {
    prismaMock.products.findUnique.mockResolvedValue({
      id: 'prod-1',
      regular_price: 100,
      sale_price: null,
      current_price: 100,
      event: null,
      priceHistory: [],
    });

    const result = await PricingService.calculateProductPrice('prod-1');

    expect(result.productId).toBe('prod-1');
    expect(result.originalPrice).toBe(100);
    expect(result.finalPrice).toBe(100);
    expect(result.discountInfo).toBeNull();
    expect(result.savings).toBe(0);
  });

  it('returns discounted pricing when product has active event', async () => {
    prismaMock.products.findUnique.mockResolvedValue({
      id: 'prod-1',
      regular_price: 200,
      sale_price: null,
      current_price: 200,
      event: {
        id: 'evt-1',
        title: 'Flash Sale',
        discount_percent: 25,
        max_discount: null,
        is_active: true,
        starting_date: new Date('2020-01-01'),
        ending_date: new Date('2099-12-31'),
        productDiscounts: [],
      },
      priceHistory: [],
    });

    const result = await PricingService.calculateProductPrice('prod-1');

    expect(result.finalPrice).toBe(150);
    expect(result.savings).toBe(50);
    expect(result.discountInfo).not.toBeNull();
  });

  it('uses sale_price as original price when present', async () => {
    prismaMock.products.findUnique.mockResolvedValue({
      id: 'prod-1',
      regular_price: 200,
      sale_price: 150,
      current_price: 150,
      event: null,
      priceHistory: [],
    });

    const result = await PricingService.calculateProductPrice('prod-1');
    expect(result.originalPrice).toBe(150);
  });

  it('applies product-specific discount from event', async () => {
    prismaMock.products.findUnique.mockResolvedValue({
      id: 'prod-1',
      regular_price: 300,
      sale_price: null,
      current_price: 300,
      event: {
        id: 'evt-1',
        title: 'Big Sale',
        discount_percent: 10,
        max_discount: null,
        is_active: true,
        starting_date: new Date('2020-01-01'),
        ending_date: new Date('2099-12-31'),
        productDiscounts: [
          {
            productId: 'prod-1',
            discountType: 'PERCENTAGE',
            discountValue: 30,
            maxDiscount: null,
            specialPrice: null,
            isActive: true,
          },
        ],
      },
      priceHistory: [],
    });

    const result = await PricingService.calculateProductPrice('prod-1');
    expect(result.finalPrice).toBe(210); // 30% off 300
    expect(result.savings).toBe(90);
  });

  it('throws when product is not found', async () => {
    prismaMock.products.findUnique.mockResolvedValue(null);
    await expect(PricingService.calculateProductPrice('nope')).rejects.toThrow('Product not found');
  });

  it('ensures final price is never negative', async () => {
    prismaMock.products.findUnique.mockResolvedValue({
      id: 'prod-1',
      regular_price: 10,
      sale_price: null,
      current_price: 10,
      event: {
        id: 'evt-1',
        title: 'Mega',
        discount_percent: 100,
        max_discount: null,
        is_active: true,
        starting_date: new Date('2020-01-01'),
        ending_date: new Date('2099-12-31'),
        productDiscounts: [],
      },
      priceHistory: [],
    });

    const result = await PricingService.calculateProductPrice('prod-1');
    expect(result.finalPrice).toBeGreaterThanOrEqual(0);
  });
});

// ═══════════════════════════════════════════════
// updateCachedPricing (async — writes to DB)
// ═══════════════════════════════════════════════
describe('PricingService.updateCachedPricing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates product with discounted pricing', async () => {
    prismaMock.products.findUnique.mockResolvedValue({
      id: 'prod-1',
      regular_price: 200,
      sale_price: null,
      current_price: 200,
      event: {
        id: 'evt-1',
        title: 'Sale',
        discount_percent: 25,
        max_discount: null,
        is_active: true,
        starting_date: new Date('2020-01-01'),
        ending_date: new Date('2099-12-31'),
        productDiscounts: [],
      },
      priceHistory: [],
    });
    prismaMock.products.update.mockResolvedValue({});

    const result = await PricingService.updateCachedPricing('prod-1');

    expect(prismaMock.products.update).toHaveBeenCalledWith({
      where: { id: 'prod-1' },
      data: {
        current_price: 150,
        is_on_discount: true,
      },
    });
    expect(result.finalPrice).toBe(150);
  });

  it('updates product with no discount when event is inactive', async () => {
    prismaMock.products.findUnique.mockResolvedValue({
      id: 'prod-1',
      regular_price: 100,
      sale_price: null,
      current_price: 100,
      event: null,
      priceHistory: [],
    });
    prismaMock.products.update.mockResolvedValue({});

    await PricingService.updateCachedPricing('prod-1');

    expect(prismaMock.products.update).toHaveBeenCalledWith({
      where: { id: 'prod-1' },
      data: {
        current_price: 100,
        is_on_discount: false,
      },
    });
  });
});

// ═══════════════════════════════════════════════
// buildPricingRecord
// ═══════════════════════════════════════════════
describe('PricingService.buildPricingRecord', () => {
  it('builds a record with event discount', () => {
    const product = makeProduct({ regular_price: 200 });
    const event = makeEvent({ discount_percent: 25 });

    const result = PricingService.buildPricingRecord({
      product,
      event,
      validFrom: new Date('2026-03-01'),
      validUntil: new Date('2026-03-31'),
    });

    expect(result.create.basePrice).toBe(200);
    expect(result.create.discountedPrice).toBe(150);
    expect(result.create.discountAmount).toBe(50);
    expect(result.create.discountSource).toBe('EVENT');
    expect(result.create.sourceId).toBe('evt-1');
    expect(result.create.validFrom).toEqual(new Date('2026-03-01'));
    expect(result.create.validUntil).toEqual(new Date('2026-03-31'));
    expect(result.productUpdate.current_price).toBe(150);
    expect(result.productUpdate.is_on_discount).toBe(true);
  });

  it('builds a record with no discount when event has 0% discount', () => {
    const product = makeProduct({ regular_price: 100 });
    const event = makeEvent({ discount_percent: 0 });

    const result = PricingService.buildPricingRecord({
      product,
      event,
      validFrom: new Date('2026-03-01'),
      validUntil: new Date('2026-03-31'),
    });

    expect(result.create.discountedPrice).toBe(100);
    expect(result.create.discountAmount).toBe(0);
    expect(result.productUpdate.is_on_discount).toBe(false);
  });

  it('builds a record with product-specific discount', () => {
    const product = makeProduct({ regular_price: 300 });
    const event = makeEvent({ discount_percent: 10 });
    const productDiscount = makeProductDiscount({
      discountType: 'FIXED_AMOUNT',
      discountValue: 75,
    });

    const result = PricingService.buildPricingRecord({
      product,
      event,
      productDiscount,
      validFrom: new Date('2026-03-01'),
      validUntil: new Date('2026-03-31'),
    });

    expect(result.create.discountAmount).toBe(75);
    expect(result.create.discountedPrice).toBe(225);
    expect(result.productUpdate.is_on_discount).toBe(true);
  });

  it('uses sale_price as base when available', () => {
    const product = makeProduct({ regular_price: 200, sale_price: 160 });
    const event = makeEvent({ discount_percent: 10 });

    const result = PricingService.buildPricingRecord({
      product,
      event,
      validFrom: new Date('2026-03-01'),
      validUntil: new Date('2026-03-31'),
    });

    expect(result.create.basePrice).toBe(160);
  });

  it('includes event title in reason field', () => {
    const event = makeEvent({ title: 'Winter Clearance' });

    const result = PricingService.buildPricingRecord({
      product: makeProduct(),
      event,
      validFrom: new Date('2026-03-01'),
      validUntil: new Date('2026-03-31'),
    });

    expect(result.create.reason).toBe('Event pricing: Winter Clearance');
  });
});
