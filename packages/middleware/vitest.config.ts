import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    name: 'middleware',
    globals: true,
    environment: 'node',
    include: ['**/*.spec.ts', '**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    setupFiles: [
      '../test-utils/setup/global-setup.ts',
      '../test-utils/setup/custom-matchers.ts',
    ],
    coverage: {
      provider: 'v8',
      include: ['*.ts'],
      exclude: ['*.spec.ts', '*.test.ts'],
      thresholds: {
        branches: 80,
        functions: 90,
        lines: 90,
        statements: 90,
      },
    },
  },
});
