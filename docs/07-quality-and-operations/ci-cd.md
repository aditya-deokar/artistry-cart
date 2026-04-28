# CI/CD

## Overview

The repository now has two primary GitHub Actions workflows:

- `.github/workflows/test.yml`
- `.github/workflows/build-publish.yml`

The first keeps fast validation in place. The second extends the repo into Phase 4 image build, scan, and registry delivery.

## Trigger Strategy

Validation runs on:

- pull requests to `master` and `develop`
- pushes to `master`

Image build and publish runs on:

- pushes to `master`
- semantic version tags such as `v1.2.0`
- manual workflow dispatch

Both workflows use concurrency to cancel superseded runs on the same ref.

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
- selects affected deployable apps on branch pushes
- builds and pushes images to GHCR
- tags images with immutable SHA tags and release tags
- enables SBOM attestation during image builds
- runs Trivy image scans and uploads SARIF output

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

## What CI Does Not Yet Cover Fully

- no staging deploy workflow yet
- no production promotion workflow yet
- no visible lint-only workflow
- `aivision-service-e2e` and `kafka-service-e2e` exist in the repo but are not currently run in the core e2e job
- Kafka-backed runtime validation is still outside the visible CI service stack

## Operational Notes

- CI standardizes on Node.js 20 and pnpm 9
- MongoDB and Redis are explicitly provisioned in CI
- GHCR is the current image registry target
- Kafka is not yet provisioned in the visible CI workflow jobs

That matters because analytics and event-driven behavior are not fully represented in the current CI runtime.

## Strengths

- practical and reasonably fast core backend pipeline
- affected-test optimization keeps PR feedback efficient
- e2e coverage is not just theoretical; services are actually built and started

## Gaps And Next Improvements

- add AI Vision and Kafka e2e coverage paths where feasible
- add staging deployment automation
- add production promotion and rollback workflows
- add lint/static analysis if desired

## Interview Framing

A strong summary is:

- CI covers core backend quality and deployable build validation
- the repo now has real container delivery automation to GHCR
- the next step is promotion automation plus broader AI and Kafka end-to-end coverage
