# Health Checks, Resources, HPA, And PDB

## Liveness Probe

Liveness answers:

```text
Is the container alive?
```

If liveness fails repeatedly, Kubernetes restarts the container.

Example:

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: http
```

## Readiness Probe

Readiness answers:

```text
Should this Pod receive traffic?
```

If readiness fails, Kubernetes removes the Pod from Service endpoints.

Example:

```yaml
readinessProbe:
  httpGet:
    path: /readyz
    port: http
```

## Liveness Versus Readiness

Liveness:

```text
restart me if broken
```

Readiness:

```text
do not send traffic yet
```

Do not use liveness for dependency checks that might temporarily fail, or Kubernetes may restart healthy apps unnecessarily.

## Resource Requests

Requests tell Kubernetes what resources a container needs.

Example:

```yaml
requests:
  cpu: 100m
  memory: 256Mi
```

Scheduler uses requests to place Pods on nodes.

## Resource Limits

Limits cap resource usage.

Example:

```yaml
limits:
  cpu: 400m
  memory: 512Mi
```

If memory exceeds limit, container may be killed.

## HPA

HPA means Horizontal Pod Autoscaler.

It scales replicas based on metrics such as CPU or memory.

Example:

```text
api-gateway replicas scale from 2 to more replicas under load
```

HPA needs resource requests and metrics server.

## PDB

PDB means PodDisruptionBudget.

It protects availability during voluntary disruptions.

Example:

```text
keep at least 1 api-gateway pod available during node drain
```

PDBs do not protect against all failures, but they help during planned operations.

## Interview Explanation

If asked "What are readiness and liveness probes?", say:

> Liveness probes tell Kubernetes whether a container should be restarted. Readiness probes tell Kubernetes whether a Pod should receive traffic. A Pod can be alive but not ready, for example while warming up or waiting for dependencies.

## Connection To Artistry Cart

Artistry Cart Deployments include:

- `/healthz` liveness probes
- `/readyz` readiness probes
- CPU/memory requests and limits
- HPAs for several services
- PDBs for public-facing/high-availability components such as user UI, seller UI, and API gateway

