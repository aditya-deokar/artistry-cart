# GitHub Actions Workflow Basics

## What GitHub Actions Is

GitHub Actions is a CI/CD automation platform built into GitHub.

It runs workflows defined as YAML files under:

```text
.github/workflows/
```

Each workflow is triggered by events such as:

- pull request
- push
- tag push
- manual dispatch
- schedule
- completion of another workflow

## Workflow

A workflow is one automation file.

Example workflow responsibilities:

- test the repo
- publish images
- deploy staging
- deploy production
- run nightly security checks

Artistry Cart has:

- `.github/workflows/test.yml`
- `.github/workflows/build-publish.yml`
- `.github/workflows/deploy-staging.yml`
- `.github/workflows/deploy-production.yml`
- `.github/workflows/nightly-security.yml`

## Job

A job is a group of steps that runs on a runner.

Example:

```yaml
jobs:
  unit-integration:
    runs-on: ubuntu-latest
```

Jobs can run in parallel or depend on each other with `needs`.

In Artistry Cart, the e2e job depends on the unit and integration job:

```text
unit-integration -> e2e
```

## Step

A step is one action or command inside a job.

Common steps:

- checkout repository
- setup Node
- setup pnpm
- install dependencies
- generate Prisma client
- run tests
- build apps
- upload artifacts

## Action

An action is a reusable workflow component.

Examples used by this repo:

- `actions/checkout`
- `pnpm/action-setup`
- `actions/setup-node`
- `actions/upload-artifact`
- `actions/download-artifact`
- `docker/setup-buildx-action`
- `docker/login-action`
- `docker/metadata-action`
- `docker/build-push-action`
- `aquasecurity/trivy-action`
- `azure/setup-kubectl`

## Trigger

The `on` block defines when a workflow runs.

Examples:

```yaml
on:
  pull_request:
    branches: [master, develop]
  push:
    branches: [master]
```

This means the workflow runs for pull requests into `master` or `develop`, and for pushes to `master`.

## Concurrency

Concurrency controls overlapping workflow runs.

Artistry Cart uses:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

That prevents wasting compute on older validation runs for the same branch.

For deployments, the repo uses a single deployment group and does not cancel in-progress deployment:

```text
staging-deploy
production-deploy
```

That is safer because two deployment jobs should not fight over the same environment.

## Permissions

GitHub Actions workflows should request only the permissions they need.

Examples:

- read repository contents
- write packages to GHCR
- upload security scan results
- read action artifacts

In image publishing, Artistry Cart grants `packages: write` because it must push Docker images.

## Secrets And Variables

Secrets are sensitive values:

- kubeconfig
- tokens
- API keys
- webhook secrets

Variables are non-secret configuration:

- smoke check URLs
- public frontend config
- environment-specific base URLs

In Artistry Cart deploy workflows, `KUBE_CONFIG` is read from environment secrets.

## Strong Interview Answer

If asked "How does GitHub Actions work?", say:

> GitHub Actions runs YAML workflows from `.github/workflows`. A workflow is triggered by events like pull requests, pushes, schedules, or manual dispatch. Each workflow contains jobs, each job runs on a runner, and each job has steps that either call reusable actions or execute shell commands. Good workflows use caching, concurrency, limited permissions, secrets, artifacts, and environment protection rules.

## Artistry Cart Connection

Artistry Cart uses GitHub Actions as its main automation layer. Test workflows validate code, build-publish workflows create Docker images and release manifests, deploy workflows apply Kustomize overlays with `kubectl`, and nightly workflows run security checks.
