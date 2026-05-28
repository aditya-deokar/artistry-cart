# Artistry Cart Monitoring Addon

This folder contains optional monitoring resources for the Artistry Cart workloads.

It is meant for clusters that already have the Prometheus Operator or `kube-prometheus-stack` installed.

## What It Adds

- `PodMonitor` resources for the backend services that expose `/metrics`
- `PrometheusRule` alerts for HTTP 5xx activity, scrape loss, Kafka parse errors, and Kafka queue growth

## Structure

- `base/` contains the shared monitoring resources
- `overlays/dev`, `staging`, and `production` apply the correct namespace for each environment

## Apply Order

1. install a Prometheus Operator compatible stack in your cluster
2. ensure the operator is configured to watch `PodMonitor` and `PrometheusRule` objects in the target namespace
3. apply the matching overlay

Examples:

```bash
kubectl apply -k k8s/addons/monitoring/overlays/dev
kubectl apply -k k8s/addons/monitoring/overlays/staging
kubectl apply -k k8s/addons/monitoring/overlays/production
```

## Important Notes

- these manifests do not install Prometheus or Grafana by themselves
- the alert thresholds are starter values and should be tuned with real traffic
- the alerts assume the shared runtime metrics introduced in Phase 6 are present
