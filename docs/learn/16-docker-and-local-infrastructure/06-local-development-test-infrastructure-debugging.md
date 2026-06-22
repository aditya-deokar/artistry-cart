# Local Development, Test Infrastructure, And Debugging

## Local Development Strategy

For microservices-style projects, do not always run everything.

Run what you need:

```text
working on product APIs:
  MongoDB
  Redis if needed
  product-service
  api-gateway
  user-ui or seller-ui if needed
```

Working on Kafka:

```text
Kafka
Kafka UI
kafka-service
producer path
MongoDB
```

## Starting Local Infra

Start core infra:

```bash
docker compose -f docker/compose/docker-compose.infra.yml up -d
```

Start Kafka-specific local setup:

```bash
docker compose -f libs/docker-compose.yml up -d
```

Start test infra:

```bash
docker compose -f docker-compose.test.yml up -d
```

Stop test infra and remove volumes:

```bash
docker compose -f docker-compose.test.yml down -v
```

## Debugging Containers

List running containers:

```bash
docker ps
```

Show logs:

```bash
docker logs <container>
```

Compose logs:

```bash
docker compose -f docker/compose/docker-compose.infra.yml logs kafka
```

Open shell:

```bash
docker exec -it <container> sh
```

Inspect container:

```bash
docker inspect <container>
```

## Common Problems

### Port Already In Use

Problem:

```text
bind: address already in use
```

Fix:

- stop process/container using port
- change host port mapping
- check `docker ps`

### Container Cannot Reach Service

Problem:

```text
using localhost inside container for another service
```

Fix:

```text
use service name, such as mongodb, redis, kafka
```

### Database Data Looks Stale

Cause:

- volume persisted old data

Fix for local/test:

```bash
docker compose down -v
```

Be careful: this deletes volume data.

### Kafka Advertised Listener Wrong

Kafka clients need the broker address that works from their environment.

Host clients may need:

```text
localhost:9092
```

Compose containers may need:

```text
kafka:9092
```

### Health Check Fails

Check:

- logs
- env vars
- network
- port
- dependency startup
- image version

## Test Infrastructure

`docker-compose.test.yml` starts:

- `mongodb-test` on host `27018`
- `redis-test` on host `6380`

This avoids colliding with normal local MongoDB/Redis ports.

## Interview Explanation

If asked "How do you debug local Docker issues?", say:

> I first check whether the container is running, then inspect logs, port mappings, environment variables, health checks, and network connectivity. In Compose, containers should usually call each other by service name, not localhost. For stale data, I check volumes, and for startup issues I inspect health checks and dependency readiness.

## Connection To Artistry Cart

Artistry Cart local infrastructure supports:

- MongoDB for Prisma-backed services
- Redis for cache/session-adjacent behavior
- Kafka for analytics events
- Kafka UI for inspecting topics
- test infra for e2e and integration workflows

