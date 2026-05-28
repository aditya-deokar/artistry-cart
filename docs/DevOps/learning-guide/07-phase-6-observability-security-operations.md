# Phase 6: Observability, Security, And Operations

## Why Phase 6 Exists

Phases 1 to 5 get software running in containers and Kubernetes.

Phase 6 is about making that platform supportable.

That means:

- you can see what the services are doing
- you can measure health and failures
- you can apply baseline security controls
- you can operate the system without guessing

This is the phase where a project starts to feel more like an actual platform.

## What Was Implemented In This Repo

### 1. Shared runtime observability

`packages/utils/runtime/index.ts` now gives the backend a common platform layer for:

- structured logs
- request IDs through `x-request-id`
- request-completion logs
- Prometheus-compatible `/metrics`
- baseline Express security headers

This matters because DevOps work gets easier when every service speaks the same operational language.

### 2. Backend service coverage

The shared runtime pattern is now used by:

- `api-gateway`
- `auth-service`
- `product-service`
- `order-service`
- `recommendation-service`
- `aivision-service`
- `kafka-service`

That gives the repo one common health and telemetry story instead of many one-off patterns.

### 3. Kafka worker operability

`kafka-service` is no longer only a background consumer with no HTTP surface.

It now exposes:

- `/healthz`
- `/readyz`
- `/metrics`

Its readiness depends on Kafka consumer readiness, and it emits worker-focused metrics such as queue size and processed event counts.

This is a very important DevOps improvement because workers also need probes and metrics.

### 4. Frontend hardening

Both Next.js apps now return baseline security headers through `next.config.js`.

That gives you a cleaner default browser-security posture for:

- `user-ui`
- `seller-ui`

### 5. Kubernetes hardening

The Kubernetes baseline now includes:

- Prometheus scrape annotations
- `NetworkPolicy` resources
- non-root container execution
- dropped Linux capabilities
- disabled privilege escalation
- runtime-default seccomp

This is the kind of work that moves a repo from "it runs in Kubernetes" to "it runs there more safely."

### 6. Supply-chain and dependency hygiene

Phase 6 also adds:

- `.github/workflows/nightly-security.yml`
- `.github/dependabot.yml`

That means the repo now has recurring security scanning and automated dependency update proposals.

## Beginner-Friendly Explanation Of The Main Concepts

### Structured logs

A structured log is a log entry written as fields instead of only plain text.

Example idea:

- service name
- request ID
- status code
- duration
- error details

Why it helps:

- log search becomes easier
- dashboards and alerts become possible
- one request can be followed across services if the request ID is preserved

### Metrics

Metrics are numbers the system exposes continuously.

Examples:

- how many requests happened
- how many errors happened
- how many Kafka events were processed
- how many requests are currently in flight

Why they matter:

- logs explain specific events
- metrics show patterns over time

### Health and readiness

These are not the same thing.

`/healthz` means:

- is the process alive enough that Kubernetes should keep the container running

`/readyz` means:

- is the app ready to receive traffic right now

This distinction is very important in real production systems.

### Network policy

A Kubernetes `NetworkPolicy` is like a traffic rule for pods.

It helps answer:

- which pods may talk to which other pods
- which traffic should be blocked by default

This is one of the most useful platform-security controls in Kubernetes.

## What Is Still Not Finished

Phase 6 is implemented as a baseline, not as a final enterprise stack.

Still missing:

- centralized Prometheus and Grafana deployment
- centralized log stack such as Loki or ELK
- tracing with OpenTelemetry
- alert rules for error spikes and Kafka lag
- external secret manager
- image signing
- backup and restore runbooks

This is normal. Good DevOps work usually grows in layers.

## What A DevOps Engineer Learns From This Phase

The big lesson is:

shipping containers is not enough.

A DevOps engineer also asks:

- how will we know this service is unhealthy
- how will we debug latency
- how will we protect the cluster
- how will we keep dependencies current
- how will we detect failure before customers report it

That mindset is exactly what Phase 6 is training.
