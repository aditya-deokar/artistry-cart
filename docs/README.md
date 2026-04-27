# Artistry Cart Documentation

This `docs/` tree is the canonical documentation space for the project.

The goal of this documentation set is to serve two audiences at the same time:

- engineers who need to understand, run, or extend the system
- interviewers or senior reviewers who want to evaluate the architecture, tradeoffs, and technical depth of the project

## Start Here

If you are new to the project, read these in order:

1. [Project Overview](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/00-overview/product-overview.md>)
2. [Business Context](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/00-overview/business-context.md>)
3. [Repository Map](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/00-overview/repo-map.md>)
4. [Local Development](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/01-getting-started/local-development.md>)
5. [Environment Variables](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/01-getting-started/environment-variables.md>)
6. [Commands and Workflows](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/01-getting-started/commands-and-workflows.md>)

## Documentation Sections

### `00-overview`

High-level project framing:

- product and platform summary
- business context
- repository map
- glossary

### `01-getting-started`

Onboarding and setup:

- local development
- environment variables
- commands and workflows
- troubleshooting

### `02-architecture`

System-level technical design:

- [System Overview](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/02-architecture/system-overview.md>)
- [Service Topology](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/02-architecture/service-topology.md>)
- [Request Flows](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/02-architecture/request-flows.md>)
- [Event Flows](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/02-architecture/event-flows.md>)
- [Data Architecture](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/02-architecture/data-architecture.md>)
- [Tradeoffs](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/02-architecture/tradeoffs.md>)

### `03-applications`

Deep-dive documentation for each app and service:

- [API Gateway](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/03-applications/api-gateway.md>)
- [Auth Service](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/03-applications/auth-service.md>)
- [Product Service](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/03-applications/product-service.md>)
- [Order Service](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/03-applications/order-service.md>)
- [Recommendation Service](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/03-applications/recommendation-service.md>)
- [Kafka Service](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/03-applications/kafka-service.md>)
- [AI Vision Service](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/03-applications/aivision-service.md>)
- [User UI](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/03-applications/user-ui.md>)
- [Seller UI](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/03-applications/seller-ui.md>)

### `04-shared-packages`

Docs for shared runtime and infrastructure packages:

- [Error Handler](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/04-shared-packages/error-handler.md>)
- [Middleware](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/04-shared-packages/middleware.md>)
- [Prisma And Database Client](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/04-shared-packages/prisma-and-database-client.md>)
- [Redis And Caching](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/04-shared-packages/redis-and-caching.md>)
- [ImageKit Integration](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/04-shared-packages/imagekit-integration.md>)
- [Kafka Utils](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/04-shared-packages/kafka-utils.md>)
- [Test Utils](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/04-shared-packages/test-utils.md>)

### `05-domain`

Cross-cutting business-domain documentation:

- [Auth And Identity](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/05-domain/auth-and-identity.md>)
- [Catalog And Products](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/05-domain/catalog-and-products.md>)
- [Shops And Sellers](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/05-domain/shops-and-sellers.md>)
- [Pricing, Discounts, Events, And Offers](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/05-domain/pricing-discounts-events-offers.md>)
- [Checkout And Orders](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/05-domain/checkout-and-orders.md>)
- [Recommendations And Analytics](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/05-domain/recommendations-and-analytics.md>)
- [AI Vision](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/05-domain/ai-vision.md>)

### `06-data-and-api`

Data model, API inventory, and integration contracts:

- [Database Schema](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/06-data-and-api/database-schema.md>)
- [Entity Relationship Notes](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/06-data-and-api/entity-relationship-notes.md>)
- [API Inventory](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/06-data-and-api/api-inventory.md>)
- [Auth Contracts](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/06-data-and-api/auth-contracts.md>)
- [Kafka Topics And Events](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/06-data-and-api/kafka-topics-and-events.md>)
- [External Integrations](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/06-data-and-api/external-integrations.md>)

### `07-quality-and-operations`

Testing, CI, security, observability, and risk:

- [Testing Strategy](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/07-quality-and-operations/testing-strategy.md>)
- [CI/CD](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/07-quality-and-operations/ci-cd.md>)
- [Observability](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/07-quality-and-operations/observability.md>)
- [Security Review](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/07-quality-and-operations/security-review.md>)
- [Performance](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/07-quality-and-operations/performance.md>)
- [Known Gaps And Risks](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/07-quality-and-operations/known-gaps-and-risks.md>)

### `08-decisions`

ADR-style design decisions and tradeoff writeups:

- [ADR-001: Monorepo And Nx](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/08-decisions/adr-001-monorepo-and-nx.md>)
- [ADR-002: MongoDB With Prisma](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/08-decisions/adr-002-mongodb-with-prisma.md>)
- [ADR-003: API Gateway Pattern](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/08-decisions/adr-003-api-gateway-pattern.md>)
- [ADR-004: Kafka Analytics Pipeline](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/08-decisions/adr-004-kafka-analytics-pipeline.md>)
- [ADR-005: AI Vision Service Boundary](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/08-decisions/adr-005-ai-vision-service-boundary.md>)

### `09-interview-prep`

Interview-ready storytelling and deep-dive prompts:

- [Project Story](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/09-interview-prep/project-story.md>)
- [System Design Walkthrough](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/09-interview-prep/system-design-walkthrough.md>)
- [Tradeoff Talking Points](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/09-interview-prep/tradeoff-talking-points.md>)
- [Deep-Dive Questions](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/09-interview-prep/deep-dive-questions.md>)

### `10-features`

Feature-area documentation that may grow into its own focused subtrees over time.

### `11-reference`

Reference material such as:

- [Port Map](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/11-reference/port-map.md>)
- [Documentation Style Guide](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/11-reference/documentation-style-guide.md>)

### `DevOps`

Operational planning and deployment documentation:

- [DevOps Implementation Plan](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/DevOps/DevOps-implemenatation.md>)
- [Docker Compose Strategy](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/DevOps/docker-compose-strategy.md>)
- [Dockerfile Standards](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/DevOps/dockerfile-standards.md>)
- [Kubernetes Deployment Guide](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/DevOps/kubernetes-deployment-guide.md>)
- [CI/CD Release Pipeline](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/DevOps/ci-cd-release-pipeline.md>)

### `legacy`

Existing docs that predate the canonical structure, plus migration notes such as:

- [Existing Docs Migration Plan](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/legacy/existing-docs-migration-plan.md>)

## Documentation Status

Implemented through Phase 8:

- root `README.md`
- `docs/README.md`
- overview docs
- onboarding docs
- architecture foundation docs
- application deep-dive docs
- shared package docs
- domain docs
- data and API docs
- quality and operations docs
- decision docs
- interview-prep docs
- initial reference docs
- DevOps planning docs
- legacy migration and canonicalization docs

Current state:

- canonical numbered documentation system is complete
- legacy docs are preserved as reference-only material with canonical pointers
- future work is incremental maintenance as the codebase evolves

## Source of Truth

When a topic appears in multiple places:

- prefer docs under the new numbered folders as the current source of truth
- use `legacy/`, `brand/`, `ai-vision-api/`, and older feature docs as supporting historical context
- use `docs/DevOps/` for active containerization, deployment, and platform-delivery planning

The documentation implementation roadmap is tracked in [docs-implemenataion.md](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/docs-implemenataion.md>).
