/**
 * Custom Vitest Matcher Type Declarations
 * 
 * This file provides TypeScript type definitions for custom Vitest matchers.
 */

import 'vitest';

declare module 'vitest' {
  interface Assertion<T = any> {
    toBeValidJWT(): T;
    toBeValidEmail(): T;
  }
  interface AsymmetricMatchersContaining {
    toBeValidJWT(): any;
    toBeValidEmail(): any;
  }
}