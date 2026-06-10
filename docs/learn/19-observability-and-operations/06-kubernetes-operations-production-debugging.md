# Kubernetes Operations And Production Debugging

## Kubernetes Operations Mindset

Kubernetes operations means understanding both application behavior and cluster behavior.

A failed request may be caused by:

- app bug
- bad environment variable
- image pull problem
- failed readiness probe
- pod crash
- service selector mismatch
- ingress issue
- network policy
- resource limit
- dependency outage

The operator needs a layered debugging path.

## First Commands

Start broad:

```text
kubectl get pods -n <namespace>
kubectl get deploy -n <namespace>
kubectl get svc -n <namespace>
kubectl get ingress -n <namespace>
kubectl get events -n <namespace> --sort-by=.lastTimestamp
```

These commands answer:

- what is running?
- what is not ready?
- what changed recently?
- are services and ingress present?
- are there obvious Kubernetes events?

## Inspect A Pod

Use:

```text
kubectl describe pod <pod-name> -n <namespace>
```

Look for:

- image pull errors
- restart count
- probe failures
- environment variables
- mounted secrets/config
- scheduling issues
- resource pressure
- events

## Read Logs

Use:

```text
kubectl logs <pod-name> -n <namespace>
kubectl logs deployment/<deployment-name> -n <namespace>
kubectl logs <pod-name> -c <container-name> -n <namespace>
```

For previous crashed container logs:

```text
kubectl logs <pod-name> --previous -n <namespace>
```

## Check Rollout

Use:

```text
kubectl rollout status deployment/<name> -n <namespace>
kubectl rollout history deployment/<name> -n <namespace>
```

If a rollout is bad, options include:

```text
kubectl rollout undo deployment/<name> -n <namespace>
```

In a release-manifest-based pipeline, redeploying a previous known-good manifest can be even clearer.

## Check Health And Metrics

For internal checks, port-forward:

```text
kubectl port-forward deployment/api-gateway 8080:8080 -n <namespace>
```

Then inspect:

```text
curl http://localhost:8080/healthz
curl http://localhost:8080/readyz
curl http://localhost:8080/metrics
```

## Common Kubernetes Failure Patterns

`ImagePullBackOff`:

```text
wrong image name, missing registry auth, unavailable image, bad tag/digest
```

`CrashLoopBackOff`:

```text
process starts then crashes repeatedly
```

`Running but not Ready`:

```text
readiness probe fails, dependency unavailable, bad config
```

`Pending`:

```text
not enough resources, scheduling constraints, missing PVC
```

`502/503 through Ingress`:

```text
service has no ready endpoints, wrong service port, ingress config issue
```

## Debugging Order

A useful order:

1. Check rollout status.
2. Check pods and readiness.
3. Check events.
4. Check logs.
5. Check service endpoints.
6. Check config and secrets.
7. Check metrics.
8. Check recent deployment image digest.
9. Check dependencies.
10. Roll back or mitigate if user impact is high.

## Operations In CI/CD

Artistry Cart deploy workflows already do operational checks:

- render Kubernetes manifests
- apply Kustomize overlay
- wait for Deployment rollout
- run smoke checks
- upload rendered manifest
- publish deployment summary

This creates a useful trail for debugging failed deployments.

## Strong Interview Answer

If asked "How do you debug a Kubernetes production issue?", say:

> I start by identifying the affected namespace, deployment, and symptom. Then I check pods, events, rollout status, logs, readiness probes, service endpoints, ingress, config/secrets, metrics, and recent image digests. If users are affected, I prioritize mitigation or rollback before deep root cause analysis.

## Artistry Cart Connection

Artistry Cart uses Kustomize overlays for dev, staging, and production, rollout waits in deployment workflows, `/healthz` and `/readyz` probes, `/metrics` endpoints, and rendered manifest artifacts. Those make Kubernetes operations more diagnosable.
