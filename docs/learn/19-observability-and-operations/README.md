# Observability And Operations

This folder is the nineteenth learning block for preparing for a bigger engineering role. It explains observability and operations from first principles, then connects those ideas to the Artistry Cart runtime and Kubernetes baseline.

The goal is to understand how teams know whether a system is healthy, how they debug production behavior, how they respond to incidents, and how they explain operational maturity in interviews.

## Learning Outcome

After completing this topic, you should be able to explain:

- what observability means and why it is different from simple monitoring
- logs, metrics, traces, events, health checks, and readiness checks
- request IDs and correlation across services
- Prometheus-style metrics and `/metrics` endpoints
- liveness versus readiness in operations
- SLIs, SLOs, error budgets, alerts, and dashboards
- incident response, triage, mitigation, rollback, and postmortems
- Kubernetes operational commands and failure debugging
- how Artistry Cart exposes logs, metrics, health, readiness, and starter alerts
- what is implemented today and what is still a future maturity step

## Files In This Topic

1. [Observability And Operations Fundamentals](./01-observability-and-operations-fundamentals.md)
2. [Logs, Structured Logging, Request IDs, And Correlation](./02-logs-structured-logging-request-ids-correlation.md)
3. [Metrics, Prometheus, SLIs, SLOs, And Error Budgets](./03-metrics-prometheus-slis-slos-error-budgets.md)
4. [Health Checks, Readiness, Liveness, And Graceful Shutdown](./04-health-readiness-liveness-graceful-shutdown.md)
5. [Alerts, Dashboards, Incidents, And Postmortems](./05-alerts-dashboards-incidents-postmortems.md)
6. [Kubernetes Operations And Production Debugging](./06-kubernetes-operations-production-debugging.md)
7. [Observability In Artistry Cart](./07-observability-in-artistry-cart.md)
8. [Interview Questions And Answer Patterns](./08-interview-questions-and-answer-patterns.md)

## Core Mental Model

```text
users experience symptoms
  -> services emit signals
  -> operators inspect logs, metrics, traces, events, and health
  -> team mitigates, verifies, learns, and improves the system
```

The main observability signals:

```text
logs = what happened
metrics = how much, how often, how slow
traces = where time went across services
events = what changed in infrastructure
health/readiness = should this process run and receive traffic
```

## Connection To Artistry Cart

Artistry Cart has a real observability baseline:

- `packages/utils/runtime` provides structured logging, request IDs, `/metrics`, security headers, health handlers, readiness handlers, and graceful shutdown helpers
- backend services expose `GET /healthz`, `GET /readyz`, and `GET /metrics`
- Kubernetes manifests use liveness and readiness probes
- `k8s/addons/monitoring` provides optional `PodMonitor` and `PrometheusRule` resources
- CI workflows capture service logs on e2e failure and publish deployment summaries/artifacts

The project has instrumentation foundations. The next maturity steps are central log aggregation, tracing, dashboards, tuned alerts, and explicit SLOs.
