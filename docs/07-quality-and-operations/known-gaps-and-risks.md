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

## 4. Kafka Topic Contract Mismatch

Observed mismatch:

- producer sends to `user-events`
- consumer default/config expects `users-events`

Why it matters:

- analytics and recommendation freshness can silently break if topic configuration is not corrected

## 5. Configuration Naming Inconsistencies

Examples include:

- `STRIPE_SECRETE_KEY`

Why it matters:

- env mistakes become easier
- onboarding and operations become less reliable

## 6. Observability Is Uneven

AI Vision has a stronger logging story than most other services.

Why it matters:

- production debugging quality differs by service
- correlation and cross-service diagnosis are harder

## 7. Gateway Rate-Limit Assumption Risk

The gateway rate limiter uses `req.user` to grant a higher limit, but the gateway itself does not visibly hydrate auth context.

Why it matters:

- authenticated traffic may not actually receive differentiated limits
- intended policy and real runtime behavior may differ

## 8. Validation Strategy Is Not Uniform

AI Vision uses explicit Zod validation middleware. Equivalent shared validation is not consistently visible across the rest of the backend.

Why it matters:

- request integrity depends more on controller logic in some services than in others

## 9. Feature TODOs In User-Facing Paths

Visible TODOs exist in:

- support actions in `user-ui`
- AI generator UI integration paths
- comment save behavior
- shop analytics expansion in Kafka consumer

Why it matters:

- some features may present as partially complete
- documentation should distinguish implemented flows from planned flows

## 10. Health And Ops Conventions Are Not Standardized

Visible health endpoints differ by service:

- `gateway-health`
- root `/`
- `/health`

Why it matters:

- automation, monitoring, and platform tooling become harder without standard readiness/liveness conventions

## Risk Posture Summary

The project's strongest risks are not "the code is chaotic." They are:

- uneven maturity across subsystems
- shared persistence coupling
- contract inconsistencies
- operations and observability not yet fully standardized

That is the kind of risk profile common to ambitious product-rich platforms that are evolving quickly.
