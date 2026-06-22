# Docker Compose And Local Infrastructure

## What Docker Compose Is

Docker Compose runs multiple containers together from a YAML file.

It is useful for local development and test infrastructure.

Example:

```text
MongoDB
Redis
Kafka
Kafka UI
backend services
frontends
```

One command can start them as a group.

## Compose Service

A service is one container definition.

Example:

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

## Common Commands

Start:

```bash
docker compose -f docker/compose/docker-compose.infra.yml up -d
```

Stop:

```bash
docker compose -f docker/compose/docker-compose.infra.yml down
```

Stop and remove volumes:

```bash
docker compose -f docker-compose.test.yml down -v
```

View logs:

```bash
docker compose -f docker/compose/docker-compose.infra.yml logs kafka
```

## Infrastructure Compose

Artistry Cart has:

```text
docker/compose/docker-compose.infra.yml
```

It defines:

- MongoDB
- Redis
- Zookeeper
- Kafka
- Kafka UI
- networks
- volumes
- health checks

## Full Compose

Artistry Cart has:

```text
docker/compose/docker-compose.full.yml
```

It extends infrastructure and app Compose definitions to run the larger platform shape.

Includes:

- infra services
- backend services
- frontends

## Test Compose

Artistry Cart has:

```text
docker-compose.test.yml
```

It starts:

- MongoDB test container on host port `27018`
- Redis test container on host port `6380`

This keeps test infrastructure separate from normal local infrastructure.

## Kafka Local Compose

Artistry Cart also has:

```text
libs/docker-compose.yml
```

It starts:

- Zookeeper
- Kafka
- Kafka UI

This is useful when developing Kafka analytics locally.

## Compose Extends

Compose files can reuse service definitions with `extends`.

Artistry Cart's full compose extends:

- infra services from `docker-compose.infra.yml`
- app services from `docker-compose.apps.yml`

This avoids duplicating service definitions.

## Interview Explanation

If asked "What is Docker Compose?", say:

> Docker Compose defines and runs multi-container environments from a YAML file. It is useful for local development and CI because you can start infrastructure like MongoDB, Redis, Kafka, and application services with consistent ports, networks, volumes, environment variables, and health checks.

## Connection To Artistry Cart

Compose gives Artistry Cart repeatable local infrastructure for:

- database
- cache
- Kafka broker
- Kafka UI
- full app/service environment
- e2e test dependencies

