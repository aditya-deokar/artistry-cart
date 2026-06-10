# Docker In Artistry Cart

## Docker Asset Map

Important files:

```text
docker/backend.Dockerfile
docker/frontend.Dockerfile
docker/compose/docker-compose.infra.yml
docker/compose/docker-compose.apps.yml
docker/compose/docker-compose.full.yml
libs/docker-compose.yml
docker-compose.test.yml
.dockerignore
```

## Backend Dockerfile

Purpose:

```text
build and run one backend Nx app/service
```

Key ideas:

- Node 20 base
- pnpm through corepack
- install dependencies
- run `prisma generate`
- build selected Nx app
- copy built output to runtime image
- install production dependencies
- run as `node`
- start with `node main.js`

## Frontend Dockerfile

Purpose:

```text
build and run one Next.js frontend app
```

Key ideas:

- build selected Nx frontend
- use Next.js standalone output
- copy `.next/static`
- copy public assets
- run as `node`
- start with `node server.js`

## Infra Compose

`docker/compose/docker-compose.infra.yml` defines:

- MongoDB
- Redis
- Zookeeper
- Kafka
- Kafka UI

It also defines:

- health checks
- networks
- volumes
- Kafka advertised listener for compose network

## Full Compose

`docker/compose/docker-compose.full.yml` combines:

- infra services
- app services
- frontends

It uses `extends` to reuse definitions.

## Kafka Local Compose

`libs/docker-compose.yml` provides a Kafka-focused local setup:

- Zookeeper
- Kafka
- Kafka UI on `8089`

Useful when working specifically on Kafka analytics.

## Test Compose

`docker-compose.test.yml` provides:

- MongoDB test on `27018`
- Redis test on `6380`
- health checks
- temporary database storage

Useful for e2e tests and CI-like local validation.

## Build Example: Backend

Example shape:

```bash
docker build -f docker/backend.Dockerfile . --build-arg APP_NAME=auth-service --build-arg BUILD_OUTPUT=apps/auth-service/dist --build-arg APP_PORT=6001 -t artistry-cart-auth-service
```

## Build Example: Frontend

Example shape:

```bash
docker build -f docker/frontend.Dockerfile . --build-arg APP_NAME=user-ui --build-arg APP_ROOT=apps/user-ui --build-arg OUTPUT_ROOT=apps/user-ui --build-arg APP_PORT=3000 -t artistry-cart-user-ui
```

## Interview Explanation

If asked "How is Docker used in Artistry Cart?", say:

> Artistry Cart uses Docker for both local infrastructure and application packaging. Compose files run MongoDB, Redis, Kafka, Kafka UI, and app stacks. The backend Dockerfile builds selected Nx backend services with Prisma generation and runs `node main.js`. The frontend Dockerfile builds selected Next.js apps and runs the standalone server. Test Compose provides isolated MongoDB and Redis ports for e2e workflows.

