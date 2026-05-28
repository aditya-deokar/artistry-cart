# Phase 4 CI/CD Implementation Plan

## Goal

Phase 4 for this repo means:

- validate code in CI
- build deployable apps consistently
- publish container images to a registry
- scan those images
- produce immutable references that later deployment workflows can trust

## What Is Implemented

The current Phase 4 implementation is built from these repo assets:

- `.github/workflows/test.yml`
- `.github/workflows/build-publish.yml`
- `scripts/ci/select-deployable-apps.mjs`
- `scripts/ci/merge-image-records.mjs`

## Practical Flow

This is the exact release path now implemented in the repo:

1. checkout the target ref
2. install dependencies with pnpm
3. run `prisma generate`
4. run unit and integration tests with coverage
5. run core backend e2e validation
6. detect which deployable apps need images
7. build and push only those images to GHCR
8. tag images with immutable metadata
9. run Trivy vulnerability scanning
10. generate SBOM and provenance metadata
11. produce a `release-image-manifest` artifact containing exact image digests

## Why The Release Manifest Matters

Without a release manifest, later deployment jobs usually have to rebuild, recalculate, or guess what should be deployed.

With the manifest artifact, a future staging or production workflow can:

- download the manifest
- read the exact digest for each app
- patch Kubernetes manifests or Helm values
- deploy the exact image set that already passed CI

That is the bridge from “CI that pushes images” to “real CD”.

## Registry Strategy

The repo currently targets GitHub Container Registry.

Image naming pattern:

```text
ghcr.io/<owner>/artistry-cart-<app>
```

Examples:

- `ghcr.io/<owner>/artistry-cart-user-ui`
- `ghcr.io/<owner>/artistry-cart-api-gateway`
- `ghcr.io/<owner>/artistry-cart-kafka-service`

## Tagging Strategy

The workflow already uses immutable tags:

- `sha-<commit>`
- release tag such as `v1.0.0`
- `master` for the default branch channel

Operationally, the safest deployment reference is still the image digest from the manifest artifact.

## Secrets And Variables To Configure

| Type | Name | Why It Exists |
| --- | --- | --- |
| built-in token | `GITHUB_TOKEN` | authenticates GHCR publishing in GitHub Actions |
| secret | `CODECOV_TOKEN` | optional coverage upload on push validation |
| repo variable | `NEXT_PUBLIC_SERVER_URI` | frontend build-time public API base |
| repo variable | `INTERNAL_SERVER_URI` | frontend internal rewrite target inside containers |
| repo variable | `NEXT_PUBLIC_FRONTEND_URL` | public frontend URL |
| repo variable | `NEXT_PUBLIC_AI_VISION_API_URL` | frontend AI API route target |
| repo variable | `NEXT_PUBLIC_USER_UI_LINK` | seller UI link back to buyer UI |
| repo variable | `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | frontend Stripe publishable key |

## Definition Of Done For Phase 4

Phase 4 is successful when:

- PRs get fast validation feedback
- default-branch pushes publish only required images
- images are traceable to commits and releases
- every published image is scanned
- a release artifact exists with exact digests for later deployment

## What I Would Build Next For Full CD

These are the next logical steps after the current Phase 4 baseline:

1. `deploy-staging.yml` that consumes `release-image-manifest`
2. smoke tests against staging URLs
3. `deploy-production.yml` with approval gates
4. digest-based rollback procedure
5. environment-scoped secrets and GitHub Environments
