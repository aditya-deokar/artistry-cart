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
    name: 'api-gateway',
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'out-tsc'],
    setupFiles: [
      path.resolve(configDir, '../../packages/test-utils/setup/global-setup.ts'),
      path.resolve(configDir, '../../packages/test-utils/setup/custom-matchers.ts'),
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
        branches: 60,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
  },
});
