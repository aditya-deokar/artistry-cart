# Interview Questions And Answer Patterns

This file gives interview-ready answers for observability and operations.

## Question: What Is Observability?

Strong answer:

> Observability is the ability to understand a running system from the signals it emits. Logs show what happened, metrics show trends and rates, traces show request flow across services, and health/readiness checks tell platforms whether instances should run and receive traffic.

## Question: Monitoring Versus Observability?

Strong answer:

> Monitoring usually watches known signals and tells us when known failure modes happen. Observability helps us investigate unknown problems by giving enough context through logs, metrics, traces, events, and health signals.

## Question: Logs Versus Metrics Versus Traces?

Strong answer:

> Logs are event records with context. Metrics are numeric time-series for trends and alerts. Traces follow one request across service boundaries and show where time was spent. In distributed systems, all three are useful because no single signal explains everything.

## Question: Why Are Request IDs Important?

Strong answer:

> Request IDs let us correlate logs for one request across the gateway and internal services. Without correlation IDs, debugging microservice flows becomes much slower because related logs are scattered across processes.

## Question: What Are SLIs And SLOs?

Strong answer:

> An SLI is a measurement of service reliability, such as successful request percentage or p95 latency. An SLO is the target for that measurement, such as 99.9 percent successful requests over 30 days. SLOs help teams balance feature velocity and reliability work.

## Question: What Is An Error Budget?

Strong answer:

> An error budget is the amount of failure allowed by an SLO. If the service is within budget, the team can usually keep shipping. If the budget is burning too fast, reliability work should take priority.

## Question: Liveness Versus Readiness?

Strong answer:

> Liveness tells Kubernetes whether a container should be restarted. Readiness tells Kubernetes whether a pod should receive traffic. A service can be alive but not ready, for example during startup or when a required dependency is unavailable.

## Question: What Makes A Good Alert?

Strong answer:

> A good alert maps to user impact or urgent operational risk, has a clear owner, includes enough context to begin debugging, and has a known response path. Noisy alerts are dangerous because they teach teams to ignore the system.

## Question: How Do You Debug A Production Incident?

Strong answer:

> I first determine impact, scope, start time, and recent changes. Then I inspect dashboards, logs, metrics, traces if available, deployment history, Kubernetes events, pod status, readiness, and dependencies. If users are affected, I prioritize mitigation or rollback before deep root cause analysis.

## Question: How Do You Debug A Kubernetes Service Returning 503?

Strong answer:

> I check whether the service has ready endpoints, whether pods are ready, whether readiness probes are failing, whether the service selector matches pod labels, whether the ingress points to the right service and port, and whether recent deployment or config changes caused the issue.

## Question: What Observability Exists In Artistry Cart?

Strong answer:

> Artistry Cart has shared runtime observability across backend services: structured logs, request IDs, HTTP request metrics, `/metrics`, `/healthz`, `/readyz`, and graceful shutdown helpers. Kubernetes has optional PodMonitor and PrometheusRule resources for scraping metrics and starter alerts. CI/CD also captures service logs, scan artifacts, rendered manifests, rollout status, and smoke check summaries.

## Question: What Would You Improve Next?

Strong answer:

> I would add central log aggregation, distributed tracing with OpenTelemetry, Grafana dashboards, tuned alert thresholds, formal SLOs, and domain-level metrics for checkout, Stripe webhooks, recommendation latency, Kafka lag, and AI workflow success rates.

## Best Short Project Pitch For This Topic

> Artistry Cart has moved beyond ad hoc logging by adding a shared runtime observability layer. Services expose structured logs, request IDs, health/readiness checks, and Prometheus-compatible metrics, while Kubernetes has optional monitoring resources and CI/CD publishes useful operational artifacts. The next maturity step is central aggregation, tracing, dashboards, tuned alerts, and SLO-driven operations.
