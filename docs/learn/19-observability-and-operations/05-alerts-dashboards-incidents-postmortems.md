# Alerts, Dashboards, Incidents, And Postmortems

## What Alerts Are

Alerts notify humans when action may be needed.

Good alerts are tied to user impact or real operational risk.

Bad alerts are noisy, vague, or unactionable.

Strong rule:

```text
an alert should have an owner, a reason, and a response path
```

## Symptoms Worth Alerting On

Good alert candidates:

- elevated HTTP 5xx rate
- public endpoint unavailable
- payment webhook failures
- checkout failure spike
- Kafka queue growing
- repeated pod restarts
- metrics scrape missing
- database unavailable
- error budget burn

Avoid alerting on every small internal detail unless it predicts user impact.

## Dashboards

Dashboards visualize system state.

Useful dashboard panels:

- request rate by service
- 4xx and 5xx rate
- p95 and p99 latency
- inflight requests
- pod restarts
- CPU and memory
- Kafka queue size or lag
- deployment version
- external provider errors

Dashboards are for investigation and situational awareness.

Alerts are for interruption.

## Incidents

An incident is a production issue that requires coordinated response.

Incident steps:

1. Detect the issue.
2. Triage user impact.
3. Assign an owner.
4. Mitigate quickly.
5. Communicate status.
6. Verify recovery.
7. Record the timeline.
8. Write a postmortem.

The first goal is mitigation, not perfect root cause.

## Triage

Triage answers:

- what is broken?
- who is affected?
- when did it start?
- what changed recently?
- is it getting worse?
- can we roll back?
- what is the fastest safe mitigation?

## Mitigation

Mitigation reduces user impact.

Examples:

- rollback deployment
- scale replicas
- disable a feature flag
- restart a stuck worker
- route traffic away from bad instance
- pause a queue consumer
- apply a hotfix

## Root Cause

Root cause analysis happens after immediate mitigation.

Good root cause analysis avoids blame and focuses on system improvement.

Ask:

- why did the issue happen?
- why was it not caught earlier?
- why did detection take that long?
- what signal was missing?
- what guardrail should exist next time?

## Postmortem

A postmortem is a written review after an incident.

It should include:

- summary
- impact
- timeline
- detection
- root cause
- contributing factors
- what went well
- what went poorly
- action items

The best postmortems create specific follow-up work.

## Artistry Cart Starter Alerts

`k8s/addons/monitoring/base/prometheus-rules.yaml` defines starter alerts for:

- sustained HTTP 5xx activity
- missing metrics scrape targets
- Kafka queue growth
- Kafka parse errors

These are starter thresholds and should be tuned with real production traffic.

## Strong Interview Answer

If asked "What makes a good alert?", say:

> A good alert points to user impact or urgent operational risk, has a clear owner, includes enough context to start debugging, and has a known response path. I avoid alerting on every internal metric because noisy alerts train teams to ignore the system.

## Artistry Cart Connection

Artistry Cart has optional PrometheusRule resources for HTTP and Kafka risks, but the next maturity step is to pair those alerts with dashboards, runbooks, environment-specific thresholds, and formal incident response practices.
