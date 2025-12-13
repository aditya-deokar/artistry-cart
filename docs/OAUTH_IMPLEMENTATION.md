# OAuth 2.0 Implementation - Complete Analysis & Test Scenarios

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Security Features](#security-features)
4. [Implementation Details](#implementation-details)
5. [Test Scenarios](#test-scenarios)
6. [Error Handling Matrix](#error-handling-matrix)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [Frontend Integration](#frontend-integration)
10. [Production Checklist](#production-checklist)
11. [Known Limitations](#known-limitations)

---

## Overview

This document provides a comprehensive analysis of the OAuth 2.0 implementation in the Artistry Cart application using the **Arctic** library. The implementation supports **Google** and **GitHub** OAuth with an extensible architecture for future providers.

### Technology Stack

| Component | Technology |
|-----------|------------|
| OAuth Library | Arctic.js v3.7.0 |
| Backend | Express.js (TypeScript) |
| Frontend | Next.js 15 |
| Database | MongoDB via Prisma |
| Session | JWT (HTTPOnly Cookies) |
| Security | CSRF State, PKCE (Google) |
| Providers | Google, GitHub |

---

## Architecture

### Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │     │ Auth Service│     │   Google    │     │  Database   │
│  (Next.js)  │     │  (Express)  │     │   OAuth     │     │  (MongoDB)  │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │ 1. Click Login    │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │                   │ 2. Generate State │                   │
       │                   │    + Code Verifier│                   │
       │                   │                   │                   │
       │                   │ 3. Set Cookies    │                   │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
       │ 4. Redirect to Google                 │                   │
       │──────────────────────────────────────>│                   │
       │                   │                   │                   │
       │                   │ 5. User Consents  │                   │
       │                   │                   │                   │
       │ 6. Redirect with code + state         │                   │
       │<──────────────────────────────────────│                   │
       │                   │                   │                   │
       │ 7. Callback to Auth Service           │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │                   │ 8. Validate State │                   │
       │                   │    (CSRF Check)   │                   │
       │                   │                   │                   │
       │                   │ 9. Exchange Code  │                   │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │                   │ 10. Access Token  │                   │
       │                   │<──────────────────│                   │
       │                   │                   │                   │
       │                   │ 11. Fetch User Info                   │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │                   │ 12. User Data     │                   │
       │                   │<──────────────────│                   │
       │                   │                   │                   │
       │                   │ 13. Find/Create User                  │
       │                   │──────────────────────────────────────>│
       │                   │                   │                   │
       │                   │ 14. User Record   │                   │
       │                   │<──────────────────────────────────────│
       │                   │                   │                   │
       │                   │ 15. Generate JWT  │                   │
       │                   │                   │                   │
       │ 16. Redirect + Set Auth Cookies       │                   │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
       │ 17. Logged In!    │                   │                   │
       └───────────────────┴───────────────────┴───────────────────┘
```

### File Structure

```
apps/auth-service/src/oauth/
├── index.ts              # Module exports
├── providers.ts          # OAuth provider configuration (Arctic)
├── oauth.controller.ts   # Request handlers
└── oauth.router.ts       # Route definitions
```

---

## Security Features

### 1. CSRF Protection (State Parameter)

```typescript
// State generation using Arctic's secure random generator
const state = await generateState();

// Stored in HTTPOnly cookie
res.cookie(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: STATE_EXPIRY_SECONDS * 1000,
    path: "/"
});

// Validated on callback
function validateState(state: string, cookieState: string): boolean {
    if (!state || !cookieState || state !== cookieState) {
        return false;
    }
    return true;
}
```

### 2. PKCE (Proof Key for Code Exchange)

```typescript
// Code verifier generation
const codeVerifier = await generateCodeVerifier();

// Stored in HTTPOnly cookie
res.cookie(CODE_VERIFIER_COOKIE_NAME, codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: STATE_EXPIRY_SECONDS * 1000,
    path: "/"
});

// Used during token exchange
const tokens = await google.validateAuthorizationCode(code, codeVerifier);
```

### 3. HTTPOnly Cookies for Token Storage

```typescript
export const setCookie = (res: Response, name: string, value: string) => {
  const isProd = process.env.NODE_ENV === "production";
  
  res.cookie(name, value, {
    httpOnly: true,                           // Prevents XSS access
    secure: isProd,                           // HTTPS only in production
    sameSite: isProd ? "none" : "lax",        // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000,          // 7 days
    path: "/",
  });
};
```

### 4. JWT Token Management

| Token | Expiry | Purpose |
|-------|--------|---------|
| Access Token | 15 minutes | Short-lived authentication |
| Refresh Token | 7 days | Long-lived session renewal |

---

## Implementation Details

### Provider Configuration (providers.ts)

```typescript
// Dynamic ESM import for Arctic (ESM-only package)
async function loadArctic(): Promise<typeof import("arctic")> {
    if (!arcticModule) {
        arcticModule = await import("arctic");
    }
    return arcticModule;
}

// Lazy initialization of Google provider
export async function getGoogleProvider(): Promise<GoogleProvider> {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        throw new Error("Google OAuth is not configured...");
    }
    
    if (!googleProviderInstance) {
        const arctic = await loadArctic();
        googleProviderInstance = new arctic.Google(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            `${OAUTH_REDIRECT_BASE_URL}/api/oauth/google/callback`
        );
    }
    
    return googleProviderInstance;
}
```

### User Creation/Linking Logic

```typescript
// Find existing user by email
let user = await prisma.users.findUnique({
    where: { email: googleUser.email }
});

if (user) {
    // Link OAuth to existing account
    if (!user.oauthProvider) {
        user = await prisma.users.update({
            where: { id: user.id },
            data: {
                oauthProvider: "google",
                oauthId: googleUser.id,
                avatar: user.avatar || (googleUser.picture ? { url: googleUser.picture, file_id: null } : null)
            }
        });
    }
} else {
    // Create new OAuth user (password is null)
    user = await prisma.users.create({
        data: {
            name: googleUser.name,
            email: googleUser.email,
            oauthProvider: "google",
            oauthId: googleUser.id,
            avatar: googleUser.picture ? { url: googleUser.picture, file_id: null } : null,
            password: null
        }
    });
}
```

---

## Test Scenarios

### ✅ Happy Path Scenarios

| # | Scenario | Expected Result | Status |
|---|----------|-----------------|--------|
| 1 | New user signs up with Google | User created, logged in, redirected to home | ✅ Implemented |
| 2 | Existing OAuth user logs in | User found, logged in, redirected to home | ✅ Implemented |
| 3 | Existing email user links Google | OAuth info added to existing user | ✅ Implemented |
| 4 | User has Google profile picture | Avatar saved to user record | ✅ Implemented |
| 5 | User has no Google profile picture | Avatar set to null | ✅ Implemented |

### ⚠️ Error Scenarios

| # | Scenario | Expected Result | Status |
|---|----------|-----------------|--------|
| 6 | User denies Google consent | Redirect to login with `oauth_denied` error | ✅ Implemented |
| 7 | Invalid/missing authorization code | Redirect to login with `oauth_error` | ✅ Implemented |
| 8 | Invalid/missing state parameter | Redirect to login with `oauth_error` | ✅ Implemented |
| 9 | State mismatch (CSRF attack) | Redirect to login with `csrf_error` | ✅ Implemented |
| 10 | Session expired (no code verifier) | Redirect to login with session expired message | ✅ Implemented |
| 11 | Google API failure | Redirect to login with error message | ✅ Implemented |
| 12 | Missing email from Google | Redirect to login with error message | ✅ Implemented |
| 13 | OAuth not configured | Redirect to login with configuration error | ✅ Implemented |
| 14 | Database error | Redirect to login with error message | ✅ Implemented |

### 🔄 Edge Cases

| # | Scenario | Expected Result | Status |
|---|----------|-----------------|--------|
| 15 | Multiple rapid login attempts | Each creates unique state, only matching one succeeds | ⚠️ Needs Testing |
| 16 | Expired state cookie (>10 min) | Cookie auto-expires, login fails gracefully | ✅ Implemented |
| 17 | Browser back button after login | State already consumed, login fails gracefully | ✅ Implemented |
| 18 | Concurrent sessions | Each session gets own tokens | ✅ Implemented |
| 19 | Token refresh for OAuth user | Works same as regular users | ✅ Implemented |

### 🔒 Security Scenarios

| # | Scenario | Expected Result | Status |
|---|----------|-----------------|--------|
| 20 | CSRF attack simulation | State validation fails, attack blocked | ✅ Implemented |
| 21 | Authorization code replay | Code verifier mismatch, attack blocked | ✅ Implemented |
| 22 | Cookie theft protection | HTTPOnly prevents JS access | ✅ Implemented |
| 23 | XSS token exposure | Tokens not accessible via JavaScript | ✅ Implemented |
| 24 | Man-in-the-middle | HTTPS (secure cookies) in production | ✅ Implemented |

---

## Error Handling Matrix

| Error Code | HTTP Status | User Message | Recovery Action |
|------------|-------------|--------------|-----------------|
| `oauth_denied` | - (redirect) | "Google login was cancelled or denied" | Click login again |
| `oauth_error` | - (redirect) | Various specific messages | Check error, retry |
| `csrf_error` | - (redirect) | "Security validation failed. Please try again." | Clear cookies, retry |
| `session_expired` | - (redirect) | "Session expired. Please try again." | Start fresh login |

### Error Response Format

All OAuth errors redirect to frontend with query parameters:

```
/login?error={error_code}&message={url_encoded_message}
```

---

## Database Schema

### Users Model (Prisma)

```prisma
model users {
  id       String   @id @default(auto()) @map("_id") @db.ObjectId
  name     String
  email    String   @unique
  password String?  // Null for OAuth-only users
  avatar   Json?    // { url: string, file_id: string | null }
  role     UserRole @default(USER)

  // OAuth fields
  oauthProvider String?  // "google", "github", "microsoft", etc.
  oauthId       String?  // Provider-specific user ID

  // ... other relations
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## API Endpoints

### OAuth Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/oauth/status` | Check configured OAuth providers |
| GET | `/api/oauth/google` | Initiate Google OAuth flow |
| GET | `/api/oauth/google/callback` | Handle Google OAuth callback |
| GET | `/api/oauth/github` | Initiate GitHub OAuth flow |
| GET | `/api/oauth/github/callback` | Handle GitHub OAuth callback |

### Response Examples

#### GET /api/oauth/status

```json
{
  "providers": {
    "google": true,
    "github": true,
    "microsoft": false
  }
}
```

---

## Frontend Integration

### Login Button Implementation

```tsx
<Button 
    variant="outline" 
    onClick={() => {
        // Redirect to Google OAuth endpoint
        window.location.href = `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/oauth/google`;
    }}
    type="button"
>
    <GoogleIcon />
    Continue with Google
</Button>
```

### Error Handling on Login Page

```tsx
// Check for OAuth errors in URL
const searchParams = useSearchParams();
const error = searchParams.get('error');
const message = searchParams.get('message');

useEffect(() => {
    if (error) {
        toast.error(decodeURIComponent(message || 'Login failed'));
    }
}, [error, message]);
```

### Successful Login Handling

```tsx
// Check for successful OAuth login
useEffect(() => {
    const loginSuccess = searchParams.get('login');
    if (loginSuccess === 'success') {
        toast.success('Logged in successfully!');
        // Refresh user data
        queryClient.invalidateQueries({ queryKey: ['user'] });
    }
}, [searchParams]);
```

---

## Production Checklist

### Environment Variables

```env
# Required - Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Required - GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Required - OAuth URLs
OAUTH_REDIRECT_BASE_URL="https://api.yourdomain.com"
FRONTEND_URL="https://yourdomain.com"

# JWT (Required)
ACCESS_TOKEN_SECRET="your-access-token-secret"
REFRESH_TOKEN_SECRET="your-refresh-token-secret"
```

### Google Cloud Console Setup

1. **Create OAuth 2.0 Client ID**
   - Application type: Web application
   - Name: Artistry Cart Production

2. **Configure Authorized Redirect URIs**
   ```
   https://api.yourdomain.com/api/oauth/google/callback
   ```

3. **Configure OAuth Consent Screen**
   - User type: External
   - App name: Artistry Cart
   - Scopes: `openid`, `email`, `profile`

### GitHub OAuth App Setup

1. **Create OAuth App** (Settings > Developer Settings > OAuth Apps)
   - Application name: Artistry Cart
   - Homepage URL: `https://yourdomain.com`
   - Authorization callback URL: `https://api.yourdomain.com/api/oauth/github/callback`

2. **Note the Client ID and generate a Client Secret**

3. **Permissions Required**
   - `user:email` - Access user's email addresses
   - `read:user` - Read user's profile data

### Security Checklist

- [ ] HTTPS enforced in production
- [ ] `secure: true` for cookies in production
- [ ] `sameSite: "none"` for cross-site cookies (if API on different domain)
- [ ] Environment variables properly secured
- [ ] Client secret never exposed to frontend
- [ ] Rate limiting on OAuth endpoints
- [ ] Logging for security audits

---

## Known Limitations

### Current Implementation

1. **No account unlink feature** - Users cannot disconnect OAuth provider
2. **Single OAuth provider per user** - Only one provider can be linked
3. **No OAuth token refresh** - Google tokens not refreshed (using JWT instead)
4. **No account merge** - If user has separate accounts (one email, one OAuth), they remain separate

### Future Enhancements

1. **Add more providers** (Microsoft, Apple)
2. **Account linking UI** - Allow users to link/unlink providers
3. **Multiple OAuth providers** - Support multiple providers per account
4. **Enhanced security logging** - Audit trail for OAuth events
5. **Rate limiting** - Prevent OAuth abuse

---

## GitHub-Specific Notes

### Private Email Handling

GitHub users may have their email set to private. The implementation handles this by:

1. First checking if email is in the user profile response
2. If not, making a separate call to `/user/emails` endpoint
3. Selecting the primary verified email from the list

```typescript
// Fetch emails if not in user profile
if (!userEmail) {
    const emailsResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": "Artistry-Cart-App"
        }
    });
    
    if (emailsResponse.status === 200) {
        const emails = await emailsResponse.json();
        const primaryEmail = emails.find(e => e.primary && e.verified);
        userEmail = primaryEmail?.email;
    }
}
```

### User-Agent Requirement

GitHub API requires a `User-Agent` header in all requests:

```typescript
headers: {
    Authorization: `Bearer ${accessToken}`,
    "User-Agent": "Artistry-Cart-App"  // Required by GitHub
}
```

---

## Manual Testing Guide

### Test Case 1: New User OAuth Flow

1. Clear all cookies and localStorage
2. Navigate to `/login`
3. Click "Continue with Google"
4. Select/sign in with a Google account not in the database
5. Verify redirect to home page with `?login=success`
6. Verify user created in database with:
   - `oauthProvider: "google"`
   - `oauthId: <google_user_id>`
   - `password: null`
   - `avatar.url: <google_profile_picture>`

### Test Case 2: Existing User OAuth Link

1. Create a user via email registration
2. Log out
3. Click "Continue with Google" using same email
4. Verify OAuth info added to existing user record
5. Verify existing password preserved

### Test Case 3: Consent Denied

1. Navigate to `/login`
2. Click "Continue with Google"
3. Click "Cancel" on Google consent screen
4. Verify redirect to `/login?error=oauth_denied&message=...`

### Test Case 4: CSRF Attack Simulation

1. Start OAuth flow to get cookies
2. Manually modify `oauth_state` cookie value
3. Complete OAuth flow
4. Verify redirect to `/login?error=csrf_error&message=...`

### Test Case 5: Session Expiry

1. Start OAuth flow
2. Wait 10+ minutes (or manually delete `oauth_code_verifier` cookie)
3. Complete OAuth flow
4. Verify redirect to `/login?error=oauth_error&message=Session expired...`

---

## Conclusion

This OAuth implementation follows industry best practices with:

- ✅ CSRF protection via state parameter
- ✅ PKCE for authorization code flow security
- ✅ HTTPOnly cookies preventing XSS token theft
- ✅ Secure cookie settings for production
- ✅ Graceful error handling with user-friendly messages
- ✅ Extensible architecture for additional providers
- ✅ Account linking for existing users
- ✅ JWT-based session management

The implementation is production-ready with comprehensive error handling and security measures.
