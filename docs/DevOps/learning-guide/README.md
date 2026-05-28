# Artistry Cart DevOps Learning Guide

This folder is your DevOps learning path for the Artistry Cart Nx monorepo.

It is written for two goals at the same time:

- help a beginner understand what each DevOps layer does
- help you think like a production-focused DevOps engineer for this exact repo

## How To Read This Folder

Read the files in this order:

1. [01-repo-devops-analysis.md](./01-repo-devops-analysis.md)
2. [02-phase-4-cicd-implementation-plan.md](./02-phase-4-cicd-implementation-plan.md)
3. [03-devops-engineer-step-by-step-guide.md](./03-devops-engineer-step-by-step-guide.md)
4. [04-next-phases-roadmap.md](./04-next-phases-roadmap.md)
5. [05-phase-5-kubernetes-baseline.md](./05-phase-5-kubernetes-baseline.md)
6. [06-kubernetes-apply-and-debug-guide.md](./06-kubernetes-apply-and-debug-guide.md)
7. [07-phase-6-observability-security-operations.md](./07-phase-6-observability-security-operations.md)
8. [08-phase-6-monitoring-and-runbook-guide.md](./08-phase-6-monitoring-and-runbook-guide.md)
9. [09-deployment-automation-guide.md](./09-deployment-automation-guide.md)
10. [10-repo-devops-done-vs-platform-ops.md](./10-repo-devops-done-vs-platform-ops.md)

## Current Status Snapshot

| Phase | Status | Notes |
| --- | --- | --- |
| Phase 1: Runtime standardization | Implemented | env-driven service URLs, shared runtime helpers, health endpoints, host binding |
| Phase 2: Dockerfile strategy | Implemented | shared backend and frontend Dockerfiles, `.dockerignore`, Next standalone |
| Phase 3: Local Docker Compose platform | Implemented | app, infra, and full compose stacks are present |
| Phase 4: CI/CD and registry delivery | Implemented baseline | test workflow, image publish workflow, GHCR delivery, Trivy scan, SBOM/provenance, release manifest artifact, staging and production deploy workflows |
| Phase 5: Kubernetes baseline | Implemented baseline | `k8s/base` and `k8s/overlays/*` now exist, including ingress, HPAs, PDBs, and the product cleanup CronJob pattern |
| Phase 6: Observability, security, and operations | Implemented baseline | shared logs and metrics, frontend security headers, Kubernetes scrape annotations and policies, nightly security workflow, Dependabot, optional monitoring addon manifests |

## What This Repo Deploys

The deployable workloads in this monorepo are:

- `user-ui`
- `seller-ui`
- `api-gateway`
- `auth-service`
- `product-service`
- `order-service`
- `recommendation-service`
- `aivision-service`
- `kafka-service`

Supporting infrastructure used locally:

- MongoDB
- Redis
- Kafka
- Kafka UI

## Best Use Of This Guide

Use this folder when you want to answer questions like:

- what is already implemented in DevOps for this project
- what each phase means in a real Nx microservices monorepo
- what a DevOps engineer would do next in this repo
- what is production-ready versus what is only baseline-ready
