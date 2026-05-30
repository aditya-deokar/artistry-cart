import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const configDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: configDir,
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.e2e-spec.ts', 'src/**/*.spec.ts'],
    setupFiles: ['src/support/test-setup.ts'],
    globalSetup: ['src/support/global-setup.ts'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    sequence: { concurrent: false },
    reporters: ['default'],
  },
});
