# OAuth 2.0 Implementation with Arctic - Setup Guide

This document provides complete setup instructions for the OAuth 2.0 authentication using the Arctic library.

## Overview

The implementation provides secure third-party authentication using:
- **Arctic** - OAuth 2.0 abstraction library
- **Google OAuth** - First provider implementation
- **CSRF Protection** - State parameter validation
- **PKCE** - Proof Key for Code Exchange
- **JWT Tokens** - Session management

## Files Created/Modified

### New Files
- `apps/auth-service/src/oauth/providers.ts` - OAuth provider configuration
- `apps/auth-service/src/oauth/oauth.controller.ts` - OAuth request handlers
- `apps/auth-service/src/oauth/oauth.router.ts` - OAuth routes
- `apps/auth-service/src/oauth/index.ts` - Module exports

### Modified Files
- `apps/auth-service/src/main.ts` - Added OAuth router
- `prisma/schema.prisma` - Added OAuth fields to users model
- `apps/user-ui/src/app/(routes)/login/page.tsx` - Connected Google button
- `.env.example` - Added OAuth configuration

## Setup Instructions

### 1. Create Google OAuth Application

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Add authorized redirect URI:
   ```
   http://localhost:6001/api/oauth/google/callback
   ```
7. Copy the **Client ID** and **Client Secret**

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
# OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
OAUTH_REDIRECT_BASE_URL="http://localhost:6001"
FRONTEND_URL="http://localhost:3000"

# JWT Secrets (if not already configured)
ACCESS_TOKEN_SECRET="your-access-token-secret"
REFRESH_TOKEN_SECRET="your-refresh-token-secret"
```

### 3. Regenerate Prisma Client

After the schema changes, regenerate the Prisma client:

```bash
pnpm exec prisma generate
```

### 4. Start the Services

```bash
# Start all services
pnpm dev

# Or start individually
pnpm exec nx run auth-service:serve
pnpm exec nx run user-ui:dev
```

## API Endpoints

### OAuth Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/oauth/status` | Check configured providers |
| GET | `/api/oauth/google` | Initiate Google OAuth flow |
| GET | `/api/oauth/google/callback` | Handle OAuth callback |

### Example Flow

1. **Initiate Login**
   ```
   GET http://localhost:6001/api/oauth/google
   ```
   - Generates state and code verifier
   - Stores them in HTTPOnly cookies
   - Redirects to Google consent screen

2. **Google Consent**
   - User approves or denies access
   - Google redirects back with code and state

3. **Callback Handler**
   ```
   GET http://localhost:6001/api/oauth/google/callback?code=...&state=...
   ```
   - Validates state (CSRF protection)
   - Exchanges code for tokens
   - Fetches user info from Google
   - Creates/updates user in database
   - Generates JWT tokens
   - Redirects to frontend with auth cookies

4. **Frontend Success**
   ```
   http://localhost:3000?login=success
   ```

## Security Measures

### CSRF Protection
- State parameter generated using Arctic's `generateState()`
- Stored in HTTPOnly cookie with 10-minute expiry
- Validated on callback by comparing cookie state with query state

### PKCE (Proof Key for Code Exchange)
- Code verifier generated using Arctic's `generateCodeVerifier()`
- Stored in HTTPOnly cookie
- Used during token exchange for additional security

### Token Security
- Access tokens: 15-minute expiry
- Refresh tokens: 7-day expiry
- Both stored in HTTPOnly, Secure cookies
- SameSite: "none" in production, "lax" in development

## Error Handling

| Error | Response |
|-------|----------|
| User denies consent | Redirect to `/login?error=oauth_denied` |
| Invalid state/CSRF | Redirect to `/login?error=csrf_error` |
| Session expired | Redirect to `/login?error=oauth_error` |
| Google API failure | Redirect to `/login?error=oauth_error` |

## Database Schema

The `users` model now includes:

```prisma
model users {
  // ... existing fields
  
  // OAuth fields
  oauthProvider String?  // "google", "github", "microsoft", etc.
  oauthId       String?  // Provider-specific user ID
}
```

## Adding More Providers

To add a new OAuth provider (e.g., GitHub):

1. Add provider to `providers.ts`:
   ```typescript
   import { GitHub } from "arctic";
   
   export const githubOAuth = new GitHub(
     process.env.GITHUB_CLIENT_ID!,
     process.env.GITHUB_CLIENT_SECRET!,
     `${OAUTH_REDIRECT_BASE_URL}/api/oauth/github/callback`
   );
   ```

2. Add controller methods in `oauth.controller.ts`

3. Add routes in `oauth.router.ts`:
   ```typescript
   oauthRouter.get("/github", githubLogin);
   oauthRouter.get("/github/callback", githubCallback);
   ```

4. Update `.env.example` with new credentials

## Troubleshooting

### Common Issues

1. **"Google OAuth is not configured"**
   - Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env`

2. **"Security validation failed"**
   - CSRF state mismatch - ensure cookies are being set properly
   - Clear browser cookies and try again

3. **"redirect_uri_mismatch"**
   - Ensure the callback URL in Google Console exactly matches:
     `http://localhost:6001/api/oauth/google/callback`

4. **Cookies not being set**
   - Check CORS configuration allows credentials
   - Verify `sameSite` cookie settings for your environment
