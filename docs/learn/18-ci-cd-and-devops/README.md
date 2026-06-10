# CI/CD And DevOps

This folder is the eighteenth learning block for preparing for a bigger engineering role. It explains CI/CD and DevOps from first principles, then connects those ideas to the Artistry Cart delivery pipeline.

The goal is to understand how code moves from a developer branch to tested builds, container images, Kubernetes deployments, smoke checks, security scans, and production releases.

## Learning Outcome

After completing this topic, you should be able to explain:

- what DevOps means in practical engineering work
- the difference between CI, CD, deployment, and release
- how GitHub Actions workflows are structured
- why monorepos need affected builds and caching
- how CI runs unit, integration, build, and e2e validation
- how Docker images are built, tagged, scanned, and published
- how release manifests connect image publishing to Kubernetes deployment
- how staging and production promotion should work
- how secrets, variables, environments, and permissions are handled
- how security scans and dependency automation fit the pipeline
- how to debug failed CI/CD jobs
- how to explain the Artistry Cart pipeline in an interview

## Files In This Topic

1. [DevOps, CI, CD, And Release Fundamentals](./01-devops-ci-cd-release-fundamentals.md)
2. [GitHub Actions Workflow Basics](./02-github-actions-workflow-basics.md)
3. [Monorepo CI With Nx, pnpm, Cache, And Affected Builds](./03-monorepo-ci-with-nx-pnpm-cache-affected-builds.md)
4. [Test, Build, E2E, And Quality Gates](./04-test-build-e2e-quality-gates.md)
5. [Docker Image Build, Scan, Publish, And Release Manifest](./05-docker-image-build-scan-publish-release-manifest.md)
6. [Staging, Production, Promotion, Rollout, And Smoke Checks](./06-staging-production-promotion-rollout-smoke-checks.md)
7. [Secrets, Security, Observability, And Failure Debugging](./07-secrets-security-observability-failure-debugging.md)
8. [CI/CD In Artistry Cart And Interview Answers](./08-ci-cd-in-artistry-cart-and-interview-answers.md)

## Core Mental Model

```text
developer change
  -> pull request validation
  -> tests and builds
  -> image build and publish
  -> release manifest
  -> staging deploy
  -> smoke checks
  -> production deploy
  -> monitoring and rollback readiness
```

For this repo:

```text
GitHub Actions + pnpm + Nx + Vitest + Docker Buildx + Trivy + GHCR + Kustomize + kubectl
```

## Connection To Artistry Cart

Artistry Cart includes CI/CD assets under:

```text
.github/workflows/
scripts/ci/
docker/
k8s/
```

The current workflow set validates pull requests, builds deployable apps, runs core service e2e tests, publishes Docker images to GitHub Container Registry, creates a release image manifest, deploys staging automatically after successful image publication, deploys production manually, runs smoke checks, uploads rendered Kubernetes manifests, and performs nightly security scanning.
