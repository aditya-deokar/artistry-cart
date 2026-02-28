/**
 * @artistry-cart/test-utils
 *
 * Barrel export for all shared test utilities.
 * Import from this file in your test specs:
 *
 * ```ts
 * import { prismaMock, resetPrismaMock } from '../../../packages/test-utils';
 * import { mockRequest, mockResponse, mockNext } from '../../../packages/test-utils';
 * import { createMockUser, createMockProduct } from '../../../packages/test-utils';
 * ```
 */

// ── Mocks ──
export { prismaMock, createPrismaMock, resetPrismaMock } from './mocks/prisma.mock';
export {
  redisMock,
  createRedisMock,
  resetRedisMock,
  setRedisKey,
  getRedisKey,
  hasRedisKey,
  type RedisMockType,
} from './mocks/redis.mock';
export { imagekitMock, resetImagekitMock } from './mocks/imagekit.mock';
export { StripeMockConstructor, stripeMethodMocks, resetStripeMock } from './mocks/stripe.mock';
export { kafkaMock, kafkaProducerMock, kafkaConsumerMock, kafkaAdminMock, resetKafkaMock } from './mocks/kafka.mock';
export { nodemailerMock, transporterMock, resetNodemailerMock } from './mocks/nodemailer.mock';

// ── Helpers ──
export { mockRequest, mockResponse, mockNext } from './helpers/request.helper';
export {
  createMockAccessToken,
  createMockRefreshToken,
  createExpiredAccessToken,
  createInvalidAccessToken,
  authCookies,
  authHeaders,
} from './helpers/auth.helper';

// ── Data Factories ──
export {
  createMockUser,
  createMockSeller,
  createMockShop,
  createMockProduct,
  createMockOrder,
  createMockOrderItem,
  createMockAddress,
  createMockPayment,
  createMockEvent,
  createMockDiscount,
  createMockShopReview,
  createMockPricing,
  createMockSiteConfig,
  createMockUserAnalytics,
  createMockProductAnalytics,
  createMockPayout,
  createMockRefund,
  createMockNotification,
  createMockEventProductDiscount,
  resetFactoryCounter,
} from './helpers/data-factories';

// ── Setup ──
export { registerCustomMatchers } from './setup/custom-matchers';
