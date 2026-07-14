# Ports, Networks, Volumes, Health Checks, And Env

## Ports

Ports expose container services to the host machine.

Example:

```yaml
ports:
  - "8089:8089"
```

Format:

```text
hostPort:containerPort
```

If MongoDB container listens on `27017`, mapping:

```text
27018:27017
```

means host uses `localhost:27018`.

## Internal Versus External Ports

Inside Compose network, services talk by service name and container port.

Example:

```text
mongodb:27017
redis:6379
kafka:9092
```

From host machine, use mapped host ports.

Example:

```text
localhost:27018 for test MongoDB
```

## Networks

Networks let containers talk to each other.

Artistry Cart compose defines networks such as:

```text
artistry-cart-edge
artistry-cart-app
artistry-cart-data
```

Network separation helps organize traffic:

- edge-facing services
- app-to-app traffic
- data infrastructure traffic

## Volumes

Volumes persist data outside container lifecycle.

Example:

```yaml
volumes:
  mongodb-data:
```

Why:

```text
container removed
volume remains
data can persist
```

For tests, using temporary storage can make cleanup easier.

## Health Checks

Health checks tell Compose whether a container is healthy.

Example:

```yaml
healthcheck:
  test: ["CMD", "redis-cli", "ping"]
  interval: 10s
  timeout: 5s
  retries: 10
```

Health checks help order startup and improve debugging.

## Depends On

`depends_on` controls startup order.

With health conditions:

```yaml
depends_on:
  kafka:
    condition: service_healthy
```

This waits until dependency is healthy before starting dependent service.

## Environment Variables

Compose can set env vars:

```yaml
environment:
  MONGO_INITDB_DATABASE: artistry-cart
```

Apps often need:

- `DATABASE_URL`
- `REDIS_URL`
- `KAFKA_BROKERS`
- service URLs
- secrets

Do not commit production secrets into Compose files.

## Container DNS

Inside Compose, service names become DNS names.

Example:

```text
kafka-service can connect to kafka:9092
api-gateway can connect to auth-service:6001
```

Do not use `localhost` inside a container to refer to another container.

Inside a container:

```text
localhost = same container
```

## Interview Explanation

If asked "How do containers communicate locally?", say:

> In Docker Compose, containers communicate over Compose networks using service names as DNS names, such as `mongodb:27017` or `redis:6379`. Ports expose container services to the host machine. Volumes persist data, environment variables configure containers, and health checks help verify dependencies are ready.

## Connection To Artistry Cart

Artistry Cart uses:

- MongoDB and Kafka volumes for persistent local infra
- data/edge/app networks
- health checks for MongoDB, Redis, Kafka
- Kafka UI exposed on host port `8089`
- test MongoDB on host `27018`
- test Redis on host `6380`

