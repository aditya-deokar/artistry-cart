import { defineProject } from 'vitest/config';
import path from 'path';

export default defineProject({
  test: {
    name: 'order-service',
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'out-tsc'],
    setupFiles: [
      path.resolve(__dirname, '../../packages/test-utils/setup/global-setup.ts'),
      path.resolve(__dirname, '../../packages/test-utils/setup/custom-matchers.ts'),
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
        branches: 65,
        functions: 75,
        lines: 75,
        statements: 75,
      },
    },
  },
});
