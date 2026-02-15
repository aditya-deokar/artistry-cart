# Auth Service Test Implementation Plan

## Overview

This document outlines a comprehensive testing strategy for the Auth Service, covering unit tests, integration tests, and end-to-end (E2E) tests. The auth service handles critical authentication functionality including user/seller registration, login, OAuth flows, password management, and profile operations.

## Service Architecture Summary

### Controllers

| Controller | File | Functions |
|------------|------|-----------|
| Auth Controller | [`auth.controller.ts`](apps/auth-service/src/controller/auth.controller.ts) | `userRegistration`, `verifyUser`, `loginUser`, `logoutUser`, `refreshToken`, `getUser`, `userForgotPassword`, `verifyUserForgotPassword`, `resetUserPassword`, `registerSeller`, `verifySeller`, `createShop`, `createStripeConnection`, `loginSeller`, `getSeller` |
| User Controller | [`user.controller.ts`](apps/auth-service/src/controller/user.controller.ts) | `getCurrentUser`, `updateUserDetails`, `updateUserAvatar`, `getUserOrders`, `getOrderDetails`, `getUserAddresses`, `createAddress`, `updateAddress`, `deleteAddress` |
| OAuth Controller | [`oauth.controller.ts`](apps/auth-service/src/oauth/oauth.controller.ts) | `googleLogin`, `googleCallback`, `githubLogin`, `githubCallback`, `facebookLogin`, `facebookCallback`, `getOAuthStatus` |

### Utilities

| Utility | File | Functions |
|---------|------|-----------|
| Auth Helper | [`auth.helper.ts`](apps/auth-service/src/utils/auth.helper.ts) | `validationRegistrationData`, `checkOTPRestrictions`, `sendOTP`, `trackOTPRequests`, `verifyOTP`, `handleForgotPassword`, `verifyForgotPasswordOTP` |
| Slugify | [`slugify.ts`](apps/auth-service/src/utils/slugify.ts) | `generateSlug`, `createUniqueSlug` |
| Cookies | [`setCookie.ts`](apps/auth-service/src/utils/cookies/setCookie.ts) | `setCookie` |
| Email | [`sendMail/index.ts`](apps/auth-service/src/utils/sendMail/index.ts) | `sendEmail` |

### Routes

| Router | File | Endpoints |
|--------|------|-----------|
| Auth Router | [`auth.router.ts`](apps/auth-service/src/routes/auth.router.ts) | 17 endpoints for auth and user management |
| OAuth Router | [`oauth.router.ts`](apps/auth-service/src/oauth/oauth.router.ts) | 7 endpoints for OAuth flows |

### External Dependencies

- **Prisma** - Database ORM for users, sellers, shops, orders, addresses
- **Redis** - OTP storage, rate limiting, spam protection
- **Stripe** - Payment account creation for sellers
- **JWT** - Access and refresh token generation
- **bcrypt** - Password hashing
- **Arctic** - OAuth 2.0 library for Google, GitHub, Facebook

---

## Test Architecture

```mermaid
flowchart TB
    subgraph Unit Tests
        UT1[Auth Helper Functions]
        UT2[Slugify Utilities]
        UT3[Cookie Utilities]
        UT4[Validation Functions]
    end

    subgraph Integration Tests
        IT1[Auth Controller]
        IT2[User Controller]
        IT3[OAuth Controller]
        IT4[Route Handlers]
        IT5[Middleware]
    end

    subgraph E2E Tests
        E2E1[User Registration Flow]
        E2E2[User Login Flow]
        E2E3[Seller Registration Flow]
        E2E4[OAuth Flows]
        E2E5[Password Reset Flow]
        E2E6[Profile Management]
    end

    Unit Tests --> Integration Tests
    Integration Tests --> E2E Tests
```

---

## Test Types and Scope

### 1. Unit Tests

Unit tests focus on isolated functions with mocked dependencies. These are fast, deterministic, and test individual pieces of logic.

#### Location
- `apps/auth-service/src/**/*.spec.ts`

#### What to Test

##### 1.1 Auth Helper Functions [`auth.helper.ts`](apps/auth-service/src/utils/auth.helper.ts)

| Function | Test Cases |
|----------|------------|
| `validationRegistrationData` | Valid user data, valid seller data, missing fields, invalid email format |
| `checkOTPRestrictions` | No restrictions, OTP lock present, spam lock present, cooldown present |
| `sendOTP` | OTP generation, Redis storage, email sending |
| `trackOTPRequests` | First request, second request, third request triggers spam lock |
| `verifyOTP` | Valid OTP, invalid OTP, expired OTP, failed attempts tracking, account lockout |
| `handleForgotPassword` | User exists, user not found, OTP sent successfully |
| `verifyForgotPasswordOTP` | Valid OTP, invalid OTP, missing fields |

##### 1.2 Slugify Utilities [`slugify.ts`](apps/auth-service/src/utils/slugify.ts)

| Function | Test Cases |
|----------|------------|
| `generateSlug` | Simple name, special characters, spaces, uppercase, unicode |
| `createUniqueSlug` | Unique slug, collision handling, multiple collisions |

##### 1.3 Cookie Utilities [`setCookie.ts`](apps/auth-service/src/utils/cookies/setCookie.ts)

| Function | Test Cases |
|----------|------------|
| `setCookie` | Cookie name and value, HTTPOnly flag, secure flag, sameSite setting, expiration |

#### Mocking Strategy

```typescript
// Example mock setup for unit tests
jest.mock('../../../../packages/libs/prisma', () => ({
    users: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    sellers: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
    shops: {
        create: jest.fn(),
        findFirst: jest.fn(),
    },
}));

jest.mock('../../../../packages/libs/redis', () => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
}));

jest.mock('../sendMail', () => ({
    sendEmail: jest.fn(),
}));
```

---

### 2. Integration Tests

Integration tests verify that multiple components work together correctly, including database interactions, middleware, and route handlers.

#### Location
- `apps/auth-service/src/**/*.integration.spec.ts` or alongside unit tests
- Alternative: Create `apps/auth-service/src/__tests__/integration/` directory

#### What to Test

##### 2.1 Auth Controller Tests

| Endpoint | Test Cases |
|----------|------------|
| `POST /api/user-registration` | Valid registration, duplicate email, validation errors, OTP sent |
| `POST /api/verify-user` | Valid verification, invalid OTP, expired OTP, user created |
| `POST /api/login-user` | Valid login, invalid credentials, tokens set in cookies |
| `GET /api/logout-user` | Cookies cleared, success response |
| `POST /api/refresh-token` | Valid refresh, expired token, invalid token, new tokens generated |
| `GET /api/logged-in-user` | Authenticated user, unauthenticated access |
| `POST /api/forgot-password-user` | Valid email, user not found, OTP sent |
| `POST /api/reset-password-user` | Valid reset, same password error, user not found |
| `POST /api/seller-registration` | Valid registration, duplicate email |
| `POST /api/verify-seller` | Valid verification, seller created |
| `POST /api/create-shop` | Valid shop, missing fields, slug generation |
| `POST /api/create-stripe-link` | Valid seller, Stripe account created |
| `POST /api/login-seller` | Valid login, invalid credentials |

##### 2.2 User Controller Tests

| Endpoint | Test Cases |
|----------|------------|
| `GET /api/me` | Returns current user, unauthenticated |
| `PATCH /api/me` | Update name, update email, unauthenticated |
| `GET /api/me/orders` | Returns orders, pagination works, unauthenticated |
| `GET /api/me/orders/:orderId` | Returns order, order not found, wrong user |
| `GET /api/me/addresses` | Returns addresses, unauthenticated |
| `POST /api/me/addresses` | Create address, validation errors |
| `PATCH /api/me/addresses/:addressId` | Update address, not found, wrong user |
| `DELETE /api/me/addresses/:addressId` | Delete address, not found, wrong user |

##### 2.3 OAuth Controller Tests

| Endpoint | Test Cases |
|----------|------------|
| `GET /api/oauth/google` | Redirects to Google, state cookie set |
| `GET /api/oauth/google/callback` | Valid callback, CSRF validation, user created, tokens set |
| `GET /api/oauth/github` | Redirects to GitHub, state cookie set |
| `GET /api/oauth/github/callback` | Valid callback, email fetch, user created |
| `GET /api/oauth/facebook` | Redirects to Facebook |
| `GET /api/oauth/facebook/callback` | Valid callback |
| `GET /api/oauth/status` | Returns provider status |

##### 2.4 Middleware Tests

| Middleware | Test Cases |
|------------|------------|
| `isAuthenticated` | Valid token, expired token, invalid token, missing token, user vs seller |
| `isSeller` | Seller access, user denied |

#### Test Database Strategy

Use a test database with transactions for cleanup:

```typescript
// Example test setup
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
    // Connect to test database
});

afterAll(async () => {
    await prisma.$disconnect();
});

beforeEach(async () => {
    // Clean tables or use transactions
    await prisma.users.deleteMany({});
    await prisma.sellers.deleteMany({});
});
```

---

### 3. End-to-End Tests

E2E tests verify complete user flows from start to finish, testing the entire stack including the running server.

#### Location
- `apps/auth-service-e2e/src/auth-service/`

#### What to Test

##### 3.1 User Registration Flow

```typescript
describe('User Registration Flow', () => {
    it('should complete full registration flow', async () => {
        // 1. Request registration
        const regRes = await axios.post('/api/user-registration', {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        });
        expect(regRes.status).toBe(200);
        
        // 2. Get OTP from email/mock
        const otp = await getOTPFromMock('test@example.com');
        
        // 3. Verify with OTP
        const verifyRes = await axios.post('/api/verify-user', {
            email: 'test@example.com',
            otp,
            password: 'password123',
            name: 'Test User'
        });
        expect(verifyRes.status).toBe(201);
    });
});
```

##### 3.2 User Login Flow

| Flow | Steps |
|------|-------|
| Login Success | Login with valid credentials, verify cookies set, access protected route |
| Login Failure | Login with invalid credentials, verify error response |
| Token Refresh | Login, wait for access token expiry, refresh token, verify new tokens |
| Logout | Login, logout, verify cookies cleared, protected route fails |

##### 3.3 Seller Registration Flow

| Flow | Steps |
|------|-------|
| Full Seller Flow | Register seller, verify OTP, create shop, create Stripe link |
| Seller Login | Login as seller, verify seller data in response |

##### 3.4 OAuth Flows

| Flow | Steps |
|------|-------|
| Google OAuth | Mock Google OAuth provider, initiate login, handle callback, verify user created |
| GitHub OAuth | Mock GitHub OAuth provider, initiate login, handle callback |
| Facebook OAuth | Mock Facebook OAuth provider, initiate login, handle callback |

##### 3.5 Password Reset Flow

| Flow | Steps |
|------|-------|
| Full Reset | Request forgot password, verify OTP, reset password, login with new password |

##### 3.6 Profile Management

| Flow | Steps |
|------|-------|
| Profile Update | Login, get profile, update profile, verify changes |
| Address Management | Login, create address, update address, delete address |
| Order History | Login, get orders, get specific order |

---

## Test File Structure

```
apps/auth-service/
  src/
    controller/
      auth.controller.spec.ts          # Unit tests for auth controller
      auth.controller.integration.spec.ts
      user.controller.spec.ts
      user.controller.integration.spec.ts
    oauth/
      oauth.controller.spec.ts
      oauth.controller.integration.spec.ts
    utils/
      auth.helper.spec.ts              # Unit tests for helper functions
      slugify.spec.ts
      cookies/
        setCookie.spec.ts
      sendMail/
        index.spec.ts
    routes/
      auth.router.integration.spec.ts  # Route integration tests
      oauth.router.integration.spec.ts
    __tests__/
      integration/
        auth.flow.integration.spec.ts  # Full flow integration tests
      mocks/
        prisma.mock.ts
        redis.mock.ts
        oauth.mock.ts

apps/auth-service-e2e/
  src/
    auth-service/
      auth-service.spec.ts             # Existing basic test
      user-registration.e2e.spec.ts
      user-login.e2e.spec.ts
      seller-registration.e2e.spec.ts
      oauth-flows.e2e.spec.ts
      password-reset.e2e.spec.ts
      profile-management.e2e.spec.ts
    support/
      global-setup.ts
      global-teardown.ts
      test-setup.ts
      test-helpers.ts                  # Shared test utilities
      mock-server.ts                   # OAuth mock server
```

---

## Test Configuration

### Jest Configuration Updates

Update [`apps/auth-service/jest.config.ts`](apps/auth-service/jest.config.ts):

```typescript
export default {
  displayName: '@artistry-cart/auth-service',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: 'test-output/jest/coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testMatch: [
    '**/*.spec.ts',
    '**/*.integration.spec.ts'
  ]
};
```

### E2E Jest Configuration Updates

Update [`apps/auth-service-e2e/jest.config.ts`](apps/auth-service-e2e/jest.config.ts):

```typescript
export default {
  displayName: '@artistry-cart/auth-service-e2e',
  preset: '../../jest.preset.js',
  globalSetup: '<rootDir>/src/support/global-setup.ts',
  globalTeardown: '<rootDir>/src/support/global-teardown.ts',
  setupFiles: ['<rootDir>/src/support/test-setup.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: 'test-output/jest/coverage',
  testMatch: [
    '**/*.e2e.spec.ts',
    '**/*.spec.ts'
  ],
  testTimeout: 30000, // 30 seconds for E2E tests
};
```

---

## Test Utilities and Helpers

### Test Setup File

Create `apps/auth-service/src/__tests__/setup.ts`:

```typescript
// Global test setup
import { mockDeep, mockReset } from 'jest-mock-extended';

// Extend Jest matchers
expect.extend({
    toBeValidJWT(received: string) {
        const parts = received.split('.');
        const pass = parts.length === 3;
        return {
            pass,
            message: () => `expected ${received} ${pass ? 'not' : ''} to be a valid JWT`
        };
    }
});

// Global mocks
jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('$2a$10$hashedpassword'),
    compare: jest.fn().mockResolvedValue(true),
}));
```

### Test Helpers

Create `apps/auth-service-e2e/src/support/test-helpers.ts`:

```typescript
import axios from 'axios';

export interface TestUser {
    name: string;
    email: string;
    password: string;
    id?: string;
}

export async function createTestUser(overrides?: Partial<TestUser>): Promise<TestUser> {
    const user: TestUser = {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        ...overrides
    };
    
    // Register user
    await axios.post('/api/user-registration', user);
    
    // Get OTP and verify (mock or real)
    // ...
    
    return user;
}

export async function loginUser(email: string, password: string): Promise<string> {
    const res = await axios.post('/api/login-user', { email, password });
    // Extract access token from cookies
    return res.headers['set-cookie']?.find(c => c.startsWith('access_token=')) || '';
}

export function extractOTPFromEmail(mockEmailCall: any): string {
    // Extract OTP from mock email call
    return '1234'; // Placeholder
}
```

---

## Mocking External Services

### Prisma Mock

```typescript
// apps/auth-service/src/__tests__/mocks/prisma.mock.ts
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

export const prismaMock = mockDeep<PrismaClient>();

jest.mock('../../../../packages/libs/prisma', () => ({
    __esModule: true,
    default: prismaMock,
}));
```

### Redis Mock

```typescript
// apps/auth-service/src/__tests__/mocks/redis.mock.ts
export const redisMock = {
    store: new Map<string, string>(),
    
    get: jest.fn((key: string) => Promise.resolve(redisMock.store.get(key))),
    set: jest.fn((key: string, value: string, ...args: any[]) => {
        redisMock.store.set(key, value);
        return Promise.resolve('OK');
    }),
    del: jest.fn((...keys: string[]) => {
        keys.forEach(k => redisMock.store.delete(k));
        return Promise.resolve(1);
    }),
};

jest.mock('../../../../packages/libs/redis', () => redisMock);
```

### OAuth Mock Server

```typescript
// apps/auth-service-e2e/src/support/mock-server.ts
import express from 'express';

export function createOAuthMockServer(port: number) {
    const app = express();
    
    // Mock Google OAuth
    app.get('/oauth2/v2/userinfo', (req, res) => {
        res.json({
            id: 'google-123',
            email: 'test@gmail.com',
            name: 'Test User',
            picture: 'https://example.com/avatar.jpg'
        });
    });
    
    // Mock GitHub OAuth
    app.get('/user', (req, res) => {
        res.json({
            id: 12345,
            login: 'testuser',
            name: 'Test User',
            email: 'test@github.com',
            avatar_url: 'https://github.com/avatar.jpg'
        });
    });
    
    return app.listen(port);
}
```

---

## Implementation Phases

### Phase 1: Unit Tests Foundation

1. Create test directory structure
2. Set up test configuration files
3. Create mock utilities for Prisma, Redis, and external services
4. Implement unit tests for utility functions:
   - [`auth.helper.ts`](apps/auth-service/src/utils/auth.helper.ts) tests
   - [`slugify.ts`](apps/auth-service/src/utils/slugify.ts) tests
   - [`setCookie.ts`](apps/auth-service/src/utils/cookies/setCookie.ts) tests

### Phase 2: Controller Unit Tests

1. Implement auth controller unit tests with mocked dependencies
2. Implement user controller unit tests
3. Implement OAuth controller unit tests with mocked OAuth providers

### Phase 3: Integration Tests

1. Set up test database configuration
2. Implement route integration tests
3. Implement middleware tests
4. Implement full flow integration tests

### Phase 4: E2E Tests

1. Update E2E test configuration
2. Create test helpers and utilities
3. Implement user registration E2E tests
4. Implement user login E2E tests
5. Implement seller registration E2E tests
6. Implement OAuth E2E tests with mock providers
7. Implement password reset E2E tests
8. Implement profile management E2E tests

### Phase 5: CI/CD Integration

1. Add test scripts to package.json
2. Configure coverage reporting
3. Set up test database for CI environment
4. Add test steps to CI pipeline

---

## Test Commands

Add to [`apps/auth-service/package.json`](apps/auth-service/package.json):

```json
{
  "scripts": {
    "test": "nx test @artistry-cart/auth-service",
    "test:watch": "nx test @artistry-cart/auth-service --watch",
    "test:coverage": "nx test @artistry-cart/auth-service --coverage",
    "test:e2e": "nx e2e @artistry-cart/auth-service-e2e",
    "test:e2e:watch": "nx e2e @artistry-cart/auth-service-e2e --watch"
  }
}
```

---

## Coverage Goals

| Category | Target Coverage |
|----------|-----------------|
| Utility Functions | 90% |
| Controllers | 80% |
| Routes | 75% |
| Overall | 80% |

---

## Risk Areas and Edge Cases

### Security Testing

- JWT token validation and expiration
- CSRF protection in OAuth flows
- Rate limiting for OTP requests
- Password hashing verification
- Cookie security flags

### Error Handling

- Database connection failures
- Redis connection failures
- Email service failures
- OAuth provider failures
- Stripe API failures

### Edge Cases

- Concurrent registration attempts
- Expired OTP scenarios
- Invalid email formats
- Unicode in names and addresses
- Very long input strings
- SQL injection attempts
- XSS attempts in user input

---

## Dependencies Required

Add to [`apps/auth-service/package.json`](apps/auth-service/package.json):

```json
{
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "jest": "^29.7.0",
    "jest-mock-extended": "^3.0.0",
    "@testcontainers/redis": "^10.0.0",
    "@testcontainers/postgresql": "^10.0.0",
    "supertest": "^6.3.0",
    "@types/supertest": "^2.0.0"
  }
}
```

---

## Summary

This plan provides a comprehensive testing strategy for the auth service covering:

1. **Unit Tests** - 30+ test cases for utility functions and individual components
2. **Integration Tests** - 40+ test cases for controllers, routes, and middleware
3. **E2E Tests** - 20+ test cases for complete user flows

The implementation should follow the phased approach, starting with unit tests as the foundation, then building up to integration and E2E tests. This ensures a solid testing base that can catch issues at every level of the application.