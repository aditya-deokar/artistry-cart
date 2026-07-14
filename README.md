# Artistry Cart

![Node.js 20](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?logo=pnpm&logoColor=white)
![Nx](https://img.shields.io/badge/Nx-monorepo-143055?logo=nx&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111111)
![Prisma](https://img.shields.io/badge/Prisma-MongoDB-2D3748?logo=prisma&logoColor=white)
![Kafka](https://img.shields.io/badge/Kafka-KRaft-231F20?logo=apachekafka&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-ready-326CE5?logo=kubernetes&logoColor=white)

Artistry Cart is a production-oriented, microservices-based ecommerce platform for artisan commerce. It combines a buyer marketplace, a seller operations dashboard, an API gateway edge layer, domain-focused backend services, MongoDB persistence through Prisma, a KRaft-native Kafka analytics pipeline with exactly-once production semantics and dead-letter queue support, Stripe payments, Redis-assisted runtime behavior with graceful degradation, and a dedicated AI Vision service for generation, visual search, and artisan collaboration.

The repository is built as an Nx monorepo: one workspace, multiple independently deployable applications, shared infrastructure packages, unified testing, Docker/Kubernetes assets, and a canonical documentation system under [`docs/`](docs/README.md).

## Table Of Contents

- [System Design Philosophy](#system-design-philosophy)
- [Architecture Overview](#architecture-overview)
- [Service Decomposition](#service-decomposition)
- [Request, Event, And Data Flows](#request-event-and-data-flows)
- [Kafka Analytics Pipeline](#kafka-analytics-pipeline)
- [Data Architecture](#data-architecture)
- [Technology Stack](#technology-stack)
- [Repository Map](#repository-map)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Ports](#ports)
- [Testing](#testing)
- [Docker, Kubernetes, And Delivery](#docker-kubernetes-and-delivery)
- [Observability And Security](#observability-and-security)
- [Architectural Tradeoffs](#architectural-tradeoffs)
- [Production Readiness](#production-readiness)
- [Documentation Guide](#documentation-guide)

## System Design Philosophy

Artistry Cart is designed around several intentional architectural principles:

### Separation Of Concerns Through Service Boundaries

Each backend service owns a distinct business domain. This isn't arbitrary decomposition — the splits follow natural fault isolation and operational sensitivity boundaries:

- **Auth** is isolated because identity, JWTs, OAuth, cookies, and onboarding flows have their own complexity and security surface.
- **Orders** are isolated because payment processing and Stripe webhook flows are operationally sensitive — a payment bug should not cascade into catalog or AI features.
- **AI Vision** is isolated because AI workloads (embeddings, generation, visual search, Agenda background jobs) have fundamentally different latency profiles, dependency graphs, and scaling characteristics than transactional commerce.
- **Kafka analytics** is isolated because materialization is asynchronous and operationally independent from request handling — consumer lag and batch failures should not affect buyer experience.

### Asynchronous Where It Matters, Synchronous Where It's Simpler

The system uses async event processing only where latency decoupling provides real value (analytics materialization, recommendation data capture), while keeping synchronous request/response patterns for catalog, checkout, and auth — where simplicity and debuggability outweigh the benefits of async orchestration.

### Pragmatic Hybrid Over Ideological Purity

Artistry Cart uses a shared MongoDB schema through Prisma rather than database-per-service. This is a deliberate tradeoff: it sacrifices full service storage independence for dramatically faster development velocity, simpler local setup, and consistent data access patterns. Services express ownership logically through code, APIs, and documentation.

### Defense In Depth For Payments And External Integrations

Stripe webhooks are verified with signature validation using raw body parsing. OAuth flows use PKCE-aware Arctic providers. AI Vision routes have per-route rate limiting independent of the gateway. The gateway itself enforces CORS, rate limiting, and centralized proxy routing.

## Architecture Overview

### High-Level System Diagram

```mermaid
flowchart LR
    Buyer["Buyer Browser"] --> UserUI["user-ui<br/>Next.js storefront"]
    Seller["Seller Browser"] --> SellerUI["seller-ui<br/>Next.js dashboard"]

    UserUI --> Gateway["api-gateway<br/>Express edge"]
    SellerUI --> Gateway

    Gateway --> Auth["auth-service"]
    Gateway --> Product["product-service"]
    Gateway --> Order["order-service"]
    Gateway --> Reco["recommendation-service"]
    Gateway --> AIV["aivision-service"]

    UserUI -. "user activity events" .-> Kafka["Kafka<br/>KRaft (no ZooKeeper)"]
    Order -. "purchase analytics outbox" .-> Kafka
    Kafka --> Worker["kafka-service<br/>analytics worker"]

    Auth --> Mongo["MongoDB<br/>Prisma"]
    Product --> Mongo
    Order --> Mongo
    Reco --> Mongo
    AIV --> Mongo
    Worker --> Mongo
    Gateway --> Mongo

    Auth --> Redis["Redis"]
    Order --> Redis

    Order --> Stripe["Stripe"]
    Auth --> OAuth["OAuth providers"]
    Auth --> SMTP["SMTP"]
    Order --> SMTP
    AIV --> Gemini["Google Gemini"]
    AIV --> HF["Hugging Face"]
    AIV --> ImageKit["ImageKit"]
    AIV --> Agenda["Agenda jobs"]
    Agenda --> Mongo
```

### Service Topology

```mermaid
flowchart TD
    subgraph Public["Public entry points"]
        U["user-ui :3000"]
        S["seller-ui :3001"]
        G["api-gateway :8080"]
    end

    subgraph Internal["Internal services"]
        A["auth-service :6001"]
        P["product-service :6002"]
        O["order-service :6004"]
        R["recommendation-service :6005"]
        AI["aivision-service :6006"]
        K["kafka-service :3000 management"]
    end

    subgraph State["State and infrastructure"]
        DB["MongoDB :27017"]
        Cache["Redis :6379"]
        Bus["Kafka :9092 (KRaft)"]
        KUI["Redpanda Console :8089"]
    end

    U --> G
    S --> G
    G --> A
    G --> P
    G --> O
    G --> R
    G --> AI
    U -.-> Bus
    O -.-> Bus
    Bus --> K
    KUI --> Bus

    A --> DB
    P --> DB
    O --> DB
    R --> DB
    AI --> DB
    K --> DB
    A --> Cache
    O --> Cache
```

## Service Decomposition

### Applications

| Project | Type | Port | Responsibility |
| --- | --- | ---: | --- |
| [`apps/user-ui`](apps/user-ui) | Next.js app | `3000` | Buyer marketplace, catalog, checkout, profile, search, shops, support, artisans, and AI Vision UX. |
| [`apps/seller-ui`](apps/seller-ui) | Next.js app | `3001` | Seller auth, onboarding, dashboard, products, events, discounts, offers, and orders. |
| [`apps/api-gateway`](apps/api-gateway) | Express service | `8080` | Public backend entry point, CORS, rate limiting, request parsing, health, metrics, and proxy routing. |
| [`apps/auth-service`](apps/auth-service) | Express service | `6001` | Buyer/seller auth, JWTs, OAuth, profile, addresses, seller onboarding, shop creation, and Stripe onboarding links. |
| [`apps/product-service`](apps/product-service) | Express service | `6002` | Products, shops, search, categories, images, pricing, discounts, events, offers, and catalog cleanup. |
| [`apps/order-service`](apps/order-service) | Express service | `6004` | Checkout, Stripe sessions/intents, webhooks, orders, cancellations, refunds, seller orders, earnings, payouts, and purchase analytics outbox. |
| [`apps/recommendation-service`](apps/recommendation-service) | Express service | `6005` | Recommendation APIs backed by materialized user activity and TensorFlow-based scoring/fallback logic. |
| [`apps/aivision-service`](apps/aivision-service) | Express service | `6006` | Text/image generation, product variations, visual search, concepts, gallery, collections, comments, artisan matching, embeddings, rate limiting, and Agenda jobs. |
| [`apps/kafka-service`](apps/kafka-service) | Worker + HTTP management | `3000` | Kafka consumer for `user-events`, analytics materialization, DLQ routing, retry with exponential backoff, readiness probes, and Prometheus-style metrics. |

### Shared Packages

| Package | Purpose |
| --- | --- |
| [`packages/error-handler`](packages/error-handler) | Shared Express error classes and middleware for normalized application, Prisma, validation, auth, and unexpected errors. |
| [`packages/middleware`](packages/middleware) | Shared JWT auth, role guards, seller/user/admin authorization helpers, and identity hydration. |
| [`packages/libs`](packages/libs) | Prisma client, Redis initialization, and ImageKit integration entry points. |
| [`packages/utils`](packages/utils) | Kafka client (SASL/SSL-capable), idempotent producer, analytics contract (Zod), admin topic management, health probes, and shared runtime helpers for logging, CORS, health, metrics, request IDs, security headers, service URLs, and shutdown. |
| [`packages/test-utils`](packages/test-utils) | Test helpers, mocks, auth utilities, data factories, request helpers, and shared setup. |

## Request, Event, And Data Flows

### Gateway Routing

The frontends see one backend entry point. The gateway keeps routing centralized and forwards requests to domain services.

| Gateway Prefix | Upstream Service | Typical Base Path |
| --- | --- | --- |
| `/auth` | `auth-service` | `/auth/api/*` |
| `/product` | `product-service` | `/product/api/*` |
| `/order` | `order-service` | `/order/api/*` |
| `/recommendation` | `recommendation-service` | `/recommendation/api/*` |
| `/ai-vision` | `aivision-service` | `/ai-vision/api/v1/ai/*` |

Gateway upstreams are environment-driven through `AUTH_SERVICE_URL`, `PRODUCT_SERVICE_URL`, `ORDER_SERVICE_URL`, `RECOMMENDATION_SERVICE_URL`, and `AIVISION_SERVICE_URL`, with local defaults matching the standard ports.

### Buyer Auth Flow

```mermaid
sequenceDiagram
    participant B as Buyer Browser
    participant UI as user-ui
    participant G as api-gateway
    participant A as auth-service
    participant DB as MongoDB

    B->>UI: Submit login or signup
    UI->>G: /auth/api/login-user
    G->>A: Proxy request
    A->>DB: Validate account and load identity
    DB-->>A: User or seller record
    A-->>G: JWT/cookie-aware auth response
    G-->>UI: Proxied response
    UI-->>B: Authenticated session state
```

### Checkout And Payment Flow

```mermaid
sequenceDiagram
    participant B as Buyer Browser
    participant UI as user-ui
    participant G as api-gateway
    participant O as order-service
    participant S as Stripe
    participant DB as MongoDB
    participant K as Kafka

    B->>UI: Start checkout
    UI->>G: /order/api/create-payment-session
    G->>O: Proxy order request
    O->>S: Create Stripe session or intent
    S-->>O: Payment metadata
    O-->>G: Checkout response
    G-->>UI: Payment flow data
    UI-->>B: Continue payment
    S->>O: Signed webhook callback
    O->>DB: Persist order/payment transition
    O-.->K: Enqueue purchase analytics via outbox
```

Stripe webhook parsing is mounted before JSON body parsing in `order-service`, which preserves the raw request body required for signature verification.

### Analytics And Recommendation Flow

```mermaid
sequenceDiagram
    participant UI as user-ui
    participant O as order-service
    participant K as Kafka user-events
    participant W as kafka-service
    participant DB as MongoDB
    participant R as recommendation-service

    UI->>K: Publish browse/cart/wishlist/shop events
    O->>K: Publish purchase events from analytics outbox
    K->>W: Deliver event batch
    W->>W: Validate payload (Zod), retry transient errors
    W->>DB: Upsert UserAnalytics
    W->>DB: Upsert productAnalytics/shopAnalytics
    W--xW: DLQ malformed/exhausted events
    R->>DB: Read activity and product data
    R->>R: Score or use cached/fallback recommendations
    R-->>UI: Recommended products
```

### AI Vision Flow

```mermaid
sequenceDiagram
    participant B as Buyer Browser
    participant UI as user-ui
    participant G as api-gateway
    participant AI as aivision-service
    participant DB as MongoDB
    participant Gemini as Google Gemini
    participant HF as Hugging Face
    participant IK as ImageKit

    B->>UI: Generate, refine, or search concept
    UI->>G: /ai-vision/api/v1/ai/*
    G->>AI: Proxy AI request
    AI->>AI: Auth context, validation, rate limit
    AI->>Gemini: Generation or reasoning
    AI->>HF: Supporting model/embedding flow
    AI->>IK: Media upload/delivery
    AI->>DB: Persist concept/session/embedding data
    AI-->>UI: Concept, search, or gallery response
    UI-->>B: AI Vision experience
```

AI Vision supports anonymous exploration for selected paths while still allowing stricter authenticated routes through local `requireAuth` behavior.

## Kafka Analytics Pipeline

The Kafka pipeline is one of the most architecturally intentional subsystems in the platform. It goes beyond basic pub/sub to implement production-grade reliability patterns.

### Pipeline Architecture

```mermaid
flowchart LR
    A["user-ui (Next.js)"] -->|"Analytics API"| B["@artistry-cart/utils/kafka<br/>Idempotent Producer"]
    C["order-service"] -->|"Transactional Outbox"| B
    B -->|"Exactly-once produce"| D["Kafka Broker<br/>(KRaft — no ZooKeeper)<br/>user-events topic"]
    D -->|"Batch consumer<br/>manual offset commit"| E["kafka-service"]
    E -->|"Success"| F["MongoDB<br/>UserAnalytics<br/>productAnalytics<br/>shopAnalytics"]
    E -..->|"Permanent failure"| G["user-events.dlq<br/>Dead Letter Queue"]
```

### Infrastructure: KRaft-Native Kafka (No ZooKeeper)

The platform uses the official **`apache/kafka`** image running in **KRaft mode** — Kafka's built-in consensus protocol that replaces ZooKeeper entirely. This provides:

- **Simpler operations**: One process handles both broker and controller roles (`KAFKA_PROCESS_ROLES: broker,controller`).
- **Faster startup**: No ZooKeeper dependency means fewer moving parts and fewer failure modes.
- **Modern baseline**: KRaft is the recommended production mode for Kafka 3.3+.

Topic initialization is handled by a dedicated `kafka-init` container that runs after the Kafka healthcheck passes, creating `user-events` (6 partitions, 7-day retention) and `user-events.dlq` (3 partitions, 30-day retention) with idempotent `--if-not-exists` semantics.

The Kafka UI is provided by **Redpanda Console** (`redpandadata/console`) on port `8089`, replacing the archived `provectuslabs/kafka-ui`.

### Reliability Guarantees

#### Idempotent Producer (Exactly-Once Production)

The shared KafkaJS producer (`packages/utils/kafka/analytics-producer.ts`) operates with `idempotent: true` and `maxInFlightRequests: 5`. If a network timeout occurs after the broker receives a message but before it sends the ACK, the producer retries automatically — idempotency ensures the broker recognizes the duplicate sequence number and discards it silently.

#### Transactional Outbox Pattern

Services like `order-service` do not write to Kafka during the main database transaction. Instead, they write an event to an `analyticsOutbox` table in MongoDB. A background process polls this table and uses the idempotent producer to publish. This prevents the **dual-write problem** — if the DB commits but Kafka is down, the event is not lost.

#### Exponential Backoff And Connection Resilience

Both the producer and consumer use exponential backoff with jitter:

- **Producer**: 5 connect retries with exponential delay (1s base, 30s cap, 25% jitter), then fails the request.
- **Consumer**: Configurable startup retries (default 5, 3s base, 60s cap, 20% jitter), with infinite reconnection on network loss after initial connect.

#### Manual Offset Commits

The consumer uses `autoCommit: false` and `eachBatchAutoResolve: false` — offsets are only committed after successful processing and persistence, ensuring at-least-once delivery semantics at the consumer side.

#### Dead Letter Queue (DLQ)

When a message fails Zod schema validation or exhausts per-message retries, it is routed to `user-events.dlq` with enriched error metadata rather than being retried infinitely (which would cause head-of-line blocking). The consumer commits the offset and continues.

### Schema Contract And Evolution

All Kafka payloads are validated using Zod schemas defined in `analytics-contract.ts`:

- **Versioning**: Every event includes a `schemaVersion` header. The consumer maintains a `SUPPORTED_SCHEMA_VERSIONS` array for backward-compatible evolution.
- **Correlation**: A `correlationId` header propagates from the API Gateway / Next.js frontend through to consumer logs, enabling end-to-end distributed tracing of a single user request.
- **Typed actions**: Seven action types are enforced — `add_to_wishlist`, `add_to_cart`, `product_view`, `remove_from_wishlist`, `remove_from_cart`, `purchase`, `shop_visit`.
- **Contextual validation**: Action-specific rules (e.g., `shop_visit` requires `shopId` or `productId`, other actions require `productId`) are enforced via Zod superRefine.

### Topic Administration

The Kafka admin module (`packages/utils/kafka/admin.ts`) provides idempotent topic creation via `ensureTopicsExist()` — the `kafka-service` verifies topic existence at startup and creates missing topics programmatically, providing self-healing behavior independent of the Docker init container.

### Health And Observability

- **`/kafka-health`** endpoint performs a lightweight admin client probe (connect → list topics → disconnect) and returns cluster health with latency.
- **`/metrics`** exposes Prometheus-compatible worker metrics:
  - `kafka_consumer_lag` — critical scaling signal
  - `kafka_batch_duration_seconds` — processing latency histogram
  - `kafka_events_dead_lettered_total` — schema mismatch alert trigger
- **`/ready`** reflects consumer connection state, running status, and shutdown awareness.
- **`waitForKafka()`** utility provides startup readiness with configurable retry and backoff for dependent services.

### Kafka Client Configuration

The shared Kafka client (`packages/utils/kafka/client.ts`) supports production deployment scenarios:

| Feature | Environment Variable | Default |
| --- | --- | --- |
| Broker list | `KAFKA_BROKERS` | `localhost:9092` |
| Client ID | `KAFKA_CLIENT_ID` | Per-service name |
| SASL auth | `KAFKA_SASL_USERNAME`, `KAFKA_SASL_PASSWORD`, `KAFKA_SASL_MECHANISM` | Disabled |
| TLS | `KAFKA_SSL` | `false` |
| Log level | `KAFKA_LOG_LEVEL` | `warn` |
| Connection timeout | `KAFKA_CONNECTION_TIMEOUT_MS` | `3000` |
| Request timeout | `KAFKA_REQUEST_TIMEOUT_MS` | `30000` |
| Retry config | `KAFKA_RETRY_INITIAL_TIME_MS`, `KAFKA_RETRY_MAX_RETRIES` | `300`, `10` |

## Data Architecture

### Ownership Model

The repository is service-oriented at the application boundary, but persistence is centralized. Services express ownership logically through code, APIs, and documentation while sharing one MongoDB schema and Prisma client.

```mermaid
flowchart TD
    Prisma["Shared Prisma Client<br/>packages/libs/prisma"] --> Mongo["MongoDB<br/>prisma/schema.prisma"]

    Auth["auth-service<br/>users, sellers, auth, profile"] --> Prisma
    Product["product-service<br/>products, shops, pricing, events, discounts"] --> Prisma
    Order["order-service<br/>orders, payments, payouts, refunds, outbox"] --> Prisma
    Reco["recommendation-service<br/>recommendation reads/cache"] --> Prisma
    Kafka["kafka-service<br/>analytics materialization"] --> Prisma
    AI["aivision-service<br/>concepts, embeddings, sessions, usage"] --> Prisma
    Gateway["api-gateway<br/>site config bootstrap"] --> Prisma
```

### Major Model Clusters

The schema in [`prisma/schema.prisma`](prisma/schema.prisma) is organized into six bounded contexts:

| Context | Models | Owning Service |
| --- | --- | --- |
| Identity | `users`, `sellers`, `addresses`, `Notification` | `auth-service` |
| Shops | `shops`, `shopReviews`, `site_config` | `product-service`, `auth-service` |
| Catalog | `products`, `ProductPricing`, `events`, `EventProductDiscount`, `discount_codes`, `discount_usage`, `banners` | `product-service` |
| Orders | `orders`, `OrderItem`, `payments`, `payouts`, `refunds` | `order-service` |
| Analytics | `UserAnalytics`, `productAnalytics`, `shopAnalytics`, `uniqueShopVisitor`, `analyticsOutbox` | `kafka-service` (write), `recommendation-service` (read) |
| AI Vision | `VisionSession`, `Concept`, `ConceptImage`, `AIGeneratedProduct`, `ArtisanMatch`, `ConceptCollection`, `ConceptComment`, `RateLimitEntry`, `ProductEmbedding`, `APIUsageLog` | `aivision-service` |

### Why Shared Persistence

This is the most significant structural tradeoff. The shared schema enables:

- **Fast development**: No cross-database sync, no distributed transactions.
- **Simple local setup**: One MongoDB instance, one `prisma generate`.
- **Consistent typed access**: All services use the same generated Prisma client.

The cost is weaker service autonomy — schema migrations require coordination, and cross-service data access is possible at the ORM level even when it shouldn't be. This is mitigated by clear code ownership and documented model boundaries.

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Monorepo | Nx 21, pnpm workspace, TypeScript 5.8 |
| Frontend | Next.js 15, React 19, Tailwind CSS 4, React Query, Zustand, Jotai, GSAP, Framer Motion, Radix UI, Lucide |
| Backend | Express, Node.js 20, Zod, cookie-parser, CORS, express-rate-limit |
| Data | MongoDB 7, Prisma 6, Redis 7 |
| Events | Apache Kafka (KRaft-native, no ZooKeeper), KafkaJS, Redpanda Console, idempotent producer, DLQ-capable analytics worker |
| Payments | Stripe client/server SDKs and signed webhooks |
| AI and media | Google Gemini, Hugging Face, TensorFlow.js, LangChain, ImageKit |
| Testing | Vitest 4, Supertest, Nx e2e projects, shared mocks and factories |
| Delivery | Docker, Docker Compose, GitHub Actions, GHCR, Kustomize, Kubernetes |
| Operations | `/healthz`, `/readyz`, `/metrics`, structured JSON logs, request IDs, Trivy scans, SBOM/provenance, Dependabot |

## Repository Map

```text
.
├── apps/
│   ├── user-ui/                    # Buyer-facing Next.js app
│   ├── seller-ui/                  # Seller dashboard Next.js app
│   ├── api-gateway/                # Public backend proxy/edge service
│   ├── auth-service/               # Identity, OAuth, onboarding
│   ├── product-service/            # Catalog, shops, search, discounts, events
│   ├── order-service/              # Checkout, orders, Stripe, payouts
│   ├── recommendation-service/     # Recommendation APIs
│   ├── aivision-service/           # AI generation, visual search, concepts
│   ├── kafka-service/              # Analytics worker
│   └── *-e2e/                      # Service-level e2e projects
├── packages/
│   ├── error-handler/              # Shared Express error contract
│   ├── middleware/                 # Shared auth/role middleware
│   ├── libs/                       # Prisma, Redis, ImageKit helpers
│   ├── utils/                      # Kafka and runtime utilities
│   └── test-utils/                 # Shared test helpers and mocks
├── prisma/
│   ├── schema.prisma               # MongoDB schema
│   └── seed/                       # Seed fixtures and scripts
├── docker/
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── compose/                    # Infra, apps, and full-stack Compose files
├── k8s/
│   ├── base/                       # Kustomize base manifests
│   ├── overlays/                   # dev, staging, production overlays
│   └── addons/monitoring/          # Optional Prometheus Operator resources
├── scripts/ci/                     # Release and deployment helper scripts
├── tools/e2e/                      # E2E orchestration helper
├── docs/                           # Canonical documentation system
└── .github/workflows/              # CI, publish, deploy, security workflows
```

## Local Development

### Prerequisites

- Node.js `20` as declared in [`.nvmrc`](.nvmrc)
- pnpm `9`
- MongoDB
- Redis
- Docker, if using Compose or local Kafka

### Install

```bash
pnpm install
pnpm exec prisma generate
```

### Prepare Environment

Start from [`.env.example`](.env.example):

```bash
cp .env.example .env
```

For Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

At minimum, most local backend flows need:

- `DATABASE_URL`
- `FRONTEND_URL`
- `CORS_ALLOWED_ORIGINS`
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `NEXT_PUBLIC_SERVER_URI`
- service URL variables such as `AUTH_SERVICE_URL` and `PRODUCT_SERVICE_URL`

Feature-specific flows require additional Stripe, SMTP, OAuth, ImageKit, Gemini, Hugging Face, Kafka, and Redis variables.

### Option 1: Full Docker Compose Stack

The canonical full-stack Compose entry point is:

```bash
docker compose -f docker/compose/docker-compose.full.yml up --build
```

Infra only (MongoDB, Redis, Kafka with KRaft, kafka-init, Redpanda Console):

```bash
docker compose -f docker/compose/docker-compose.infra.yml up -d
```

Apps only:

```bash
docker compose -f docker/compose/docker-compose.apps.yml up --build
```

### Option 2: Manual Service Startup

Start infrastructure first using the Compose infra stack:

```bash
docker compose -f docker/compose/docker-compose.infra.yml up -d
```

This starts MongoDB (with replica set), Redis, Kafka (KRaft — no ZooKeeper), the topic init container, and Redpanda Console.

Recommended manual order:

1. MongoDB
2. Redis
3. Kafka infrastructure
4. `auth-service`
5. `product-service`
6. `order-service`
7. `recommendation-service`
8. `aivision-service`
9. `kafka-service`
10. `api-gateway`
11. `user-ui`
12. `seller-ui`

Backend services:

```bash
pnpm exec nx serve auth-service
pnpm exec nx serve product-service
pnpm exec nx serve order-service
pnpm exec nx serve recommendation-service
pnpm exec nx serve aivision-service
pnpm exec nx serve kafka-service
pnpm exec nx serve api-gateway
```

Frontend apps:

```bash
pnpm exec nx dev user-ui
pnpm exec nx dev seller-ui
```

Shortcut scripts:

```bash
pnpm user-ui
pnpm seller-ui
```

### Common Root Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run Nx `serve` across all projects. Useful but noisy for the full monorepo. |
| `pnpm user-ui` | Start the buyer UI in dev mode. |
| `pnpm seller-ui` | Start the seller UI in dev mode. |
| `pnpm run build:shared` | Build shared workspace packages used by tests and services. |
| `pnpm test` | Build shared packages, then run the root Vitest workspace. |
| `pnpm test:coverage` | Run coverage through the root Vitest workspace. |
| `pnpm test:e2e:infra:up` | Start MongoDB and Redis test infrastructure. |
| `pnpm test:e2e:core` | Run core backend e2e suites. |
| `pnpm test:e2e:all` | Run all e2e suites, including AI Vision and Kafka. |

## Environment Variables

The full inventory lives in [`docs/01-getting-started/environment-variables.md`](docs/01-getting-started/environment-variables.md). The most important groups are:

| Group | Variables |
| --- | --- |
| Runtime | `NODE_ENV`, `HOST`, `PORT`, `LOG_LEVEL`, `CORS_ALLOWED_ORIGINS`, `FRONTEND_URL` |
| Gateway upstreams | `AUTH_SERVICE_URL`, `PRODUCT_SERVICE_URL`, `ORDER_SERVICE_URL`, `RECOMMENDATION_SERVICE_URL`, `AIVISION_SERVICE_URL` |
| Frontend public config | `NEXT_PUBLIC_SERVER_URI`, `INTERNAL_SERVER_URI`, `NEXT_PUBLIC_FRONTEND_URL`, `NEXT_PUBLIC_USER_UI_LINK`, `NEXT_PUBLIC_AI_VISION_API_URL` |
| Database/cache | `DATABASE_URL`, `REDIS_ENABLED`, `REDIS_URL` |
| Auth | `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `MAINTENANCE_TOKEN` |
| OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`, `OAUTH_REDIRECT_BASE_URL` |
| Kafka | `KAFKA_BROKERS`, `KAFKA_CLIENT_ID`, `KAFKA_USER_EVENTS_TOPIC`, `KAFKA_DLQ_TOPIC`, `KAFKA_SSL`, `KAFKA_SASL_USERNAME`, `KAFKA_SASL_PASSWORD`, `KAFKA_SASL_MECHANISM`, retry/batch/fetch controls |
| Payments | `STRIPE_SECRETE_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` |
| Email | `SMTP_HOST`, `SMTP_PORT`, `SMTP_SERVICE`, `SMTP_USER`, `SMTP_PASS` |
| AI/media | `GOOGLE_API_KEY`, `HUGGINGFACE_API_KEY`, `IMAGEKIT_PUBLIC_API_KEY`, `IMAGEKIT_PRIVATE_API_KEY`, `IMAGEKIT_URL_ENDPOINT` |

Note the current Stripe secret variable is intentionally documented as `STRIPE_SECRETE_KEY` because that spelling is used by the codebase.

## Ports

| Port | Component | Notes |
| ---: | --- | --- |
| `3000` | `user-ui` | Buyer app |
| `3001` | `seller-ui` | Seller dashboard |
| `6001` | `auth-service` | Auth, registration, OAuth |
| `6002` | `product-service` | Catalog, shops, search, discounts, events, offers |
| `6004` | `order-service` | Orders, payments, webhooks |
| `6005` | `recommendation-service` | Recommendations |
| `6006` | `aivision-service` | AI Vision API |
| `8080` | `api-gateway` | Public backend entry point |
| `8089` | Redpanda Console | Kafka topic inspection (replaces archived kafka-ui) |
| `9092` | Kafka | Broker (KRaft mode — no ZooKeeper required) |
| `6379` | Redis | Cache/auxiliary runtime |
| `27017` | MongoDB | Primary database |

See [`docs/11-reference/port-map.md`](docs/11-reference/port-map.md) for the canonical reference.

## Testing

The repo uses layered testing:

- Unit and integration tests through Vitest.
- Service-level e2e projects under `apps/*-e2e`.
- Shared mocks, factories, request helpers, and setup through `packages/test-utils`.
- GitHub Actions validation for affected tests/builds, coverage, selected e2e flows, image builds, scans, and deployments.

### Root Test Workspace

The root [`vitest.config.mjs`](vitest.config.mjs) currently includes:

- `apps/kafka-service`
- `apps/product-service`
- `apps/auth-service`
- `apps/order-service`
- `apps/api-gateway`
- `apps/recommendation-service`
- `packages/middleware`
- `packages/error-handler`

Run all configured unit/integration tests:

```bash
pnpm test
```

Focused suites:

```bash
pnpm test:auth
pnpm test:product
pnpm test:order
pnpm test:gateway
pnpm test:recommendation
pnpm test:kafka
pnpm test:middleware
pnpm test:error-handler
```

Coverage:

```bash
pnpm test:coverage
```

### E2E Suites

The e2e runner can start required services and run suite groups:

```bash
pnpm test:e2e:infra:up
pnpm test:e2e:core
pnpm test:e2e:all
pnpm test:e2e:infra:down
```

Core e2e suites cover auth, product, order, recommendation, and gateway flows. The `all` group also includes AI Vision and Kafka e2e projects.

## Docker, Kubernetes, And Delivery

### Containerization

The repository includes:

- [`docker/backend.Dockerfile`](docker/backend.Dockerfile)
- [`docker/frontend.Dockerfile`](docker/frontend.Dockerfile)
- [`docker/compose/docker-compose.infra.yml`](docker/compose/docker-compose.infra.yml) — MongoDB (replica set), Redis, Kafka (KRaft), kafka-init, Redpanda Console
- [`docker/compose/docker-compose.apps.yml`](docker/compose/docker-compose.apps.yml) — All application services
- [`docker/compose/docker-compose.full.yml`](docker/compose/docker-compose.full.yml) — Combined infra + apps
- [`docker-compose.test.yml`](docker-compose.test.yml) — Test infrastructure

The Compose design separates infra, apps, and full-stack startup so local workflows can be as small or complete as needed.

### Kubernetes Topology

The Kubernetes baseline uses Kustomize:

```text
k8s/
├── base/                   # Deployments, Services, ConfigMaps, NetworkPolicies, Ingress
├── overlays/
│   ├── dev/
│   ├── staging/
│   └── production/
└── addons/monitoring/      # Optional Prometheus Operator resources
```

```mermaid
flowchart TD
    Internet["Internet"] --> Ingress["Ingress Controller"]
    Ingress --> UserUI["user-ui"]
    Ingress --> SellerUI["seller-ui"]
    Ingress --> Gateway["api-gateway"]

    Gateway --> Auth["auth-service"]
    Gateway --> Product["product-service"]
    Gateway --> Order["order-service"]
    Gateway --> Reco["recommendation-service"]
    Gateway --> AIV["aivision-service"]

    Worker["kafka-service"] --> Kafka["Managed Kafka"]
    Auth --> Mongo["Managed MongoDB"]
    Product --> Mongo
    Order --> Mongo
    Reco --> Mongo
    AIV --> Mongo
    Worker --> Mongo

    Auth --> Redis["Managed Redis"]
    Order --> Redis
```

Only `user-ui`, `seller-ui`, and `api-gateway` are intended to be public. Internal services stay behind `ClusterIP` services. Stateful production infrastructure (MongoDB, Redis, Kafka) is expected to be managed outside the app cluster.

Apply an overlay:

```bash
kubectl apply -k k8s/overlays/dev
```

Optional monitoring add-on:

```bash
kubectl apply -k k8s/addons/monitoring/overlays/dev
```

### CI/CD Flow

The repository includes five GitHub Actions workflows:

| Workflow | Purpose |
| --- | --- |
| [`.github/workflows/test.yml`](.github/workflows/test.yml) | PR/default-branch validation, affected tests/builds, coverage, and core e2e. |
| [`.github/workflows/build-publish.yml`](.github/workflows/build-publish.yml) | Build deployable workloads, publish images to GHCR, generate image manifest, scan images, and attach SBOM/provenance. |
| [`.github/workflows/deploy-staging.yml`](.github/workflows/deploy-staging.yml) | Promote exact image digests into staging with Kustomize. |
| [`.github/workflows/deploy-production.yml`](.github/workflows/deploy-production.yml) | Controlled production promotion using published image digests. |
| [`.github/workflows/nightly-security.yml`](.github/workflows/nightly-security.yml) | Scheduled filesystem scanning and dependency audit. |

```mermaid
flowchart LR
    PR["Pull Request"] --> Install["Install + prisma generate"]
    Install --> Affected["Nx affected test/build"]
    Affected --> Merge["Merge to master"]

    Merge --> Coverage["Coverage + deployable builds"]
    Coverage --> Images["Build Docker images"]
    Images --> Scan["Trivy scan + SBOM/provenance"]
    Scan --> GHCR["Publish to GHCR"]
    GHCR --> Manifest["Release image manifest"]
    Manifest --> Staging["Deploy staging overlay"]
    Staging --> Smoke["Smoke checks"]
    Smoke --> Approval["Production approval"]
    Approval --> Prod["Deploy production overlay"]
```

## Observability And Security

### Observability Baseline

The shared runtime utilities in [`packages/utils/runtime`](packages/utils/runtime/index.ts) provide:

- structured logging with production JSON output and human-readable dev format
- `x-request-id` generation and propagation
- request completion logs
- Prometheus-compatible `/metrics` with counter, gauge, and histogram support
- process uptime and HTTP request metrics
- standardized `/healthz` and `/readyz`
- graceful shutdown helpers with configurable timeout

`kafka-service` adds worker metrics for processing latency, parse failures, dead-letter counts, readiness state, and management endpoints.

### Security Baseline

Current safeguards include:

- JWT verification and account hydration through shared middleware.
- Seller/user/admin role guards.
- OAuth state and PKCE-aware provider flows through Arctic.
- Stripe webhook signature verification with raw body parsing.
- Gateway rate limiting through environment-driven limits.
- AI Vision route-level rate limiting.
- Baseline browser and Express security headers.
- Kubernetes non-root execution, dropped capabilities, disabled privilege escalation, runtime-default seccomp, PDB/HPA manifests, and baseline NetworkPolicy resources.
- Trivy image/filesystem scans, SBOM/provenance generation, Dependabot, and scheduled security workflow.

## Architectural Tradeoffs

This section is intentionally candid about design decisions and their implications — these are the kinds of points that matter in system design discussions.

### Shared Persistence vs Database Per Service

**Decision**: All services share one MongoDB instance and Prisma client.

**Why**: Dramatically simpler local development, no distributed transactions, consistent typed access. At the current scale, the development velocity gain far outweighs the coupling cost.

**Cost**: Service independence is logical rather than physical. Schema migrations require cross-team coordination. A service can accidentally read another service's data at the ORM level.

**Mitigation path**: Clear code ownership boundaries, documented model contexts, and potential future migration to per-service schemas using MongoDB's multi-database support.

### Kafka For Analytics Only vs Broad Event Bus

**Decision**: Kafka is used exclusively for analytics materialization, not for cross-service domain events.

**Why**: Analytics has a clear async value proposition (user-facing latency decoupling). Expanding Kafka to general domain events would add operational complexity without proportional benefit at current scale.

**Cost**: Cross-service communication still relies on synchronous HTTP calls through the gateway.

### Request-Time Recommendation Scoring vs Offline Model Serving

**Decision**: Recommendations are computed in the request path with caching and TensorFlow-based fallback logic.

**Why**: Simpler infrastructure — no separate model-serving pipeline, no offline batch jobs for scoring.

**Cost**: Recommendation API latency includes scoring time. Scaling recommendation traffic is more expensive than serving from a precomputed index.

### Monorepo vs Multi-Repo

**Decision**: Everything lives in one Nx-managed monorepo.

**Why**: Shared packages are trivial to evolve. Cross-service refactors are atomic. CI uses Nx-aware affected builds to avoid redundant work.

**Cost**: Repo size and cognitive load grow. Shared packages can create accidental coupling if discipline slips.

### Product-Service Scope

**Decision**: `product-service` owns catalog, shops, search, pricing, discounts, events, and offers.

**Why**: These domains are tightly coupled in the business logic — a discount references a product which belongs to a shop.

**Cost**: High blast radius. A bug in discount logic could affect search or event listing.

## Production Readiness

### Strong Signals

- Clear app and service boundaries with intentional decomposition.
- Buyer and seller frontends separated by persona.
- Orders and AI workloads isolated from core catalog logic.
- Kafka analytics pipeline with exactly-once production, DLQ, schema contracts, and health probes.
- Shared runtime utilities standardize health, readiness, metrics, logging, CORS, security headers, and shutdown across all services.
- Shared test utilities reduce duplicated mocking and setup.
- Docker Compose, Dockerfiles, Kustomize overlays, CI, image publishing, scanning, and deployment workflows are present.
- SASL/SSL-capable Kafka client for production broker authentication.

### Areas For Future Hardening

- Secrets management is environment/Kubernetes-secret based today; external secret management (Vault, AWS Secrets Manager) and rotation workflows are future items.
- Validation rigor is strongest in AI Vision and the Kafka pipeline; other backend services would benefit from similar Zod coverage.
- Frontend automated test coverage is not as visible as backend service coverage.
- Recommendation serving would benefit from a precomputed index or offline model pipeline at higher scale.
- `aivision-service` combines API routes and Agenda jobs; production scaling may split API and worker roles.

## Documentation Guide

The canonical documentation starts at [`docs/README.md`](docs/README.md).

Recommended reading path:

1. [`docs/00-overview/product-overview.md`](docs/00-overview/product-overview.md)
2. [`docs/00-overview/business-context.md`](docs/00-overview/business-context.md)
3. [`docs/00-overview/repo-map.md`](docs/00-overview/repo-map.md)
4. [`docs/01-getting-started/local-development.md`](docs/01-getting-started/local-development.md)
5. [`docs/01-getting-started/environment-variables.md`](docs/01-getting-started/environment-variables.md)
6. [`docs/02-architecture/system-overview.md`](docs/02-architecture/system-overview.md)
7. [`docs/02-architecture/service-topology.md`](docs/02-architecture/service-topology.md)
8. [`docs/02-architecture/request-flows.md`](docs/02-architecture/request-flows.md)
9. [`docs/02-architecture/event-flows.md`](docs/02-architecture/event-flows.md)
10. [`docs/02-architecture/data-architecture.md`](docs/02-architecture/data-architecture.md)
11. [`docs/07-quality-and-operations/testing-strategy.md`](docs/07-quality-and-operations/testing-strategy.md)
12. [`docs/07-quality-and-operations/ci-cd.md`](docs/07-quality-and-operations/ci-cd.md)
13. [`docs/DevOps/kubernetes-deployment-guide.md`](docs/DevOps/kubernetes-deployment-guide.md)

Architecture decisions are captured under [`docs/08-decisions`](docs/08-decisions):

- [ADR-001: Monorepo And Nx](docs/08-decisions/adr-001-monorepo-and-nx.md)
- [ADR-002: MongoDB With Prisma](docs/08-decisions/adr-002-mongodb-with-prisma.md)
- [ADR-003: API Gateway Pattern](docs/08-decisions/adr-003-api-gateway-pattern.md)
- [ADR-004: Kafka Analytics Pipeline](docs/08-decisions/adr-004-kafka-analytics-pipeline.md)
- [ADR-005: AI Vision Service Boundary](docs/08-decisions/adr-005-ai-vision-service-boundary.md)

For interview-style system design prep, see [`docs/09-interview-prep`](docs/09-interview-prep) and the learning path under [`docs/learn`](docs/learn/README.md).
