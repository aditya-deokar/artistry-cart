import { defineProject } from 'vitest/config';
import path from 'path';

export default defineProject({
  test: {
    name: 'api-gateway',
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
        branches: 60,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
  },
});
