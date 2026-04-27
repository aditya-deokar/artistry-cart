# Tradeoffs

## Purpose

This document captures the major architectural tradeoffs visible in the current implementation. These are the kinds of points senior engineers usually care about because they reveal whether the system design is intentional, pragmatic, and self-aware.

## 1. Nx Monorepo vs Multiple Repositories

### Why it helps

- shared packages are easy to build and reuse
- cross-service refactors are simpler
- frontend and backend evolution stay aligned
- testing and CI can use Nx-aware workflows

### What it costs

- repo size and cognitive load grow quickly
- shared packages can create accidental coupling
- service independence is lower than in truly separate repos

### Current judgment

This is a good fit for the project stage represented by the repository. The main risk is not the monorepo itself, but letting shared code expand into hidden cross-service coupling.

## 2. Service-Oriented Backend vs Single Monolith

### Why it helps

- auth, product, order, recommendation, analytics, and AI concerns stay conceptually separated
- operationally sensitive areas like payments and AI integrations are isolated
- future deployment splitting is more plausible

### What it costs

- more runtime processes to manage locally
- more duplicated bootstrap concerns across services
- gateway, ports, and env coordination become part of daily development

### Current judgment

The service split is meaningful, especially around orders and AI Vision. The main architectural caveat is that shared persistence still makes the system less independent than the service map might imply.

## 3. API Gateway vs Direct Frontend-To-Service Calls

### Why it helps

- simpler client backend entry point
- centralized routing boundary
- easier to evolve frontend API targets without changing every client path

### What it costs

- adds another moving piece to local development
- current gateway configuration is static and host/port-specific
- the gateway currently does little orchestration, so some complexity is routing overhead rather than business value

### Current judgment

The gateway is useful, but it is still lightweight infrastructure rather than a strong policy or aggregation layer.

## 4. Shared MongoDB Schema vs Database Per Service

### Why it helps

- much faster development and onboarding
- no need for heavy cross-database synchronization
- shared Prisma client keeps implementation consistent

### What it costs

- weaker service autonomy
- harder ownership boundaries
- greater risk of cross-service schema coupling
- more care needed during migrations and model evolution

### Current judgment

This is the most important structural tradeoff in the repository. It is pragmatic and productive, but it should be described honestly as logical service separation over shared persistence rather than full storage independence.

## 5. MongoDB + Prisma vs Strict Relational Modeling

### Why it helps

- flexible modeling for product metadata, images, AI payloads, and analytics
- faster iteration in feature-rich and AI-heavy domains
- Prisma still provides typed access and schema structure

### What it costs

- JSON-heavy structures reduce strictness
- complex cross-entity constraints are less explicit than in a relational design
- some analytics and pricing semantics require discipline at the application layer

### Current judgment

This is a sensible choice for a platform with rich product metadata and evolving AI-oriented entities, as long as the team stays disciplined about validation and ownership.

## 6. Kafka Analytics Pipeline vs Synchronous Analytics Writes

### Why it helps

- keeps user-facing request latency lower
- decouples analytics capture from core browse and cart flows
- enables recommendation inputs to be materialized asynchronously

### What it costs

- eventual consistency
- harder debugging than direct writes
- additional infrastructure and operational complexity
- failure handling needs more observability than a simple CRUD path

### Current judgment

This is one of the stronger design decisions in the repo. It aligns well with the problem. The remaining gap is operational maturity around event monitoring and schema governance.

## 7. Request-Time Recommendation Scoring vs Offline Recommendation Serving

### Why it helps

- simple implementation path
- fewer infrastructure components than a separate model-serving layer
- easy to evolve recommendation logic in one service

### What it costs

- recommendation latency depends on in-request computation
- scaling recommendation traffic can become expensive
- model behavior is closer to application code than to a dedicated ML pipeline

### Current judgment

Good for iteration, but not the final form of a high-scale recommendation system.

## 8. Dedicated AI Vision Service vs Embedding AI Into Core Commerce Services

### Why it helps

- isolates AI dependencies and runtime behavior
- keeps product and order services cleaner
- makes AI experimentation safer and easier to reason about
- background jobs and embeddings can evolve without bloating transactional services

### What it costs

- additional operational surface
- another set of routes, configs, and dependencies to maintain
- more cross-service conceptual navigation for new contributors

### Current judgment

This is a strong separation. AI workloads typically deserve their own boundary once they start involving embeddings, external models, media handling, and scheduled maintenance jobs.

## 9. Graceful Redis Degradation vs Hard Dependency

### Why it helps

- local development is more resilient
- selected flows can degrade instead of failing completely
- infrastructure outages do not necessarily bring the whole platform down

### What it costs

- feature behavior may become inconsistent when Redis is missing
- developers need to know which capabilities are best-effort and which are strict requirements

### Current judgment

A pragmatic choice. It favors platform availability and developer ergonomics, but the documentation needs to clearly explain degraded-mode behavior.

## 10. Current Standardization Level

### Strength

- service bootstrap structure is recognizable across apps
- shared middleware and error handling improve consistency

### Constraint

- env naming is not fully normalized
- not every service exposes identical conventions for health, config, and structure
- some route and proxy assumptions are encoded directly in code

### Current judgment

The architecture is coherent, but still in the phase where consistency needs deliberate cleanup to become production-polished.

## Best Senior-Level Framing

The strongest honest description of the system is:

- it is a thoughtfully decomposed platform
- it favors practical delivery speed over strict infrastructure purity
- it already contains meaningful domain boundaries
- the biggest next-step improvements are contract standardization, observability, and stronger ownership around shared persistence

## Related Docs

- [System Overview](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/02-architecture/system-overview.md>)
- [Service Topology](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/02-architecture/service-topology.md>)
- [Data Architecture](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/02-architecture/data-architecture.md>)
