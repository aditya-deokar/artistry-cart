# Known Gaps And Risks

## Purpose

This document collects the most important current gaps and architectural risks visible from the repository audit. It is intentionally candid. Good production documentation should help decision-making, not hide reality.

## 1. Shared Database Coupling

Multiple services share one MongoDB schema and one Prisma client package.

Why it matters:

- schema changes can ripple broadly
- ownership boundaries are weaker than the service map suggests
- scaling or isolating data by service is harder later

## 2. Uneven Test Coverage Across Surfaces

The root Vitest workspace covers core backend services and shared packages, but not:

- `aivision-service`
- `kafka-service`
- frontend apps

Why it matters:

- the most experimental and integration-heavy service is not part of the main unit/integration test workspace
- event-processing logic is underrepresented in the core automated loop

## 3. CI Coverage Does Not Match Repo Surface

Visible e2e projects exist for AI Vision and Kafka, but the current CI e2e job only runs:

- auth
- product
- order
- api-gateway
- recommendation

Why it matters:

- some important runtime paths exist in the repo without corresponding CI execution

## 4. Deployment Promotion Exists, But Environment Wiring Still Matters

The repo now includes:

- `deploy-staging.yml`
- `deploy-production.yml`
- digest-driven overlay rendering from the `release-image-manifest`

Why it still matters:

- GitHub Environment secrets, kubeconfig setup, and ingress URLs still need to be configured correctly outside the codebase
- rollback convenience automation is still thinner than the main forward-deploy path

## 5. Secrets Management Is Still Basic

Current patterns are acceptable as a baseline, but the repo still lacks:

- external secret manager integration
- rotation workflow documentation
- narrower secret ownership by workload

Why it matters:

- the current setup is fine for a baseline, but mature operations need stronger secret lifecycle control

## 6. Configuration Naming Inconsistencies

Examples include:

- `STRIPE_SECRETE_KEY`

Why it matters:

- env mistakes become easier
- onboarding and operations become less reliable

## 7. Observability Is Better, But Not Fully Installed

Phase 6 added shared logs, request IDs, `/metrics`, Prometheus annotations, and worker health for Kafka.

The repo now also includes optional monitoring addon manifests for `PodMonitor` and `PrometheusRule`.

Why it matters:

- the repo has instrumentation and monitoring scaffolding, but not yet an installed central monitoring stack
- dashboards, alerts, and trace aggregation still need cluster-side operator and platform setup

## 8. Worker And API Responsibilities Are Still Partly Coupled

Examples:

- `aivision-service` still mixes API and Agenda worker behavior
- `product-service` now supports a CronJob pattern, but the in-process cron can still run when enabled

Why it matters:

- scaling and incident isolation are still weaker than a fully separated worker model

## 9. Validation Strategy Is Not Uniform

AI Vision uses explicit Zod validation middleware. Equivalent shared validation is not consistently visible across the rest of the backend.

Why it matters:

- request integrity depends more on controller logic in some services than in others

## 10. Feature TODOs In User-Facing Paths

Visible TODOs exist in:

- support actions in `user-ui`
- AI generator UI integration paths
- comment save behavior
- shop analytics expansion in Kafka consumer

Why it matters:

- some features may present as partially complete
- documentation should distinguish implemented flows from planned flows

## 11. Backup And Restore Runbooks Are Not Yet Defined

The repo does not yet include a concrete backup and restore runbook for:

- MongoDB
- Redis
- Kafka-related recovery expectations

Why it matters:

- production readiness depends on recovery planning, not only deployment manifests

## 12. Health And Ops Conventions Still Have Compatibility Drift

Visible health endpoints differ by service:

- `gateway-health`
- root `/`
- `/health`

Why it matters:

- the standardized `/healthz` and `/readyz` pattern now exists, but legacy aliases still need to be managed carefully in dashboards and probes

## Risk Posture Summary

The project's strongest risks are not "the code is chaotic." They are:

- uneven maturity across subsystems
- shared persistence coupling
- environment-side deployment dependencies
- incomplete operations hardening after the new baseline

That is the kind of risk profile common to ambitious product-rich platforms that are evolving quickly.
