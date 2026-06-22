# Docker And Local Infrastructure

This folder is the sixteenth learning block for preparing for a bigger engineering role. It explains Docker and local infrastructure from first principles, then connects those ideas to the Artistry Cart monorepo.

The goal is to understand how containers package services, how Docker Compose runs local dependencies, and how to explain local infrastructure for a microservices-style project in interviews.

## Learning Outcome

After completing this topic, you should be able to explain:

- what Docker is and why containers exist
- image versus container
- Dockerfile basics
- multi-stage builds
- Docker Compose basics
- local infrastructure for MongoDB, Redis, Kafka, and Kafka UI
- ports, volumes, networks, health checks, and environment variables
- how to debug common container problems
- how Artistry Cart packages backend and frontend apps
- how local/test infrastructure supports development and CI

## Files In This Topic

1. [Docker Fundamentals](./01-docker-fundamentals.md)
2. [Dockerfile And Image Build Basics](./02-dockerfile-and-image-build-basics.md)
3. [Docker Compose And Local Infrastructure](./03-docker-compose-and-local-infrastructure.md)
4. [Ports, Networks, Volumes, Health Checks, And Env](./04-ports-networks-volumes-healthchecks-env.md)
5. [Backend And Frontend Containerization](./05-backend-and-frontend-containerization.md)
6. [Local Development, Test Infrastructure, And Debugging](./06-local-development-test-infrastructure-debugging.md)
7. [Docker In Artistry Cart](./07-docker-in-artistry-cart.md)
8. [Interview Questions And Answer Patterns](./08-interview-questions-and-answer-patterns.md)

## Core Mental Model

```text
Dockerfile -> builds image
image -> template/package
container -> running instance of image
Docker Compose -> runs many containers together
```

For this repo:

```text
MongoDB + Redis + Kafka + Kafka UI = local infrastructure
backend/frontend Dockerfiles = app packaging
Compose files = repeatable local/test/full environment
```

## Connection To Artistry Cart

Artistry Cart includes:

- `docker/backend.Dockerfile`
- `docker/frontend.Dockerfile`
- `docker/compose/docker-compose.infra.yml`
- `docker/compose/docker-compose.apps.yml`
- `docker/compose/docker-compose.full.yml`
- `libs/docker-compose.yml` for local Kafka/Kafka UI style setup
- `docker-compose.test.yml` for test MongoDB and Redis

