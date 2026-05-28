# Observability

## Overview

Phase 6 gives the repo a real observability baseline.

The platform is no longer just a mix of health checks and ad hoc console logs. The shared runtime now provides structured request logging, request IDs, Prometheus-style metrics endpoints, and reusable health/readiness conventions across the main backend services.

## What Is Implemented Now

### Shared HTTP observability baseline

`packages/utils/runtime` now provides:

- a shared structured logger
- `x-request-id` generation and propagation
- automatic request-completion logging
- Prometheus-compatible `/metrics` endpoints
- baseline Express security headers

This is now used by the main runtime entrypoints for:

- `api-gateway`
- `auth-service`
- `product-service`
- `order-service`
- `recommendation-service`
- `aivision-service`
- `kafka-service`

### Health and readiness

Standardized endpoints remain:

- `GET /healthz`
- `GET /readyz`

Legacy aliases still exist in a few services for compatibility, such as:

- `GET /gateway-health`
- `GET /health`
- `GET /ready`

### Metrics coverage

Every service using `setupHttpObservability()` now exposes baseline HTTP metrics such as:

- total request count
- error request count
- cumulative request duration
- inflight requests
- process uptime

`kafka-service` also exposes worker-focused metrics such as:

- processed event count
- parse error count
- in-memory queue size

### Kubernetes integration

The Kubernetes baseline now includes Prometheus scrape annotations for the main API and worker Deployments.

That means the repo is ready for a Prometheus operator or scrape configuration to consume the app-level metrics once a monitoring stack is installed.

## What Is Observable Today

- startup and shutdown events for the main services
- per-request logs with request IDs on the main HTTP services
- readiness and liveness status
- gateway and internal API HTTP metrics
- Kafka worker readiness state
- Kafka event processing counts and parse failures
- CI release and security workflow results in GitHub Actions

## What Is Still Missing

The repo now has instrumentation, but not yet a full central observability platform.

Missing or partial areas:

- no in-repo Prometheus, Grafana, Loki, or ELK deployment
- no OpenTelemetry tracing pipeline yet
- no alert rules in the repo for 5xx spikes, restart loops, or Kafka lag
- no SLO or error-budget definitions yet
- feature-level logging inside controllers and services is still uneven in some apps

## Strong Spots

- the platform now has one shared observability pattern instead of service-by-service drift
- Kafka is no longer a blind background worker because it now exposes health, readiness, and metrics
- Kubernetes manifests are already prepared for metrics scraping

## Remaining Weak Spots

- observability is strongest at the runtime boundary, not yet equally mature inside every controller and domain workflow
- distributed tracing between gateway and internal services is not implemented
- dashboarding and alerting still need a central stack

## Recommended Next Steps

- add Prometheus and Grafana in the cluster or through your managed platform
- centralize logs with Loki or ELK
- introduce OpenTelemetry traces starting at `api-gateway`
- define alerts for:
  - readiness failures
  - high 5xx rate in `api-gateway`
  - Kafka consumer lag or stalled queue processing
  - repeated pod restarts
- add domain metrics for Stripe webhooks, recommendation latency, and AI job success/failure

## Interview Framing

The honest summary now is:

- the repo has a real observability baseline
- instrumentation is standardized at the platform layer
- the next maturity step is central aggregation, tracing, dashboards, and alerting
