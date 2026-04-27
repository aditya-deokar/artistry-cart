# Dockerfile Standards

## Purpose

This document defines the Dockerfile standards for Artistry Cart so that all images in the Nx monorepo are built consistently, stay reasonably small, and behave predictably in Docker Compose and Kubernetes.

## Why Standards Matter In This Repo

This repository mixes:

- Next.js apps
- Express services
- a Kafka worker
- Prisma
- TensorFlow-native dependencies
- shared workspace packages

Without consistent Dockerfile rules, image sizes drift, build times grow, and runtime behavior becomes hard to reason about.

## Standard Goals

Our Dockerfile standards should optimize for:

- reproducible builds
- small but stable runtime images
- fast rebuilds
- consistent app startup behavior
- compatibility with Nx and pnpm workspaces
- easy promotion from local Docker to CI and Kubernetes

## Current Repo Reality

Important facts from the current codebase:

- package manager: `pnpm`
- Node target in CI: Node `20`
- monorepo tool: Nx `21`
- frontends: Next.js `15`
- backend mix: inferred Nx builds plus custom configs
- one generated Dockerfile exists at [apps/auth-service/Dockerfile](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/apps/auth-service/Dockerfile>)
- `recommendation-service` uses `@tensorflow/tfjs-node`
- `aivision-service` has heavier AI-related runtime needs
- both Next apps are not yet configured with `output: 'standalone'`

Those details drive the standards below.

## Base Image Standards

Recommended base images:

| Workload | Default base image | Why |
| --- | --- | --- |
| Next.js frontend runtime | `node:20-bookworm-slim` | stable Node runtime, good package compatibility |
| Express API runtime | `node:20-bookworm-slim` | safer than Alpine for Prisma and native modules |
| Kafka worker runtime | `node:20-bookworm-slim` | same runtime family as APIs |
| Heavy native dependency workloads | `node:20-bookworm-slim` | avoids Alpine-native friction |

Default recommendation:

- prefer Debian slim over Alpine for this repo

Why:

- Prisma and native modules are easier to support
- TensorFlow runtime compatibility is better
- the saved debugging time is worth the slightly larger base image

## Universal Dockerfile Rules

Every production-style Dockerfile in this repo should follow these rules:

- use multi-stage builds
- pin the Node major version explicitly
- run as a non-root user in the final stage
- set `NODE_ENV=production` in the final stage
- bind apps to `0.0.0.0`
- never copy `.env` files into the image
- copy only required runtime artifacts into the final image
- keep build tooling out of the final image
- use one Dockerfile pattern per workload class, not one-off hand-written styles everywhere

## Root `.dockerignore` Standard

The root `.dockerignore` should exclude at least:

```text
.git
.github
.nx
node_modules
tmp
coverage
dist
.env
.env.*
docs/legacy
apps/*-e2e
**/*.log
```

Notes:

- do not exclude assets needed by frontend runtime such as `public/`
- if docs are excluded from build context, keep runtime and app code references elsewhere

## Build Context Standard

The default build context should be the repo root.

Why:

- Nx builds and workspace dependencies span multiple folders
- shared packages live outside the target app directory
- Prisma and shared config live at the workspace level

The tradeoff is larger context size, which is why a strong `.dockerignore` matters.

## Backend Dockerfile Standard

Backend services in this repo currently fall into two practical modes:

1. bundled or near-bundled output
2. unbundled output that still needs runtime dependencies from the workspace

The standard should support both, but the long-term direction should favor smaller runtime payloads where safe.

### Required backend build steps

Each backend image build should:

1. install workspace dependencies once in a builder stage
2. run `prisma generate` if the service depends on Prisma
3. run the Nx production build for the target app
4. copy only the built output and needed runtime dependencies into the final image

### Backend runtime rules

Every backend runtime image should set:

```dockerfile
ENV NODE_ENV=production
ENV HOST=0.0.0.0
```

And should accept:

- `PORT`
- service-specific env vars
- database and broker URLs from runtime injection

### Backend template shape

Illustrative pattern:

```dockerfile
FROM node:20-bookworm-slim AS builder

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig.base.json tsconfig.json ./
COPY apps ./apps
COPY packages ./packages
COPY libs ./libs
COPY prisma ./prisma

RUN pnpm install --frozen-lockfile
RUN pnpm exec prisma generate

ARG APP_NAME
RUN pnpm exec nx build ${APP_NAME} --configuration=production

FROM node:20-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0

RUN useradd --system --create-home appuser

COPY --from=builder /workspace/dist ./dist
COPY --from=builder /workspace/node_modules ./node_modules
COPY --from=builder /workspace/package.json ./package.json

USER appuser

CMD ["node", "dist/apps/auth-service/main.js"]
```

This is a shape example, not the final literal Dockerfile for every app.

### Bundled vs unbundled guidance

Preferred direction:

- bundle backend output enough that the runtime image does not need the entire workspace dependency tree

Short-term repo-safe reality:

- some services may still need runtime `node_modules` copied from the builder stage

That is acceptable initially, but it should be treated as a temporary efficiency cost, not the final standard.

## Frontend Dockerfile Standard

For `user-ui` and `seller-ui`, the standard should assume:

- Nx build
- Next.js standalone output
- copy only standalone runtime artifacts into the final image

### Required frontend app changes

Before finalizing frontend images, both apps should adopt:

```js
output: 'standalone'
```

in their Next config.

### Frontend runtime artifact set

The final image should include only:

- `.next/standalone`
- `.next/static`
- `public`

### Frontend template shape

Illustrative pattern:

```dockerfile
FROM node:20-bookworm-slim AS builder

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig.base.json tsconfig.json ./
COPY apps ./apps
COPY packages ./packages
COPY libs ./libs

RUN pnpm install --frozen-lockfile

ARG APP_NAME
RUN pnpm exec nx build ${APP_NAME} --configuration=production

FROM node:20-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0

RUN useradd --system --create-home appuser

COPY --from=builder /workspace/dist/apps/user-ui/.next/standalone ./
COPY --from=builder /workspace/dist/apps/user-ui/.next/static ./.next/static
COPY --from=builder /workspace/apps/user-ui/public ./public

USER appuser

CMD ["node", "server.js"]
```

Exact copy paths depend on the final Nx build output for each app, so this should be verified once standalone mode is enabled.

## Prisma Standards

Services that depend on Prisma should follow these rules:

- generate Prisma client during build
- ensure Prisma runtime artifacts are present in the final image
- do not depend on local machine-generated Prisma output
- keep `DATABASE_URL` runtime-injected

If a service is not using migrations at container startup, do not copy the full Prisma workspace unless it is actually needed.

## Environment And Secret Standards

Never bake the following into images:

- database credentials
- Stripe keys
- OAuth secrets
- SMTP credentials
- AI provider keys
- ImageKit private keys

All of these belong in:

- local env files for developer machines
- CI secrets
- Kubernetes Secrets

## Service-Specific Notes

### `api-gateway`

- must move to environment-driven upstream URLs before its image is production-ready

### `auth-service`

- replace the generated Nx Dockerfile
- ensure final command and port match actual runtime expectations

### `product-service`

- the image can be standard backend shape
- scheduled cleanup logic should move out of the API process before horizontal scaling

### `order-service`

- webhook endpoint stability matters more than image novelty
- keep base image conservative and predictable

### `recommendation-service`

- do not optimize aggressively toward Alpine
- verify TensorFlow native runtime compatibility in CI before publishing images

### `aivision-service`

- expect the largest image among current services
- keep API and worker split in mind even if the first image still runs both concerns together

### `kafka-service`

- lightweight API-free runtime
- same backend standards still apply

## Build Cache Standards

Use Docker BuildKit where available.

Helpful cache targets:

- pnpm store
- Nx build cache where useful

Why:

- this repo is large enough that cached dependency and build layers matter

## Labels And Metadata

Recommended image labels:

- source repository
- commit SHA
- build date
- app name
- version or tag

These are especially useful once CI starts publishing multiple images per release.

## Definition Of Done

A Dockerfile is aligned with the repo standard when:

- it uses multi-stage build structure
- it runs as non-root in the final stage
- it avoids shipping source, tests, and build tooling in the final image
- it starts with runtime-injected configuration only
- it uses the correct app port and host binding
- it works cleanly with Compose and Kubernetes

## Related Docs

- [DevOps Implementation Plan](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/DevOps/DevOps-implemenatation.md>)
- [Docker Compose Strategy](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/DevOps/docker-compose-strategy.md>)
- [Kubernetes Deployment Guide](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/DevOps/kubernetes-deployment-guide.md>)
- [CI/CD Release Pipeline](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/DevOps/ci-cd-release-pipeline.md>)
