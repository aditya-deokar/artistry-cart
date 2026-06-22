# CI/CD In Artistry Cart And Interview Answers

This file gives interview-ready answers for CI/CD and DevOps.

## Artistry Cart Pipeline Map

```text
.github/workflows/test.yml
  -> PR and master validation

.github/workflows/build-publish.yml
  -> release validation, e2e, image build, image scan, GHCR publish, release manifest

.github/workflows/deploy-staging.yml
  -> staging Kustomize deploy, rollout wait, smoke checks

.github/workflows/deploy-production.yml
  -> manual production Kustomize deploy, rollout wait, smoke checks

.github/workflows/nightly-security.yml
  -> recurring Trivy filesystem scan and pnpm audit
```

## Important Helper Scripts

```text
scripts/ci/select-deployable-apps.mjs
```

Selects deployable apps for image building.

```text
scripts/ci/merge-image-records.mjs
```

Merges per-app image records into one release manifest.

```text
scripts/ci/render-kustomize-images-from-manifest.mjs
```

Updates Kustomize image references with immutable image digests from the release manifest.

```text
scripts/ci/run-deploy-smoke-checks.mjs
```

Checks deployed public endpoints after staging or production deployment.

## Deployable Apps

The pipeline knows these deployable applications:

- `user-ui`
- `seller-ui`
- `api-gateway`
- `auth-service`
- `product-service`
- `order-service`
- `recommendation-service`
- `aivision-service`
- `kafka-service`

This mirrors the service-oriented architecture of the repo.

## Question: What Is DevOps?

Strong answer:

> DevOps is the practice of making software delivery automated, reliable, observable, and collaborative. It connects development, testing, infrastructure, deployment, monitoring, and feedback so teams can ship changes safely and repeatedly.

## Question: CI Versus CD?

Strong answer:

> CI validates that changes integrate safely by running tests, builds, and quality checks. CD automates the path from validated code to deployable or deployed software. Continuous delivery means the system is always ready to deploy; continuous deployment means valid changes are automatically deployed to production.

## Question: How Does CI Work In This Project?

Strong answer:

> Pull requests run Nx affected tests and builds for fast feedback. Pushes to `master` run broader unit and integration tests with coverage, build all deployable apps, and upload coverage. Core backend e2e tests start MongoDB, Redis, backend services, and the API gateway, wait for `/readyz`, then run Nx e2e projects.

## Question: Why Use Nx Affected In CI?

Strong answer:

> In a monorepo, not every change affects every project. Nx affected uses the project graph and Git diff to run tests and builds only for impacted projects. That keeps pull request feedback faster while still respecting shared dependencies.

## Question: How Are Docker Images Published?

Strong answer:

> After release validation passes, the pipeline selects deployable apps, builds Docker images with Buildx, pushes them to GHCR, scans them with Trivy, records each image digest, and merges those records into a release image manifest.

## Question: Why Use Image Digests?

Strong answer:

> Tags can move, but digests identify exact image content. Deploying by digest gives better traceability and makes it clear exactly which artifact reached staging or production.

## Question: How Does Deployment Work?

Strong answer:

> The deploy workflow downloads the release image manifest, updates the target Kustomize overlay with image digests, renders the Kubernetes manifest, applies the overlay with `kubectl apply -k`, waits for each Deployment rollout, runs smoke checks, uploads the rendered YAML, and writes a deployment summary.

## Question: Staging Versus Production In This Project?

Strong answer:

> Staging deployment can run automatically after successful image publishing from `master`, while production deployment is manual. Both use the same release manifest pattern, but different Kustomize overlays and namespaces: `artistry-cart-staging` and `artistry-cart-prod`.

## Question: How Are Secrets Managed?

Strong answer:

> CI/CD secrets should live in secret stores, not in source code. In this project, deploy workflows read `KUBE_CONFIG` from GitHub environment secrets. Runtime app secrets should be injected through Kubernetes Secrets or environment-specific secret management, not baked into images.

## Question: What Security Checks Exist?

Strong answer:

> Image builds are scanned with Trivy and results are uploaded to GitHub Security. A nightly security workflow also runs Trivy filesystem scanning and `pnpm audit --prod`, then uploads scan artifacts. Dependabot helps keep dependencies and workflow actions updated.

## Question: How Do You Debug Failed Deployments?

Strong answer:

> I first identify whether the failure is manifest rendering, kubeconfig access, `kubectl apply`, rollout timeout, or smoke check failure. Then I inspect the rendered manifest artifact, rollout events, pod logs, readiness probes, image digests, environment variables, and recent Kubernetes events.

## Best Short Project Pitch For This Topic

> Artistry Cart has a practical CI/CD pipeline for a service-oriented Nx monorepo. Pull requests use Nx affected validation, release workflows run full tests and e2e checks, deployable apps are packaged as Docker images, images are scanned and published to GHCR, a release manifest records immutable digests, and Kubernetes deploy workflows promote those artifacts through staging and production with rollout checks and smoke tests.
