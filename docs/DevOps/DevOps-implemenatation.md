# DevOps Implementation Plan

## Purpose

This document is the working DevOps plan for Dockerizing the full Artistry Cart Nx monorepo and preparing it for scalable Kubernetes deployment.

It covers:

- what Docker is and why it is useful here
- the current state of this repository from a DevOps point of view
- the image optimization techniques we should use
- the phased implementation plan for local Docker, CI/CD, and production delivery
- a Kubernetes deployment overview for the current architecture

## Repository Scope

This monorepo currently contains these deployable runtime units:

| Component | Type | Default Port | Deployment Role |
| --- | --- | --- | --- |
| `user-ui` | Next.js frontend | `3000` | public buyer-facing web app |
| `seller-ui` | Next.js frontend | `3001` | public seller dashboard |
| `api-gateway` | Express API | `8080` | public backend entry point |
| `auth-service` | Express API | `6001` | internal service |
| `product-service` | Express API | `6002` | internal service |
| `order-service` | Express API | `6004` | internal service |
| `recommendation-service` | Express API | `6005` | internal service |
| `aivision-service` | Express API | `6006` | internal service with AI and background jobs |
| `kafka-service` | background worker | n/a | internal Kafka consumer |

Supporting infrastructure:

- MongoDB
- Redis
- Kafka
- Kafka UI for local development

The e2e apps in `apps/*-e2e` are test projects and should not be containerized as production services.

## What Docker Is

Docker is a container platform that packages an application together with the runtime, system libraries, and configuration it needs to run consistently across laptops, CI pipelines, staging, and production.

Instead of saying "it works on my machine," we define the runtime once in a Docker image and run that same image everywhere.

## Why Docker Is Useful For This Repo

Docker is especially useful for this repository because the project is:

- a multi-service Nx monorepo
- split across two frontends and several backend services
- dependent on infrastructure like MongoDB, Redis, and Kafka
- carrying native and heavier dependencies such as Prisma and TensorFlow

Main benefits for Artistry Cart:

- consistent local setup for all engineers
- easier service isolation and debugging
- reproducible CI builds
- cleaner handoff from development to staging and production
- simpler scaling because each service becomes an independent deployable unit
- better operational discipline around environment variables, health checks, and service discovery

## Current Repo Assessment

The codebase already has a strong monorepo structure, but it is not fully container-ready yet.

### What already exists

- Nx monorepo organization for frontends, APIs, workers, and shared packages
- `docker-compose.test.yml` for MongoDB and Redis test infrastructure
- `libs/docker-compose.yml` for Kafka and Kafka UI
- one generated Dockerfile in `apps/auth-service/Dockerfile`
- mostly configurable ports through `PORT`
- basic health-style endpoints in several services

### Current gaps that matter for Dockerization

- `api-gateway` proxies to hardcoded `localhost` upstreams instead of environment-based service URLs
- multiple services hardcode local CORS origins such as `http://localhost:3000` and `http://localhost:3001`
- health endpoints are inconsistent across services: `/gateway-health`, `/`, and `/health`
- `aivision-service` explicitly loads `.env` from relative filesystem paths, which is fragile inside containers
- `product-service` runs a cron job inside the API process, which will duplicate work if the API is scaled horizontally
- `aivision-service` runs Agenda background jobs inside the API container, which mixes HTTP traffic and worker concerns
- `recommendation-service` depends on `@tensorflow/tfjs-node`, which makes base-image choice important
- both Next.js apps are not yet configured for `output: 'standalone'`, which is the easiest route to small runtime images
- the generated `apps/auth-service/Dockerfile` uses port `3000`, which does not match the service default of `6001`

## Design Goals

The Docker and Kubernetes design should aim for:

- small but practical images
- fast rebuilds in CI
- stateless application containers
- clear separation between app containers and stateful infrastructure
- easy local startup with Docker Compose
- safe production deployment on Kubernetes
- independent scaling of HTTP APIs, frontends, and workers

## Target Containerization Architecture

### Local development target

For local Docker-based development, we should run:

- both frontends
- all backend services
- MongoDB
- Redis
- Kafka
- Kafka UI

This gives the team a one-command environment for full-stack validation.

### Production target

For production, the preferred direction is:

- containerize all application workloads
- keep application workloads in Kubernetes
- use managed MongoDB, Redis, and Kafka where possible instead of self-hosting those stateful systems in the same cluster

That split keeps the app layer scalable and reduces operational burden.

## Techniques We Should Use To Keep Images Small And Efficient

### 1. Multi-stage Docker builds

Use a builder stage for dependency install and Nx builds, then copy only the runtime output into the final image.

This removes:

- TypeScript sources
- test files
- dev dependencies
- build toolchain

### 2. `output: 'standalone'` for Next.js apps

For `user-ui` and `seller-ui`, enable Next.js standalone output so the final image contains only:

- the standalone server bundle
- static assets
- public assets

This is the single biggest frontend image reduction available in this repo.

### 3. A strong root `.dockerignore`

Ignore content that should never enter image build context:

- `.git`
- `node_modules`
- `.nx`
- `tmp`
- coverage artifacts
- local env files
- docs that are not needed for runtime
- test output

Smaller build context means faster Docker builds and less accidental leakage.

### 4. Production-only runtime dependencies

The final runtime image should contain only the dependencies needed to run the built application.

For backend services, this usually means:

- build in one stage
- install production dependencies only in runtime, or copy a pruned runtime dependency set

### 5. BuildKit cache mounts

When supported in CI and local builds, use Docker BuildKit cache mounts for:

- pnpm store
- Nx cache where helpful

That speeds up repeated builds significantly.

### 6. Reusable base image choice with care

For this repo, `node:20-bookworm-slim` is the safer default than Alpine for backend services because of native dependencies like:

- Prisma client generation
- `@tensorflow/tfjs-node`

Alpine can be smaller, but it often creates extra native-module friction. In this monorepo, stability is more important than chasing a few megabytes.

### 7. Non-root runtime user

Run containers as a non-root user in final images. This improves baseline security without increasing image size meaningfully.

### 8. Copy only app-specific artifacts

Each image should copy only the built output for its target app, not the whole monorepo.

Examples:

- backend: compiled `dist` output plus runtime package metadata
- frontend: standalone output plus `.next/static` and `public`

### 9. Avoid baking secrets into images

Secrets must be injected at runtime through Compose env files, Kubernetes Secrets, or an external secret manager.

Images should be portable and environment-agnostic.

### 10. Shared Dockerfile patterns instead of one-off files

Because this is an Nx monorepo, we should avoid nine completely different Dockerfiles unless a service truly needs special handling.

Recommended pattern:

- one reusable backend Dockerfile template
- one reusable frontend Dockerfile template
- optional service-specific overrides only where native dependencies or runtime behavior demand it

## Scalability And Optimization Principles

To make the Dockerized platform scalable, we should build around these rules:

- all HTTP services should be stateless
- application state should live in MongoDB, Redis, Kafka, or external object services
- service discovery should be environment-driven, not hardcoded to `localhost`
- each app should expose a consistent health endpoint
- workers should be separated from public HTTP APIs when scaling patterns differ
- frontends, APIs, and workers should scale independently
- logs, metrics, and traces should be centralized
- stateful infrastructure should be managed separately from stateless app rollouts

## Repo-Specific Changes Required Before Full Dockerization

These are the most important code-level changes to make before building the full container setup.

### 1. Replace hardcoded upstream URLs in `api-gateway`

Current gateway routes proxy directly to local ports such as:

- `http://localhost:6001`
- `http://localhost:6002`
- `http://localhost:6004`
- `http://localhost:6005`
- `http://localhost:6006`

This must be replaced with environment variables such as:

- `AUTH_SERVICE_URL`
- `PRODUCT_SERVICE_URL`
- `ORDER_SERVICE_URL`
- `RECOMMENDATION_SERVICE_URL`
- `AIVISION_SERVICE_URL`

This is mandatory for Docker networking and Kubernetes service discovery.

### 2. Move CORS configuration to environment-driven settings

Several services hardcode localhost origins today. We should standardize on something like:

- `CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001`

Each service can parse this list and apply it consistently.

### 3. Standardize health endpoints

Recommended convention:

- `/healthz` for liveness
- `/readyz` for readiness

Each service should respond predictably, and readiness should check only what is necessary for traffic handling.

### 4. Remove filesystem-coupled `.env` loading in `aivision-service`

Containers and Kubernetes should inject environment variables directly. The service should not depend on a relative `.env` path existing in the runtime filesystem.

### 5. Revisit background jobs inside API containers

`product-service` currently starts a cron job inside the API process. If that Deployment is scaled to more than one replica, the cron will run in every replica.

Recommended direction:

- move this cleanup task to a dedicated worker or Kubernetes CronJob

`aivision-service` also mixes Agenda worker behavior into the API process. That is acceptable as a first step, but the more scalable long-term direction is:

- `aivision-api` Deployment for HTTP traffic
- `aivision-worker` Deployment for Agenda jobs

### 6. Enable Next standalone builds

Add `output: 'standalone'` to both Next.js apps and verify they build correctly with Nx.

### 7. Standardize container host binding

All services should use:

- `HOST=0.0.0.0`

Containers should not default to binding only to `localhost`.

## Proposed File And Folder Layout

Recommended structure for the Docker and Kubernetes work:

```text
docker/
  backend.Dockerfile
  frontend.Dockerfile
  compose/
    docker-compose.dev.yml
    docker-compose.full.yml
    docker-compose.observability.yml
k8s/
  base/
    namespace.yaml
    configmap.yaml
    secrets.example.yaml
    api-gateway/
    auth-service/
    product-service/
    order-service/
    recommendation-service/
    aivision-service/
    kafka-service/
    user-ui/
    seller-ui/
  overlays/
    dev/
    staging/
    production/
```

This keeps Docker and Kubernetes assets organized without scattering them across app folders.

## Phase-Wise Implementation Plan

### Phase 1: Runtime Standardization

Goal: make every app container-friendly before writing the final Docker assets.

Tasks:

- define a shared env naming scheme for service URLs, ports, host binding, and CORS
- replace hardcoded `localhost` upstreams in `api-gateway`
- replace hardcoded CORS origins with environment-driven parsing
- standardize `/healthz` and `/readyz`
- remove relative `.env` loading from `aivision-service`
- confirm graceful shutdown handling in all services
- decide ownership of scheduled jobs and workers

Deliverable:

- every deployable app can run cleanly with only environment variables and no localhost assumptions

### Phase 2: Dockerfile Strategy

Goal: create optimized image builds for all deployable apps.

Tasks:

- add a root `.dockerignore`
- create a reusable backend Dockerfile pattern for Express services and workers
- create a reusable frontend Dockerfile pattern for Next.js standalone apps
- choose `node:20-bookworm-slim` as the default backend base image
- treat `recommendation-service` as a service that may need slightly different runtime tuning due to TensorFlow
- replace the current generated auth Dockerfile with the new shared pattern
- verify Prisma client generation and runtime assets are copied correctly

Deliverable:

- one reproducible Docker image per deployable application workload

### Phase 3: Local Docker Compose Platform

Goal: make the full system easy to boot locally.

Tasks:

- create a root Compose stack for both frontends, all services, and local infrastructure
- reuse the current test Compose setup where possible, but keep test and dev concerns separated
- use service health checks and `depends_on` with healthy conditions
- create named networks for app traffic
- persist MongoDB and Kafka data only when useful for local workflows
- expose only the frontends, gateway, and optional Kafka UI to the host

Recommended local service exposure:

- `user-ui` -> host
- `seller-ui` -> host
- `api-gateway` -> host
- `mongodb` -> optional host exposure
- `redis` -> optional host exposure
- `kafka-ui` -> optional host exposure

Internal-only services:

- `auth-service`
- `product-service`
- `order-service`
- `recommendation-service`
- `aivision-service`
- `kafka-service`
- `kafka`

Deliverable:

- developers can run the platform with one Docker Compose command

### Phase 4: CI/CD And Registry Delivery

Goal: build, test, tag, scan, and publish images automatically.

Tasks:

- extend GitHub Actions from test-only CI into build-and-publish CI
- build images only for affected apps when practical
- tag images with commit SHA and release tag
- run unit and e2e coverage before image publishing
- push images to a registry such as GitHub Container Registry or Docker Hub
- add image scanning and SBOM generation

Recommended CI flow:

1. install dependencies
2. generate Prisma client
3. run tests
4. build changed apps
5. build Docker images
6. scan images
7. push images
8. promote images to staging or production through deployment automation

Deliverable:

- reproducible container delivery pipeline

### Phase 5: Kubernetes Baseline

Goal: deploy the Dockerized application stack in a scalable and operationally safe way.

Tasks:

- create a Kubernetes namespace for the platform
- add ConfigMaps for non-secret configuration
- add Secrets for sensitive values
- create one Deployment and one Service per app
- add an Ingress for public entry points
- add Horizontal Pod Autoscalers for stateless HTTP services
- add a separate worker Deployment for Kafka consumption
- move product cleanup cron to a Kubernetes CronJob or dedicated worker
- add PodDisruptionBudgets for critical services
- define resource requests and limits

Deliverable:

- a production-ready baseline deployment model

### Phase 6: Observability, Security, And Operations

Goal: make the platform supportable after deployment.

Tasks:

- emit structured JSON logs
- add metrics endpoints where practical
- integrate logs, metrics, and traces into a central monitoring stack
- manage secrets outside source control
- add container vulnerability scanning
- define backup and restore strategy for MongoDB
- define alerting for gateway errors, worker lag, pod restarts, and readiness failures

Deliverable:

- a deployable system that can also be monitored and operated safely

## Service-Specific Docker Notes

### `user-ui`

- use Next standalone output
- keep `NEXT_PUBLIC_SERVER_URI` configurable
- serve as a public web Deployment behind Ingress

### `seller-ui`

- same standalone strategy as `user-ui`
- set public API base URL through environment variables
- likely deploy under a separate host such as `seller.<domain>`

### `api-gateway`

- convert all upstreams to environment variables
- expose only this backend publicly
- use it as the stable internal edge for service routing

### `auth-service`

- replace the generated Dockerfile
- ensure OAuth redirect variables are environment-driven
- verify cookies, CORS, and frontend URLs per environment

### `product-service`

- remove or isolate the in-process cron for horizontal scaling safety
- keep as an internal API behind the gateway

### `order-service`

- add explicit readiness and liveness routes
- keep Stripe webhook path stable through gateway and ingress routing

### `recommendation-service`

- prefer Debian slim over Alpine because of TensorFlow native dependencies
- monitor CPU and memory more closely than lightweight services

### `aivision-service`

- treat as the heaviest service in the platform
- keep AI keys and ImageKit keys in Secrets
- split API and worker responsibilities later for better scaling

### `kafka-service`

- no public ingress
- deploy as a worker Deployment
- consider KEDA-based autoscaling from Kafka lag in Kubernetes

## Kubernetes Deployment Overview

### Recommended production topology

- `user-ui` and `seller-ui` as public web Deployments
- `api-gateway` as the public backend Deployment
- backend services as internal ClusterIP Services
- `kafka-service` as a background worker Deployment
- managed MongoDB, Redis, and Kafka outside the cluster where possible

### Networking model

Recommended DNS split:

- `app.<domain>` -> `user-ui`
- `seller.<domain>` -> `seller-ui`
- `api.<domain>` -> `api-gateway`

Internal service discovery should use Kubernetes DNS names such as:

- `http://auth-service:6001`
- `http://product-service:6002`
- `http://order-service:6004`
- `http://recommendation-service:6005`
- `http://aivision-service:6006`

### Kubernetes resource model

Use these resource types:

- `Deployment` for frontends, APIs, and workers
- `Service` for internal network access
- `Ingress` for public HTTP entry
- `ConfigMap` for non-secret runtime configuration
- `Secret` for API keys, OAuth keys, Stripe keys, and database URLs
- `HorizontalPodAutoscaler` for stateless HTTP workloads
- `CronJob` for scheduled cleanup work
- `PodDisruptionBudget` for critical services

### Scaling overview

Good HPA candidates:

- `api-gateway`
- `auth-service`
- `product-service`
- `order-service`
- `recommendation-service`
- `aivision-service`

Special cases:

- `kafka-service` should scale from queue or lag metrics, ideally with KEDA
- `product-service` should not scale safely beyond one replica until the embedded cron is separated
- `aivision-service` may need separate API and worker autoscaling policies

### Stateful infrastructure recommendation

For production, prefer managed services for:

- MongoDB
- Redis
- Kafka

Reasons:

- backups are easier
- upgrades are safer
- operations are simpler
- cluster complexity stays lower

Use in-cluster stateful infrastructure only for local development, demos, or constrained environments.

### Security Guidance

Minimum security practices for the Dockerized platform:

- run containers as non-root
- use read-only root filesystem where practical
- keep secrets out of images
- pin base images to trusted versions
- scan images in CI
- restrict inter-service traffic with Kubernetes NetworkPolicies when introduced

## Suggested Rollout Order

The lowest-risk rollout path is:

1. standardize runtime configuration and health endpoints
2. containerize one backend service with the shared pattern
3. containerize both frontends with standalone output
4. add full local Docker Compose
5. containerize the remaining services
6. automate image builds in CI
7. add Kubernetes manifests
8. split workers and scheduled jobs where scaling requires it

## Acceptance Criteria

We can consider the Dockerization effort successful when:

- every deployable app builds to a Docker image
- the full stack boots locally with Docker Compose
- gateway routing works through environment-based upstream URLs
- frontends run from standalone production images
- no runtime container depends on repository-local `.env` files
- health checks are standardized
- secrets are runtime-injected
- Kubernetes manifests can deploy the stateless application layer cleanly

## Companion Docs

The implementation plan is supported by these focused DevOps documents:

- [Docker Compose Strategy](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/DevOps/docker-compose-strategy.md>)
- [Dockerfile Standards](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/DevOps/dockerfile-standards.md>)
- [Kubernetes Deployment Guide](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/DevOps/kubernetes-deployment-guide.md>)
- [CI/CD Release Pipeline](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/DevOps/ci-cd-release-pipeline.md>)

## Related Docs

- [Repository Map](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/00-overview/repo-map.md>)
- [Service Topology](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/02-architecture/service-topology.md>)
- [Environment Variables](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/01-getting-started/environment-variables.md>)
- [Port Map](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/11-reference/port-map.md>)
- [CI/CD](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/07-quality-and-operations/ci-cd.md>)
