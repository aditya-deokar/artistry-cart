# Auth Contracts

## Overview

This document captures the authentication and authorization contracts used across the platform.

The codebase uses a few distinct auth patterns:

- shared JWT + cookie auth for most backend services
- optional bearer-token auth in AI Vision with anonymous fallback
- frontend refresh-token retry behavior through Axios interceptors

## Primary Auth Mechanisms

### JWT-based session auth

Most backend services rely on:

- `access_token` cookie
- optional `Authorization: Bearer <token>` header

The shared `isAuthenticated` middleware:

- verifies the JWT with `ACCESS_TOKEN_SECRET`
- resolves the referenced `users` or `sellers` record
- attaches `req.user`
- attaches `req.role`

### Refresh token flow

The frontends retry failed authenticated requests by calling:

- `POST /auth/api/refresh-token`

Observed frontend behavior:

- `user-ui` retries only for requests explicitly marked `requireAuth === true`
- `seller-ui` retries all `401` responses once

This is an important behavioral difference between the two clients.

### AI Vision auth model

AI Vision uses a different contract:

- bearer token is optional
- anonymous requests are allowed for many routes
- middleware generates:
  - `requestId`
  - `sessionToken`
- session token may come from:
  - `X-Session-Token` header
  - cookie `sessionToken`
  - generated fallback uuid

Protected AI Vision routes use `requireAuth` or `requireSeller`.

## Cookie Contract

Visible cookie behavior:

- auth cookies are set as `httpOnly`
- `secure` depends on `NODE_ENV === "production"`
- `sameSite` is:
  - `none` in production
  - `lax` in development
- cookie lifetime is 7 days in the helper we inspected

Known cookie names in active use:

- `access_token`
- `refresh_token`

## Authorization Roles

Observed roles and checks:

- user
- seller
- admin

Shared backend guards:

- `isSeller`
- `isUser`
- `isAdmin`

Role checks are not fully represented by one universal type system across every service, so documentation matters here.

## OAuth Contract

Supported providers:

- Google
- GitHub
- Facebook

Key endpoints:

- `/auth/api/oauth/google`
- `/auth/api/oauth/google/callback`
- `/auth/api/oauth/github`
- `/auth/api/oauth/github/callback`
- `/auth/api/oauth/facebook`
- `/auth/api/oauth/facebook/callback`

Key configuration:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID`
- `FACEBOOK_CLIENT_SECRET`
- `OAUTH_REDIRECT_BASE_URL`

## Frontend Auth Client Behavior

### `user-ui`

- uses credentialed Axios requests
- supports refresh retry queueing
- clears client store state on logout/refresh failure
- route middleware protects most non-public pages

### `seller-ui`

- uses credentialed Axios requests
- supports one refresh retry queue
- redirects to `/login` on refresh failure

## Service-by-Service Auth Expectations

| Service | Auth style |
| --- | --- |
| `auth-service` | issues and refreshes tokens, resolves identity |
| `product-service` | shared JWT auth for seller/admin routes |
| `order-service` | shared JWT auth for customer and seller flows |
| `recommendation-service` | shared JWT auth |
| `aivision-service` | optional auth plus route-level required auth |

## Contract Risks To Track

- frontend refresh behavior is not identical across buyer and seller clients
- role naming and case conventions should stay consistent across services
- cookie and bearer-token behavior should remain documented whenever auth flows change
- AI Vision's looser auth model is powerful but more complex than the default shared middleware path
