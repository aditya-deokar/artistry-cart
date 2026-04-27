# Environment Variables

## Purpose

This document captures the environment-variable surface used by the current codebase. It is broader than `.env.example`, because several runtime integrations are referenced directly in code but are not yet fully represented in the example file.

## Baseline Variables

### Database

- `DATABASE_URL`
  - used by Prisma-backed services
  - local default in `.env.example`: `mongodb://localhost:27017/artistry-cart`

### Frontend and host

- `FRONTEND_URL`
  - used by backend CORS and redirect flows
  - local default in `.env.example`: `http://localhost:3000`

- `HOST`
  - shared host binding override for backend services
  - Phase 1 runtime standardization now defaults services to `0.0.0.0`

- `PORT`
  - optional port override for individual services

- `NODE_ENV`
  - affects cookie security and error detail behavior in multiple services

- `CORS_ALLOWED_ORIGINS`
  - comma-separated list of allowed browser origins for services that use the shared runtime CORS helper
  - local default in `.env.example`: `http://localhost:3000,http://localhost:3001`

### Internal service URLs

These are primarily used by `api-gateway` and become especially important in Docker and Kubernetes, where `localhost` should be replaced with service discovery names.

- `AUTH_SERVICE_URL`
  - local default in `.env.example`: `http://localhost:6001`

- `PRODUCT_SERVICE_URL`
  - local default in `.env.example`: `http://localhost:6002`

- `ORDER_SERVICE_URL`
  - local default in `.env.example`: `http://localhost:6004`

- `RECOMMENDATION_SERVICE_URL`
  - local default in `.env.example`: `http://localhost:6005`

- `AIVISION_SERVICE_URL`
  - local default in `.env.example`: `http://localhost:6006`

## Auth and Token Variables

- `ACCESS_TOKEN_SECRET`
  - JWT signing and verification

- `REFRESH_TOKEN_SECRET`
  - refresh token signing and verification

## OAuth Variables

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID`
- `FACEBOOK_CLIENT_SECRET`
- `OAUTH_REDIRECT_BASE_URL`
  - local fallback in code: `http://localhost:6001`

## Redis Variables

- `REDIS_ENABLED`
  - feature toggle for shared Redis initialization
  - `.env.example` default: `true`

- `REDIS_URL`
  - `.env.example` default: `redis://localhost:6379`

## Kafka Variables

- `KAFKA_BROKERS`
  - `.env.example` default: `localhost:9092`

- `KAFKA_CLIENT_ID`
  - `.env.example` default: `kafka-service`

- `KAFKA_SSL`

- `KAFKA_SASL_USERNAME`

- `KAFKA_SASL_PASSWORD`

- `KAFKA_SASL_MECHANISM`
  - code supports `plain`, `scram-sha-256`, and `scram-sha-512`

- `KAFKA_CONSUMER_GROUP_ID`
  - `.env.example` default: `user-events-group`

- `KAFKA_USER_EVENTS_TOPIC`
  - `.env.example` default: `users-events`

- `KAFKA_CONSUMER_BATCH_INTERVAL_MS`
  - `.env.example` default: `3000`

## Stripe Variables

- `STRIPE_SECRETE_KEY`
  - note: the current code uses the name `STRIPE_SECRETE_KEY`
  - this spelling is inconsistent with standard Stripe naming and should be documented carefully until normalized in code

- `STRIPE_WEBHOOK_SECRET`

- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
  - used by `user-ui`

## SMTP / Email Variables

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SERVICE`
- `SMTP_USER`
- `SMTP_PASS`

These are used by auth and order email-sending utilities.

## AI Vision Variables

- `GOOGLE_API_KEY`
  - Gemini-related configuration

- `HUGGINGFACE_API_KEY`

- `IMAGEKIT_PUBLIC_API_KEY`
- `IMAGEKIT_PRIVATE_API_KEY`
- `IMAGEKIT_URL_ENDPOINT`

- `LOG_LEVEL`
  - used by the AI Vision service logger

## Frontend Public Variables

### Shared frontend API access

- `NEXT_PUBLIC_SERVER_URI`
  - used by both frontends to reach backend APIs
  - typical local value: `http://localhost:8080`

- `NEXT_PUBLIC_FRONTEND_URL`
  - used in checkout return URL construction in `user-ui`

### AI Vision frontend

- `NEXT_PUBLIC_AI_VISION_API_URL`
  - fallback in code points to gateway-routed AI Vision API
  - local fallback: `http://localhost:8080/ai-vision/api/v1/ai`

### Seller UI

- `NEXT_PUBLIC_USER_UI_LINK`
  - used by seller flows that deep-link into buyer-facing product pages

## Test-Oriented Variables Referenced In E2E Helpers

- `AUTH_SERVICE_URL`
- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`
- `TEST_SELLER_EMAIL`
- `TEST_SELLER_PASSWORD`

These are not part of the normal app runtime, but they are referenced by e2e helpers and should be considered part of the broader project configuration surface.

## Recommended Local `.env` Baseline

The following list is a practical local baseline for most backend work:

```dotenv
DATABASE_URL="mongodb://localhost:27017/artistry-cart"
FRONTEND_URL="http://localhost:3000"
HOST="0.0.0.0"
CORS_ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"
AUTH_SERVICE_URL="http://localhost:6001"
PRODUCT_SERVICE_URL="http://localhost:6002"
ORDER_SERVICE_URL="http://localhost:6004"
RECOMMENDATION_SERVICE_URL="http://localhost:6005"
AIVISION_SERVICE_URL="http://localhost:6006"
ACCESS_TOKEN_SECRET="replace-me"
REFRESH_TOKEN_SECRET="replace-me"
REDIS_ENABLED="true"
REDIS_URL="redis://localhost:6379"
KAFKA_BROKERS="localhost:9092"
KAFKA_CLIENT_ID="kafka-service"
KAFKA_SSL="false"
KAFKA_SASL_USERNAME=""
KAFKA_SASL_PASSWORD=""
KAFKA_SASL_MECHANISM="plain"
KAFKA_CONSUMER_GROUP_ID="user-events-group"
KAFKA_USER_EVENTS_TOPIC="users-events"
KAFKA_CONSUMER_BATCH_INTERVAL_MS="3000"
OAUTH_REDIRECT_BASE_URL="http://localhost:6001"
```

Add Stripe, SMTP, OAuth, AI, and frontend variables only when your flows require them.

## Documentation Gap To Track

`.env.example` now covers the core Phase 1 runtime contract, but it still does not capture every optional integration variable used by Stripe, SMTP, OAuth, and AI workflows.

## Related Docs

- [Local Development](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/01-getting-started/local-development.md>)
- [Troubleshooting](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/01-getting-started/troubleshooting.md>)
