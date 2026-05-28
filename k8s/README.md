# Artistry Cart Kubernetes Baseline

This folder contains the Phase 5 Kubernetes baseline for the Artistry Cart Nx monorepo.

## Structure

- `base/` holds the shared application manifests.
- `overlays/dev`, `overlays/staging`, and `overlays/production` apply environment-specific namespace, ingress, scaling, and HPA patches.
- `addons/monitoring` holds optional `PodMonitor` and `PrometheusRule` resources for Prometheus Operator based stacks.

## Main Ideas

- only `user-ui`, `seller-ui`, and `api-gateway` are exposed publicly
- internal services stay behind `ClusterIP` services
- `kafka-service` runs as a worker deployment
- `product-service` disables its in-process cleanup cron in Kubernetes and uses a `CronJob` instead
- configuration is split into `ConfigMap` and `Secret`

## Apply Order

1. create a real `artistry-cart-secrets` secret from `base/secrets.example.yaml`
2. choose an overlay such as `overlays/dev`
3. apply the overlay with Kustomize

Example:

```bash
kubectl apply -k k8s/overlays/dev
```

Optional monitoring addon:

```bash
kubectl apply -k k8s/addons/monitoring/overlays/dev
```
