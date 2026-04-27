# Observability

## Overview

The current observability posture is functional but uneven. The platform has health endpoints, console and request logging, and some structured logging in AI Vision, but it does not yet present as a fully standardized observability stack.

## Current Signals

### Health endpoints

Visible health-style endpoints include:

- `api-gateway`: `GET /gateway-health`
- `product-service`: `GET /`
- `recommendation-service`: `GET /`
- `aivision-service`: `GET /` and `GET /health`

The shape is helpful, but not standardized.

### Request logging

Visible usage includes:

- `morgan('dev')` in `api-gateway`
- `morgan('dev')` in `aivision-service`

### Structured logging

AI Vision uses a Winston logger with:

- timestamps
- stack-aware error formatting
- JSON output in production
- service metadata

This is the most mature logging implementation in the repo.

### Console logging

Many services still rely on:

- `console.log`
- `console.error`
- `console.warn`

This is workable in development, but not ideal as a long-term production standard.

## What Is Observable Today

- service startup
- gateway health
- some request traffic
- AI Vision job lifecycle events
- basic webhook and processing failures through logs
- test workflow results and coverage artifacts in CI

## What Is Not Yet Fully Observable

- standardized structured logs across all services
- distributed request tracing
- metrics dashboards
- event lag and delivery monitoring for Kafka
- alerting for webhook failures, recommendation latency, or AI job degradation
- consistent readiness/liveness semantics across services

## Strong Spots

- AI Vision already treats observability more seriously than the average service
- health endpoints exist in multiple places
- recurring AI jobs emit lifecycle events

## Weak Spots

- logging is inconsistent across services
- request ids are not standardized outside AI Vision
- gateway, payments, analytics, and recommendations would benefit from stronger latency/error metrics

## Recommended Next Steps

- standardize structured logging across backend services
- add request correlation ids end to end
- define health, readiness, and dependency-check conventions
- add metrics for:
  - auth failures
  - payment webhook failures
  - recommendation latency
  - Kafka lag
  - AI job success/failure

## Interview Framing

The honest framing is:

- the platform has the beginnings of observability
- AI Vision is ahead of the rest
- the next maturity step is consistency and measurable runtime telemetry
