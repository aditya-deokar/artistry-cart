/**
 * Custom Matchers
 *
 * Vitest custom matchers used across all services.
 * Import and call `registerCustomMatchers()` in your setup file,
 * or include this file as a setupFile in vitest.config.ts.
 */
import { expect } from 'vitest';

export function registerCustomMatchers(): void {
  expect.extend({
    toBeValidJWT(received: string) {
      const parts = typeof received === 'string' ? received.split('.') : [];
      const pass = parts.length === 3 && parts.every((p) => p.length > 0);
      return {
        pass,
        message: () => `expected "${received}" ${pass ? 'not ' : ''}to be a valid JWT format (xxx.xxx.xxx)`,
      };
    },

    toBeValidEmail(received: string) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const pass = typeof received === 'string' && emailRegex.test(received);
      return {
        pass,
        message: () => `expected "${received}" ${pass ? 'not ' : ''}to be a valid email address`,
      };
    },
  });
}

// Auto-register when this file is imported directly as a setupFile
registerCustomMatchers();
