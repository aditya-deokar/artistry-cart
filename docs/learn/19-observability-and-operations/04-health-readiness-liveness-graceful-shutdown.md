# Health Checks, Readiness, Liveness, And Graceful Shutdown

## Why Health Checks Exist

Platforms need to know whether a process should keep running and whether it should receive traffic.

That is why services expose health endpoints.

Common endpoints:

```text
GET /healthz
GET /readyz
```

## Liveness

Liveness answers:

```text
is this process alive enough to keep running?
```

If liveness fails repeatedly, Kubernetes can restart the container.

Liveness checks should be simple. They should not fail just because a downstream dependency is temporarily slow.

## Readiness

Readiness answers:

```text
should this instance receive traffic right now?
```

If readiness fails, Kubernetes removes the pod from service endpoints.

A process can be alive but not ready.

Examples:

- app is warming up
- database connection is unavailable
- required config is missing
- Kafka worker is not ready to consume

## Liveness Versus Readiness

Simple version:

```text
liveness = should Kubernetes restart me?
readiness = should Kubernetes send traffic to me?
```

Do not mix them casually.

Bad readiness can protect users.

Bad liveness can cause restart loops.

## Health In Artistry Cart Runtime

`packages/utils/runtime` provides:

- `createHealthHandlers()`
- `registerHealthEndpoints()`

The standard endpoints are:

```text
/healthz
/readyz
```

The liveness response includes:

- service name
- status
- check type
- timestamp
- optional metadata

The readiness response can run a custom readiness check and returns `503` when it fails.

## Kubernetes Probes

Kubernetes Deployments use probes to call these endpoints.

Typical pattern:

```text
livenessProbe -> /healthz
readinessProbe -> /readyz
```

This allows Kubernetes to restart unhealthy processes and avoid sending traffic to unready pods.

## Graceful Shutdown

Graceful shutdown means the service handles termination cleanly.

It should:

- stop accepting new work
- finish or safely stop current work
- close the HTTP server
- close database or queue connections
- log shutdown progress
- exit before the platform force-kills it

## SIGTERM

Kubernetes usually sends `SIGTERM` before killing a container.

The app should respond by shutting down gracefully.

`packages/utils/runtime` provides `registerGracefulShutdown()`.

It handles:

- `SIGTERM`
- `SIGINT`
- shutdown timeout
- optional shutdown callback
- server close callback
- success and failure logging

## Operational Mistakes

Common mistakes:

- readiness always returns success even when dependencies are broken
- liveness checks dependencies and causes restart storms
- no graceful shutdown, causing dropped requests
- health endpoints log every probe and create log noise
- health endpoint exposes sensitive data

## Strong Interview Answer

If asked "What is the difference between liveness and readiness?", say:

> Liveness tells the platform whether the process should be restarted. Readiness tells the platform whether the instance should receive traffic. A service can be alive but not ready, such as during startup or dependency failure. Readiness protects traffic routing; liveness protects against stuck processes.

## Artistry Cart Connection

Artistry Cart standardizes `/healthz` and `/readyz` across backend services and uses them in CI readiness waits and Kubernetes probes. The shared runtime also supports graceful shutdown so services can respond cleanly to termination signals.
