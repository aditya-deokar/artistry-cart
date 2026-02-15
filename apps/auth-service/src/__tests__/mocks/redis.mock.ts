/**
 * Redis Mock
 * 
 * Mock implementation for Redis client used in unit tests.
 * Uses an in-memory Map to simulate Redis operations.
 */

import { jest } from "@jest/globals";

// Type definition for the Redis mock
export interface RedisMockType {
  store: Map<string, string>;
  expiry: Map<string, number>;
  get: ((key: string) => Promise<string | null>) & { mockClear: () => void };
  set: ((key: string, value: string, ...args: any[]) => Promise<string>) & { mockClear: () => void };
  del: ((...keys: string[]) => Promise<number>) & { mockClear: () => void };
  exists: ((key: string) => Promise<number>) & { mockClear: () => void };
  expire: ((key: string, seconds: number) => Promise<number>) & { mockClear: () => void };
  ttl: ((key: string) => Promise<number>) & { mockClear: () => void };
  incr: ((key: string) => Promise<number>) & { mockClear: () => void };
  decr: ((key: string) => Promise<number>) & { mockClear: () => void };
  keys: ((pattern: string) => Promise<string[]>) & { mockClear: () => void };
  flushall: (() => Promise<string>) & { mockClear: () => void };
}

// In-memory store to simulate Redis
const redisStore = new Map<string, string>();
const expiryStore = new Map<string, number>();

// Create mock Redis client
export const createRedisMock = (): RedisMockType => ({
  store: redisStore,
  expiry: expiryStore,
  
  get: jest.fn((key: string): Promise<string | null> => {
    // Check if key has expired
    const expiry = expiryStore.get(key);
    if (expiry && Date.now() > expiry) {
      redisStore.delete(key);
      expiryStore.delete(key);
      return Promise.resolve(null);
    }
    return Promise.resolve(redisStore.get(key) || null);
  }),
  
  set: jest.fn((key: string, value: string, ...args: any[]): Promise<string> => {
    redisStore.set(key, value);
    
    // Handle EX (expiry in seconds)
    if (args[0] === 'EX' && typeof args[1] === 'number') {
      expiryStore.set(key, Date.now() + args[1] * 1000);
    }
    // Handle PX (expiry in milliseconds)
    else if (args[0] === 'PX' && typeof args[1] === 'number') {
      expiryStore.set(key, Date.now() + args[1]);
    }
    
    return Promise.resolve('OK');
  }),
  
  del: jest.fn((...keys: string[]): Promise<number> => {
    let deleted = 0;
    keys.forEach(key => {
      if (redisStore.delete(key)) {
        deleted++;
        expiryStore.delete(key);
      }
    });
    return Promise.resolve(deleted);
  }),
  
  exists: jest.fn((key: string): Promise<number> => {
    const expiry = expiryStore.get(key);
    if (expiry && Date.now() > expiry) {
      redisStore.delete(key);
      expiryStore.delete(key);
      return Promise.resolve(0);
    }
    return Promise.resolve(redisStore.has(key) ? 1 : 0);
  }),
  
  expire: jest.fn((key: string, seconds: number): Promise<number> => {
    if (!redisStore.has(key)) {
      return Promise.resolve(0);
    }
    expiryStore.set(key, Date.now() + seconds * 1000);
    return Promise.resolve(1);
  }),
  
  ttl: jest.fn((key: string): Promise<number> => {
    const expiry = expiryStore.get(key);
    if (!expiry) return Promise.resolve(-1);
    if (!redisStore.has(key)) return Promise.resolve(-2);
    const ttl = Math.floor((expiry - Date.now()) / 1000);
    return Promise.resolve(ttl > 0 ? ttl : -2);
  }),
  
  incr: jest.fn((key: string): Promise<number> => {
    const value = parseInt(redisStore.get(key) || '0') + 1;
    redisStore.set(key, value.toString());
    return Promise.resolve(value);
  }),
  
  decr: jest.fn((key: string): Promise<number> => {
    const value = parseInt(redisStore.get(key) || '0') - 1;
    redisStore.set(key, value.toString());
    return Promise.resolve(value);
  }),
  
  keys: jest.fn((pattern: string): Promise<string[]> => {
    if (pattern === '*') {
      return Promise.resolve(Array.from(redisStore.keys()));
    }
    // Simple pattern matching (supports only * wildcard)
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Promise.resolve(
      Array.from(redisStore.keys()).filter(key => regex.test(key))
    );
  }),
  
  flushall: jest.fn((): Promise<string> => {
    redisStore.clear();
    expiryStore.clear();
    return Promise.resolve('OK');
  }),
});

// Default mock instance
export const redisMock: RedisMockType = createRedisMock();

// Helper to reset the Redis store between tests
export const resetRedisMock = (): void => {
  redisStore.clear();
  expiryStore.clear();
  Object.values(redisMock).forEach((fn: any) => {
    if (typeof fn?.mockClear === 'function') fn.mockClear();
  });
};

// Helper to set a key with value (for test setup)
export const setRedisKey = (key: string, value: string, expirySeconds?: number): void => {
  redisStore.set(key, value);
  if (expirySeconds) {
    expiryStore.set(key, Date.now() + expirySeconds * 1000);
  }
};

// Helper to get a key (for test assertions)
export const getRedisKey = (key: string): string | null => {
  return redisStore.get(key) || null;
};

// Helper to check if key exists (for test assertions)
export const hasRedisKey = (key: string): boolean => {
  const expiry = expiryStore.get(key);
  if (expiry && Date.now() > expiry) {
    return false;
  }
  return redisStore.has(key);
};
