# CI/CD

## Overview

The repository currently has one visible GitHub Actions workflow:

- `.github/workflows/test.yml`

This workflow is focused on test execution rather than full deployment automation.

## Trigger Strategy

The workflow runs on:

- pull requests to `master` and `develop`
- pushes to `master`

It also uses workflow concurrency to cancel superseded runs on the same ref.

## CI Pipeline Structure

### Job 1: Unit and integration tests

This job:

- checks out the repository
- sets up pnpm and Node.js 20
- installs dependencies with `pnpm install --frozen-lockfile`
- runs `npx prisma generate`
- runs:
  - `nx affected --target=test` on pull requests
  - `vitest run` on pushes
  - coverage on pushes
- uploads coverage to Codecov on pushes

### Job 2: E2E tests

This job:

- depends on the unit/integration job
- provisions MongoDB and Redis as CI services
- installs dependencies
- runs `prisma generate`
- builds:
  - `auth-service`
  - `product-service`
  - `order-service`
  - `recommendation-service`
  - `api-gateway`
- starts those services
- waits for ports to come up
- runs selected e2e projects

## What CI Covers Well

- core backend install/build/test loop
- affected-test optimization for pull requests
- service startup and cross-service request-path validation for core commerce apps
- coverage publishing on push

## What CI Does Not Yet Cover Fully

- no visible deploy workflow
- no visible lint-only workflow
- no visible frontend build/test workflow
- `aivision-service-e2e` and `kafka-service-e2e` exist in the repo but are not currently run in the inspected e2e job
- AI Vision and Kafka are not part of the core backend build/start sequence in this workflow

## Operational Notes

- CI standardizes on Node.js 20 and pnpm 9
- MongoDB and Redis are explicitly provisioned in CI
- Kafka is not provisioned in the visible workflow

That matters because analytics and event-driven behavior are not fully represented in the current CI runtime.

## Strengths

- practical and reasonably fast core backend pipeline
- affected-test optimization keeps PR feedback efficient
- e2e coverage is not just theoretical; services are actually built and started

## Gaps And Next Improvements

- add AI Vision and Kafka coverage paths where feasible
- add frontend build validation
- add lint/static analysis if desired
- add deployment, preview, or release automation when the project stage requires it

## Interview Framing

A strong summary is:

- CI is real and useful for core backend quality
- it is stronger on validation than on release automation
- the biggest next step is widening coverage to experimental and non-core surfaces
