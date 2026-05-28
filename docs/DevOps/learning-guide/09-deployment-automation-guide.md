# Deployment Automation Guide

## What Was Added

The repo now has two deployment workflows:

- `.github/workflows/deploy-staging.yml`
- `.github/workflows/deploy-production.yml`

These workflows do not rebuild images.

They:

1. download `release-image-manifest`
2. patch the Kustomize overlay with exact image digests
3. apply the overlay to Kubernetes
4. wait for rollouts
5. run optional smoke checks

That is the correct DevOps pattern because build and deploy are separated.

## Why This Is Better Than Rebuilding During Deploy

If you rebuild during deploy, you can accidentally deploy something different from what CI validated.

If you deploy by digest:

- staging and production use the same image set
- rollback is easier
- release history is easier to reason about
- supply-chain trust is better

## Secrets And Variables You Must Configure

For the `staging` and `production` GitHub Environments, configure:

- secret: `KUBE_CONFIG`
- variable: `SMOKE_USER_UI_URL`
- variable: `SMOKE_SELLER_UI_URL`
- variable: `SMOKE_API_GATEWAY_URL`

The smoke-test variables are optional.

If you do not configure them, deployment still runs, but smoke checks are skipped.

## What A DevOps Engineer Does In Practice

### For staging

- let `deploy-staging.yml` run after a successful master release build
- confirm rollout status
- review smoke-check output

### For production

- trigger `deploy-production.yml` manually
- use a known-good `run_id`
- approve through GitHub Environment protections
- confirm rollout and smoke-check output

## Best Habit To Learn

Always think of release promotion like this:

- build once
- verify once
- promote the same artifact

That habit is one of the most important DevOps maturity upgrades in this repo.
