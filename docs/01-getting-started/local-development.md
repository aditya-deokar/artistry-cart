# Local Development

## Goal

This guide explains how to boot the repository locally with enough fidelity to work on the buyer UI, seller UI, gateway, and backend services.

## Prerequisites

Install or provision:

- Node.js 20
- pnpm 9
- MongoDB
- Redis
- Docker, if you want to run Kafka locally from Compose

## Install Dependencies

From the repository root:

```bash
pnpm install
```

## Environment Setup

Start from `.env.example`, then add any variables required for the flows you plan to touch.

At minimum, local development usually needs:

- `DATABASE_URL`
- `REDIS_URL`
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `FRONTEND_URL`
- `CORS_ALLOWED_ORIGINS`

Additional flows require extra configuration:

- OAuth: Google, GitHub, Facebook credentials
- payments: Stripe keys and webhook secret
- email: SMTP settings
- AI Vision: Gemini, Hugging Face, ImageKit keys
- frontend runtime: `NEXT_PUBLIC_SERVER_URI`, `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`, and related public variables

See [Environment Variables](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/01-getting-started/environment-variables.md>) for the full inventory.

## Start Local Infrastructure

### Kafka

The repo includes a Compose file for Kafka-related infrastructure:

```bash
docker compose -f libs/docker-compose.yml up -d
```

This starts:

- Zookeeper
- Kafka broker
- Kafka UI on port `8089`

### MongoDB and Redis

MongoDB and Redis are expected separately. The repository does not currently include them in the provided Compose file.

Recommended defaults:

- MongoDB: `mongodb://localhost:27017/artistry-cart`
- Redis: `redis://localhost:6379`

## Recommended Service Startup Order

When bringing the stack up manually, use this order:

1. MongoDB
2. Redis
3. Kafka infrastructure
4. `auth-service`
5. `product-service`
6. `order-service`
7. `recommendation-service`
8. `aivision-service`
9. `api-gateway`
10. `user-ui`
11. `seller-ui`

The gateway now supports environment-based upstream service URLs, but the default local values still target the standard local ports, so starting the services before the gateway makes local debugging easier.

## Run Backend Services

```bash
pnpm exec nx serve auth-service
pnpm exec nx serve product-service
pnpm exec nx serve order-service
pnpm exec nx serve recommendation-service
pnpm exec nx serve aivision-service
pnpm exec nx serve api-gateway
```

Optional analytics consumer:

```bash
pnpm exec nx serve kafka-service
```

## Run Frontend Apps

```bash
pnpm exec nx dev user-ui
pnpm exec nx dev seller-ui
```

Helpful shortcuts already defined in the root package:

```bash
pnpm user-ui
pnpm seller-ui
```

## Suggested Minimal Local Setup

If you only need to work on shopper flows:

- MongoDB
- Redis
- `auth-service`
- `product-service`
- `order-service`
- `api-gateway`
- `user-ui`

If you only need seller flows:

- MongoDB
- Redis
- `auth-service`
- `product-service`
- `order-service`
- `api-gateway`
- `seller-ui`

If you need recommendation or analytics flows:

- add Kafka
- add `recommendation-service`
- add `kafka-service`

If you need AI Vision flows:

- add `aivision-service`
- configure AI and ImageKit keys

## Important Routing Notes

- `user-ui` uses Next.js rewrites to forward `/auth/api/*`, `/product/api/*`, `/order/api/*`, and `/ai-vision/api/*` to `NEXT_PUBLIC_SERVER_URI`, which defaults to the gateway on `http://localhost:8080`
- `seller-ui` talks to backend APIs through `NEXT_PUBLIC_SERVER_URI`
- `api-gateway` proxies to the backend services on ports `6001`, `6002`, `6004`, `6005`, and `6006`
- standardized health endpoints are `GET /healthz` and `GET /readyz`, with some legacy aliases still available

## Common Local URLs

- buyer app: `http://localhost:3000`
- seller app: `http://localhost:3001`
- gateway readiness: `http://localhost:8080/readyz`
- gateway legacy health alias: `http://localhost:8080/gateway-health`
- auth service: `http://localhost:6001`
- product service: `http://localhost:6002`
- order service: `http://localhost:6004`
- recommendation service: `http://localhost:6005`
- AI Vision service: `http://localhost:6006`
- Kafka UI: `http://localhost:8089`

The complete port reference is in [Port Map](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/11-reference/port-map.md>).

## Before Opening A PR

At a minimum:

- install dependencies cleanly
- run the affected service locally
- run the most relevant test target
- confirm env assumptions are documented if you introduced new config

## Related Docs

- [Commands and Workflows](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/01-getting-started/commands-and-workflows.md>)
- [Troubleshooting](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/01-getting-started/troubleshooting.md>)
