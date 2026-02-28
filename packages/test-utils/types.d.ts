/**
 * Custom Vitest Matcher Type Declarations
 *
 * Extends the Vitest Assertion interface with project-specific matchers.
 * Add new custom matchers here as the test suite grows.
 */

import 'vitest';

interface CustomMatchers<R = unknown> {
  /** Assert the value is a string in valid JWT format (3 dot-separated parts) */
  toBeValidJWT(): R;
  /** Assert the value is a string matching email regex */
  toBeValidEmail(): R;
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Assertion<T = unknown> extends CustomMatchers<T> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
