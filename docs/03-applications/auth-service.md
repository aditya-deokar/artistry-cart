# Auth Service

## Overview

`auth-service` owns identity and account lifecycle flows for both buyers and sellers. It handles registration, verification, login, refresh token flows, password reset flows, OAuth, and several user-profile endpoints.

It is one of the most important services in the repository because it sits on the critical path for both buyer and seller access.

## Responsibilities

- user registration and verification
- seller registration and verification
- buyer and seller login
- refresh token handling
- logout
- forgot-password and reset-password flows
- OAuth with Google, GitHub, and Facebook
- shop creation during seller onboarding
- current-user, address, and order-history profile endpoints
- Stripe onboarding link creation for sellers

## Inbound Interfaces

Mounted under `/api` in the service and proxied under `/auth/api` through the gateway.

Representative routes:

- `POST /user-registration`
- `POST /verify-user`
- `POST /login-user`
- `GET /logout-user`
- `POST /refresh-token`
- `GET /logged-in-user`
- `POST /forgot-password-user`
- `POST /reset-password-user`
- `POST /verify-forgot-password-user`
- `POST /seller-registration`
- `POST /verify-seller`
- `POST /create-shop`
- `POST /create-stripe-link`
- `POST /login-seller`
- `GET /logged-in-seller`
- `GET /me`
- `PATCH /me`
- `GET /me/orders`
- `GET /me/orders/:orderId`
- address book endpoints under `/me/addresses`

OAuth routes are mounted under `/api/oauth`:

- `/status`
- `/google`
- `/google/callback`
- `/github`
- `/github/callback`
- `/facebook`
- `/facebook/callback`

## Outbound Dependencies

- MongoDB via Prisma
- shared auth middleware and role middleware
- JWT signing and verification
- Redis-backed support paths through shared infra
- SMTP for email flows
- OAuth providers
- Stripe for seller onboarding connection flows

## Internal Structure

Key folders:

- `controller/`
- `oauth/`
- `routes/`
- `utils/`
- `__tests__/`

Notable support assets:

- email templates under `src/utils/email-templates`
- app-local OAuth setup docs in `apps/auth-service/OAUTH_SETUP.md`

## Data Touch Points

Primary models it touches include:

- `users`
- `sellers`
- `shops`
- `addresses`
- user-facing profile/order lookup paths

This service owns identity, but it also reaches into adjacent onboarding and profile concerns.

## Runtime Behavior

- listens on `6001` by default
- enables credentialed CORS for the buyer frontend and `FRONTEND_URL`
- uses cookie parsing plus JSON body parsing
- relies on shared `errorMiddleware`
- rehydrates authenticated users via shared JWT middleware

## Tests

This service has strong test signals:

- controller specs
- OAuth controller spec
- auth helper and cookie utility specs
- unit and integration support under `src/__tests__/`
- dedicated e2e project in `apps/auth-service-e2e`

## Strengths

- covers both local auth and OAuth
- shared middleware keeps auth enforcement consistent across services
- seller and buyer flows are unified in one identity boundary
- testing footprint is stronger here than in many other apps

## Tradeoffs

- the service owns more than pure authentication; profile, addresses, shop creation, and order-history reads expand its scope
- env surface is broad because auth, email, Stripe onboarding, and OAuth all meet here
- token, cookie, and redirect behavior need careful consistency across frontend flows

## Future Hardening

- separate pure identity responsibilities from profile/read-model concerns if service scope keeps growing
- normalize env naming and secret conventions
- document refresh-token and cookie strategy more formally
- consider clearer boundary ownership for shop creation and order-history reads
