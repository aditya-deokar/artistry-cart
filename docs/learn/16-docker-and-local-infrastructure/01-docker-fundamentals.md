# Docker Fundamentals

## What Docker Is

Docker is a tool for packaging and running applications in containers.

A container includes:

- application code
- runtime dependencies
- environment configuration
- filesystem layer
- process startup command

Containers make applications more repeatable across machines.

## The Problem Docker Solves

Without Docker:

```text
works on my machine
missing Node version
wrong pnpm version
MongoDB not installed
Redis version mismatch
Kafka setup painful
```

With Docker:

```text
run same image/container setup locally, in CI, and near production
```

Docker does not remove all environment problems, but it reduces them.

## Image Versus Container

Image:

```text
read-only packaged template
```

Container:

```text
running instance of an image
```

Analogy:

```text
image = class
container = object instance
```

## Container Versus Virtual Machine

Virtual machine:

- includes full guest OS
- heavier
- slower startup

Container:

- shares host kernel
- lighter
- faster startup
- packages app dependencies

Containers are not full VMs.

## Docker Registry

A registry stores images.

Examples:

- Docker Hub
- GitHub Container Registry
- private registry

Example image:

```text
mongo:7
redis:7-alpine
bitnami/kafka:3.7.0-debian-12-r0
```

## Why Docker Is Useful For Microservices

Microservices need many processes:

- auth service
- product service
- order service
- gateway
- Kafka worker
- frontends
- MongoDB
- Redis
- Kafka

Docker makes each process packageable and runnable in a consistent way.

## What Docker Does Not Solve

Docker does not automatically solve:

- bad architecture
- secrets management
- database migrations
- service discovery in production
- observability
- security hardening
- scaling

It is packaging and runtime isolation, not full platform engineering by itself.

## Common Commands

Build image:

```bash
docker build -t my-app .
```

Run container:

```bash
docker run -p 3000:3000 my-app
```

List containers:

```bash
docker ps
```

View logs:

```bash
docker logs <container>
```

Stop container:

```bash
docker stop <container>
```

## Interview Explanation

If asked "What is Docker?", say:

> Docker packages an application and its runtime dependencies into an image, then runs that image as an isolated container. It helps make development, CI, and deployment more repeatable because services can run with the same runtime, dependencies, ports, and startup commands across environments.

## Connection To Artistry Cart

Artistry Cart uses Docker for:

- MongoDB local/test infrastructure
- Redis local/test infrastructure
- Kafka and Kafka UI
- backend service images
- frontend Next.js images
- full local platform composition
- future Kubernetes deployment images

