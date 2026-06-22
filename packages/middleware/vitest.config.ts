import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createWorkspaceAliases } from '../../vitest.workspace-aliases';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(configDir, '../..');

export default defineConfig({
  root: configDir,
  resolve: {
    alias: createWorkspaceAliases(repoRoot),
  },
  test: {
    name: 'middleware',
    globals: true,
    environment: 'node',
    include: ['**/*.spec.ts', '**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    setupFiles: [
      path.resolve(configDir, '../test-utils/setup/global-setup.ts'),
      path.resolve(configDir, '../test-utils/setup/custom-matchers.ts'),
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
