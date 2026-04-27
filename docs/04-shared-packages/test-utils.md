# Test Utils

## Overview

`packages/test-utils` is the shared testing toolkit for the monorepo. It packages mocks, helpers, factories, and setup logic so service tests can stay focused on behavior instead of boilerplate.

## What It Contains

### Mocks

- Prisma
- Redis
- ImageKit
- Stripe
- Kafka
- Nodemailer

### Helpers

- request/response/next Express mocks
- mock JWT auth headers and cookies

### Data factories

- mock users
- mock sellers
- mock shops
- mock products
- mock orders
- mock events
- mock discounts
- mock analytics records
- mock payouts and refunds

### Setup

- shared global test env defaults
- custom matchers registration

## Why It Exists

This package does two important things:

- reduces repeated test scaffolding across services
- makes the monorepo feel like one engineering system rather than a pile of unrelated test suites

## Notable Design Choices

- global test setup disables Redis by default
- common secrets and URLs are seeded for test runtime
- console noise is suppressed unless `DEBUG` is set

These choices optimize for predictable and quiet local test runs.

## Strengths

- broad mock coverage across external dependencies
- strong ergonomics for controller and middleware tests
- helps keep service-level tests consistent

## Tradeoffs

- shared test utilities can become too magical if they hide too much setup
- changes to shared mocks can affect many suites at once
- broad factories are helpful, but they need maintenance as the schema evolves

## Interview Notes

This package is one of the strongest signs in the repo that the codebase has moved past purely ad hoc testing.
