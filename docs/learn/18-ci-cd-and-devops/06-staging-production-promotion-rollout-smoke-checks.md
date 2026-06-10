# Staging, Production, Promotion, Rollout, And Smoke Checks

## Why Environments Matter

Different environments serve different purposes.

Common flow:

```text
local -> CI -> staging -> production
```

Local is for fast development.

CI is for automated validation.

Staging is for production-like deployment verification.

Production is where real users depend on the system.

## Promotion

Promotion means moving the same validated artifact through environments.

The important phrase is:

```text
same artifact, different environment config
```

You do not want to rebuild different code for production after testing something else in staging.

Artistry Cart supports this with a release image manifest that is consumed by staging and production deploy workflows.

## Staging Deployment

Artistry Cart staging deployment is defined in:

```text
.github/workflows/deploy-staging.yml
```

It can run:

- automatically after successful Build and Publish Images workflow on `master`
- manually through workflow dispatch

It deploys:

```text
k8s/overlays/staging
```

The staging namespace is:

```text
artistry-cart-staging
```

## Production Deployment

Artistry Cart production deployment is defined in:

```text
.github/workflows/deploy-production.yml
```

It runs manually through workflow dispatch.

It deploys:

```text
k8s/overlays/production
```

The production namespace is:

```text
artistry-cart-prod
```

Manual production dispatch is a common controlled-delivery pattern.

## Kubeconfig

Deploy workflows need cluster access.

Artistry Cart reads kubeconfig from:

```text
secrets.KUBE_CONFIG
```

The workflow writes it to the runner temp directory and sets:

```text
KUBECONFIG
```

This is sensitive and should be scoped carefully through GitHub environments and secrets.

## Rendering Kustomize Image Digests

Before applying manifests, the workflow runs:

```text
node scripts/ci/render-kustomize-images-from-manifest.mjs --require-all <manifest> <overlay>/kustomization.yaml
```

This updates the overlay with image digests from the release manifest.

The `--require-all` flag makes deployment fail if a required app image is missing.

That is a good safety gate.

## Rendered Manifest Artifact

The deploy workflow runs:

```text
kubectl kustomize <overlay> > rendered.yaml
```

Then it uploads the rendered manifest as an artifact.

This helps debugging because the team can inspect the exact Kubernetes YAML that was applied.

## Applying The Overlay

The workflow deploys with:

```text
kubectl apply -k k8s/overlays/staging
kubectl apply -k k8s/overlays/production
```

Kustomize combines base manifests with environment-specific patches.

## Rollout Status

After applying manifests, the workflow waits for rollout status:

```text
kubectl rollout status deployment/<name> --namespace <namespace> --timeout=180s
```

This verifies Kubernetes accepted the change and Deployments became healthy.

## Smoke Checks

Smoke checks are lightweight post-deploy checks.

They answer:

```text
is the deployed system basically alive from the outside?
```

Artistry Cart runs:

```text
node scripts/ci/run-deploy-smoke-checks.mjs staging
node scripts/ci/run-deploy-smoke-checks.mjs production
```

The workflows use configured URLs for:

- user UI
- seller UI
- API gateway

## Strong Interview Answer

If asked "How should staging and production deployment work?", say:

> I prefer building artifacts once, recording immutable image digests, deploying the same artifacts to staging first, running rollout and smoke checks, then promoting the same manifest to production with environment-specific config. Production should usually have stronger controls, environment secrets, and manual approval or protected deployment rules.

## Artistry Cart Connection

Artistry Cart uses staging as the automatic post-publish verification environment and production as a manual deployment. Both deploy workflows download the release manifest, render Kustomize image digests, apply Kubernetes overlays, wait for rollouts, run smoke checks, upload rendered YAML, and write deployment summaries.
