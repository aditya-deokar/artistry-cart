# Middleware

## Overview

`packages/middleware` contains shared authorization and authentication helpers used by the backend services.

These utilities are part of the platform contract between route handlers and request identity.

## What It Contains

- `isAuthenticated`
- `isAdmin`
- role guards in `authorizedRoles.ts`
  - `isSeller`
  - `isUser`

## Core Behavior

### `isAuthenticated`

This middleware:

- reads JWT from `access_token` cookie or bearer token header
- verifies the token with `ACCESS_TOKEN_SECRET`
- loads the matching `users` or `sellers` record from MongoDB
- attaches `req.user`
- attaches `req.role`

This means auth is not just token verification. It is also account hydration.

### `isSeller` and `isUser`

These guards depend on `req.role` already being populated and enforce role-scoped access.

### `isAdmin`

This guard checks `req.user.role === 'ADMIN'` and returns explicit `401` or `403` responses when needed.

## Why It Exists

This package prevents every service from reimplementing:

- JWT extraction
- token verification
- user lookup
- role guard behavior

It also creates a consistent protected-route pattern across auth, product, order, and recommendation services.

## Design Implications

Because `isAuthenticated` loads the full account on each protected request:

- services can rely on hydrated identity state
- authorization logic is simpler at the route layer
- protected request latency includes a database read

## Strengths

- shared identity pattern across services
- simpler service-level route code
- good fit for a monorepo with many protected backend routes

## Tradeoffs

- auth middleware is coupled to the shared MongoDB schema
- every protected request pays for token verification plus account lookup
- role strings and identity semantics must stay consistent across services

## Special Case

`aivision-service` uses its own local auth middleware because it supports both anonymous and authenticated usage. That is an intentional divergence, not necessarily a flaw.
