# Kafka Utils

## Overview

`packages/utils/kafka` centralizes KafkaJS configuration for producers and consumers in the monorepo.

## What It Does

- builds broker list from `KAFKA_BROKERS`
- configures client id from `KAFKA_CLIENT_ID`
- optionally enables SSL
- optionally configures SASL auth
- supports:
  - `plain`
  - `scram-sha-256`
  - `scram-sha-512`
- exports a shared `Kafka` instance

## Why It Exists

Without this package:

- each producer and consumer would duplicate connection logic
- auth and security configuration could drift
- tests would be harder to normalize

## Where It Is Used

Visible usage includes:

- `user-ui` server action producer in `track-user.ts`
- `kafka-service` consumer

## Strengths

- centralizes all Kafka bootstrap logic
- keeps event infrastructure configuration out of domain code
- easy to mock in shared test utilities

## Tradeoffs

- topic naming and event governance still live outside this package
- a shared Kafka instance simplifies reuse, but it also means transport concerns are centralized rather than isolated per bounded context

## Interview Notes

This is a classic infrastructure helper package: low conceptual complexity, high leverage.
