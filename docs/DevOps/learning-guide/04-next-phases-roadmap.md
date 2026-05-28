# Next Phases Roadmap

## What Comes After The Current Repo Baseline

The repo now has:

- CI validation
- image publishing
- staging and production deployment workflows
- Kubernetes overlays
- observability runtime instrumentation
- optional monitoring addon manifests

The next work is less about writing basic repo code and more about installing, integrating, and governing the platform around that code.

## What Is Already Done In Repo Code

The repo already includes:

- digest-based image publishing through `release-image-manifest`
- `deploy-staging.yml`
- `deploy-production.yml`
- optional `PodMonitor` and `PrometheusRule` monitoring addons

That means the remaining work is mostly environment installation, policy, and operational maturity.

## Phase 7: Central Monitoring And Alerting

Phase 6 added instrumentation, and the repo now includes optional monitoring manifests. Phase 7 should add the actual installed monitoring stack.

The first central stack should include:

- Prometheus
- Grafana
- centralized logs with Loki or ELK
- alert rules for readiness failures, restart loops, and API error spikes

Strong advanced direction:

- OpenTelemetry for traces
- SLO dashboards
- Kafka lag alerting

## Phase 8: Secrets, Signing, And Policy Enforcement

After deployment promotion is stable, harden the platform further with:

- external secret manager integration
- image signing
- dependency review
- admission policies
- secret rotation runbooks

Good advanced options:

- External Secrets Operator
- Cosign
- Kyverno or OPA Gatekeeper
- SOPS or Sealed Secrets

## Scaling Roadmap

The scaling order I would recommend is:

1. `api-gateway`
2. `auth-service`
3. `product-service` after cron extraction
4. `order-service`
5. `recommendation-service`
6. `aivision-service` with API and worker separation
7. `kafka-service` using lag-aware autoscaling such as KEDA

## Reliability Roadmap

You should also add runbooks for:

- failed deployment rollback
- expired secrets
- MongoDB outage
- Redis outage
- Kafka consumer lag
- Stripe webhook verification failures

## Suggested 30 / 60 / 90 Day Focus

### First 30 days

- install a central metrics stack
- wire the monitoring addon into your Prometheus Operator setup
- configure environment-scoped smoke-test URLs and kubeconfig secrets

### Next 60 days

- add smoke tests and rollback runbook
- add alerting for gateway, readiness, and Kafka health
- expand AI Vision and Kafka CI coverage

### Next 90 days

- add tracing and centralized logs
- add external secret manager and image signing
- tune autoscaling and resource budgets
