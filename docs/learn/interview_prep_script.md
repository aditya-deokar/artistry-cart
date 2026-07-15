# Artistry Cart — Interview Preparation Script

> This script is structured as a full walkthrough of the Artistry Cart project. Each section has:
> - **What the interviewer wants to hear** — the intent behind the question
> - **Your answer script** — what to say, explained from first principles
> - **Mermaid diagrams** — visual aids with walkthroughs
> - **Code references** — exact files to cite if asked "show me where"

---

## 1. Why Did You Build It?

### What The Interviewer Wants To Hear
They want to know if you can **identify a real problem** and if you built this to learn or to solve something meaningful. They're also gauging whether you think about users, not just technology.

### Your Answer

> I built Artistry Cart because I wanted to solve a real problem while learning production-grade engineering patterns.
>
> The problem: Artisan creators — people who make handmade jewelry, custom art, crafts — don't have a good e-commerce platform. Generic platforms like Amazon or Shopify aren't designed for their workflow. They need shop pages that tell their story, AI-assisted product visualization, event-based sales (craft fairs, seasonal), and flexible discount structures.
>
> I chose this problem specifically because it naturally requires interesting engineering: **multiple user personas** (buyers and sellers), **payment flows** with Stripe, **event-driven analytics**, **AI capabilities** for product generation and visual search, and **multi-service architecture** to handle different domains at different scales.
>
> It's not a tutorial project. It has production features: webhook-verified payments, OAuth, rate limiting, graceful shutdown, Prometheus metrics, Kubernetes manifests, and a full CI/CD pipeline.

---

## 2. Problem Statement

### What The Interviewer Wants To Hear
Can you articulate the problem clearly, identify the stakeholders, and describe the core user flows?

### Your Answer

> Artistry Cart serves **two personas** with fundamentally different needs:
>
> **Buyers** want to: discover artisan products, search visually, add to cart/wishlist, checkout securely, track orders, and get personalized recommendations.
>
> **Sellers** want to: onboard their shop, manage products with pricing and images, create time-bound events and discount codes, track orders and earnings, request payouts, and use AI to generate product concepts.
>
> The **core flows** are:
> 1. **Discovery** → Browse, search, AI-powered visual search
> 2. **Purchase** → Cart → Checkout → Stripe payment → Order tracking
> 3. **Seller Operations** → Product management → Order fulfillment → Earnings/payouts
> 4. **Analytics** → User activity captured asynchronously → Materialized into recommendation data

### Persona Flow Diagram

```mermaid
flowchart LR
    subgraph Buyer["Buyer Persona"]
        B1["Browse & Search"] --> B2["Add to Cart/Wishlist"]
        B2 --> B3["Checkout via Stripe"]
        B3 --> B4["Track Order"]
        B1 --> B5["AI Visual Search"]
        B5 --> B2
    end

    subgraph Seller["Seller Persona"]
        S1["Register & Onboard Shop"] --> S2["Add Products"]
        S2 --> S3["Create Events & Discounts"]
        S3 --> S4["Receive Orders"]
        S4 --> S5["Manage Earnings & Payouts"]
        S2 --> S6["AI Product Generation"]
    end

    subgraph Platform["Platform Intelligence"]
        P1["Capture User Activity"] --> P2["Materialize Analytics"]
        P2 --> P3["Power Recommendations"]
    end

    Buyer -.-> Platform
```

> **Walkthrough**: The buyer flow is left-to-right — discovery through purchase. The seller flow is top-down — onboarding through earnings. Both feed into the platform intelligence layer, where user activity events are captured asynchronously through Kafka and materialized for recommendations.

---

## 3. Architecture

### What The Interviewer Wants To Hear
This is the most important section. They want to see that you can **explain architectural decisions**, not just list technologies. Why microservices? Why this split? Why not just a monolith?

### Your Answer

> The architecture is a **service-oriented monorepo** — multiple independently deployable services living in one Nx-managed repository. It's not a pure microservices architecture (we share a database), but it's not a monolith either. I'll explain why.

### High-Level Architecture

```mermaid
flowchart TB
    subgraph Clients["Client Layer"]
        BuyerBrowser["Buyer Browser"]
        SellerBrowser["Seller Browser"]
    end

    subgraph Frontends["Frontend Layer (Next.js 15 + React 19)"]
        UserUI["user-ui :3000"]
        SellerUI["seller-ui :3001"]
    end

    subgraph Edge["Edge Layer"]
        Gateway["api-gateway :8080<br/>CORS, Rate Limit, Proxy"]
    end

    subgraph Services["Domain Services (Express + Node.js)"]
        Auth["auth-service :6001<br/>Identity, OAuth, JWT"]
        Product["product-service :6002<br/>Catalog, Shops, Search"]
        Order["order-service :6004<br/>Checkout, Stripe, Payouts"]
        Reco["recommendation-service :6005<br/>Scoring, Fallbacks"]
        AI["aivision-service :6006<br/>Generation, Visual Search"]
    end

    subgraph Async["Async Processing"]
        Kafka["Kafka (KRaft)"]
        Worker["kafka-service<br/>Analytics Worker"]
    end

    subgraph State["State Layer"]
        Mongo["MongoDB (Prisma)"]
        Redis["Redis"]
    end

    subgraph External["External Services"]
        Stripe["Stripe"]
        OAuth["Google/GitHub/Facebook OAuth"]
        Gemini["Google Gemini"]
        HF["Hugging Face"]
        IK["ImageKit"]
    end

    BuyerBrowser --> UserUI
    SellerBrowser --> SellerUI
    UserUI --> Gateway
    SellerUI --> Gateway

    Gateway --> Auth
    Gateway --> Product
    Gateway --> Order
    Gateway --> Reco
    Gateway --> AI

    UserUI -.->|"user activity"| Kafka
    Order -.->|"purchase outbox"| Kafka
    Kafka --> Worker

    Auth & Product & Order & Reco & AI & Worker --> Mongo
    Auth & Order --> Redis
    Order --> Stripe
    Auth --> OAuth
    AI --> Gemini & HF & IK
```

> **Walkthrough — Read this diagram in layers:**
>
> **Layer 1 — Clients & Frontends**: Two separate Next.js apps for two personas. This is intentional — a buyer's UX (browsing, visual search, checkout) has nothing in common with a seller's UX (dashboard, product management, earnings). Separate apps mean separate deployment and independent UX evolution.
>
> **Layer 2 — Edge (API Gateway)**: Every backend request goes through one entry point. The gateway handles CORS, rate limiting, request ID generation, and proxies to the correct service. It does NOT do business logic — it's a thin routing layer.
>
> **Layer 3 — Domain Services**: Each service owns a business domain. The splits follow **fault isolation boundaries**:
> - Auth is isolated because identity has its own security surface
> - Orders are isolated because payment bugs shouldn't crash the catalog
> - AI Vision is isolated because AI workloads have fundamentally different latency and scaling characteristics
>
> **Layer 4 — Async Processing**: User activity events flow through Kafka to a dedicated worker that materializes analytics. This is intentionally asynchronous — a buyer clicking "view product" should not wait for analytics to finish writing.
>
> **Layer 5 — State**: All services share one MongoDB through Prisma. This is the biggest architectural tradeoff (we'll discuss why in Section 8).

### Why Not A Monolith?

> A monolith would be simpler, but:
> - AI workloads (Gemini, embedding computation) would compete for CPU with checkout
> - A bug in discount calculation shouldn't bring down auth
> - Kafka consumer lag shouldn't affect buyer-facing latency
> - Different parts of the system scale differently
>
> But I didn't go full microservices either — I kept a shared database because at this scale, the development velocity gain of a shared Prisma schema outweighs the coupling cost.

### Request Flow Detail

```mermaid
sequenceDiagram
    participant B as Buyer Browser
    participant UI as user-ui (Next.js)
    participant G as api-gateway
    participant S as Backend Service
    participant DB as MongoDB

    B->>UI: Click / Navigate
    UI->>UI: SSR or Client-side fetch
    UI->>G: GET/POST /auth/api/* or /product/api/*
    Note over G: CORS check<br/>Rate limit check<br/>Attach x-request-id
    G->>S: Proxy request (express-http-proxy)
    S->>S: JWT verification (shared middleware)
    S->>DB: Prisma query
    DB-->>S: Result
    S-->>G: JSON response
    G-->>UI: Proxied response
    UI-->>B: Rendered page or data
```

> **Walkthrough**: Every request follows this exact path. The key insight is that **security is layered**:
> 1. The gateway enforces rate limits and CORS
> 2. Each service independently verifies JWTs using shared middleware
> 3. Role guards (`isSeller`, `isUser`) enforce authorization after authentication
> 
> The gateway doesn't verify tokens — it just routes. This means services can function independently in tests without the gateway.

---

## 4. Database Design

### What The Interviewer Wants To Hear
They want to understand your **data modeling decisions**, how you handle relationships in a document database, and whether you understand the tradeoffs of your schema design.

### Your Answer

> I use MongoDB with Prisma ORM. The schema has **~35 models** organized into 6 bounded contexts, even though they all live in one database.

### Data Model Map

```mermaid
erDiagram
    users ||--o{ orders : places
    users ||--o{ addresses : has
    users ||--o| UserAnalytics : tracks
    users ||--o{ shopReviews : writes
    users ||--o{ Notification : receives

    sellers ||--o| shops : owns
    shops ||--o{ products : lists
    shops ||--o{ shopAnalytics : tracked_by
    shops ||--o{ orders : receives

    products ||--o{ OrderItem : ordered_as
    products ||--o| ProductPricing : priced_by
    products ||--o| productAnalytics : tracked_by
    products ||--o{ ProductEmbedding : embedded_as

    orders ||--o{ OrderItem : contains
    orders ||--o| payments : paid_via
    orders ||--o{ refunds : refunded_by

    sellers ||--o{ payouts : receives

    events ||--o{ EventProductDiscount : discounts
    discount_codes ||--o{ discount_usage : used_in

    VisionSession ||--o{ Concept : generates
    Concept ||--o{ ConceptImage : has
    Concept ||--o{ ArtisanMatch : matched_to
```

> **Walkthrough — Bounded contexts in this diagram:**
>
> | Context | Key Models | Owning Service |
> | --- | --- | --- |
> | **Identity** | `users`, `sellers`, `addresses` | auth-service |
> | **Catalog** | `products`, `shops`, `ProductPricing`, `events`, `discount_codes` | product-service |
> | **Orders** | `orders`, `OrderItem`, `payments`, `payouts`, `refunds` | order-service |
> | **Analytics** | `UserAnalytics`, `productAnalytics`, `shopAnalytics`, `analyticsOutbox` | kafka-service (write), recommendation-service (read) |
> | **AI Vision** | `VisionSession`, `Concept`, `ConceptImage`, `ProductEmbedding` | aivision-service |
>
> **Key design decisions:**
> - `password` on `users` is **optional** (`String?`) — because OAuth users don't have passwords
> - `OrderItem` stores `price` and `originalPrice` at time of purchase — this is **point-in-time snapshotting**. If a seller changes their price later, existing orders don't change.
> - `analyticsOutbox` implements the **Transactional Outbox Pattern** — events are written to the DB first, then a background process publishes to Kafka. This solves the dual-write problem.
> - Analytics models (`UserAnalytics`) use MongoDB's flexible `Json` fields for action history arrays, since the shape evolves.

### Why Shared Database?

> This is the most common follow-up. The honest answer:
>
> **Pros**: One `prisma generate`. One MongoDB instance locally. No distributed transactions. Consistent types across services. Dramatically faster development.
>
> **Cons**: Services can accidentally read each other's data. Schema migrations need coordination. True service independence is logical, not physical.
>
> **Mitigation**: Code ownership boundaries are documented. Each service only imports the models it owns. The Prisma schema file has comments marking which service owns which models.

---

## 5. Authentication

### What The Interviewer Wants To Hear
They want to know if you understand **security fundamentals**: token lifecycle, cookie security, OAuth flows, and how auth propagates across services.

### Your Answer

> The auth system supports two strategies: **email/password with JWT** and **OAuth 2.0 with Google, GitHub, and Facebook**.

### Authentication Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant UI as user-ui
    participant G as api-gateway
    participant A as auth-service
    participant DB as MongoDB
    participant P as OAuth Provider

    Note over B,P: Strategy 1: Email/Password
    B->>UI: Submit login form
    UI->>G: POST /auth/api/login-user
    G->>A: Proxy
    A->>DB: Find user by email
    A->>A: bcrypt.compare(password, hash)
    A->>A: jwt.sign(accessToken, 15m expiry)
    A->>A: jwt.sign(refreshToken, 7d expiry)
    A-->>B: Set HTTPOnly cookies + user data

    Note over B,P: Strategy 2: OAuth (Google example)
    B->>UI: Click "Login with Google"
    UI->>G: GET /auth/api/oauth/google/login
    G->>A: Proxy
    A->>A: Generate state + PKCE code verifier
    A-->>B: Set state in HTTPOnly cookie + redirect to Google
    B->>P: User authorizes on Google
    P-->>A: Callback with code + state
    A->>A: Validate state from cookie (CSRF protection)
    A->>P: Exchange code for tokens via Arctic
    P-->>A: Access token
    A->>P: Fetch user profile with access token
    A->>DB: Find or create user
    A->>A: Generate JWT pair
    A-->>B: Set cookies + redirect to frontend
```

> **Walkthrough — key security decisions:**
>
> **HTTPOnly cookies**: Tokens are stored in `httpOnly: true` cookies, not localStorage. This prevents XSS attacks from stealing tokens. The cookie settings also adapt: `secure: true` and `sameSite: "none"` in production, `sameSite: "lax"` in development.
>
> **Short-lived access tokens**: Access tokens expire in **15 minutes**. Refresh tokens last **7 days**. When the access token expires, the frontend calls `/auth/api/refresh-token`, which verifies the refresh token, looks up the user in the DB, and issues a new pair.
>
> **OAuth CSRF protection**: Before redirecting to Google/GitHub/Facebook, the server generates a random `state` parameter and stores it in an HTTPOnly cookie. When the OAuth provider calls back, the server compares the callback state with the cookie value. If they don't match, the request is rejected.
>
> **PKCE (Proof Key for Code Exchange)**: Google OAuth uses PKCE — a `code_verifier` is generated and stored in a cookie, and the `code_challenge` is sent to Google. This prevents authorization code interception attacks.

### Token Verification Across Services

```mermaid
flowchart LR
    Request["Incoming Request"] --> Cookie["Extract token from cookie<br/>or Authorization header"]
    Cookie --> Verify["jwt.verify(token, ACCESS_TOKEN_SECRET)"]
    Verify -->|Valid| Decode["Decode { id, role }"]
    Decode --> Lookup["Prisma: find user or seller by ID"]
    Lookup -->|Found| Hydrate["Attach to req.user and req.role"]
    Hydrate --> RoleCheck["Role guard: isSeller? isUser? isAdmin?"]
    RoleCheck -->|Authorized| Handler["Route handler executes"]

    Verify -->|Expired| E401a["401: Token expired"]
    Verify -->|Invalid| E401b["401: Invalid token"]
    Lookup -->|Not found| E401c["401: Account not found"]
    RoleCheck -->|Wrong role| E403["403: Access denied"]
```

> **Walkthrough**: This is the `isAuthenticated` middleware in [packages/middleware/isAuthenticated.ts](file:///c:/Users/adity/Desktop/Artistry%20Cart/artistry-cart/packages/middleware/isAuthenticated.ts). It's a **shared package** — every service uses the same middleware. The token carries `{ id, role }` where role is either `"user"` or `"seller"`. After verification, the middleware does a DB lookup to hydrate the full user/seller object onto `req.user`.

---

## 6. APIs

### What The Interviewer Wants To Hear
They want to know how your services communicate, what your API design looks like, and whether you've thought about API contracts.

### Your Answer

> All inter-service communication for the request path goes through the **API Gateway**, which is a simple Express proxy. There's no service-to-service communication — if `order-service` needs user data, it queries the shared database directly (tradeoff of shared persistence).

### Gateway Routing Map

```mermaid
flowchart LR
    Client["Frontend Client"] --> Gateway["api-gateway :8080"]

    Gateway -->|"/auth/*"| Auth["auth-service :6001"]
    Gateway -->|"/product/*"| Product["product-service :6002"]
    Gateway -->|"/order/*"| Order["order-service :6004"]
    Gateway -->|"/recommendation/*"| Reco["recommendation-service :6005"]
    Gateway -->|"/ai-vision/*"| AI["aivision-service :6006"]
```

> **Key API design patterns**:
>
> **1. Gateway as a thin router**: The gateway uses `express-http-proxy` — it forwards the entire request including cookies, headers, and body. It doesn't transform anything. This keeps it simple and debuggable.
>
> **2. RESTful conventions**: Routes follow `/{service}/api/{resource}/{action}` patterns. Examples:
> - `POST /auth/api/login-user` — login
> - `GET /product/api/get-products` — list products
> - `POST /order/api/create-payment-session` — start checkout
> - `GET /recommendation/api/recommendations` — get recommendations
>
> **3. Stripe webhooks bypass JSON parsing**: The webhook route is mounted **before** `express.json()` in [order-service/main.ts](file:///c:/Users/adity/Desktop/Artistry%20Cart/artistry-cart/apps/order-service/src/main.ts). This preserves the raw body needed for `stripe.webhooks.constructEvent()` signature verification.
>
> **4. Shared error handling**: All services use `@artistry-cart/error-handler` which provides typed error classes (`AppError`, `AuthError`, `ValidationError`, `PrismaError`) and a unified error middleware that formats errors consistently.

---

## 7. Deployment

### What The Interviewer Wants To Hear
They want to see that you've thought about the **full lifecycle** — from local development to production deployment.

### Your Answer

### Deployment Pipeline

```mermaid
flowchart LR
    subgraph Dev["Local Development"]
        Code["Write Code"] --> Compose["docker compose up<br/>(infra + apps)"]
        Compose --> Test["pnpm test"]
    end

    subgraph CI["GitHub Actions CI"]
        PR["Pull Request"] --> Install["Install + prisma generate"]
        Install --> Affected["Nx affected:test + affected:build"]
        Affected --> Coverage["Coverage report"]
    end

    subgraph Publish["Build & Publish"]
        Merge["Merge to master"] --> DockerBuild["Build Docker images<br/>(backend + frontend Dockerfiles)"]
        DockerBuild --> Scan["Trivy security scan"]
        Scan --> SBOM["SBOM + Provenance"]
        SBOM --> GHCR["Push to GHCR"]
    end

    subgraph Deploy["Kubernetes Deployment"]
        GHCR --> Staging["kubectl apply -k overlays/staging"]
        Staging --> Smoke["Smoke checks"]
        Smoke --> Approval["Manual approval gate"]
        Approval --> Prod["kubectl apply -k overlays/production"]
    end

    Dev --> CI
    CI --> Publish
    Publish --> Deploy
```

> **Walkthrough**:
>
> **Local**: `docker compose -f docker/compose/docker-compose.infra.yml up -d` starts MongoDB, Redis, Kafka (KRaft mode), and Redpanda Console. Then services run via `pnpm exec nx serve <service-name>`.
>
> **CI**: GitHub Actions uses **Nx affected** to only test and build what changed — if I modify `auth-service`, it doesn't rebuild `aivision-service`. This keeps CI fast.
>
> **Image publishing**: Two Dockerfiles — one for backend services, one for frontends. Both use multi-stage builds. The build argument `APP_NAME` determines which service gets built. Images are scanned with Trivy and published to GHCR with SBOM and provenance attestations.
>
> **Kubernetes**: Uses **Kustomize** with three overlays (dev, staging, production). The base manifests define Deployments, Services, ConfigMaps, NetworkPolicies, and Ingress. Only `user-ui`, `seller-ui`, and `api-gateway` are public — everything else is `ClusterIP`.

### Kubernetes Topology

```mermaid
flowchart TD
    Internet --> Ingress["Ingress Controller"]
    Ingress --> UserUI["user-ui"]
    Ingress --> SellerUI["seller-ui"]
    Ingress --> Gateway["api-gateway"]

    Gateway --> Auth["auth-service<br/>ClusterIP"]
    Gateway --> Product["product-service<br/>ClusterIP"]
    Gateway --> Order["order-service<br/>ClusterIP"]
    Gateway --> Reco["recommendation-service<br/>ClusterIP"]
    Gateway --> AI["aivision-service<br/>ClusterIP"]

    Worker["kafka-service<br/>ClusterIP"] --> ManagedKafka["Managed Kafka"]
    Auth & Product & Order & Reco & AI & Worker --> ManagedMongo["Managed MongoDB"]
    Auth & Order --> ManagedRedis["Managed Redis"]
```

> **Key production decisions**: In production, stateful infrastructure (MongoDB, Redis, Kafka) is **managed** — not self-hosted in the cluster. The application workloads run in Kubernetes with non-root containers, dropped capabilities, and seccomp profiles.

---

## 8. Tradeoffs

### What The Interviewer Wants To Hear
This is where you show **engineering maturity**. They want to hear you talk honestly about decisions, not pretend everything is perfect.

### Your Answer

> Every architecture has tradeoffs. Here are the five most significant ones I made:

### Tradeoff Map

```mermaid
mindmap
  root["Artistry Cart Tradeoffs"]
    Shared DB
      Pro: Fast development, one prisma generate
      Pro: No distributed transactions
      Con: Weak service autonomy
      Con: Accidental cross-service reads possible
    Kafka Scope
      Pro: Analytics decoupled from request path
      Pro: Simpler than full event bus
      Con: Cross-service sync still uses HTTP
      Con: No event sourcing for domain events
    Monorepo
      Pro: Shared packages are trivial to evolve
      Pro: Atomic cross-service refactors
      Con: Repo size grows
      Con: Shared packages can create coupling
    No Circuit Breakers
      Pro: Simpler debugging
      Pro: Failures are explicit
      Con: Cascading failures possible
      Con: No automatic degradation
    Request-Time Recommendations
      Pro: No offline pipeline needed
      Pro: Simpler infrastructure
      Con: Scoring in request path adds latency
      Con: Harder to scale than precomputed index
```

> **How I'd discuss each one**:
>
> 1. **Shared DB vs database-per-service**: "I chose shared persistence because the development velocity gain at this scale far outweighs the coupling cost. I mitigate it through code ownership conventions and documented model boundaries. If the project scaled to multiple teams, I'd split databases using MongoDB's multi-database support."
>
> 2. **Kafka for analytics only**: "I deliberately limited Kafka to analytics. Adding Kafka for domain events (like 'order.created') would mean managing eventual consistency, sagas, and compensating transactions — a level of complexity that doesn't pay off at current scale."
>
> 3. **No circuit breakers**: "The gateway proxies directly to services without circuit breakers. If `auth-service` is down, requests fail immediately. I chose this because at current scale, explicit failures are easier to debug than automatic degradation. In production at scale, I'd add opossum or a similar library."

---

## 9. Biggest Challenge

### What The Interviewer Wants To Hear
They want a **real story** about a technical problem you solved, how you debugged it, and what you learned.

### Your Answer

> The hardest engineering problem was **the dual-write problem in analytics**.

### The Problem Explained

```mermaid
sequenceDiagram
    participant O as order-service
    participant DB as MongoDB
    participant K as Kafka

    Note over O,K: ❌ Naive approach (dual-write)
    O->>DB: Save order to database
    O->>K: Publish purchase event to Kafka
    Note over K: What if Kafka is down?<br/>Order is saved but event is lost.<br/>Analytics will never know about this purchase.

    Note over O,K: ❌ Reverse order?
    O->>K: Publish purchase event to Kafka
    O->>DB: Save order to database
    Note over DB: What if DB write fails?<br/>Event was published but order doesn't exist.<br/>Analytics will count a phantom purchase.
```

> **Walkthrough**: The problem is that you can't atomically write to both a database and a message broker. If you write to the DB first and Kafka fails, the event is lost. If you write to Kafka first and the DB fails, you have a phantom event. This is the **dual-write problem** — one of the most common distributed systems challenges.

### The Solution: Transactional Outbox Pattern

```mermaid
sequenceDiagram
    participant O as order-service
    participant DB as MongoDB
    participant Outbox as analyticsOutbox table
    participant Publisher as Outbox Publisher (background)
    participant K as Kafka

    Note over O,K: ✅ Transactional Outbox Pattern
    O->>DB: Save order to database
    O->>Outbox: Write event to analyticsOutbox (same DB transaction)
    Note over Outbox: Event is safely persisted<br/>Status: PENDING

    loop Every 5 seconds
        Publisher->>Outbox: Poll for PENDING records
        Outbox-->>Publisher: Batch of pending events
        Publisher->>Publisher: Claim record (optimistic lock)
        Publisher->>Publisher: Validate payload with Zod
        Publisher->>K: Publish via idempotent producer
        K-->>Publisher: ACK
        Publisher->>Outbox: Mark PUBLISHED
    end

    Note over Publisher,K: If publish fails:
    Publisher->>Outbox: Mark RETRY with exponential backoff
    Note over Outbox: Retried up to 8 times<br/>Then marked FAILED
```

> **Walkthrough**: The solution is the Transactional Outbox Pattern, implemented in [order-service/services/analytics-outbox.ts](file:///c:/Users/adity/Desktop/Artistry%20Cart/artistry-cart/apps/order-service/src/services/analytics-outbox.ts):
>
> 1. When a purchase happens, the order and the analytics event are written to the **same database** — the order to the `orders` collection, the event to the `analyticsOutbox` collection. Since both writes go to the same MongoDB, they're atomic.
> 2. A background publisher polls the outbox every 5 seconds, claims pending records with an optimistic lock (preventing duplicate processing), validates them with Zod, and publishes to Kafka using the idempotent producer.
> 3. If publication fails, the record gets exponential backoff (`1s → 2s → 4s → ... → 5min`) up to 8 attempts, then it's marked `FAILED`.
> 4. Stale locks (records stuck in `PROCESSING` for over 60 seconds) are automatically released.
>
> This was the hardest challenge because it required understanding **distributed systems guarantees** — you can't have exactly-once across two systems, but you can get effectively-once by combining an outbox with an idempotent producer.

---

## 10. Performance Optimization

### What The Interviewer Wants To Hear
They want specific, measurable optimizations — not vague claims about "making it faster."

### Your Answer

### Performance Strategy Map

```mermaid
flowchart TB
    subgraph FE["Frontend Performance"]
        SSR["Next.js SSR + ISR"]
        Standalone["Standalone output<br/>(minimal runtime)"]
        CodeSplit["Automatic code splitting"]
        ImageOpt["Next.js Image optimization"]
    end

    subgraph BE["Backend Performance"]
        Async["Async analytics via Kafka<br/>(off the request path)"]
        Redis_Cache["Redis caching for<br/>auth/order hot paths"]
        Graceful["Graceful Redis degradation<br/>(works without Redis)"]
        DBIndex["MongoDB indexes on<br/>userId, shopId, status"]
    end

    subgraph Kafka_Perf["Kafka Pipeline Performance"]
        Batch["Batch consumption<br/>(eachBatch, not eachMessage)"]
        ManualCommit["Manual offset commits<br/>(commit after processing)"]
        Idempotent["Idempotent producer<br/>(no duplicate writes)"]
        DLQ["DLQ for bad messages<br/>(no head-of-line blocking)"]
    end

    subgraph Ops["Operational Performance"]
        NxAffected["Nx affected builds<br/>(CI only rebuilds changes)"]
        MultiStage["Multi-stage Docker builds<br/>(small runtime images)"]
        HealthReady["Health + Readiness probes<br/>(no traffic to unready pods)"]
    end
```

> **Key optimizations to discuss:**
>
> 1. **Analytics off the request path**: When a buyer views a product, the analytics event goes to Kafka — not to a database call in the same request. This means the "view product" API responds in milliseconds, and analytics processing happens asynchronously.
>
> 2. **Batch consumption**: `kafka-service` uses `eachBatch` mode, not `eachMessage`. This means it processes events in batches and commits offsets once per batch, reducing the number of broker roundtrips.
>
> 3. **DLQ prevents head-of-line blocking**: If one bad event fails Zod validation, it goes to the dead-letter queue immediately. Without a DLQ, one malformed event would block all subsequent events in the partition.
>
> 4. **Redis with graceful degradation**: Redis is used for caching in auth and order flows, but the system works without it. If Redis is down, it falls back to direct database queries. This is better than crashing.
>
> 5. **Database indexes**: The Prisma schema has `@@index` on fields used in queries: `orders.userId`, `orders.shopId`, `orders.status`, `addresses.userId`.

---

## 11. Security

### What The Interviewer Wants To Hear
They want to know you understand **defense in depth** — multiple layers of security, not just one.

### Security Layers

```mermaid
flowchart TB
    subgraph Layer1["Layer 1: Transport"]
        CORS["CORS with explicit origins"]
        RateLimit["Rate limiting (per-IP)"]
        Headers["Security headers"]
        TLS["HTTPS in production"]
    end

    subgraph Layer2["Layer 2: Authentication"]
        JWT["JWT verification on every request"]
        HTTPOnly["HTTPOnly + Secure cookies"]
        ShortLived["15-minute access tokens"]
        RefreshRotation["Refresh token rotation"]
        OAuthState["OAuth state + PKCE"]
    end

    subgraph Layer3["Layer 3: Authorization"]
        RoleGuards["isSeller / isUser / isAdmin guards"]
        OwnerCheck["Ownership checks in controllers"]
        AIRateLimit["AI Vision per-route rate limiting"]
    end

    subgraph Layer4["Layer 4: Payment Security"]
        WebhookSig["Stripe webhook signature verification"]
        RawBody["Raw body parsing before JSON"]
        Idempotent2["Idempotent event processing"]
    end

    subgraph Layer5["Layer 5: Infrastructure"]
        NonRoot["Non-root containers"]
        Capabilities["Dropped Linux capabilities"]
        Seccomp["Seccomp runtime default"]
        NetworkPolicy["Kubernetes NetworkPolicies"]
        Trivy["Trivy image + filesystem scans"]
        Dependabot["Dependabot for dependency updates"]
    end

    Layer1 --> Layer2 --> Layer3 --> Layer4 --> Layer5
```

> **Walkthrough — the most important security decisions:**
>
> **Cookie security**: Tokens are stored in HTTPOnly cookies — JavaScript cannot read them. In production: `secure: true` (HTTPS only), `sameSite: "none"` (cross-site allowed for API-frontend split). The `setCookie` utility adapts automatically based on `NODE_ENV`.
>
> **Stripe webhook verification**: The Stripe webhook route is mounted BEFORE `express.json()` middleware. This is critical — `stripe.webhooks.constructEvent()` needs the **raw request body** to verify the signature. If JSON parsing runs first, the body is modified and signature verification fails. This is a common production mistake.
>
> **OAuth CSRF protection**: OAuth state is stored in an HTTPOnly cookie (not in the URL or localStorage). The callback validates that the returned state matches the cookie. This prevents CSRF attacks where an attacker initiates an OAuth flow and tricks the user into completing it.

---

## 12. Testing

### What The Interviewer Wants To Hear
They want to see a **testing strategy**, not just "I wrote tests."

### Testing Pyramid

```mermaid
flowchart TB
    subgraph Unit["Unit Tests (Fast, Isolated)"]
        Controllers["Controller logic tests"]
        Middleware["Middleware tests<br/>(isAuthenticated, authorizedRoles)"]
        ErrorHandler["Error handler tests"]
        Outbox["Analytics outbox logic tests"]
        Contract["Kafka contract validation tests"]
    end

    subgraph Integration["Integration Tests"]
        ProxyRouting["Gateway proxy routing tests"]
        OAuthFlows["OAuth flow integration tests"]
        KafkaConsumer["Kafka consumer batch tests"]
    end

    subgraph E2E["End-to-End Tests"]
        AuthE2E["auth-service-e2e"]
        ProductE2E["product-service-e2e"]
        OrderE2E["order-service-e2e"]
        GatewayE2E["api-gateway-e2e"]
        KafkaE2E["kafka-service-e2e"]
        AIE2E["aivision-service-e2e"]
    end

    subgraph Infra["Test Infrastructure"]
        TestCompose["docker-compose.test.yml<br/>MongoDB :27018, Redis :6380"]
        SharedMocks["packages/test-utils<br/>Factories, mocks, helpers"]
    end

    Unit --> Integration --> E2E
    Infra -.-> E2E
```

> **Key testing patterns:**
>
> **Shared test utilities**: `packages/test-utils` provides mock factories, auth helpers, request helpers, and shared setup. This prevents every service from reinventing test infrastructure.
>
> **Isolated test databases**: E2E tests use `docker-compose.test.yml` which starts MongoDB on port `27018` and Redis on `6380` — completely separate from development databases.
>
> **Nx workspace testing**: The root `vitest.config.mjs` includes all service test suites. `pnpm test` runs everything. `pnpm test:auth` runs only auth tests. CI uses `nx affected:test` to only run tests affected by the change.
>
> **OAuth unit testing**: OAuth controllers are tested by mocking the Arctic library providers. The tests verify state generation, CSRF validation, user creation/update, and token generation without calling real OAuth providers.

---

## 13. What Would You Improve?

### What The Interviewer Wants To Hear
This is a maturity check. They want to see that you can **critically evaluate your own work** and prioritize improvements.

### Your Answer

### Improvement Roadmap

```mermaid
flowchart LR
    subgraph P1["Priority 1: Resilience"]
        CB["Add circuit breakers<br/>to gateway proxies"]
        Retry["HTTP retry with<br/>exponential backoff"]
        Timeout["Per-route timeouts"]
    end

    subgraph P2["Priority 2: Observability"]
        Tracing["Distributed tracing<br/>(OpenTelemetry)"]
        Alerting["Consumer lag alerting<br/>rules in Prometheus"]
        Dashboard["Grafana dashboards<br/>per service"]
    end

    subgraph P3["Priority 3: Scale"]
        SplitDB["Split databases<br/>per service"]
        PrecomputedReco["Precomputed recommendation<br/>index (offline pipeline)"]
        SplitAIWorker["Split aivision-service<br/>API vs background jobs"]
    end

    subgraph P4["Priority 4: Developer Experience"]
        FrontendTests["Frontend automated tests"]
        SchemaRegistry["Kafka schema registry"]
        EventReplay["Event replay tooling"]
    end

    P1 --> P2 --> P3 --> P4
```

> **How to discuss each:**
>
> **Circuit breakers (Priority 1)**: "Right now, if auth-service goes down, all auth requests fail immediately. Adding `opossum` circuit breakers would let the gateway detect the failure pattern and fail fast without even attempting the request, reducing latency during outages."
>
> **Distributed tracing (Priority 2)**: "We already have correlation IDs in the Kafka pipeline and request IDs from the gateway. The next step is full OpenTelemetry integration so we can trace a request from the browser through the gateway, service, and database."
>
> **Database splitting (Priority 3)**: "The shared database works today, but if this were a multi-team project, I'd split into per-service databases. MongoDB makes this feasible — each service could have its own database on the same cluster initially, then migrate to separate clusters."
>
> **Precomputed recommendations (Priority 3)**: "Currently, recommendations are scored at request time. At scale, I'd move to an offline pipeline that precomputes recommendation scores and stores them in a fast lookup (Redis or Elasticsearch), reducing API latency."

---

## Quick Reference: Common Follow-up Questions

| Question | Key Point |
| --- | --- |
| "Why not use GraphQL?" | REST is simpler for this use case. Each service has clear resource boundaries. GraphQL adds resolver complexity without proportional benefit for this API surface. |
| "Why MongoDB and not Postgres?" | Schema flexibility for analytics (Json fields), natural fit for document-shaped product data (variants, images, options), and simpler horizontal scaling. |
| "How do you handle distributed transactions?" | We don't — that's the benefit of a shared database. The one case that needs cross-system atomicity (purchase → analytics) uses the Transactional Outbox Pattern. |
| "What happens if Kafka goes down?" | Analytics events accumulate in the outbox table. When Kafka recovers, the publisher drains the backlog. User-facing flows (browsing, checkout) are unaffected because Kafka is not in the request path. |
| "How do you prevent duplicate analytics?" | Three layers: (1) idempotent Kafka producer prevents duplicate writes, (2) outbox optimistic locking prevents duplicate publishing, (3) consumer deduplication via eventId. |
| "Why two separate frontends?" | Buyer and seller personas have zero UI overlap. Separate apps mean independent deployment, independent bundle sizes, and no conditional rendering based on user type. |
| "How would you scale this?" | Horizontal: add replicas behind k8s HPA. Database: read replicas or sharding. Kafka: add partitions. AI: separate API and worker processes. Recommendations: precomputed index. |
