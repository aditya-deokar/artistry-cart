# CI/CD

## Overview

The repository now has five important GitHub Actions workflows:

- `.github/workflows/test.yml`
- `.github/workflows/build-publish.yml`
- `.github/workflows/deploy-staging.yml`
- `.github/workflows/deploy-production.yml`
- `.github/workflows/nightly-security.yml`

The first keeps fast validation in place. The second handles image build, scan, and registry delivery. The third and fourth handle digest-based Kubernetes promotion. The last adds recurring security and dependency-audit checks.

## Trigger Strategy

Validation runs on:

- pull requests to `master` and `develop`
- pushes to `master`

Image build and publish runs on:

- pushes to `master`
- semantic version tags such as `v1.2.0`
- manual workflow dispatch

Deployment automation runs on:

- successful `Build and Publish Images` completion for staging
- manual workflow dispatch for production

Nightly security runs on:

- a weekly schedule
- manual workflow dispatch

## CI Pipeline Structure

### Validation workflow

The validation workflow:

- checks out the repository
- sets up pnpm and Node.js 20
- installs dependencies with `pnpm install --frozen-lockfile`
- runs `pnpm exec prisma generate`
- runs:
  - `nx affected --target=test` on pull requests
  - `nx affected --target=build` on pull requests
  - `vitest run --coverage` on pushes
  - deployable app builds on pushes
- uploads coverage to Codecov on pushes

### Release workflow

The build-and-publish workflow:

- reruns coverage before publish
- reruns core backend e2e validation before publish
- builds deployable workloads for automated master releases
- builds and pushes images to GHCR
- tags images with immutable SHA tags and release tags
- enables SBOM attestation during image builds
- runs Trivy image scans and uploads SARIF output
- writes a full `release-image-manifest` artifact so deploy workflows can promote exact digests

### Deployment workflows

The deployment workflows:

- download the `release-image-manifest` artifact from the publish workflow
- render Kustomize overlays with exact image digests
- apply staging or production overlays without rebuilding images
- wait for Deployment rollouts to finish
- run optional smoke checks when environment URLs are configured

### Nightly security workflow

The scheduled security workflow:

- runs a Trivy filesystem scan across the repo
- uploads SARIF results into GitHub security reporting
- runs `pnpm audit --prod`
- uploads audit results as build artifacts

### Dependency update automation

The repo also includes `.github/dependabot.yml` so npm and GitHub Actions dependencies can receive recurring update pull requests.

### E2E tests

The core e2e job:

- depends on successful validation
- provisions MongoDB and Redis as CI services
- installs dependencies
- runs `pnpm exec prisma generate`
- builds:
  - `auth-service`
  - `product-service`
  - `order-service`
  - `recommendation-service`
  - `api-gateway`
- starts those services from their built outputs
- waits for readiness endpoints
- runs selected e2e projects

## What CI Covers Well

- core backend install/build/test loop
- affected-test and affected-build optimization for pull requests
- frontend and backend build validation on the default branch
- service startup and cross-service request-path validation for core commerce apps
- coverage publishing on push
- container image build, scan, and GHCR publish for deployable apps
- digest-based promotion into staging and production
- recurring filesystem scanning and dependency-audit reporting

## What CI Does Not Yet Cover Fully

- no visible lint-only workflow
- `aivision-service-e2e` and `kafka-service-e2e` exist in the repo but are not currently run in the core e2e job
- Kafka-backed runtime validation is still outside the visible CI service stack
- deployment smoke checks are still health-oriented and not yet full business-flow validation

## Operational Notes

- CI standardizes on Node.js 20 and pnpm 9
- MongoDB and Redis are explicitly provisioned in CI
- GHCR is the current image registry target
- Kafka is not yet provisioned in the visible CI workflow jobs
- staging and production workflows expect GitHub Environment secrets such as `KUBE_CONFIG`
- smoke checks can use environment-scoped variables such as `SMOKE_USER_UI_URL`, `SMOKE_SELLER_UI_URL`, and `SMOKE_API_GATEWAY_URL`

That matters because analytics and event-driven behavior are not fully represented in the current CI runtime, and environment promotion still depends on real cluster setup.

## Strengths

- practical and reasonably fast core backend pipeline
- affected-test optimization keeps PR feedback efficient
- e2e coverage is not just theoretical; services are actually built and started
- supply-chain security checks are now part of the repo workflow story
- deployment workflows promote published digests instead of rebuilding

## Gaps And Next Improvements

- add AI Vision and Kafka e2e coverage paths where feasible
- add a richer rollback workflow shortcut
- add lint/static analysis if desired
- add dependency review and image signing if the release path becomes stricter
- expand smoke tests from health checks into business-path validation

## Interview Framing

A strong summary is:

- CI covers core backend quality and deployable build validation
- the repo has real container delivery automation to GHCR
- the repo has digest-based deployment promotion
- the next step is broader AI and Kafka end-to-end coverage plus deeper smoke and rollback automation
