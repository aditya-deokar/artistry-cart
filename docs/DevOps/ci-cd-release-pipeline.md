# CI/CD Release Pipeline

## Purpose

This document defines the target CI/CD and release pipeline for the Dockerized Artistry Cart monorepo.

It explains:

- what the current pipeline already does
- what gaps remain
- how images should be built, tagged, scanned, and published
- how staging and production promotion should work

## Current State

The current visible workflow is [test.yml](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/.github/workflows/test.yml>).

Today it gives the repo:

- pull request and push test validation
- Nx affected testing on pull requests
- Vitest execution on push
- MongoDB and Redis-backed e2e runs for selected backend services

That is a solid validation baseline, but it is not yet a release pipeline.

## What The Current Workflow Covers Well

- Node `20`
- pnpm `9`
- `prisma generate`
- backend build and e2e startup for a core subset of services
- coverage upload on push

## What It Does Not Yet Cover

- no image build or publish
- no frontend production build validation
- no `aivision-service` image or e2e coverage in the main CI path
- no Kafka-backed workflow validation
- no staging or production deployment automation
- no vulnerability scanning
- no SBOM generation

## Pipeline Goals

The target pipeline should provide:

- fast PR feedback
- reliable image builds
- traceable image tags
- repeatable staging deployment
- controlled production promotion
- rollback-friendly release history

## Recommended Pipeline Stages

### 1. Pull request validation

Trigger:

- pull requests to `master` and `develop`

Goals:

- fail fast
- validate only what changed when practical

Recommended checks:

- install dependencies
- generate Prisma client
- `nx affected --target=test`
- `nx affected --target=build`
- frontend build verification
- optional Dockerfile lint or static validation

### 2. Main branch image build and publish

Trigger:

- push to `master`

Goals:

- build all affected deployable workloads
- publish images to registry
- attach traceable metadata

Recommended jobs:

- run tests
- build affected apps
- build Docker images
- scan images
- push images

### 3. Staging deployment

Trigger:

- successful image publish from `master`
- or manual workflow dispatch

Goals:

- deploy the exact published images to staging
- run smoke checks
- keep promotion reproducible

### 4. Production release

Trigger:

- manual approval
- semantic version tag
- or promotion from a validated staging release

Goals:

- promote a known-good image set
- keep rollback simple
- avoid rebuilding during promotion

## Recommended Workflow Split

Recommended GitHub Actions files:

| Workflow | Purpose |
| --- | --- |
| `pr-validate.yml` | pull request tests and builds |
| `build-publish.yml` | image build, scan, and push |
| `deploy-staging.yml` | deploy published images to staging |
| `deploy-production.yml` | controlled production promotion |
| `nightly-security.yml` | optional scheduled scan and dependency hygiene |

The current `test.yml` can remain temporarily and later be absorbed into the PR validation workflow.

## Nx-Aware Build Strategy

Nx should stay central to CI efficiency.

Recommended commands:

- PRs: `pnpm exec nx affected --target=test --base=origin/master --head=HEAD`
- PRs: `pnpm exec nx affected --target=build --base=origin/master --head=HEAD`
- main branch: `pnpm exec nx run-many --target=build --projects=<deployable-apps>`

Important note:

- Docker build decisions should follow deployable app boundaries, not every changed file blindly

Deployable workloads in scope:

- `user-ui`
- `seller-ui`
- `api-gateway`
- `auth-service`
- `product-service`
- `order-service`
- `recommendation-service`
- `aivision-service`
- `kafka-service`

## Registry Strategy

Recommended registry:

- GitHub Container Registry first

Why:

- natural fit with GitHub Actions
- clean per-repo image ownership
- simpler permission model for a GitHub-hosted workflow

Suggested image naming pattern:

```text
ghcr.io/<org>/artistry-cart-<app>
```

Examples:

- `ghcr.io/<org>/artistry-cart-user-ui`
- `ghcr.io/<org>/artistry-cart-api-gateway`
- `ghcr.io/<org>/artistry-cart-auth-service`

## Tagging Strategy

Every pushed image should receive immutable tags.

Recommended tags:

- commit SHA tag
- branch or channel tag
- semantic version tag for formal releases

Examples:

- `sha-abc1234`
- `main-20260427-1`
- `v1.2.0`

Recommendation:

- avoid using `latest` as the primary deployment reference
- deploy by immutable tag or digest

## Suggested Job Sequence

1. checkout
2. setup pnpm and Node
3. install dependencies
4. run `prisma generate`
5. run tests
6. run frontend and backend builds
7. build Docker images
8. scan images
9. generate SBOM
10. push images
11. deploy to staging
12. run smoke tests
13. wait for production approval
14. promote the same image tags to production

## Security And Supply Chain Checks

Recommended additions:

- container vulnerability scanning
- dependency scanning
- SBOM generation
- image provenance or attestation where practical

Why this matters here:

- the repo includes authentication, payments, AI integrations, and multiple third-party services
- the blast radius of a compromised dependency is not small

## Environment And Secret Management

Recommended GitHub secrets or environment-scoped secrets should include:

| Secret group | Examples |
| --- | --- |
| registry auth | `GHCR_TOKEN` or equivalent |
| Kubernetes access | kubeconfig or workload identity credentials |
| staging config | staging database and API-related secrets |
| production config | production secrets separated from staging |
| deploy notifications | optional Slack or other webhook |

Important repo-specific note:

- there is currently a naming inconsistency between common Stripe conventions and the codebase, which expects `STRIPE_SECRETE_KEY` in some places

That mismatch should be normalized before the release pipeline is treated as stable.

## Staging Deployment Strategy

Recommended staging rules:

- deploy only published images
- never rebuild during staging deploy
- use the same manifests as production with environment overlays
- run smoke checks against:
  - `user-ui`
  - `seller-ui`
  - `api-gateway`
  - core internal routes

Minimum smoke checks:

- gateway health
- auth login or token refresh path
- product list or search path
- order-service readiness

## Production Release Strategy

Recommended production rules:

- promote images that already passed staging
- require explicit approval
- deploy by immutable image tag or digest
- record release metadata in GitHub release notes or deployment annotations

Recommended production gates:

- tests passed
- images published
- staging deploy passed
- smoke tests passed
- manual approval granted

## Rollback Strategy

Rollback should be operationally boring.

Recommended rollback methods:

- redeploy the last known-good image tag
- keep at least several recent image versions available in the registry
- annotate deployments with release version and commit SHA

Do not require a rebuild in order to roll back.

## Recommended Release Sequence

1. merge change to `master`
2. run validation and build workflows
3. publish immutable images
4. deploy the published image set to staging
5. run smoke checks
6. approve production
7. deploy the exact same image set to production
8. monitor rollout and application health

## Gaps To Close Before Full CI/CD Rollout

- standardize health endpoints across services
- remove gateway hardcoded localhost upstreams
- validate frontend production builds in CI
- add `aivision-service` and Kafka paths to the release picture
- split background jobs from API pods where scale behavior requires it

## Definition Of Done

The CI/CD pipeline is in good shape when:

- PRs get fast validation
- deployable apps build as Docker images automatically
- images are scanned and published with immutable tags
- staging consumes published images, not local rebuilds
- production promotion is controlled and rollback-friendly

## Related Docs

- [DevOps Implementation Plan](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/DevOps/DevOps-implemenatation.md>)
- [Docker Compose Strategy](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/DevOps/docker-compose-strategy.md>)
- [Dockerfile Standards](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/DevOps/dockerfile-standards.md>)
- [Kubernetes Deployment Guide](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/DevOps/kubernetes-deployment-guide.md>)
- [CI/CD](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/07-quality-and-operations/ci-cd.md>)
