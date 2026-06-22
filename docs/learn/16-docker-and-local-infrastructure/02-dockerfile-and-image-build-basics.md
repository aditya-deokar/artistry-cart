# Dockerfile And Image Build Basics

## What Is A Dockerfile

A Dockerfile is a recipe for building a Docker image.

It defines:

- base image
- working directory
- files copied into image
- dependencies installed
- build commands
- runtime command
- user
- environment defaults

## Common Dockerfile Instructions

### FROM

Chooses base image.

```dockerfile
FROM node:20-bookworm-slim
```

### WORKDIR

Sets working directory.

```dockerfile
WORKDIR /app
```

### COPY

Copies files from build context into image.

```dockerfile
COPY . .
```

### RUN

Runs command during image build.

```dockerfile
RUN pnpm install --frozen-lockfile
```

### ENV

Sets environment variable.

```dockerfile
ENV NODE_ENV=production
```

### CMD

Default command when container starts.

```dockerfile
CMD ["node", "main.js"]
```

## Build Context

Build context is the files Docker can access during build.

If you run:

```bash
docker build .
```

then `.` is the build context.

Use `.dockerignore` to avoid sending unnecessary files.

## Multi-Stage Build

Multi-stage builds use separate build and runtime stages.

Example shape:

```dockerfile
FROM node:20 AS builder
RUN build app

FROM node:20-slim AS runtime
COPY --from=builder /built/app .
CMD ["node", "main.js"]
```

Benefits:

- smaller runtime image
- build tools do not need to be in runtime
- cleaner production image

## Build Args

Build args provide values at build time.

Example:

```dockerfile
ARG APP_NAME
RUN pnpm exec nx build ${APP_NAME}
```

Build:

```bash
docker build --build-arg APP_NAME=auth-service .
```

## Runtime Env Versus Build Args

Build args:

```text
available during image build
not ideal for secrets
```

Runtime env vars:

```text
provided when container starts
used for environment-specific config
```

Important:

> Do not bake secrets into images.

## Running As Non-Root

Production images should avoid running as root where practical.

Example:

```dockerfile
USER node
```

This reduces risk if the container is compromised.

## Layer Caching

Docker builds in layers.

If earlier layers do not change, Docker can reuse them.

For Node apps, dependency install layers can be expensive, so caching pnpm store helps.

## Interview Explanation

If asked "What is a Dockerfile?", say:

> A Dockerfile is a build recipe for a Docker image. It starts from a base image, installs dependencies, copies application code, runs build steps, sets environment defaults, and defines the command to start the container. Multi-stage builds keep production images smaller by separating build-time and runtime dependencies.

## Connection To Artistry Cart

Artistry Cart has:

- `docker/backend.Dockerfile` for backend services
- `docker/frontend.Dockerfile` for Next.js apps

Both use multi-stage builds with Node 20 and pnpm.

