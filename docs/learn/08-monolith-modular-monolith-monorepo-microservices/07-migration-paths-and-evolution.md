# Migration Paths And Evolution

## Architecture Evolves

Good architecture changes with the product.

A common path:

```text
simple monolith
  -> modular monolith
  -> selected service extraction
  -> mature microservices
```

Do not jump to the final stage unless the system needs it.

## Stage 1: Simple Monolith

Best when:

- product is new
- team is small
- speed matters
- domain is unclear

Focus:

- working product
- clear code style
- tests
- basic deployment

Risk:

- code grows without boundaries

## Stage 2: Modular Monolith

Best when:

- product has multiple domains
- deployment can remain simple
- boundaries are becoming clearer

Focus:

- domain modules
- module APIs
- import rules
- database ownership conventions
- tests per module

Risk:

- modules import each other's internals

## Stage 3: Service Extraction

Extract a module into a service when:

- it scales differently
- it fails differently
- it has different dependencies
- it needs independent deployment
- a team can own it independently

Good extraction candidates:

- payments/order processing
- recommendations
- analytics workers
- AI processing
- notifications

## Stage 4: Mature Microservices

Requires:

- CI/CD maturity
- observability
- service ownership
- API versioning
- event schema management
- deployment automation
- incident response
- data ownership rules

## Strangler Fig Pattern

The strangler fig pattern gradually replaces parts of an old system.

Flow:

```text
old monolith handles everything
new service handles one route/capability
traffic gradually moves to new service
old logic is removed when safe
```

This avoids risky big-bang rewrites.

## Extracting A Service Safely

Steps:

1. identify clear module boundary
2. define API/event contract
3. separate data ownership or access rules
4. add tests around current behavior
5. build new service
6. route traffic gradually
7. monitor errors and latency
8. remove old code

## Monorepo During Migration

A monorepo can help migrations because:

- old and new code are visible together
- shared contracts can be updated atomically
- tests can cover both sides
- gateway routing can change in one PR
- docs can evolve with code

## Common Migration Mistakes

- extracting before boundary is understood
- sharing the same database without ownership rules
- moving code but not ownership
- creating network calls for every small function
- no observability before production traffic
- no rollback plan
- no contract tests

## Interview Explanation

If asked "How would you move from monolith to microservices?", say:

> I would not rewrite everything at once. I would first create clear modules inside the monolith, add tests around module behavior, identify a capability with a strong reason for independence, define its API or event contract, extract it gradually, route traffic through a gateway or strangler pattern, monitor it, and only then remove the old implementation.

## Connection To Artistry Cart

Artistry Cart already starts with extracted services:

- auth
- product
- order
- recommendations
- AI Vision
- Kafka analytics

Future evolution could focus on:

- stronger data ownership
- clearer API contracts
- event schema governance
- service-level deployment ownership
- stronger observability

