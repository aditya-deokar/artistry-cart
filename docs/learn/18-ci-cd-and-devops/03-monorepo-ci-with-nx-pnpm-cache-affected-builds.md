# Monorepo CI With Nx, pnpm, Cache, And Affected Builds

## Why Monorepo CI Is Different

In a small single-service repo, CI can build and test everything on every change.

In a monorepo, that becomes expensive because one repository may contain:

- multiple frontends
- multiple backend services
- shared packages
- e2e projects
- infrastructure code
- deployment manifests

The pipeline needs to answer:

```text
what changed, and what is affected by that change?
```

## pnpm In CI

`pnpm` is the package manager used by this repo.

CI uses:

```text
pnpm install --frozen-lockfile
```

This is important because CI should not silently change dependency versions. The lockfile must match the package definitions.

Strong interview sentence:

> In CI, I use a frozen lockfile so dependency resolution is reproducible and the pipeline fails if the lockfile is out of sync.

## Node And pnpm Versions

The workflows set:

```text
NODE_VERSION = 20
PNPM_VERSION = 9
```

This keeps CI consistent across runs.

If local development uses different versions, a bug can appear locally but not in CI, or the reverse.

## Cache

Caching stores reusable data between workflow runs.

In this repo, `actions/setup-node` uses:

```yaml
cache: pnpm
```

This speeds up dependency installation.

Docker build also uses GitHub Actions cache:

```text
cache-from: type=gha
cache-to: type=gha,mode=max
```

Caching should improve speed without changing correctness.

## Nx Affected

Nx understands the workspace project graph.

On pull requests, Artistry Cart runs:

```text
pnpm exec nx affected --target=test --base=origin/master --head=HEAD --parallel=3
pnpm exec nx affected --target=build --base=origin/master --head=HEAD --parallel=3
```

This means:

```text
only test and build projects affected by the PR change
```

That is one of the biggest advantages of Nx in a monorepo.

## Run Many

For pushes to `master`, the pipeline builds known deployable apps:

```text
pnpm exec nx run-many --target=build --projects=<deployable apps> --parallel=5
```

This is more exhaustive than PR affected builds and validates all deployable services before release steps.

## Deployable App Selection

The script `scripts/ci/select-deployable-apps.mjs` defines deployable apps:

- `user-ui`
- `seller-ui`
- `api-gateway`
- `auth-service`
- `product-service`
- `order-service`
- `recommendation-service`
- `aivision-service`
- `kafka-service`

It can select apps by:

- explicit `--apps`
- all apps with `--all`
- changed files between `--base` and `--head`

Shared changes trigger all apps because packages, Dockerfiles, Prisma, lockfiles, and CI scripts can affect many projects.

## Why Shared Changes Trigger More Work

If a shared package changes, many services may be affected.

Examples:

- `packages/` change can affect backend and frontend code
- `prisma/` change can affect services using database models
- `docker/` change can affect image builds
- `pnpm-lock.yaml` change can affect all apps
- `.github/workflows/` change can affect delivery itself

That is why a monorepo pipeline needs conservative rules around shared files.

## Strong Interview Answer

If asked "How do you optimize CI in an Nx monorepo?", say:

> I use the Nx project graph to run affected tests and builds for pull requests, use `run-many` for broader release validation, keep installs reproducible with `pnpm install --frozen-lockfile`, use dependency and Docker layer caching, and treat shared package or infrastructure changes as wider-impact changes that may require rebuilding more projects.

## Artistry Cart Connection

Artistry Cart combines Nx affected commands for PR feedback with explicit deployable app builds for release confidence. Its image selection script understands app roots, Dockerfiles, ports, build outputs, and shared paths.
