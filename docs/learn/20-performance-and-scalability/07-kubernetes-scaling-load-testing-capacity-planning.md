# Kubernetes Scaling, Load Testing, And Capacity Planning

## Kubernetes Scaling Basics

Kubernetes can run multiple replicas of a service.

Example:

```text
api-gateway Deployment -> multiple api-gateway pods
Service -> load balances traffic across ready pods
```

This supports horizontal scaling for stateless services.

## Resource Requests

Requests tell Kubernetes what a container needs for scheduling.

Example:

```text
cpu: 100m
memory: 256Mi
```

Requests help Kubernetes choose a node with enough capacity.

## Resource Limits

Limits cap what a container can use.

Limits protect the node, but poor limits can hurt performance:

- CPU limit can cause throttling
- memory limit can cause OOM kills

Set limits based on measurement, not vibes.

## HPA

HPA means HorizontalPodAutoscaler.

It changes replica count based on metrics such as CPU utilization.

Artistry Cart has HPA manifests for:

- `user-ui`
- `seller-ui`
- `api-gateway`
- `auth-service`
- `order-service`
- `recommendation-service`
- `aivision-service`

Production patches raise some max replicas, such as `api-gateway` up to 8.

## HPA Limits

HPA is useful, but it is not magic.

It may not fix:

- slow database
- bad query
- external provider latency
- hot Kafka partition
- memory leak
- insufficient cluster nodes
- CPU metric not matching real bottleneck

For workers, lag-aware autoscaling with tools like KEDA may be better than CPU-only scaling.

## Load Balancing

Kubernetes Services load balance across ready pods.

Only ready pods should receive traffic.

That is why readiness probes matter for performance and availability.

## Load Testing

Load testing sends simulated traffic to understand behavior under expected or high load.

Types:

- smoke test: tiny check after deploy
- load test: expected traffic
- stress test: beyond expected traffic
- soak test: sustained traffic over time
- spike test: sudden burst

## What To Measure During Load Tests

Measure:

- request rate
- p50, p95, p99 latency
- error rate
- CPU and memory
- database query latency
- cache hit rate
- queue lag
- pod restarts
- HPA scaling behavior
- external dependency errors

## Capacity Planning

Capacity planning estimates resources needed for expected traffic.

Questions:

- how many requests per second should we handle?
- what is acceptable p95 latency?
- what are peak traffic periods?
- what is the slowest dependency?
- how many pods are needed?
- can the database handle the write/read load?
- what happens if one pod or node fails?

## Performance Budgets

A performance budget is a target limit.

Examples:

- product listing p95 under 300 ms
- checkout API p95 under 800 ms
- AI route returns accepted job under 500 ms
- frontend LCP under 2.5 seconds
- bundle size under a defined threshold

Budgets make performance visible before it becomes pain.

## Strong Interview Answer

If asked "How do you scale services in Kubernetes?", say:

> I make services stateless, define resource requests and limits, run multiple replicas, use readiness probes, and add HPA based on the right metric. Then I load test and watch latency, errors, CPU, memory, database pressure, and queue lag. Autoscaling helps only if the constrained layer can actually scale.

## Artistry Cart Connection

Artistry Cart uses Kubernetes Deployments, Services, readiness probes, resource settings, and HPA for several frontends and backend services. For future scale, worker lag-aware scaling and database capacity planning would matter as much as HTTP pod autoscaling.
