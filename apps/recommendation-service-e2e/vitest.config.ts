import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: __dirname,
  test: {
    globals: false,
    include: ['src/**/*.e2e-spec.ts', 'src/**/*.spec.ts'],
    setupFiles: ['./src/support/test-setup.ts'],
    globalSetup: ['./src/support/global-setup.ts'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    fileParallelism: false,
  },
});
