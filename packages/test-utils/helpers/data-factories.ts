/**
 * Data Factories
 *
 * Functions that create realistic mock data for every Prisma model.
 * Each factory accepts optional overrides so tests can customize
 * only the fields they care about.
 */

// ---------- Helpers ----------

let counter = 0;

/** Generate a unique fake ObjectId-like string */
function fakeId(): string {
  counter++;
  return `6500000000000000000${counter.toString().padStart(5, '0')}`;
}

function now(): Date {
  return new Date('2026-02-28T12:00:00.000Z');
}

// ---------- Core Models ----------

export function createMockUser(overrides: Record<string, unknown> = {}) {
  return {
    id: fakeId(),
    name: 'Test User',
    email: `testuser${counter}@example.com`,
    password: '$2b$10$hashedpassword123456789012345678901234567890',
    avatar: null,
    role: 'USER',
    oauthProvider: null,
    oauthId: null,
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function createMockSeller(overrides: Record<string, unknown> = {}) {
  return {
    id: fakeId(),
    name: 'Test Seller',
    email: `seller${counter}@example.com`,
    password: '$2b$10$hashedpassword123456789012345678901234567890',
    phone_number: '+1234567890',
    country: 'US',
    stripeId: null,
    stripeOnboardingComplete: false,
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function createMockShop(overrides: Record<string, unknown> = {}) {
  const id = fakeId();
  return {
    id,
    name: 'Test Art Shop',
    slug: `test-art-shop-${id}`,
    bio: 'A beautiful art shop for testing',
    category: 'art',
    avatar: null,
    coverBanner: null,
    address: '123 Art Street, Creative City',
    opening_hours: '9AM - 6PM',
    website: null,
    socialLinks: [],
    ratings: 4.5,
    sellerId: fakeId(),
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function createMockProduct(overrides: Record<string, unknown> = {}) {
  const id = fakeId();
  return {
    id,
    title: 'Test Painting',
    description: 'A beautiful test painting',
    detailed_description: 'This is a detailed description of the test painting.',
    warranty: null,
    custom_specifications: null,
    slug: `test-painting-${id}`,
    tags: ['art', 'painting', 'test'],
    cash_on_delivery: true,
    brand: null,
    video_url: null,
    category: 'Paintings',
    subCategory: 'Oil Paintings',
    colors: ['Red', 'Blue'],
    sizes: ['Medium', 'Large'],
    discountCodes: null,
    stock: 10,
    sale_price: null,
    regular_price: 99.99,
    current_price: 99.99,
    is_on_discount: false,
    ratings: 5,
    isDeleted: false,
    customProperties: {},
    images: [{ url: 'https://example.com/img.jpg', file_id: 'file-1' }],
    status: 'Active',
    totalSales: 0,
    deletedAt: null,
    shopId: fakeId(),
    eventId: null,
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function createMockOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: fakeId(),
    totalAmount: 199.98,
    status: 'PENDING',
    shippingAddressId: null,
    couponCode: null,
    discountAmount: null,
    deliveryStatus: 'Ordered',
    userId: fakeId(),
    shopId: fakeId(),
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function createMockOrderItem(overrides: Record<string, unknown> = {}) {
  return {
    id: fakeId(),
    quantity: 2,
    price: 99.99,
    originalPrice: 99.99,
    discountAmount: null,
    selectedOptions: null,
    orderId: fakeId(),
    productId: fakeId(),
    ...overrides,
  };
}

export function createMockAddress(overrides: Record<string, unknown> = {}) {
  return {
    id: fakeId(),
    addressLine1: '123 Main St',
    addressLine2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'US',
    isDefault: false,
    userId: fakeId(),
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function createMockPayment(overrides: Record<string, unknown> = {}) {
  return {
    id: fakeId(),
    orderId: fakeId(),
    stripePaymentIntent: `pi_test_${fakeId()}`,
    stripeChargeId: null,
    amount: 199.98,
    currency: 'usd',
    platformFee: 19.998,
    sellerAmount: 179.982,
    stripeFee: null,
    status: 'PENDING',
    paymentMethod: 'card',
    metadata: null,
    errorMessage: null,
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function createMockEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: fakeId(),
    title: 'Summer Art Sale',
    description: 'Get amazing deals on art pieces!',
    banner_image: { url: 'https://example.com/banner.jpg', file_id: 'banner-1' },
    event_type: 'SEASONAL',
    discount_percent: 20,
    discount_type: 'PERCENTAGE',
    discount_value: 20,
    max_discount: null,
    min_order_value: null,
    starting_date: new Date('2026-03-01T00:00:00.000Z'),
    ending_date: new Date('2026-03-31T23:59:59.000Z'),
    is_active: true,
    sellerId: fakeId(),
    shopId: fakeId(),
    views: 0,
    clicks: 0,
    conversions: 0,
    totalRevenue: 0,
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function createMockDiscount(overrides: Record<string, unknown> = {}) {
  return {
    id: fakeId(),
    publicName: 'SUMMER20',
    description: '20% off summer collection',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    discountCode: `SUMMER20-${fakeId()}`,
    minimumOrderAmount: 50,
    maximumDiscountAmount: 100,
    usageLimit: 100,
    usageLimitPerUser: 1,
    currentUsageCount: 0,
    isActive: true,
    validFrom: new Date('2026-02-01T00:00:00.000Z'),
    validUntil: new Date('2026-04-01T00:00:00.000Z'),
    applicableToAll: true,
    applicableCategories: [],
    applicableProducts: [],
    excludedProducts: [],
    sellerId: fakeId(),
    shopId: fakeId(),
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function createMockShopReview(overrides: Record<string, unknown> = {}) {
  return {
    id: fakeId(),
    userId: fakeId(),
    rating: 4.5,
    reviews: 'Great shop, beautiful artwork!',
    shopsId: fakeId(),
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function createMockPricing(overrides: Record<string, unknown> = {}) {
  return {
    id: fakeId(),
    productId: fakeId(),
    basePrice: 99.99,
    discountedPrice: null,
    discountAmount: null,
    discountPercent: null,
    discountSource: null,
    sourceId: null,
    sourceName: null,
    validFrom: now(),
    validUntil: null,
    isActive: true,
    createdBy: null,
    reason: null,
    notes: null,
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function createMockSiteConfig(overrides: Record<string, unknown> = {}) {
  return {
    id: fakeId(),
    categories: ['Paintings', 'Sculptures', 'Digital Art', 'Photography', 'Crafts'],
    subCategories: {
      Paintings: ['Oil Paintings', 'Watercolor', 'Acrylic', 'Mixed Media'],
      Sculptures: ['Bronze', 'Wood', 'Clay', 'Metal'],
      'Digital Art': ['Illustrations', '3D Art', 'Pixel Art', 'AI Art'],
      Photography: ['Portrait', 'Landscape', 'Abstract', 'Street'],
      Crafts: ['Pottery', 'Jewelry', 'Textiles', 'Glass'],
    },
    ...overrides,
  };
}

export function createMockUserAnalytics(overrides: Record<string, unknown> = {}) {
  return {
    id: fakeId(),
    userId: fakeId(),
    lastVisited: now(),
    actions: [],
    recommendations: [],
    lastTrained: null,
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function createMockProductAnalytics(overrides: Record<string, unknown> = {}) {
  return {
    id: fakeId(),
    productId: fakeId(),
    shopId: fakeId(),
    views: 0,
    cartAdds: 0,
    wishlistAdds: 0,
    purchases: 0,
    lastViewedAt: now(),
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function createMockPayout(overrides: Record<string, unknown> = {}) {
  return {
    id: fakeId(),
    sellerId: fakeId(),
    stripeTransferId: `tr_test_${fakeId()}`,
    stripePayoutId: null,
    amount: 500,
    currency: 'usd',
    status: 'PENDING',
    periodStart: null,
    periodEnd: null,
    processedAt: null,
    failedAt: null,
    errorMessage: null,
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function createMockRefund(overrides: Record<string, unknown> = {}) {
  return {
    id: fakeId(),
    paymentId: fakeId(),
    stripeRefundId: `re_test_${fakeId()}`,
    amount: 99.99,
    reason: 'requested_by_customer',
    status: 'PENDING',
    requestedBy: fakeId(),
    requestedByType: 'customer',
    processedAt: null,
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function createMockNotification(overrides: Record<string, unknown> = {}) {
  return {
    id: fakeId(),
    title: 'New Order',
    message: 'You have a new order!',
    isRead: false,
    redirect_link: '/orders/123',
    createrId: fakeId(),
    recieverId: fakeId(),
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function createMockEventProductDiscount(overrides: Record<string, unknown> = {}) {
  return {
    id: fakeId(),
    eventId: fakeId(),
    productId: fakeId(),
    discountType: 'PERCENTAGE',
    discountValue: 15,
    maxDiscount: null,
    specialPrice: null,
    minQuantity: null,
    maxQuantity: null,
    priority: 1,
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

/** Reset the counter (call between test suites if needed) */
export function resetFactoryCounter(): void {
  counter = 0;
}
