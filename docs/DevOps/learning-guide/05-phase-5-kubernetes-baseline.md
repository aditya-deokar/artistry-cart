# Phase 5 Kubernetes Baseline

## Goal

Phase 5 means the repo is no longer only container-ready.

It now has a Kubernetes deployment baseline that answers:

- what gets deployed
- how workloads are grouped
- what is public versus internal
- where config lives
- how scaling starts

## What Was Implemented

The repo now includes:

- [k8s/README.md](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/k8s/README.md>)
- [k8s/base/kustomization.yaml](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/k8s/base/kustomization.yaml>)
- [k8s/base/configmap.yaml](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/k8s/base/configmap.yaml>)
- [k8s/base/ingress.yaml](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/k8s/base/ingress.yaml>)
- [k8s/base/secrets.example.yaml](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/k8s/base/secrets.example.yaml>)
- environment overlays under `k8s/overlays/dev`, `staging`, and `production`

## Workload Mapping

| Workload | Kubernetes owner | Notes |
| --- | --- | --- |
| `user-ui` | `Deployment`, `Service`, `HPA`, `PDB` | public frontend |
| `seller-ui` | `Deployment`, `Service`, `HPA`, `PDB` | public frontend |
| `api-gateway` | `Deployment`, `Service`, `HPA`, `PDB` | public backend edge |
| `auth-service` | `Deployment`, `Service`, `HPA` | internal API |
| `product-service` | `Deployment`, `Service` | internal API, no HPA yet because cleanup behavior needs caution |
| `order-service` | `Deployment`, `Service`, `HPA` | internal API |
| `recommendation-service` | `Deployment`, `Service`, `HPA` | heavier service |
| `aivision-service` | `Deployment`, `Service`, `HPA` | heaviest API, includes startup probe |
| `kafka-service` | `Deployment` | background worker |
| product cleanup | `CronJob` | calls internal maintenance endpoint instead of running inside every API replica |

## Why Kustomize Was Chosen

Kustomize fits this repo well because:

- the same app set exists across environments
- only namespace, ingress, config, and scale vary between environments
- it keeps the files plain YAML and easy to learn

## Config Strategy

The Kubernetes baseline uses:

- one shared `ConfigMap` for non-secret platform settings
- one shared example `Secret` manifest for initial setup

Beginner idea:

- separate normal config from secrets

Advanced idea:

- this shared secret is only a baseline convenience; later you should split secrets per workload or use an external secret manager

## The Important Product Cleanup Change

This is one of the most meaningful Phase 5 changes.

Before:

- `product-service` ran its cleanup cron inside every API replica

Problem:

- if the deployment scales beyond one replica, the same cleanup schedule can run multiple times

Now:

- Kubernetes sets `PRODUCT_CLEANUP_CRON_ENABLED=false` for `product-service`
- a `CronJob` runs on schedule
- that `CronJob` calls an internal maintenance endpoint using `MAINTENANCE_TOKEN`

This is not the final perfect architecture, but it is a much safer Kubernetes baseline.

## Frontend Probe Improvement

`user-ui` and `seller-ui` now expose:

- `/healthz`
- `/readyz`

That gives Kubernetes cleaner liveness and readiness checks than probing the home page.

## What Is Still Not Final

Phase 5 baseline does not mean “everything is finished”.

The main next-step items are:

- deploy overlays from CI using the release manifest digests
- split `aivision-service` API and worker behavior
- eventually move from shared secret to more targeted secret ownership
- add network policies and observability
