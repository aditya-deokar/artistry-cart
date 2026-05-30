import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const configDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: configDir,
  resolve: {
    alias: {
      '@artistry-cart/test-utils': path.resolve(configDir, '../../packages/test-utils/index.ts'),
    },
  },
  test: {
    name: 'auth-service',
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'out-tsc'],
    setupFiles: [
      path.resolve(configDir, '../../packages/test-utils/setup/global-setup.ts'),
      path.resolve(configDir, '../../packages/test-utils/setup/custom-matchers.ts'),
      path.resolve(configDir, 'src/__tests__/setup.ts'),
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/__tests__/**',
        'src/**/*.spec.ts',
        'src/**/*.test.ts',
        'src/main.ts',
        'src/assets/**',
      ],
      thresholds: {
        branches: 70,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
