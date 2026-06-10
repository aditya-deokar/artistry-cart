# Interview Questions And Answer Patterns

This file gives interview-ready answers for Docker and local infrastructure.

## Question: What Is Docker?

Strong answer:

> Docker packages an application and its runtime dependencies into an image, then runs that image as an isolated container. It helps make development, CI, and deployment more repeatable across machines.

## Question: Image Versus Container?

Strong answer:

> An image is a read-only packaged template. A container is a running instance of that image. You build images and run containers from them.

## Question: What Is A Dockerfile?

Strong answer:

> A Dockerfile is a recipe for building a Docker image. It defines the base image, copied files, installed dependencies, build commands, environment defaults, user, and startup command.

## Question: What Is A Multi-Stage Build?

Strong answer:

> A multi-stage build separates build-time and runtime stages. The builder stage installs dependencies and compiles the app, while the runtime stage copies only the necessary output. This keeps production images smaller and cleaner.

## Question: What Is Docker Compose?

Strong answer:

> Docker Compose runs multi-container environments from a YAML file. It is useful for local development and tests because it can start infrastructure like MongoDB, Redis, Kafka, and application services with consistent ports, networks, volumes, environment variables, and health checks.

## Question: What Are Docker Volumes?

Strong answer:

> Volumes persist data outside a container's lifecycle. If a database container is removed but its volume remains, the data can still exist. For tests, removing volumes with `down -v` gives a clean state.

## Question: How Do Containers Communicate In Compose?

Strong answer:

> Containers on the same Compose network can communicate using service names as DNS names, such as `mongodb:27017` or `kafka:9092`. From inside a container, `localhost` refers to that same container, not another service.

## Question: What Are Health Checks?

Strong answer:

> Health checks let Docker/Compose know whether a container is actually ready, not just started. For example, Redis can be checked with `redis-cli ping`, and MongoDB can be checked with a ping command.

## Question: Build Args Versus Environment Variables?

Strong answer:

> Build args are available during image build and are useful for selecting app name or build-time public config. Environment variables are provided at container runtime and should be used for environment-specific config. Secrets should not be baked into images.

## Question: How Do You Debug A Container That Fails?

Strong answer:

> I check `docker ps`, container logs, exit code, environment variables, port mappings, health checks, and network connectivity. For Compose, I verify service names, dependency health, and whether volumes contain stale data.

## Question: How Does Docker Fit Artistry Cart?

Strong answer:

> Artistry Cart uses Docker for local infrastructure and app packaging. Compose files run MongoDB, Redis, Kafka, Kafka UI, and full app stacks. Backend and frontend Dockerfiles package Nx services and Next.js apps. Test Compose starts isolated MongoDB and Redis for e2e workflows.

## Best Short Project Pitch For This Topic

> Docker makes Artistry Cart's local and deployment story repeatable. MongoDB, Redis, Kafka, and Kafka UI can run through Compose, while backend and frontend Dockerfiles package individual Nx projects into production-style containers. This matters because a service-oriented monorepo needs consistent infrastructure across local development, CI, and deployment.

