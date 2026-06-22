# Metrics, Prometheus, SLIs, SLOs, And Error Budgets

## What Metrics Are

Metrics are numeric measurements collected over time.

Examples:

- request count
- error count
- request duration
- inflight requests
- process uptime
- Kafka queue size
- parse error count

Metrics are strong for trends, dashboards, and alerts.

## Counter

A counter only goes up.

Examples:

```text
http_requests_total
http_request_errors_total
kafka_events_parse_errors_total
```

Use counters for totals since process start.

## Gauge

A gauge can go up or down.

Examples:

```text
http_inflight_requests
process_uptime_seconds
kafka_event_queue_size
```

Use gauges for current state.

## Prometheus

Prometheus is a metrics collection and alerting system.

It commonly works by scraping HTTP endpoints.

Application exposes:

```text
GET /metrics
```

Prometheus scrapes:

```text
service metrics every N seconds
```

Then engineers query those metrics using PromQL.

## Prometheus Text Format

Prometheus metrics are usually exposed as text:

```text
# HELP http_requests_total Total HTTP requests handled
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/products",status="200"} 123
```

The important pieces are:

- metric name
- help text
- type
- labels
- value

## Labels

Labels add dimensions to metrics.

Examples:

- method
- route
- status
- service
- namespace
- pod

Be careful with high-cardinality labels.

Bad labels:

- user ID
- email
- full URL with unique IDs
- raw search query

High cardinality can hurt Prometheus performance.

## SLIs

SLI means service level indicator.

It is a measurement of user-facing reliability.

Examples:

- percentage of successful API requests
- 95th percentile checkout latency
- percentage of successful payment webhooks
- Kafka event processing delay

## SLOs

SLO means service level objective.

It is a target for an SLI.

Examples:

```text
99.9 percent of gateway requests should succeed over 30 days
95 percent of product search requests should finish under 500 ms
99 percent of payment webhooks should be processed within 1 minute
```

SLOs turn vague reliability into an explicit promise.

## Error Budgets

An error budget is the amount of unreliability allowed by an SLO.

If the SLO is 99.9 percent success, the error budget is 0.1 percent failure.

Why it matters:

- if error budget is healthy, teams can ship faster
- if error budget is burned, teams should prioritize reliability

## Metrics In Artistry Cart Runtime

`packages/utils/runtime` exposes:

- `app_info`
- `process_uptime_seconds`
- `http_inflight_requests`
- `http_requests_total`
- `http_request_errors_total`
- `http_request_duration_ms_total`

The Kafka worker also has worker-focused metrics such as queue size and parse errors.

## Strong Interview Answer

If asked "How do metrics support operations?", say:

> Metrics give numeric signals over time, which makes them useful for dashboards and alerts. I track golden signals like latency, traffic, errors, and saturation, then define SLIs and SLOs around user-facing reliability. Prometheus-style metrics let services expose counters and gauges that operators can query and alert on.

## Artistry Cart Connection

Artistry Cart exposes Prometheus-compatible `/metrics` endpoints from the shared runtime and includes optional Kubernetes `PodMonitor` resources that scrape backend and worker pods every 30 seconds.
