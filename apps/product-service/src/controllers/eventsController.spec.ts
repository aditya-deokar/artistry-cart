/**
 * Unit Tests for eventsController.ts
 *
 * Covers: createEvent, getAllEvents, getSellerEvents, getEventById,
 *   updateEvent, deleteEvent, getSellerProductsForEvent,
 *   updateEventProducts, createEventWithProduct
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks ──
const { prismaMock, pricingServiceMock } = vi.hoisted(() => {
  const prismaMock = {
    events: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    products: {
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
    },
    eventProductDiscount: {
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    productPricing: {
      updateMany: vi.fn(),
    },
    $transaction: vi.fn((fn: any) => fn(prismaMock)),
  };

  const pricingServiceMock = {
    updateCachedPricing: vi.fn(),
  };

  return { prismaMock, pricingServiceMock };
});

vi.mock('../../../../packages/libs/prisma', () => ({
  __esModule: true,
  default: prismaMock,
}));

// Mock PricingService — the controller also uses an inner EventPricingService class,
// but it calls PricingService methods. We mock at the import level.
vi.mock('../lib/pricing.service', () => ({
  PricingService: pricingServiceMock,
}));

import {
  createEvent,
  getAllEvents,
  getSellerEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getSellerProductsForEvent,
  updateEventProducts,
  createEventWithProduct,
} from './eventsController';

import { mockRequest, mockResponse, mockNext } from '../../../../packages/test-utils';

function req(data: Record<string, unknown> = {}) { return mockRequest(data); }
function res() { return mockResponse(); }
function next() { return mockNext(); }

const sellerAuth = { user: { id: 'seller1', shop: { id: 'shop1' } } };

// ═══════════════════════════════════════════════
// getAllEvents
// ═══════════════════════════════════════════════
describe('getAllEvents', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns paginated events', async () => {
    prismaMock.events.findMany.mockResolvedValue([{ id: 'e1', title: 'Sale' }]);
    prismaMock.events.count.mockResolvedValue(1);

    const r = res();
    await getAllEvents(req({ query: {} }), r, next());

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({ pagination: expect.any(Object) }),
    }));
  });

  it('forwards errors to next()', async () => {
    prismaMock.events.findMany.mockRejectedValue(new Error('fail'));
    const n = next();
    await getAllEvents(req({ query: {} }), res(), n);
    expect(n).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ═══════════════════════════════════════════════
// getSellerEvents
// ═══════════════════════════════════════════════
describe('getSellerEvents', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns seller events', async () => {
    prismaMock.events.findMany.mockResolvedValue([{ id: 'e1' }]);
    prismaMock.events.count.mockResolvedValue(1);

    const r = res();
    await getSellerEvents(req({ query: {}, ...sellerAuth }), r, next());

    expect(r.status).toHaveBeenCalledWith(200);
  });

  it('returns 401 when not authenticated', async () => {
    const r = res();
    await getSellerEvents(req({ query: {}, user: {} }), r, next());
    expect(r.status).toHaveBeenCalledWith(401);
  });
});

// ═══════════════════════════════════════════════
// getEventById
// ═══════════════════════════════════════════════
describe('getEventById', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns event and increments click count', async () => {
    const event = { id: 'e1', title: 'Sale', products: [], productDiscounts: [], shop: {} };
    prismaMock.events.findUnique.mockResolvedValue(event);
    prismaMock.events.update.mockResolvedValue({});

    const r = res();
    await getEventById(req({ params: { eventId: 'e1' } }), r, next());

    expect(r.status).toHaveBeenCalledWith(200);
    expect(prismaMock.events.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'e1' },
        data: { clicks: { increment: 1 } },
      }),
    );
  });

  it('returns 404 when event not found', async () => {
    prismaMock.events.findUnique.mockResolvedValue(null);

    const r = res();
    await getEventById(req({ params: { eventId: 'nope' } }), r, next());

    expect(r.status).toHaveBeenCalledWith(404);
  });
});

// ═══════════════════════════════════════════════
// createEvent
// ═══════════════════════════════════════════════
describe('createEvent', () => {
  const validBody = {
    title: 'Flash Sale',
    description: 'Big savings!',
    event_type: 'FLASH_SALE',
    starting_date: '2026-03-01T00:00:00Z',
    ending_date: '2026-03-31T23:59:59Z',
  };

  beforeEach(() => vi.clearAllMocks());

  it('creates an event and returns 201', async () => {
    prismaMock.events.create.mockResolvedValue({ id: 'e1', ...validBody });
    prismaMock.products.findMany.mockResolvedValue([]);
    prismaMock.events.findUnique.mockResolvedValue({ id: 'e1', products: [], shop: {} });

    const r = res();
    await createEvent(req({ body: validBody, ...sellerAuth }), r, next());

    expect(r.status).toHaveBeenCalledWith(201);
  });

  it('returns 401 when not authenticated', async () => {
    const r = res();
    await createEvent(req({ body: validBody, user: {} }), r, next());
    expect(r.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 for invalid body', async () => {
    const r = res();
    await createEvent(
      req({ body: { title: '' }, ...sellerAuth }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(400);
  });
});

// ═══════════════════════════════════════════════
// updateEvent
// ═══════════════════════════════════════════════
describe('updateEvent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates event successfully', async () => {
    prismaMock.events.findFirst.mockResolvedValue({
      id: 'e1', sellerId: 'seller1', shopId: 'shop1',
      starting_date: new Date('2026-03-01'), ending_date: new Date('2026-03-31'),
    });
    prismaMock.events.update.mockResolvedValue({ id: 'e1', title: 'Updated' });
    prismaMock.events.findUnique.mockResolvedValue({ id: 'e1', products: [], shop: {} });

    const r = res();
    await updateEvent(
      req({ params: { eventId: 'e1' }, body: { title: 'Updated' }, ...sellerAuth }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(200);
  });

  it('returns 401 when not authenticated', async () => {
    const r = res();
    await updateEvent(
      req({ params: { eventId: 'e1' }, body: {}, user: {} }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when event not found', async () => {
    prismaMock.events.findFirst.mockResolvedValue(null);

    const r = res();
    await updateEvent(
      req({ params: { eventId: 'e1' }, body: { title: 'x' }, ...sellerAuth }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(404);
  });

  it('returns 400 when end date is before start date', async () => {
    prismaMock.events.findFirst.mockResolvedValue({
      id: 'e1', sellerId: 'seller1', shopId: 'shop1',
      starting_date: new Date('2026-03-01'), ending_date: new Date('2026-03-31'),
    });

    const r = res();
    await updateEvent(
      req({
        params: { eventId: 'e1' },
        body: {
          starting_date: '2026-04-01T00:00:00Z',
          ending_date: '2026-03-01T00:00:00Z',
        },
        ...sellerAuth,
      }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(400);
  });
});

// ═══════════════════════════════════════════════
// deleteEvent
// ═══════════════════════════════════════════════
describe('deleteEvent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deletes event and resets product pricing', async () => {
    prismaMock.events.findFirst.mockResolvedValue({
      id: 'e1', sellerId: 'seller1', shopId: 'shop1',
      products: [{ id: 'p1', sale_price: null, regular_price: 100 }],
      productDiscounts: [{ id: 'pd1' }],
    });
    prismaMock.productPricing.updateMany.mockResolvedValue({});
    prismaMock.products.update.mockResolvedValue({});
    prismaMock.eventProductDiscount.deleteMany.mockResolvedValue({});
    prismaMock.events.delete.mockResolvedValue({});

    const r = res();
    await deleteEvent(
      req({ params: { eventId: 'e1' }, ...sellerAuth }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(200);
  });

  it('returns 401 when not authenticated', async () => {
    const r = res();
    await deleteEvent(req({ params: { eventId: 'e1' }, user: {} }), r, next());
    expect(r.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when event not found', async () => {
    prismaMock.events.findFirst.mockResolvedValue(null);

    const r = res();
    await deleteEvent(req({ params: { eventId: 'e1' }, ...sellerAuth }), r, next());
    expect(r.status).toHaveBeenCalledWith(404);
  });
});

// ═══════════════════════════════════════════════
// getSellerProductsForEvent
// ═══════════════════════════════════════════════
describe('getSellerProductsForEvent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns seller products for event selection', async () => {
    prismaMock.products.findMany.mockResolvedValue([{ id: 'p1' }]);
    prismaMock.products.count.mockResolvedValue(1);

    const r = res();
    await getSellerProductsForEvent(
      req({ query: {}, ...sellerAuth }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(200);
  });

  it('returns 401 when not authenticated', async () => {
    const r = res();
    await getSellerProductsForEvent(req({ query: {}, user: {} }), r, next());
    expect(r.status).toHaveBeenCalledWith(401);
  });
});

// ═══════════════════════════════════════════════
// updateEventProducts
// ═══════════════════════════════════════════════
describe('updateEventProducts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const r = res();
    await updateEventProducts(
      req({ params: { eventId: 'e1' }, body: { product_ids: [] }, user: {} }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when event not found', async () => {
    prismaMock.events.findFirst.mockResolvedValue(null);

    const r = res();
    await updateEventProducts(
      req({ params: { eventId: 'e1' }, body: { product_ids: ['p1'] }, ...sellerAuth }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(404);
  });

  it('returns 400 when products dont belong to seller', async () => {
    prismaMock.events.findFirst.mockResolvedValue({ id: 'e1', starting_date: new Date(), ending_date: new Date() });
    prismaMock.products.findMany.mockResolvedValue([{ id: 'p1' }]); // only 1, but 2 requested

    const r = res();
    await updateEventProducts(
      req({
        params: { eventId: 'e1' },
        body: { product_ids: ['p1', 'p2'] },
        ...sellerAuth,
      }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(400);
  });
});

// ═══════════════════════════════════════════════
// createEventWithProduct
// ═══════════════════════════════════════════════
describe('createEventWithProduct', () => {
  const validBody = {
    title: 'Flash Sale',
    description: 'Amazing deals!',
    event_type: 'FLASH_SALE',
    starting_date: '2026-03-01T00:00:00Z',
    ending_date: '2026-03-31T23:59:59Z',
    product_ids: ['p1', 'p2'],
  };

  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const r = res();
    await createEventWithProduct(
      req({ body: validBody, user: {} }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 when products dont belong to seller', async () => {
    prismaMock.products.findMany.mockResolvedValue([{ id: 'p1', eventId: null, stock: 5 }]); // only 1

    const r = res();
    await createEventWithProduct(
      req({ body: validBody, ...sellerAuth }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when products are already in events', async () => {
    prismaMock.products.findMany.mockResolvedValue([
      { id: 'p1', title: 'Art', eventId: 'other-event', stock: 5, regular_price: 100, current_price: 100 },
      { id: 'p2', title: 'Craft', eventId: null, stock: 5, regular_price: 50, current_price: 50 },
    ]);

    const r = res();
    await createEventWithProduct(
      req({ body: validBody, ...sellerAuth }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for invalid body (Zod error)', async () => {
    const r = res();
    await createEventWithProduct(
      req({ body: { title: '' }, ...sellerAuth }),
      r,
      next(),
    );
    expect(r.status).toHaveBeenCalledWith(400);
  });
});
