# Observability In Artistry Cart

## Current Observability Baseline

Artistry Cart has observability foundations in:

```text
packages/utils/runtime
k8s/addons/monitoring
docs/07-quality-and-operations/observability.md
.github/workflows
```

The strongest current layer is shared runtime instrumentation for backend services.

## Shared Runtime

`packages/utils/runtime` provides:

- structured logger
- request ID generation
- request completion logging
- security headers
- Prometheus-compatible metrics registry
- `/metrics` endpoint
- health handlers
- `/healthz`
- `/readyz`
- graceful shutdown

This prevents each service from inventing its own operational pattern.

## Backend Service Signals

The main backend services expose:

```text
GET /healthz
GET /readyz
GET /metrics
```

The shared HTTP metrics include:

- `app_info`
- `process_uptime_seconds`
- `http_inflight_requests`
- `http_requests_total`
- `http_request_errors_total`
- `http_request_duration_ms_total`

## Request Logging

The shared runtime logs HTTP request completion with:

- request ID
- method
- route
- status code
- duration
- IP
- user agent

It skips routine probe and metrics paths to reduce noise.

In production, logs are JSON.

## Kafka Worker Observability

The monitoring rules refer to Kafka worker metrics such as:

- `kafka_event_queue_size`
- `kafka_events_parse_errors_total`

These are important because background workers can fail without direct user-facing HTTP errors.

For workers, useful signals include:

- queue size
- consumer lag
- processing count
- parse errors
- retry count
- dead-letter count

## Kubernetes Monitoring Addon

`k8s/addons/monitoring` is optional.

It assumes a cluster already has Prometheus Operator or `kube-prometheus-stack`.

It provides:

- `PodMonitor` resources
- `PrometheusRule` resources
- dev, staging, and production overlays

Apply examples:

```text
kubectl apply -k k8s/addons/monitoring/overlays/dev
kubectl apply -k k8s/addons/monitoring/overlays/staging
kubectl apply -k k8s/addons/monitoring/overlays/production
```

## PodMonitor

The PodMonitor selects backend and worker pods by `app.kubernetes.io/name`.

It scrapes:

```text
path: /metrics
interval: 30s
scrapeTimeout: 10s
```

Services included:

- `api-gateway`
- `auth-service`
- `product-service`
- `order-service`
- `recommendation-service`
- `aivision-service`
- `kafka-service`

## PrometheusRule

Starter alerts include:

- HTTP 5xx burst
- missing metrics scrape
- Kafka queue growth
- Kafka parse errors

These rules are a starting point. Real systems should tune thresholds after observing real traffic.

## CI And Deployment Signals

GitHub Actions contributes operational visibility too.

Examples:

- e2e workflows print service logs on failure
- build-publish workflow uploads image scan artifacts
- deploy workflows upload rendered Kubernetes manifests
- deploy workflows write environment summaries
- smoke checks verify public endpoints after deployment

CI/CD observability is part of operations because deployment failures are production-risk signals.

## Honest Maturity Assessment

Implemented:

- shared logging baseline
- request IDs
- HTTP metrics
- health/readiness endpoints
- graceful shutdown helper
- optional Prometheus Operator resources
- starter alert rules
- CI/deployment artifacts and summaries

Still missing or future maturity:

- central log aggregation
- distributed tracing
- Grafana dashboards
- tuned production alerts
- formal SLOs and error budgets
- deeper domain metrics for checkout, webhooks, recommendations, and AI workflows

## Strong Interview Answer

If asked "What observability exists in Artistry Cart?", say:

> Artistry Cart has a shared runtime observability baseline for backend services: structured logs, request IDs, request metrics, `/metrics`, `/healthz`, `/readyz`, and graceful shutdown helpers. Kubernetes has optional PodMonitor and PrometheusRule resources for Prometheus Operator based stacks. The honest next step is adding central logs, distributed tracing, Grafana dashboards, tuned alerts, and SLOs.
