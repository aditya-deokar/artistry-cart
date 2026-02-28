/**
 * Redis Mock
 *
 * In-memory Redis mock using a Map store.
 * Mirrors the interface of packages/libs/redis (wrapper) so it can be
 * swapped via vi.mock('../../../../packages/libs/redis', ...).
 *
 * Also works for tests that mock `ioredis` directly (order-service).
 */
import { vi } from 'vitest';

export interface RedisMockType {
  store: Map<string, string>;
  expiry: Map<string, number>;
  get: ((key: string) => Promise<string | null>) & ReturnType<typeof vi.fn>;
  set: ((key: string, value: string | number, ...args: (string | number)[]) => Promise<string | null>) & ReturnType<typeof vi.fn>;
  del: ((...keys: string[]) => Promise<number>) & ReturnType<typeof vi.fn>;
  exists: ((key: string) => Promise<number>) & ReturnType<typeof vi.fn>;
  expire: ((key: string, seconds: number) => Promise<number>) & ReturnType<typeof vi.fn>;
  ttl: ((key: string) => Promise<number>) & ReturnType<typeof vi.fn>;
  incr: ((key: string) => Promise<number>) & ReturnType<typeof vi.fn>;
  decr: ((key: string) => Promise<number>) & ReturnType<typeof vi.fn>;
  keys: ((pattern: string) => Promise<string[]>) & ReturnType<typeof vi.fn>;
  setex: ((key: string, seconds: number, value: string) => Promise<string | null>) & ReturnType<typeof vi.fn>;
  flushall: (() => Promise<string>) & ReturnType<typeof vi.fn>;
  isAvailable: (() => boolean) & ReturnType<typeof vi.fn>;
}

// Internal stores — shared between factory calls when using the default instance
const redisStore = new Map<string, string>();
const expiryStore = new Map<string, number>();

function isExpired(key: string): boolean {
  const exp = expiryStore.get(key);
  if (exp && Date.now() > exp) {
    redisStore.delete(key);
    expiryStore.delete(key);
    return true;
  }
  return false;
}

/**
 * Create a fresh Redis mock. Call in tests that need isolation from others.
 */
export function createRedisMock(): RedisMockType {
  return {
    store: redisStore,
    expiry: expiryStore,

    get: vi.fn((key: string): Promise<string | null> => {
      isExpired(key);
      return Promise.resolve(redisStore.get(key) ?? null);
    }),

    set: vi.fn((key: string, value: string | number, ...args: (string | number)[]): Promise<string | null> => {
      redisStore.set(key, String(value));
      if (args[0] === 'EX' && typeof args[1] === 'number') {
        expiryStore.set(key, Date.now() + args[1] * 1000);
      } else if (args[0] === 'PX' && typeof args[1] === 'number') {
        expiryStore.set(key, Date.now() + args[1]);
      }
      return Promise.resolve('OK');
    }),

    del: vi.fn((...keys: string[]): Promise<number> => {
      let deleted = 0;
      for (const key of keys) {
        if (redisStore.delete(key)) {
          deleted++;
          expiryStore.delete(key);
        }
      }
      return Promise.resolve(deleted);
    }),

    exists: vi.fn((key: string): Promise<number> => {
      isExpired(key);
      return Promise.resolve(redisStore.has(key) ? 1 : 0);
    }),

    expire: vi.fn((key: string, seconds: number): Promise<number> => {
      if (!redisStore.has(key)) return Promise.resolve(0);
      expiryStore.set(key, Date.now() + seconds * 1000);
      return Promise.resolve(1);
    }),

    ttl: vi.fn((key: string): Promise<number> => {
      const exp = expiryStore.get(key);
      if (!exp) return Promise.resolve(-1);
      if (!redisStore.has(key)) return Promise.resolve(-2);
      const remaining = Math.floor((exp - Date.now()) / 1000);
      return Promise.resolve(remaining > 0 ? remaining : -2);
    }),

    incr: vi.fn((key: string): Promise<number> => {
      const val = parseInt(redisStore.get(key) || '0', 10) + 1;
      redisStore.set(key, val.toString());
      return Promise.resolve(val);
    }),

    decr: vi.fn((key: string): Promise<number> => {
      const val = parseInt(redisStore.get(key) || '0', 10) - 1;
      redisStore.set(key, val.toString());
      return Promise.resolve(val);
    }),

    keys: vi.fn((pattern: string): Promise<string[]> => {
      if (pattern === '*') return Promise.resolve(Array.from(redisStore.keys()));
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return Promise.resolve(Array.from(redisStore.keys()).filter((k) => regex.test(k)));
    }),

    setex: vi.fn((key: string, seconds: number, value: string): Promise<string | null> => {
      redisStore.set(key, value);
      expiryStore.set(key, Date.now() + seconds * 1000);
      return Promise.resolve('OK');
    }),

    flushall: vi.fn((): Promise<string> => {
      redisStore.clear();
      expiryStore.clear();
      return Promise.resolve('OK');
    }),

    isAvailable: vi.fn((): boolean => true),
  };
}

/** Default shared instance — import this in your tests */
export const redisMock: RedisMockType = createRedisMock();

/** Reset store + mock call counts */
export function resetRedisMock(): void {
  redisStore.clear();
  expiryStore.clear();
  for (const val of Object.values(redisMock)) {
    if (typeof (val as { mockClear?: () => void })?.mockClear === 'function') {
      (val as { mockClear: () => void }).mockClear();
    }
  }
}

/** Convenience: seed a key for test setup */
export function setRedisKey(key: string, value: string, expirySeconds?: number): void {
  redisStore.set(key, value);
  if (expirySeconds) {
    expiryStore.set(key, Date.now() + expirySeconds * 1000);
  }
}

/** Convenience: read key for assertions */
export function getRedisKey(key: string): string | null {
  return redisStore.get(key) ?? null;
}

/** Convenience: check existence for assertions */
export function hasRedisKey(key: string): boolean {
  if (isExpired(key)) return false;
  return redisStore.has(key);
}
