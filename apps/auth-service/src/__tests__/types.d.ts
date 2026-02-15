/**
 * Custom Jest Matcher Type Declarations
 * 
 * This file provides TypeScript type definitions for custom Jest matchers.
 */

declare namespace jest {
  interface Matchers<R> {
    toBeValidJWT(): R;
    toBeValidEmail(): R;
  }
}