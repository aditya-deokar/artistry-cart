# Seller UI

## Overview

`seller-ui` is the seller-facing Next.js application for onboarding, dashboard operations, product management, event and discount management, order review, and seller workflow tooling.

It is operational rather than editorial in character, and its structure reflects that.

## Responsibilities

- seller login and signup
- seller onboarding and shop/product setup flows
- dashboard landing and navigation
- product management
- order review
- event management
- discount management
- seller operational tooling and internal UI workflows

## Route Structure

Major route areas include:

- auth routes: `/login`, `/signup`
- dashboard routes under `(routes)/dashboard`
- product creation and edit flows
- all-products and order pages
- events and event-creation pages
- discounts and discount-creation pages
- onboarding or new-seller flows under `dashboard/new-seller/create`
- success page

## State And Data Strategy

Key client-side patterns:

- React Query for server-state handling
- Zustand stores for products, offers, events, and discounts
- persisted product-store preferences and filters
- component-heavy dashboard modules for product, event, discount, order, and offer management

## Runtime Behavior

- Next.js App Router application
- default local port `3001`
- backend API access is driven by `NEXT_PUBLIC_SERVER_URI`
- global layout includes theming and toast notifications
- the visual shell is more dashboard-like and operational than `user-ui`

## Internal Structure

Key folders:

- `src/app`
- `src/components`
- `src/hooks`
- `src/store`
- `src/shared`
- `src/lib`
- `src/utils`

This app contains many reusable dashboard-oriented modules such as tables, filters, analytics widgets, bulk actions, and form wrappers.

## Integration Points

- auth-service for seller auth and onboarding
- product-service for products, discounts, offers, and events
- order-service for seller order and earnings flows
- user-ui deep links through `NEXT_PUBLIC_USER_UI_LINK`

## Strengths

- operational UI concerns are clearly separated from the buyer-facing experience
- stateful dashboard behavior is supported with domain-specific stores
- route structure mirrors seller tasks closely

## Tradeoffs

- there are multiple overlapping dashboard implementations and route patterns, which may indicate some evolution in structure over time
- state is distributed across React Query, Zustand stores, and component-local state
- the app depends heavily on backend route consistency across several services

## Future Hardening

- standardize dashboard route conventions and remove overlapping patterns where possible
- document domain store ownership more explicitly
- add a seller-workflow map covering product, event, discount, and order flows end to end
