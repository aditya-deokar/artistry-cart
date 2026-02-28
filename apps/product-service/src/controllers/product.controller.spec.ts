/**
 * Unit Tests for product.controller.ts
 *
 * Covers: getCategories, uploadProductImage, deleteProductImage,
 *   getAllProducts, getProductBySlug, getProductsByIds,
 *   createProduct, getSellerProducts, updateProduct, deleteProduct,
 *   restoreProduct, getAllProductsAdmin, updateProductStatusAdmin,
 *   validateCoupon, getSellerProductsSummary
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks ──
const { prismaMock, imagekitMock, pricingServiceMock } = vi.hoisted(() => {
  const prismaMock = {
    site_config: { findFirst: vi.fn() },
    products: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    discount_codes: { findUnique: vi.fn() },
    $transaction: vi.fn((fn: any) => fn(prismaMock)),
  };

  const imagekitMock = {
    upload: vi.fn(),
    deleteFile: vi.fn(),
  };

  const pricingServiceMock = {
    calculateProductPrice: vi.fn(),
    updateCachedPricing: vi.fn(),
  };

  return { prismaMock, imagekitMock, pricingServiceMock };
});

vi.mock('../../../../packages/libs/prisma', () => ({
  __esModule: true,
  default: prismaMock,
}));

vi.mock('../../../../packages/libs/imageKit', () => ({
  __esModule: true,
  imagekit: imagekitMock,
}));

vi.mock('../lib/pricing.service', () => ({
  PricingService: pricingServiceMock,
}));

vi.mock('../../../../packages/error-handler', () => ({
  AuthError: class AuthError extends Error {
    constructor(msg: string) { super(msg); this.name = 'AuthError'; }
  },
  ValidationError: class ValidationError extends Error {
    constructor(msg: string) { super(msg); this.name = 'ValidationError'; }
  },
}));

import {
  getCategories,
  uploadProductImage,
  deleteProductImage,
  getAllProducts,
  getProductBySlug,
  getProductsByIds,
  createProduct,
  getSellerProducts,
  updateProduct,
  deleteProduct,
  restoreProduct,
  getAllProductsAdmin,
  updateProductStatusAdmin,
  validateCoupon,
  getSellerProductsSummary,
} from './product.controller';

import { mockRequest, mockResponse, mockNext } from '../../../../packages/test-utils';

// ── Helpers ──
function req(data: Record<string, unknown> = {}) { return mockRequest(data); }
function res() { return mockResponse(); }
function next() { return mockNext(); }

// ═══════════════════════════════════════════════
// getCategories
// ═══════════════════════════════════════════════
describe('getCategories', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns categories from site_config', async () => {
    const config = { categories: ['Art', 'Crafts'], subCategories: { Art: ['Oil'] } };
    prismaMock.site_config.findFirst.mockResolvedValue(config);

    const r = res();
    await getCategories(req(), r, next());

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: { categories: config.categories, subCategories: config.subCategories },
    }));
  });

  it('returns 404 when no site_config exists', async () => {
    prismaMock.site_config.findFirst.mockResolvedValue(null);

    const r = res();
    await getCategories(req(), r, next());

    expect(r.status).toHaveBeenCalledWith(404);
  });

  it('forwards errors to next()', async () => {
    const error = new Error('DB down');
    prismaMock.site_config.findFirst.mockRejectedValue(error);

    const n = next();
    await getCategories(req(), res(), n);

    expect(n).toHaveBeenCalledWith(error);
  });
});

// ═══════════════════════════════════════════════
// uploadProductImage
// ═══════════════════════════════════════════════
describe('uploadProductImage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uploads an image and returns url + fileId', async () => {
    imagekitMock.upload.mockResolvedValue({ url: 'https://img.com/1.jpg', fileId: 'file-1' });

    const r = res();
    await uploadProductImage(req({ body: { fileName: 'data:image/png;base64,...' } }), r, next());

    expect(imagekitMock.upload).toHaveBeenCalledWith(expect.objectContaining({
      file: 'data:image/png;base64,...',
      folder: '/products',
    }));
    expect(r.status).toHaveBeenCalledWith(201);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: { file_url: 'https://img.com/1.jpg', file_id: 'file-1' },
    }));
  });

  it('calls next with ValidationError when fileName is missing', async () => {
    const n = next();
    await uploadProductImage(req({ body: {} }), res(), n);

    expect(n).toHaveBeenCalledWith(expect.objectContaining({ name: 'ValidationError' }));
  });

  it('forwards imagekit errors to next()', async () => {
    imagekitMock.upload.mockRejectedValue(new Error('upload fail'));

    const n = next();
    await uploadProductImage(req({ body: { fileName: 'x' } }), res(), n);

    expect(n).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ═══════════════════════════════════════════════
// deleteProductImage
// ═══════════════════════════════════════════════
describe('deleteProductImage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deletes an image by fileId', async () => {
    imagekitMock.deleteFile.mockResolvedValue({ success: true });

    const r = res();
    await deleteProductImage(req({ body: { fileId: 'file-1' } }), r, next());

    expect(imagekitMock.deleteFile).toHaveBeenCalledWith('file-1');
    expect(r.status).toHaveBeenCalledWith(200);
  });

  it('calls next with ValidationError when fileId is missing', async () => {
    const n = next();
    await deleteProductImage(req({ body: {} }), res(), n);

    expect(n).toHaveBeenCalledWith(expect.objectContaining({ name: 'ValidationError' }));
  });
});

// ═══════════════════════════════════════════════
// getAllProducts
// ═══════════════════════════════════════════════
describe('getAllProducts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns paginated products with default params', async () => {
    const products = [{ id: '1', title: 'Painting' }];
    prismaMock.products.findMany.mockResolvedValue(products);
    prismaMock.products.count.mockResolvedValue(1);

    const r = res();
    await getAllProducts(req({ query: {} }), r, next());

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({
        products,
        pagination: expect.objectContaining({ total: 1, currentPage: 1 }),
      }),
    }));
  });

  it('applies category filter', async () => {
    prismaMock.products.findMany.mockResolvedValue([]);
    prismaMock.products.count.mockResolvedValue(0);

    await getAllProducts(req({ query: { category: 'Paintings' } }), res(), next());

    expect(prismaMock.products.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ category: 'Paintings' }),
      }),
    );
  });

  it('applies price range filter', async () => {
    prismaMock.products.findMany.mockResolvedValue([]);
    prismaMock.products.count.mockResolvedValue(0);

    await getAllProducts(req({ query: { minPrice: '10', maxPrice: '100' } }), res(), next());

    expect(prismaMock.products.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          current_price: { gte: 10, lte: 100 },
        }),
      }),
    );
  });

  it('ignores category "all"', async () => {
    prismaMock.products.findMany.mockResolvedValue([]);
    prismaMock.products.count.mockResolvedValue(0);

    await getAllProducts(req({ query: { category: 'all' } }), res(), next());

    const call = prismaMock.products.findMany.mock.calls[0][0];
    expect(call.where.category).toBeUndefined();
  });

  it('sorts by price ascending', async () => {
    prismaMock.products.findMany.mockResolvedValue([]);
    prismaMock.products.count.mockResolvedValue(0);

    await getAllProducts(req({ query: { sortBy: 'price-asc' } }), res(), next());

    expect(prismaMock.products.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { current_price: 'asc' } }),
    );
  });

  it('filters event-only products', async () => {
    prismaMock.products.findMany.mockResolvedValue([]);
    prismaMock.products.count.mockResolvedValue(0);

    await getAllProducts(req({ query: { eventOnly: 'true' } }), res(), next());

    const call = prismaMock.products.findMany.mock.calls[0][0];
    expect(call.where.event).toBeDefined();
  });

  it('applies search filter', async () => {
    prismaMock.products.findMany.mockResolvedValue([]);
    prismaMock.products.count.mockResolvedValue(0);

    await getAllProducts(req({ query: { search: 'canvas' } }), res(), next());

    const call = prismaMock.products.findMany.mock.calls[0][0];
    expect(call.where.OR).toBeDefined();
    expect(call.where.OR.length).toBeGreaterThan(0);
  });

  it('forwards errors to next()', async () => {
    prismaMock.products.findMany.mockRejectedValue(new Error('fail'));
    const n = next();
    await getAllProducts(req({ query: {} }), res(), n);
    expect(n).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ═══════════════════════════════════════════════
// getProductBySlug
// ═══════════════════════════════════════════════
describe('getProductBySlug', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns product with pricing when found', async () => {
    const product = { id: 'p1', slug: 'test-painting', title: 'Test' };
    prismaMock.products.findUnique.mockResolvedValue(product);
    prismaMock.products.update.mockResolvedValue(product);
    pricingServiceMock.calculateProductPrice.mockResolvedValue({
      productId: 'p1', originalPrice: 100, finalPrice: 80, discountInfo: null, savings: 20,
    });

    const r = res();
    await getProductBySlug(req({ params: { slug: 'test-painting' } }), r, next());

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({
        product: expect.objectContaining({ id: 'p1', pricing: expect.any(Object) }),
      }),
    }));
  });

  it('returns 404 when product not found', async () => {
    prismaMock.products.findUnique.mockResolvedValue(null);

    const r = res();
    await getProductBySlug(req({ params: { slug: 'nope' } }), r, next());

    expect(r.status).toHaveBeenCalledWith(404);
  });

  it('returns 400 when slug is empty', async () => {
    const r = res();
    await getProductBySlug(req({ params: {} }), r, next());

    expect(r.status).toHaveBeenCalledWith(400);
  });
});

// ═══════════════════════════════════════════════
// getProductsByIds
// ═══════════════════════════════════════════════
describe('getProductsByIds', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns products matching the IDs', async () => {
    const products = [{ id: 'p1' }, { id: 'p2' }];
    prismaMock.products.findMany.mockResolvedValue(products);

    const r = res();
    await getProductsByIds(req({ query: { ids: 'p1,p2' } }), r, next());

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: products,
    }));
  });

  it('returns 400 when ids string is empty (falsy)', async () => {
    const r = res();
    await getProductsByIds(req({ query: { ids: '' } }), r, next());

    expect(r.status).toHaveBeenCalledWith(400);
  });

  it('returns empty array when ids string has only commas', async () => {
    prismaMock.products.findMany.mockResolvedValue([]);

    const r = res();
    await getProductsByIds(req({ query: { ids: ',,' } }), r, next());

    expect(r.status).toHaveBeenCalledWith(200);
  });
});

// ═══════════════════════════════════════════════
// createProduct
// ═══════════════════════════════════════════════
describe('createProduct', () => {
  const validBody = {
    title: 'Oil Painting',
    description: 'A lovely painting',
    detailed_description: 'Very detailed',
    slug: 'oil-painting',
    tags: ['art'],
    category: 'Paintings',
    subCategory: 'Oil',
    stock: 5,
    regular_price: 150,
    images: [{ url: 'https://img.com/1.jpg' }],
  };

  beforeEach(() => vi.clearAllMocks());

  it('creates a product and returns 201', async () => {
    const created = { id: 'p1', ...validBody };
    prismaMock.products.findUnique.mockResolvedValue(null); // no slug conflict
    prismaMock.products.create.mockResolvedValue(created);
    pricingServiceMock.updateCachedPricing.mockResolvedValue({});

    const r = res();
    await createProduct(
      req({ body: validBody, user: { id: 'u1', shop: { id: 'shop1' } } }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(201);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('returns 400 for invalid body', async () => {
    const r = res();
    await createProduct(
      req({ body: { title: '' }, user: { id: 'u1', shop: { id: 'shop1' } } }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(400);
  });

  it('calls next with AuthError when user has no shop', async () => {
    const n = next();
    await createProduct(req({ body: validBody, user: { id: 'u1' } }), res(), n);

    expect(n).toHaveBeenCalledWith(expect.objectContaining({ name: 'AuthError' }));
  });

  it('calls next with ValidationError when slug already exists', async () => {
    prismaMock.products.findUnique.mockResolvedValue({ id: 'existing' });

    const n = next();
    await createProduct(
      req({ body: validBody, user: { id: 'u1', shop: { id: 'shop1' } } }),
      res(),
      n,
    );

    expect(n).toHaveBeenCalledWith(expect.objectContaining({ name: 'ValidationError' }));
  });
});

// ═══════════════════════════════════════════════
// getSellerProducts
// ═══════════════════════════════════════════════
describe('getSellerProducts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns paginated seller products', async () => {
    prismaMock.products.findMany.mockResolvedValue([{ id: 'p1' }]);
    prismaMock.products.count.mockResolvedValue(1);

    const r = res();
    await getSellerProducts(
      req({ query: {}, user: { id: 'u1', shop: { id: 'shop1' } } }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ pagination: expect.any(Object) }),
    }));
  });

  it('calls next with AuthError when user has no shop', async () => {
    const n = next();
    await getSellerProducts(req({ query: {}, user: {} }), res(), n);

    expect(n).toHaveBeenCalledWith(expect.objectContaining({ name: 'AuthError' }));
  });

  it('applies status filter "deleted"', async () => {
    prismaMock.products.findMany.mockResolvedValue([]);
    prismaMock.products.count.mockResolvedValue(0);

    await getSellerProducts(
      req({ query: { status: 'deleted' }, user: { id: 'u1', shop: { id: 'shop1' } } }),
      res(),
      next(),
    );

    const call = prismaMock.products.findMany.mock.calls[0][0];
    expect(call.where.isDeleted).toBe(true);
  });

  it('applies search filter', async () => {
    prismaMock.products.findMany.mockResolvedValue([]);
    prismaMock.products.count.mockResolvedValue(0);

    await getSellerProducts(
      req({ query: { search: 'painting' }, user: { id: 'u1', shop: { id: 'shop1' } } }),
      res(),
      next(),
    );

    const call = prismaMock.products.findMany.mock.calls[0][0];
    expect(call.where.OR).toBeDefined();
  });
});

// ═══════════════════════════════════════════════
// updateProduct
// ═══════════════════════════════════════════════
describe('updateProduct', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates product successfully', async () => {
    const existing = { id: 'p1', slug: 'old-slug', shopId: 'shop1' };
    prismaMock.products.findFirst.mockResolvedValue(existing);
    prismaMock.products.update.mockResolvedValue({ ...existing, title: 'New' });
    pricingServiceMock.updateCachedPricing.mockResolvedValue({});

    const r = res();
    await updateProduct(
      req({
        params: { productId: 'p1' },
        body: { title: 'New' },
        user: { shop: { id: 'shop1' } },
      }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(200);
  });

  it('returns 404 when product not found or wrong seller', async () => {
    prismaMock.products.findFirst.mockResolvedValue(null);

    const r = res();
    await updateProduct(
      req({
        params: { productId: 'p1' },
        body: { title: 'x' },
        user: { shop: { id: 'shop1' } },
      }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(404);
  });

  it('calls next with AuthError when seller id missing', async () => {
    const n = next();
    await updateProduct(
      req({ params: { productId: 'p1' }, body: { title: 'x' }, user: {} }),
      res(),
      n,
    );

    expect(n).toHaveBeenCalledWith(expect.objectContaining({ name: 'AuthError' }));
  });

  it('validates slug uniqueness on update', async () => {
    prismaMock.products.findFirst.mockResolvedValue({ id: 'p1', slug: 'old', shopId: 'shop1' });
    prismaMock.products.findUnique.mockResolvedValue({ id: 'p2' }); // slug taken

    const n = next();
    await updateProduct(
      req({
        params: { productId: 'p1' },
        body: { slug: 'new-slug' },
        user: { shop: { id: 'shop1' } },
      }),
      res(),
      n,
    );

    expect(n).toHaveBeenCalledWith(expect.objectContaining({ name: 'ValidationError' }));
  });
});

// ═══════════════════════════════════════════════
// deleteProduct
// ═══════════════════════════════════════════════
describe('deleteProduct', () => {
  beforeEach(() => vi.clearAllMocks());

  it('soft-deletes product with 24h grace period', async () => {
    prismaMock.products.findFirst.mockResolvedValue({ id: 'p1', title: 'Art', isDeleted: false });
    prismaMock.products.update.mockResolvedValue({});

    const r = res();
    await deleteProduct(
      req({ params: { productId: 'p1' }, user: { shop: { id: 'shop1' } } }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(200);
    expect(prismaMock.products.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isDeleted: true, deletedAt: expect.any(Date) }),
      }),
    );
  });

  it('calls next with ValidationError when product not found', async () => {
    prismaMock.products.findFirst.mockResolvedValue(null);

    const n = next();
    await deleteProduct(
      req({ params: { productId: 'p1' }, user: { shop: { id: 'shop1' } } }),
      res(),
      n,
    );

    expect(n).toHaveBeenCalledWith(expect.objectContaining({ name: 'ValidationError' }));
  });

  it('calls next with ValidationError when product already deleted', async () => {
    prismaMock.products.findFirst.mockResolvedValue({ id: 'p1', isDeleted: true });

    const n = next();
    await deleteProduct(
      req({ params: { productId: 'p1' }, user: { shop: { id: 'shop1' } } }),
      res(),
      n,
    );

    expect(n).toHaveBeenCalledWith(expect.objectContaining({ name: 'ValidationError' }));
  });
});

// ═══════════════════════════════════════════════
// restoreProduct
// ═══════════════════════════════════════════════
describe('restoreProduct', () => {
  beforeEach(() => vi.clearAllMocks());

  it('restores a deleted product within grace period', async () => {
    const futureDate = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12h from now
    prismaMock.products.findFirst.mockResolvedValue({
      id: 'p1', isDeleted: true, deletedAt: futureDate,
    });
    prismaMock.products.update.mockResolvedValue({});

    const r = res();
    await restoreProduct(
      req({ params: { productId: 'p1' }, user: { shop: { id: 'shop1' } } }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(200);
    expect(prismaMock.products.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isDeleted: false, deletedAt: null } }),
    );
  });

  it('calls next with ValidationError when product not found', async () => {
    prismaMock.products.findFirst.mockResolvedValue(null);

    const n = next();
    await restoreProduct(
      req({ params: { productId: 'p1' }, user: { shop: { id: 'shop1' } } }),
      res(),
      n,
    );

    expect(n).toHaveBeenCalledWith(expect.objectContaining({ name: 'ValidationError' }));
  });

  it('returns 400 when product is not deleted', async () => {
    prismaMock.products.findFirst.mockResolvedValue({ id: 'p1', isDeleted: false });

    const r = res();
    await restoreProduct(
      req({ params: { productId: 'p1' }, user: { shop: { id: 'shop1' } } }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when grace period has expired', async () => {
    const pastDate = new Date(Date.now() - 1000);
    prismaMock.products.findFirst.mockResolvedValue({
      id: 'p1', isDeleted: true, deletedAt: pastDate,
    });

    const r = res();
    await restoreProduct(
      req({ params: { productId: 'p1' }, user: { shop: { id: 'shop1' } } }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(400);
  });
});

// ═══════════════════════════════════════════════
// getAllProductsAdmin
// ═══════════════════════════════════════════════
describe('getAllProductsAdmin', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns paginated products for admin', async () => {
    prismaMock.products.findMany.mockResolvedValue([{ id: 'p1' }]);
    prismaMock.products.count.mockResolvedValue(1);

    const r = res();
    await getAllProductsAdmin(
      req({ query: {}, user: { role: 'ADMIN' } }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(200);
  });

  it('calls next with AuthError when user is not admin', async () => {
    const n = next();
    await getAllProductsAdmin(
      req({ query: {}, user: { role: 'USER' } }),
      res(),
      n,
    );

    expect(n).toHaveBeenCalledWith(expect.objectContaining({ name: 'AuthError' }));
  });

  it('applies status and shopId filters', async () => {
    prismaMock.products.findMany.mockResolvedValue([]);
    prismaMock.products.count.mockResolvedValue(0);

    await getAllProductsAdmin(
      req({ query: { status: 'Active', shopId: 'shop1' }, user: { role: 'ADMIN' } }),
      res(),
      next(),
    );

    const call = prismaMock.products.findMany.mock.calls[0][0];
    expect(call.where.status).toBe('Active');
    expect(call.where.shopId).toBe('shop1');
  });
});

// ═══════════════════════════════════════════════
// updateProductStatusAdmin
// ═══════════════════════════════════════════════
describe('updateProductStatusAdmin', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates product status successfully', async () => {
    prismaMock.products.update.mockResolvedValue({ id: 'p1', status: 'Active' });

    const r = res();
    await updateProductStatusAdmin(
      req({ params: { productId: 'p1' }, body: { status: 'Active' }, user: { role: 'ADMIN' } }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(200);
  });

  it('returns 400 for invalid status', async () => {
    const r = res();
    await updateProductStatusAdmin(
      req({ params: { productId: 'p1' }, body: { status: 'INVALID' }, user: { role: 'ADMIN' } }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(400);
  });

  it('calls next with AuthError when not admin', async () => {
    const n = next();
    await updateProductStatusAdmin(
      req({ params: { productId: 'p1' }, body: { status: 'Active' }, user: { role: 'USER' } }),
      res(),
      n,
    );

    expect(n).toHaveBeenCalledWith(expect.objectContaining({ name: 'AuthError' }));
  });
});

// ═══════════════════════════════════════════════
// validateCoupon
// ═══════════════════════════════════════════════
describe('validateCoupon', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns discount data for valid coupon', async () => {
    const discount = {
      id: 'd1',
      discountCode: 'SUMMER20',
      isActive: true,
      validFrom: new Date('2020-01-01'),
      validUntil: new Date('2099-12-31'),
      currentUsageCount: 0,
      usageLimit: 100,
    };
    prismaMock.discount_codes.findUnique.mockResolvedValue(discount);

    const r = res();
    await validateCoupon(req({ body: { couponCode: 'summer20' } }), r, next());

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: discount }));
  });

  it('returns 400 when couponCode is missing', async () => {
    const r = res();
    await validateCoupon(req({ body: {} }), r, next());
    expect(r.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when coupon not found', async () => {
    prismaMock.discount_codes.findUnique.mockResolvedValue(null);

    const r = res();
    await validateCoupon(req({ body: { couponCode: 'NOPE' } }), r, next());

    expect(r.status).toHaveBeenCalledWith(404);
  });

  it('returns 400 when coupon is expired', async () => {
    prismaMock.discount_codes.findUnique.mockResolvedValue({
      isActive: true,
      validFrom: new Date('2020-01-01'),
      validUntil: new Date('2020-12-31'), // expired
      currentUsageCount: 0,
      usageLimit: 100,
    });

    const r = res();
    await validateCoupon(req({ body: { couponCode: 'OLD' } }), r, next());

    expect(r.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when usage limit reached', async () => {
    prismaMock.discount_codes.findUnique.mockResolvedValue({
      isActive: true,
      validFrom: new Date('2020-01-01'),
      validUntil: new Date('2099-12-31'),
      currentUsageCount: 100,
      usageLimit: 100,
    });

    const r = res();
    await validateCoupon(req({ body: { couponCode: 'MAXED' } }), r, next());

    expect(r.status).toHaveBeenCalledWith(400);
  });
});

// ═══════════════════════════════════════════════
// getSellerProductsSummary
// ═══════════════════════════════════════════════
describe('getSellerProductsSummary', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns product counts for seller', async () => {
    prismaMock.products.count
      .mockResolvedValueOnce(10)  // total
      .mockResolvedValueOnce(8)   // active
      .mockResolvedValueOnce(1)   // draft
      .mockResolvedValueOnce(0)   // out of stock
      .mockResolvedValueOnce(1);  // deleted

    const r = res();
    await getSellerProductsSummary(
      req({ user: { shop: { id: 'shop1' } } }),
      r,
      next(),
    );

    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: {
        totalProducts: 10,
        activeProducts: 8,
        draftProducts: 1,
        outOfStockProducts: 0,
        deletedProducts: 1,
      },
    }));
  });

  it('calls next with AuthError when no shop', async () => {
    const n = next();
    await getSellerProductsSummary(req({ user: {} }), res(), n);

    expect(n).toHaveBeenCalledWith(expect.objectContaining({ name: 'AuthError' }));
  });
});
