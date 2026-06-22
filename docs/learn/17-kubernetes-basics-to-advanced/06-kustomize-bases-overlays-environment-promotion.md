# Kustomize Bases, Overlays, And Environment Promotion

## What Kustomize Is

Kustomize customizes Kubernetes YAML without templating.

It lets you define:

- base manifests
- environment overlays
- patches
- labels
- image changes
- namespace changes

Command:

```bash
kubectl apply -k k8s/overlays/dev
```

## Base

Base contains shared manifests.

In Artistry Cart:

```text
k8s/base/
```

Base includes:

- namespace
- configmap
- ingress
- network policies
- deployments
- services
- HPAs
- PDBs
- CronJob

## Overlay

Overlay modifies base for an environment.

Artistry Cart overlays:

```text
k8s/overlays/dev
k8s/overlays/staging
k8s/overlays/production
```

Overlays can change:

- replicas
- resource settings
- HPA thresholds
- ingress host
- image tags
- namespace
- environment-specific config

## Why Overlays Matter

Dev, staging, and production are similar but not identical.

Example:

```text
dev: fewer replicas, lower resources
production: more replicas, stricter scaling, production domains
```

Avoid copy-pasting full YAML per environment.

## Patches

Patches update parts of base resources.

Artistry Cart overlays include:

- `hpa-patches.yaml`
- `settings-patches.yaml`

This keeps environment differences explicit.

## Environment Promotion

Promotion means moving a version through environments.

Example:

```text
dev -> staging -> production
```

Good promotion requires:

- image tags
- config separation
- secrets per environment
- smoke tests
- rollback plan
- observability

## Monitoring Addon

Artistry Cart includes optional monitoring resources:

```text
k8s/addons/monitoring
```

It includes:

- PodMonitor
- PrometheusRule
- overlays for dev/staging/production

This supports Prometheus Operator style monitoring.

## Interview Explanation

If asked "How do Kustomize overlays work?", say:

> Kustomize uses a base for shared Kubernetes manifests and overlays for environment-specific changes. The base defines common Deployments, Services, ConfigMaps, and policies, while overlays patch replicas, resources, hostnames, image tags, or scaling settings for dev, staging, and production.

## Connection To Artistry Cart

Artistry Cart applies an environment with:

```bash
kubectl apply -k k8s/overlays/dev
```

Optional monitoring:

```bash
kubectl apply -k k8s/addons/monitoring/overlays/dev
```

