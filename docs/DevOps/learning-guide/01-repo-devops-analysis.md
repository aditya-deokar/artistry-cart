# Repo DevOps Analysis

## 1. What This Monorepo Really Is

This is an Nx monorepo that combines:

- two public Next.js frontends
- one public API gateway
- several internal Express microservices
- one background Kafka worker
- shared runtime, middleware, Prisma, Redis, and test packages

From a DevOps point of view, this is a microservices e-commerce platform, not a single web app.

That matters because DevOps work must solve for:

- service-to-service networking
- independent image builds
- shared infra dependencies
- health checks
- safe rollout order
- different scaling behavior for APIs, frontends, and workers

## 2. Deployable Runtime Units

| Workload | Type | Build Style | Port | Exposure | Notes |
| --- | --- | --- | --- | --- | --- |
| `user-ui` | Next.js frontend | Nx Next standalone | `3000` | public | buyer-facing site |
| `seller-ui` | Next.js frontend | Nx Next standalone | `3001` | public | seller dashboard |
| `api-gateway` | Node API | Nx webpack | `8080` | public | entry point to backend services |
| `auth-service` | Node API | Nx esbuild | `6001` | internal | auth, OAuth, sessions |
| `product-service` | Node API | Nx webpack | `6002` | internal | catalog, offers, events, discounts |
| `order-service` | Node API | Nx webpack | `6004` | internal | checkout and Stripe workflows |
| `recommendation-service` | Node API | Nx webpack | `6005` | internal | heavier service because of TensorFlow |
| `aivision-service` | Node API | Nx webpack | `6006` | internal | AI-heavy API plus background jobs |
| `kafka-service` | worker | Nx webpack | `3000` management port | internal | event consumer with health and metrics endpoint |

## 3. DevOps Assets Already Present In The Repo

The repo already contains strong building blocks:

- shared runtime helpers in `packages/utils/runtime`
- standardized health endpoint registration
- env-driven service URL resolution in `api-gateway`
- shared Dockerfiles in `docker/backend.Dockerfile` and `docker/frontend.Dockerfile`
- Compose stacks in `docker/compose`
- `.dockerignore` tuned for monorepo builds
- GitHub Actions workflows in `.github/workflows`
- image-selection script in `scripts/ci/select-deployable-apps.mjs`
- Kubernetes manifests in `k8s/base` and `k8s/overlays`

This is why Phases 1 to 6 could be implemented as layers instead of starting from scratch.

## 4. Phase Status Review

| Phase | Status | Evidence In Repo | Important Notes |
| --- | --- | --- | --- |
| Phase 1 | Implemented | `packages/utils/runtime`, `apps/api-gateway/src/config.ts`, shared health usage across services | the remaining architectural caveat is background jobs still running inside API processes for `product-service` and `aivision-service` |
| Phase 2 | Implemented | `docker/backend.Dockerfile`, `docker/frontend.Dockerfile`, `.dockerignore`, `next.config.js` standalone output | frontends are container-ready and backends share a common pattern |
| Phase 3 | Implemented | `docker/compose/docker-compose.apps.yml`, `docker-compose.full.yml`, `docker-compose.infra.yml` | local full-stack startup is now part of the repo design |
| Phase 4 | Implemented baseline | `.github/workflows/test.yml`, `.github/workflows/build-publish.yml`, `.github/workflows/deploy-staging.yml`, `.github/workflows/deploy-production.yml`, GHCR tagging, Trivy scanning, SBOM/provenance, release manifest artifact | the repo now has full in-repo promotion automation, but still depends on real cluster credentials and environment setup |
| Phase 5 | Implemented baseline | `k8s/base`, `k8s/overlays/*`, `docs/DevOps/kubernetes-deployment-guide.md` | the repo now has a real Kubernetes baseline |
| Phase 6 | Implemented baseline | `packages/utils/runtime`, `.github/workflows/nightly-security.yml`, `.github/dependabot.yml`, `k8s/addons/monitoring`, `docs/07-quality-and-operations/*` | the repo now has a platform observability and security baseline, but not yet a fully installed central monitoring stack |

## 5. What Phase 4 Looks Like After The Current Work

Phase 4 gives this repo a real delivery baseline:

1. `test.yml` validates pull requests and default-branch pushes.
2. `build-publish.yml` runs release validation and core e2e checks.
3. images are built and pushed to GHCR for automated master releases.
4. staging and production deploy workflows consume the release manifest artifact.
5. each image gets immutable tags such as commit SHA and release tag.
6. Trivy scans the published image.
7. Docker provenance and SBOM generation are enabled.
8. a `release-image-manifest` artifact is generated so later deployment jobs can consume exact digests.

That last point is important because mature CD pipelines deploy digests, not guesses.

## 6. What Phase 5 Added

Phase 5 gives the repo a Kubernetes baseline:

- `k8s/base` contains Deployments, Services, HPAs, PDBs, shared config, ingress, and a CronJob
- `k8s/overlays/dev`, `staging`, and `production` provide environment-specific namespace, ingress, config, and scaling patches
- `user-ui` and `seller-ui` expose `/healthz` and `/readyz` routes for cleaner Kubernetes probes
- `product-service` can disable in-process cleanup cron and accept a maintenance-triggered cleanup request from the Kubernetes CronJob

## 7. What Phase 6 Added

Phase 6 gives the repo an operational baseline:

- shared structured logger and request ID support in `packages/utils/runtime`
- Prometheus-compatible `/metrics` endpoint on the main backend services
- security headers through shared Express middleware
- frontend security headers in both Next.js apps
- Kafka worker management HTTP server with health, readiness, and metrics
- Prometheus scrape annotations in Kubernetes Deployments
- baseline Kubernetes `NetworkPolicy` objects
- nightly security scanning workflow
- Dependabot update automation

This is the point where the repo starts to become supportable after deployment, not only deployable.

## 8. Remaining Gaps After The Current Repo Baseline

The biggest remaining gaps are now:

- no installed central Prometheus, Grafana, Loki, or tracing stack in a live environment
- no external secret manager yet
- no main CI path for `aivision-service-e2e` or `kafka-service-e2e`
- no full separation yet between API pods and background workers for `product-service` and `aivision-service`

## 9. Best Next Implementation Order

If the goal is production-grade DevOps for this repo, the next order should be:

1. install centralized monitoring and alerting in the cluster
2. split worker behavior from API pods where needed
3. add external secrets, signing, and stronger policy enforcement
4. expand AI Vision and Kafka CI coverage
5. add rollback shortcuts and deeper smoke tests
