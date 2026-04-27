# External Integrations

## Overview

The platform integrates with several external systems for payments, auth, AI, media, messaging, cache, and event transport.

This document catalogs those integration points and their responsibilities.

## Stripe

### Used by

- `order-service`
- `auth-service` seller onboarding flow
- `user-ui` checkout client

### Responsibilities

- payment sessions and payment intents
- webhook-based payment state finalization
- seller account or onboarding links
- payout-related identifiers

### Key variables

- `STRIPE_SECRETE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`

### Key events handled

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`
- `account.updated`
- `transfer.created`

## OAuth Providers

### Used by

- `auth-service`

### Providers

- Google
- GitHub
- Facebook

### Responsibilities

- external identity sign-in
- callback-based account linking or login

### Key variables

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID`
- `FACEBOOK_CLIENT_SECRET`
- `OAUTH_REDIRECT_BASE_URL`

## SMTP / Email

### Used by

- `auth-service`
- `order-service`

### Responsibilities

- registration and password-reset email flows
- order-related email sending

### Key variables

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SERVICE`
- `SMTP_USER`
- `SMTP_PASS`

## Redis

### Used by

- shared package `packages/libs/redis`
- visible consumers include `auth-service` and `order-service`

### Responsibilities

- auxiliary cache or short-lived support behavior
- not the durable system of record

### Key variables

- `REDIS_ENABLED`
- `REDIS_URL`

## Kafka

### Used by

- `user-ui` producer
- `kafka-service` consumer

### Responsibilities

- asynchronous user-activity transport
- analytics materialization input

### Key variables

- `KAFKA_BROKERS`
- `KAFKA_CLIENT_ID`
- `KAFKA_SSL`
- `KAFKA_SASL_USERNAME`
- `KAFKA_SASL_PASSWORD`
- `KAFKA_SASL_MECHANISM`
- `KAFKA_CONSUMER_GROUP_ID`
- `KAFKA_USER_EVENTS_TOPIC`
- `KAFKA_CONSUMER_BATCH_INTERVAL_MS`

## ImageKit

### Used by

- shared package `packages/libs/imageKit`
- AI Vision workflows

### Responsibilities

- media upload and delivery
- generated concept image support

### Key variables

- `IMAGEKIT_PUBLIC_API_KEY`
- `IMAGEKIT_PRIVATE_API_KEY`
- `IMAGEKIT_URL_ENDPOINT`

## Google Gemini

### Used by

- `aivision-service`

### Responsibilities

- text generation
- image-related AI generation flows
- concept refinement
- AI-generated product description or structuring paths

### Key variables

- `GOOGLE_API_KEY`

### Configured model names

- `gemini-2.5-pro`
- `gemini-2.5-flash`
- `gemini-2.5-flash-image`

## Hugging Face

### Used by

- `aivision-service`

### Responsibilities

- supporting AI model access and possibly search/embedding-adjacent flows

### Key variables

- `HUGGINGFACE_API_KEY`

## MongoDB

### Used by

- effectively all backend services through Prisma

### Responsibilities

- primary persistence layer

### Key variables

- `DATABASE_URL`

## Integration Characteristics

The integration surface shows three architectural patterns:

1. Transactional external systems
   - Stripe
   - OAuth providers

2. Infrastructure external systems
   - MongoDB
   - Redis
   - Kafka

3. Product-capability external systems
   - Gemini
   - Hugging Face
   - ImageKit

This is a useful way to explain the system in interviews because not all external dependencies carry the same operational risk.

## Highest-Risk Integrations

The most operationally sensitive integrations are:

- Stripe, because it affects money state
- OAuth providers, because they affect user access
- Kafka, because it affects analytics correctness and recommendation freshness
- Gemini/ImageKit, because they affect AI Vision latency and output quality
