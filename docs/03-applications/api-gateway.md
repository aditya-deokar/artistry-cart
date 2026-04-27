# API Gateway

## Overview

`api-gateway` is the client-facing backend entry point for the platform. It is an Express service that primarily handles cross-origin setup, request body parsing, rate limiting, cookie parsing, and proxy routing to downstream services.

It is intentionally thin. Most domain logic lives in the downstream services.

## Responsibilities

- expose a single backend entry point for the frontends
- proxy requests to auth, product, order, recommendation, and AI Vision services
- enforce coarse rate limiting
- initialize site configuration data at startup
- provide a lightweight health endpoint

## Inbound Interfaces

### Public endpoints

- `GET /gateway-health`

### Proxy prefixes

- `/auth` -> `auth-service`
- `/product` -> `product-service`
- `/order` -> `order-service`
- `/recommendation` -> `recommendation-service`
- `/ai-vision` -> `aivision-service`

## Outbound Dependencies

- `express-http-proxy` for downstream routing
- MongoDB via `initializeSiteConfig` on startup
- CORS configuration for `http://localhost:3000` and `http://localhost:3001`

## Internal Structure

Key files:

- `apps/api-gateway/src/main.ts`
- `apps/api-gateway/src/libs/initializeSiteConfig.ts`
- `apps/api-gateway/src/routes/proxy.integration.spec.ts`

## Runtime Behavior

- listens on `8080` by default
- trusts proxy headers with `app.set("trust proxy", 1)`
- applies request-size limits for JSON and URL-encoded bodies
- rate limits requests with a larger allowance for authenticated requests if `req.user` is present

## Data Touch Points

The gateway is mostly stateless, but not completely:

- on startup it initializes the `site_config` collection if missing

This means the gateway has a bootstrap side effect and is not purely a proxy.

## Tests

The app includes an integration-focused proxy test suite:

- `apps/api-gateway/src/routes/proxy.integration.spec.ts`

This is a good sign because routing bugs at the gateway boundary can break every frontend flow.

## Strengths

- simple mental model
- keeps frontend API targets centralized
- easy to extend with additional service routes
- integration tests validate proxy behavior and CORS assumptions

## Tradeoffs

- proxy targets are hardcoded to localhost ports, which limits deployment flexibility unless wrapped by env-aware infrastructure later
- gateway logic is still thin enough that some teams might choose direct frontend-to-service routing instead
- site configuration initialization slightly blurs the boundary between infrastructure routing and business bootstrap

## Future Hardening

- move upstream service URLs into configuration
- standardize health and readiness checks
- consider centralized auth propagation or request tracing headers
- separate bootstrap responsibilities from proxy runtime if stricter gateway purity is desired
