# Docker Compose Strategy

## Purpose

This document defines the Docker Compose strategy for local development and integration testing of the Artistry Cart Nx monorepo.

It explains:

- what Compose should orchestrate in this repository
- how services should be grouped and exposed
- how environment variables, networks, volumes, and health checks should work
- how the existing Compose files should evolve into a canonical local platform

## Why Compose Matters Here

This repository is not a single app. It is a local platform made up of:

- two Next.js frontends
- multiple backend services
- a Kafka worker
- MongoDB
- Redis
- Kafka and Kafka UI

Running that stack manually is possible, but it is noisy and fragile. Docker Compose gives the team:

- one repeatable startup path
- consistent network names and service discovery
- easier onboarding
- a clean bridge between laptop workflows and later Kubernetes deployment

## Current Baseline

The repo already has two useful but partial Compose assets:

- [docker-compose.test.yml](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docker-compose.test.yml>)
  - MongoDB and Redis for e2e tests
- [libs/docker-compose.yml](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/libs/docker-compose.yml>)
  - Kafka, Zookeeper, and Kafka UI for local infrastructure

Those files solve isolated pieces of the problem, but they do not yet provide a full application stack.

## Strategy Goals

The Compose design for this monorepo should aim for:

- one-command startup for the whole stack
- support for partial startup when a developer only needs some services
- stable service names that match future Kubernetes DNS-style naming
- minimal host port exposure
- health-based startup ordering
- clear separation between app traffic and stateful infrastructure
- no hardcoded localhost dependencies inside containers

## Canonical Compose Layout

The recommended long-term file layout is:

```text
docker/
  compose/
    docker-compose.infra.yml
    docker-compose.apps.yml
    docker-compose.full.yml
    docker-compose.override.example.yml
```

Recommended meaning of each file:

| File | Purpose |
| --- | --- |
| `docker-compose.infra.yml` | MongoDB, Redis, Kafka, Zookeeper, Kafka UI |
| `docker-compose.apps.yml` | frontends, gateway, backend services, worker |
| `docker-compose.full.yml` | convenience entry point that includes infra + apps |
| `docker-compose.override.example.yml` | optional local overrides for developers |

The existing root test compose file can remain for e2e use. The Kafka compose file under `libs/` can remain temporarily, but the canonical direction should be the `docker/compose/` folder above.

## Service Inventory

Recommended local Compose service names:

| Compose service | Role | Host exposure | Internal URL |
| --- | --- | --- | --- |
| `user-ui` | buyer frontend | yes | `http://user-ui:3000` |
| `seller-ui` | seller frontend | yes | `http://seller-ui:3001` |
| `api-gateway` | public backend edge | yes | `http://api-gateway:8080` |
| `auth-service` | internal API | no | `http://auth-service:6001` |
| `product-service` | internal API | no | `http://product-service:6002` |
| `order-service` | internal API | no | `http://order-service:6004` |
| `recommendation-service` | internal API | no | `http://recommendation-service:6005` |
| `aivision-service` | internal API | no | `http://aivision-service:6006` |
| `kafka-service` | worker | no | n/a |
| `mongodb` | database | optional | `mongodb://mongodb:27017/artistry-cart` |
| `redis` | cache | optional | `redis://redis:6379` |
| `zookeeper` | Kafka dependency | no | `zookeeper:2181` |
| `kafka` | broker | optional | `kafka:9092` |
| `kafka-ui` | local admin tool | optional | `http://kafka-ui:8089` |

## Host Port Exposure Rules

By default, only these services should publish ports to the host:

- `user-ui`
- `seller-ui`
- `api-gateway`
- `kafka-ui`

Optional host exposure:

- `mongodb`
- `redis`
- `kafka`

Internal-only by default:

- `auth-service`
- `product-service`
- `order-service`
- `recommendation-service`
- `aivision-service`
- `kafka-service`
- `zookeeper`

Why this matters:

- fewer host port conflicts
- clearer security posture
- easier parity with Kubernetes, where most services are internal

## Network Strategy

Recommended Compose networks:

```text
edge
app
data
```

Recommended use:

| Network | Purpose | Members |
| --- | --- | --- |
| `edge` | host-facing traffic | `user-ui`, `seller-ui`, `api-gateway`, optional `kafka-ui` |
| `app` | internal application traffic | all frontends, gateway, APIs, workers |
| `data` | infra access | APIs, workers, `mongodb`, `redis`, `kafka`, `zookeeper` |

This is a local-development simplification, but it helps keep service intent clear.

## Environment Variable Strategy

Compose should not become the source of truth for business configuration. It should inject values that are already defined by the app runtime contract.

Recommended sources:

- shared repo `.env` for local defaults
- a Compose-specific env file for container-friendly values when needed
- `environment:` blocks only for explicit overrides

Recommended pattern:

- keep app config names the same in local Node and Docker runs
- change only the values, not the variable names

Examples of container-friendly replacements:

| Variable | Local non-container example | Compose value |
| --- | --- | --- |
| `DATABASE_URL` | `mongodb://localhost:27017/artistry-cart` | `mongodb://mongodb:27017/artistry-cart` |
| `REDIS_URL` | `redis://localhost:6379` | `redis://redis:6379` |
| `KAFKA_BROKERS` | `localhost:9092` | `kafka:9092` |
| `AUTH_SERVICE_URL` | `http://localhost:6001` | `http://auth-service:6001` |
| `PRODUCT_SERVICE_URL` | `http://localhost:6002` | `http://product-service:6002` |
| `ORDER_SERVICE_URL` | `http://localhost:6004` | `http://order-service:6004` |
| `RECOMMENDATION_SERVICE_URL` | `http://localhost:6005` | `http://recommendation-service:6005` |
| `AIVISION_SERVICE_URL` | `http://localhost:6006` | `http://aivision-service:6006` |
| `NEXT_PUBLIC_SERVER_URI` | `http://localhost:8080` | `http://api-gateway:8080` for container-to-container, host URL for browser-facing use |

Important frontend note:

- browser traffic still needs a host-reachable URL such as `http://localhost:8080`
- server-side rewrites inside Next can use the internal service name only if the rendered runtime sits inside the same Compose network and the browser never sees that value

Because of that, frontends should stay deliberate about:

- server-side internal calls
- browser-side public calls

## Health Check Strategy

Compose should use health checks aggressively. The current repo has partial health endpoints already, but the target should be standardized.

Recommended target endpoints:

- `/healthz` for process liveness
- `/readyz` for dependency readiness

Until code is standardized, Compose can use temporary endpoints such as `/`, `/health`, or `/gateway-health` where required.

Recommended health-check behavior:

| Service | Current usable check | Target check |
| --- | --- | --- |
| `api-gateway` | `/gateway-health` | `/readyz` |
| `auth-service` | `/` | `/readyz` |
| `product-service` | `/` | `/readyz` |
| `order-service` | `/` | `/readyz` |
| `recommendation-service` | `/` | `/readyz` |
| `aivision-service` | `/health` | `/readyz` |
| `mongodb` | `mongosh ping` | same |
| `redis` | `redis-cli ping` | same |
| `kafka` | broker or admin check | same |

## Startup Ordering

Recommended dependency flow:

1. `mongodb`, `redis`, `zookeeper`, `kafka`
2. internal APIs and worker
3. `api-gateway`
4. `user-ui` and `seller-ui`
5. optional `kafka-ui`

Compose should rely on health rather than raw container start order where possible.

## Volume Strategy

Recommended persistence approach:

| Component | Persistence strategy |
| --- | --- |
| `mongodb` | named volume for day-to-day development, tmpfs for throwaway test stacks |
| `redis` | optional named volume or ephemeral storage, depending on workflow |
| `kafka` | named volume only if developers need retained topics locally |
| frontends and APIs | no persistent runtime volume in production-style stacks |

Avoid bind-mounting source code into production-like Compose files. If a watch-mode developer stack is added later, keep that separate from the main full-stack validation setup.

## Compose Profiles

Compose profiles are a good fit for this repo because not every developer needs the full surface area every time.

Recommended profiles:

| Profile | Includes |
| --- | --- |
| `core` | `user-ui`, `seller-ui`, `api-gateway`, core APIs, `mongodb`, `redis` |
| `ai` | `aivision-service` |
| `analytics` | `kafka`, `zookeeper`, `kafka-service`, `kafka-ui` |
| `full` | everything |
| `test` | throwaway infra for e2e-like workflows |

## Recommended Compose Conventions

All application containers should follow these runtime conventions:

- `HOST=0.0.0.0`
- explicit `PORT`
- `NODE_ENV=production` for production-style stacks
- non-root runtime user where the image supports it
- no baked-in secrets

All service names should match future Kubernetes resource names when practical. That reduces translation work later.

## Example Command Shapes

Full stack:

```bash
docker compose -f docker/compose/docker-compose.full.yml up --build
```

Infra only:

```bash
docker compose -f docker/compose/docker-compose.infra.yml up -d
```

Core app stack without analytics:

```bash
docker compose -f docker/compose/docker-compose.apps.yml --profile core up --build
```

## Recommended Implementation Steps

1. Keep `docker-compose.test.yml` as the test-only stack.
2. Fold Kafka infrastructure into a canonical infra compose file under `docker/compose/`.
3. Add a full-stack app compose file with stable service names.
4. Convert gateway and services to environment-driven upstreams.
5. Standardize health checks and switch `depends_on` to healthy conditions.
6. Add profiles for `core`, `analytics`, and `full`.

## Common Pitfalls To Avoid

- exposing every internal service to the host
- mixing dev watch-mode bind mounts into the production-like Compose stack
- using `localhost` inside container-to-container URLs
- letting Compose invent environment names that differ from the app runtime contract
- skipping health checks and relying only on start order

## Definition Of Done

The Compose strategy is in good shape when:

- a developer can start the full stack with one Compose command
- the gateway talks to services by service name, not `localhost`
- frontends and APIs share a predictable network contract
- core infra is reusable between dev and test setups
- service health determines startup ordering

## Related Docs

- [DevOps Implementation Plan](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/DevOps/DevOps-implemenatation.md>)
- [Dockerfile Standards](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/DevOps/dockerfile-standards.md>)
- [Kubernetes Deployment Guide](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/DevOps/kubernetes-deployment-guide.md>)
- [Environment Variables](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/01-getting-started/environment-variables.md>)
- [Port Map](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/11-reference/port-map.md>)
