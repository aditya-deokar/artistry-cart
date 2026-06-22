# Logs, Structured Logging, Request IDs, And Correlation

## What Logs Are

Logs are records of events produced by applications and infrastructure.

Examples:

- service started
- request completed
- database query failed
- payment webhook rejected
- Kafka message parse failed
- graceful shutdown started

Logs are especially useful when you need context around a specific failure.

## Plain Logs Versus Structured Logs

Plain log:

```text
User login failed
```

Structured log:

```json
{
  "timestamp": "2026-06-11T00:00:00.000Z",
  "level": "warn",
  "service": "auth-service",
  "message": "User login failed",
  "requestId": "abc-123",
  "userId": "user_1",
  "reason": "invalid_password"
}
```

Structured logs are easier to search, filter, aggregate, and alert on.

## Log Levels

Common log levels:

- `info`: normal important behavior
- `warn`: unusual behavior that may need attention
- `error`: failed behavior that needs investigation

Do not log everything at `error`. Alert fatigue starts when every minor issue looks urgent.

## Request IDs

A request ID is a unique identifier attached to one request.

It lets you connect logs from the same request:

```text
api-gateway requestId=abc
auth-service requestId=abc
order-service requestId=abc
```

Without request IDs, debugging distributed systems becomes guesswork.

## Correlation

Correlation means connecting related signals.

Examples:

- request log and error log with the same request ID
- API 500 spike and deployment event
- Kafka queue growth and recommendation latency
- pod restart and memory limit breach

Correlation is the bridge between raw data and diagnosis.

## What Artistry Cart Runtime Provides

`packages/utils/runtime` provides `createLogger()`.

It supports:

- service name
- `info`, `warn`, and `error`
- child logger bindings
- `LOG_LEVEL`
- JSON logs in production
- readable logs outside production

Production logs are JSON so a log collector can parse fields consistently.

## HTTP Request Logging

`setupHttpObservability()` adds request logging.

It records:

- request ID
- method
- route
- status code
- duration in milliseconds
- IP
- user agent

It skips noisy health and metrics paths unless there is an error.

That is useful because health checks can otherwise flood logs.

## What Not To Log

Avoid logging:

- passwords
- access tokens
- refresh tokens
- payment card data
- full OAuth credentials
- full personal data
- secret environment variables

Strong rule:

```text
logs are operational data, not a dumping ground
```

## Good Logging Practices

Good logs are:

- structured
- searchable
- specific
- safe
- connected by request ID
- written at the right level
- useful during incidents

Bad logs are:

- vague
- too noisy
- missing context
- full of secrets
- inconsistent across services

## Strong Interview Answer

If asked "Why use structured logging and request IDs?", say:

> Structured logs make production events machine-searchable by fields like service, route, status, and request ID. Request IDs let us correlate logs for one user request across the gateway and internal services, which is essential when debugging distributed systems.

## Artistry Cart Connection

Artistry Cart's shared runtime creates request IDs, returns them through the `x-request-id` response header, attaches them to request logs, and writes JSON logs in production. That gives the platform a common logging convention across the main backend services.
