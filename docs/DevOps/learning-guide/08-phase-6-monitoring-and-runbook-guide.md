# Phase 6 Monitoring And Runbook Guide

## Purpose

This file is written like a beginner-friendly operations guide.

It explains what a DevOps engineer would actually do after the Phase 6 baseline is in place.

## Daily Operational Checks

When you support this platform, the daily checks usually become:

1. check whether the latest CI workflows passed
2. check whether any pods are restarting repeatedly
3. check whether readiness probes are failing
4. check gateway and core API error rates
5. check Kafka worker health and queue behavior
6. review Dependabot and nightly security results

## Step-By-Step: How To Look At A Problem

### Step 1: Start with the entry point

For this repo, the public entry points are:

- `user-ui`
- `seller-ui`
- `api-gateway`

If the app feels broken to users, first ask:

- is ingress routing healthy
- are frontends up
- is `api-gateway` ready

### Step 2: Check health endpoints

Use:

- `/healthz`
- `/readyz`

If liveness fails:

- the container may be crashing or stuck badly

If readiness fails:

- the process is alive but should not receive traffic

That usually points to dependency or startup problems.

### Step 3: Check request logs

Look for:

- `x-request-id`
- response status code
- route
- duration

If many requests are slow or failing, the request logs help you narrow the issue quickly.

### Step 4: Check metrics

Important first metrics in this repo:

- total HTTP requests
- HTTP error count
- cumulative request duration
- inflight requests
- Kafka processed events
- Kafka parse errors
- Kafka queue size

Ask simple questions first:

- are errors rising
- is traffic normal
- is queue size growing instead of shrinking

### Step 5: Check the dependency boundary

A service may be healthy as a process but unhealthy as a business function.

Examples:

- `auth-service` may be up but unable to use the database
- `order-service` may be up but Stripe secrets may be wrong
- `kafka-service` may be running but not consuming from the expected topic

This is why readiness checks, logs, metrics, and config review all matter together.

## Example Incident Playbooks

### Incident: `api-gateway` returns many 5xx responses

Check:

- whether `api-gateway` pods are ready
- which upstream route is failing most
- whether one internal service has failing readiness
- whether request duration increased before failures

Likely next actions:

- inspect the failing upstream service logs
- compare a healthy request ID with a failing one
- roll back only if the failure lines up with a recent deployment

### Incident: `kafka-service` is ready false

Check:

- Kafka broker URL
- topic name
- consumer group configuration
- broker reachability

In this repo, also remember:

- the default topic should match `user-events`

### Incident: a pod keeps restarting

Check:

- liveness probe path
- startup timing
- missing required environment variables
- memory pressure or OOM kills

Then ask:

- is the app failing before it becomes ready
- or is it becoming ready and then crashing later

### Incident: security workflow finds issues

Check:

- whether the issue is in a direct dependency or transitive dependency
- whether Dependabot already proposed an upgrade
- whether the issue affects runtime code or only dev tooling

Then decide:

- patch immediately
- defer with a documented risk
- mitigate by configuration while waiting

## Weekly And Monthly DevOps Work

### Weekly

- review Dependabot PRs
- review nightly Trivy and audit results
- scan for repeated pod restarts
- check whether resource limits still look realistic

### Monthly

- review security headers and ingress policy
- review whether more metrics are needed
- review which controllers still use inconsistent logging
- update runbooks after real incidents

## Advanced Improvements You Would Add Next

- Prometheus and Grafana dashboards
- Loki or ELK log aggregation
- OpenTelemetry traces
- alert rules for 5xx rate, restart loops, and Kafka lag
- external secret manager integration
- image signing and admission policies
- KEDA for Kafka-aware autoscaling

## The Mindset To Keep

A beginner often asks:

- "How do I deploy this?"

A DevOps engineer also asks:

- "How do I know it is healthy?"
- "How do I know it is safe?"
- "How do I know it is getting worse before users notice?"

That mindset shift is the real value of Phase 6.
