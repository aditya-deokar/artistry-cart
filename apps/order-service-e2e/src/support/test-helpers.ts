/**
 * Order Service E2E Test Helpers
 */

import axios from 'axios';

/** Authenticate as a user via auth-service and return the access token */
export async function loginAsUser(): Promise<string | null> {
  try {
    const res = await axios.post('http://localhost:6001/api/login-user', {
      email: process.env.TEST_USER_EMAIL ?? 'test@example.com',
      password: process.env.TEST_USER_PASSWORD ?? 'TestPassword123!',
    }, { validateStatus: () => true });
    if (res.status !== 200) return null;
    const cookies = res.headers['set-cookie'];
    if (cookies) {
      const accessCookie = (cookies as string[]).find((c) => c.startsWith('access_token='));
      if (accessCookie) return accessCookie.split(';')[0].split('=')[1];
    }
    return null;
  } catch {
    return null;
  }
}

/** Authenticate as a seller via auth-service and return the access token */
export async function loginAsSeller(): Promise<string | null> {
  try {
    const res = await axios.post('http://localhost:6001/api/login-seller', {
      email: process.env.TEST_SELLER_EMAIL ?? 'seller@example.com',
      password: process.env.TEST_SELLER_PASSWORD ?? 'SellerPassword123!',
    }, { validateStatus: () => true });
    if (res.status !== 200) return null;
    const cookies = res.headers['set-cookie'];
    if (cookies) {
      const accessCookie = (cookies as string[]).find((c) => c.startsWith('access_token='));
      if (accessCookie) return accessCookie.split(';')[0].split('=')[1];
    }
    return null;
  } catch {
    return null;
  }
}

/** Build auth headers from a token */
export function authHeaders(token: string) {
  return { Cookie: `access_token=${token}` };
}
