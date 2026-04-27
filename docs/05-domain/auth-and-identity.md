# Auth And Identity

## Domain Summary

The auth and identity domain supports both buyer and seller access patterns. It covers registration, verification, login, refresh token handling, OAuth, role-based access, and authenticated profile access.

This domain is broader than pure login. It also reaches into onboarding and account-adjacent read flows.

## Main Actors

- buyers
- sellers
- admins

## Owning Components

- `auth-service`
- shared middleware in `packages/middleware`
- both frontends, especially auth route groups and protected flows

## Core Data Models

- `users`
- `sellers`
- `shops`
- `addresses`
- `UserRole`

## Main Flows

### Buyer auth flow

- buyer signs up or logs in through `user-ui`
- request reaches `auth-service`
- credentials or verification codes are checked
- JWTs are issued
- later protected routes rehydrate the account with shared middleware

### Seller onboarding flow

- seller signs up
- seller verifies account
- seller creates or links a shop
- Stripe onboarding setup can be triggered for payout-related flows

### OAuth flow

- buyer starts Google, GitHub, or Facebook login
- provider callback returns to `auth-service`
- service maps provider identity to local account
- frontend is redirected with authenticated state

## Cross-Service Role

Identity is consumed across:

- product-service protected seller/admin routes
- order-service customer and seller flows
- recommendation-service protected user recommendation route
- AI Vision authenticated save or send-to-artisans actions

## Strengths

- one domain boundary handles both local auth and OAuth
- shared middleware keeps protected backend routes consistent
- role-based access is explicit in backend route composition

## Tradeoffs

- auth-service scope includes more than identity alone
- user and seller concepts are both identity and business actors, which increases complexity
- refresh-token, cookie, and redirect strategy should be documented carefully as the platform grows

## Interview Framing

A strong way to describe this domain is:

- identity is centralized
- authorization is shared
- onboarding is partially colocated with auth for pragmatic reasons
