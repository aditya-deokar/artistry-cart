import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      'apps/product-service/vitest.config.ts',
      'apps/auth-service/vitest.config.ts',
      'apps/order-service/vitest.config.ts',
      'apps/api-gateway/vitest.config.ts',
      'apps/recommendation-service/vitest.config.ts',
      'packages/middleware/vitest.config.ts',
      'packages/error-handler/vitest.config.ts',
    ],
  },
});
