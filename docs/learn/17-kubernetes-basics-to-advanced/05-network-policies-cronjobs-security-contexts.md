# Network Policies, CronJobs, And Security Contexts

## NetworkPolicy

NetworkPolicy controls allowed network traffic between Pods.

It can restrict:

- which Pods can talk to which services
- ingress traffic
- egress traffic

This reduces blast radius if one service is compromised.

## Default Allow Versus Default Deny

Without policies, many clusters allow broad Pod-to-Pod traffic.

Stronger security:

```text
default deny
explicitly allow required traffic
```

NetworkPolicy requires a network plugin that enforces it.

## CronJob

CronJob runs scheduled jobs.

Example:

```text
run product cleanup every night
```

Kubernetes CronJob is better than running cleanup inside every app replica.

Why:

- one scheduled execution
- visible job history
- independent scaling
- clearer operations

## Worker Deployment Versus CronJob

Worker Deployment:

```text
long-running process
```

Example:

```text
kafka-service consumes events continuously
```

CronJob:

```text
scheduled task
```

Example:

```text
product cleanup runs on schedule
```

## Security Context

Security context controls container security settings.

Examples:

```yaml
runAsNonRoot: true
runAsUser: 1000
allowPrivilegeEscalation: false
capabilities:
  drop:
    - ALL
seccompProfile:
  type: RuntimeDefault
```

These harden containers.

## Principle Of Least Privilege

Containers should run with only required privileges.

Good:

- non-root user
- no privilege escalation
- dropped Linux capabilities
- restricted network access
- scoped secrets

## Interview Explanation

If asked "How do you secure workloads in Kubernetes?", say:

> I use least privilege: run containers as non-root, drop unnecessary capabilities, disable privilege escalation, use scoped Secrets, restrict network traffic with NetworkPolicies, expose only edge services publicly, and separate scheduled jobs from application replicas using CronJobs where appropriate.

## Connection To Artistry Cart

Artistry Cart includes:

- `k8s/base/network-policies.yaml`
- security contexts in Deployments
- `product-cleanup-cronjob`
- `kafka-service` as a worker deployment

The Kubernetes README notes product-service disables in-process cleanup cron in Kubernetes and uses a CronJob instead.

