# Technical Architecture

## System Overview

Artistry Cart is built on a **microservices architecture** designed for scalability, maintainability, and flexibility.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    CLIENTS                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│    ┌─────────────┐      ┌─────────────┐       ┌─────────────┐                      │
│    │   Web App   │      │ Mobile App  │       │   Admin     │                      │
│    │  (Next.js)  │      │   (React    │       │ Dashboard   │                      │
│    │             │      │   Native)   │       │             │                      │
│    └──────┬──────┘      └──────┬──────┘       └──────┬──────┘                      │
│           │                    │                     │                              │
└───────────┼────────────────────┼─────────────────────┼──────────────────────────────┘
            │                    │                     │
            └────────────────────┼─────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│    ┌─────────────────────────────────────────────────────────────────────────┐     │
│    │                       Kong / Express Gateway                             │     │
│    │  • Rate Limiting  • Authentication  • Load Balancing  • Logging         │     │
│    └─────────────────────────────────────────────────────────────────────────┘     │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                            MICROSERVICES                                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │   Auth   │ │   User   │ │ Product  │ │  Order   │ │ Payment  │ │   Chat   │    │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │ │ Service  │ │ Service  │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
│                                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ Notific- │ │   AI     │ │  Search  │ │ Recom-   │ │  Media   │ │ Shipping │    │
│  │  ation   │ │  Vision  │ │ Service  │ │ mendation│ │ Service  │ │ Service  │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  PostgreSQL  │  │    Redis     │  │Elasticsearch │  │  AWS S3 /    │            │
│  │  (Primary    │  │   (Cache &   │  │  (Search &   │  │  Cloudinary  │            │
│  │   Database)  │  │   Sessions)  │  │   Full-text) │  │   (Media)    │            │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SERVICES                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│  │  Stripe  │ │  OpenAI  │ │ SendGrid │ │  Twilio  │ │  Shippo  │                  │
│  │ Payments │ │ DALL-E 3 │ │  Email   │ │   SMS    │ │ Shipping │                  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘                  │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Web Application** | Next.js 15 + React 19 | SSR, routing, performance |
| **Styling** | TailwindCSS + custom design system | Consistent, responsive UI |
| **State Management** | Zustand / TanStack Query | Client state, server caching |
| **Forms** | React Hook Form + Zod | Validation, UX |
| **Animation** | Framer Motion + GSAP | Premium interactions |
| **3D/AI Visualization** | Three.js / React Three Fiber | Product visualization |

### Backend

| Component | Technology | Purpose |
|-----------|------------|---------|
| **API Framework** | NestJS | Modular microservices |
| **Language** | TypeScript | Type safety |
| **Database ORM** | Prisma | Type-safe queries |
| **Validation** | class-validator + class-transformer | Request validation |
| **Queue** | BullMQ | Background jobs |
| **Real-time** | Socket.io | Live chat, notifications |

### Data Storage

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Primary Database** | PostgreSQL | Transactional data |
| **Cache** | Redis | Sessions, caching, pub/sub |
| **Search Engine** | Elasticsearch | Full-text search, filters |
| **Media Storage** | AWS S3 / Cloudinary | Images, videos |
| **CDN** | CloudFront / Cloudinary | Asset delivery |

### Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Container** | Docker | Consistent environments |
| **Orchestration** | Kubernetes / Docker Compose | Service management |
| **CI/CD** | GitHub Actions | Automated deployments |
| **Cloud Provider** | AWS / GCP / Vercel | Hosting |
| **Monitoring** | DataDog / Sentry | Observability |

---

## Microservices Detail

### Auth Service

**Purpose**: Handle authentication, authorization, OAuth providers

```typescript
// Endpoints
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/oauth/:provider        // Google, Apple, Facebook
GET    /auth/oauth/:provider/callback
```

**Technologies**: JWT, bcrypt, OAuth 2.0, Redis sessions

---

### User Service

**Purpose**: User profiles, preferences, seller management

```typescript
// Endpoints
GET    /users/me
PATCH  /users/me
GET    /users/:id
GET    /users/:id/public-profile

// Seller-specific
POST   /sellers/apply
GET    /sellers/:id/shop
PATCH  /sellers/:id/shop
GET    /sellers/:id/analytics
```

**Data Models**:
- User (buyer/seller/admin)
- SellerProfile
- UserPreferences
- Verification

---

### Product Service

**Purpose**: Product catalog, categories, inventory

```typescript
// Endpoints
GET    /products
GET    /products/:id
POST   /products                    // Seller
PATCH  /products/:id                // Seller
DELETE /products/:id                // Seller

GET    /categories
GET    /products/:id/reviews
POST   /products/:id/reviews        // Buyer
```

**Data Models**:
- Product
- Category
- ProductVariant
- ProductImage
- Review
- Wishlist

---

### Order Service

**Purpose**: Order management, cart, fulfillment

```typescript
// Endpoints
GET    /orders
GET    /orders/:id
POST   /orders
PATCH  /orders/:id/status           // Seller

// Cart
GET    /cart
POST   /cart/items
PATCH  /cart/items/:id
DELETE /cart/items/:id

// Custom Orders (AI Vision)
POST   /custom-orders
GET    /custom-orders/:id
PATCH  /custom-orders/:id/proposal  // Seller
POST   /custom-orders/:id/accept    // Buyer
```

**Data Models**:
- Order
- OrderItem
- Cart
- CartItem
- CustomOrder
- Milestone

---

### Payment Service

**Purpose**: Payment processing, escrow, payouts

```typescript
// Endpoints
POST   /payments/create-intent
POST   /payments/confirm
GET    /payments/:id
POST   /refunds

// Escrow
POST   /escrow/create
POST   /escrow/:id/release
POST   /escrow/:id/dispute

// Payouts (Sellers)
GET    /payouts
POST   /payouts/request
```

**Integration**: Stripe Connect (multi-party payments)

---

### Chat Service

**Purpose**: Real-time messaging between buyers and sellers

```typescript
// REST Endpoints
GET    /conversations
GET    /conversations/:id/messages
POST   /conversations
POST   /conversations/:id/messages

// WebSocket Events
connection
join_conversation
leave_conversation
send_message
receive_message
typing_start
typing_stop
```

**Technologies**: Socket.io, Redis pub/sub

---

### AI Vision Service

**Purpose**: Generate product concepts from text descriptions

```typescript
// Endpoints
POST   /vision/generate
POST   /vision/refine
GET    /vision/sessions/:id
POST   /vision/sessions/:id/save

// Matching
POST   /vision/match-artisans
```

**Integration**: OpenAI DALL-E 3, Stable Diffusion

**Flow**:
1. User provides text description
2. Service calls AI image generation API
3. Returns multiple concept images
4. User can refine with follow-up prompts
5. Final concept saved and shared with artisans

---

### Notification Service

**Purpose**: Multi-channel notifications

```typescript
// Endpoints
GET    /notifications
PATCH  /notifications/:id/read
PATCH  /notifications/read-all
GET    /notifications/preferences
PATCH  /notifications/preferences
```

**Channels**:
- In-app (WebSocket)
- Email (SendGrid)
- SMS (Twilio)
- Push (Firebase)

---

### Search Service

**Purpose**: Full-text search, filtering, faceted search

```typescript
// Endpoints
GET    /search?q=...
GET    /search/suggestions
GET    /search/trending
POST   /search/index           // Internal
```

**Integration**: Elasticsearch

---

### Media Service

**Purpose**: File upload, processing, optimization

```typescript
// Endpoints
POST   /media/upload
GET    /media/:id
DELETE /media/:id
POST   /media/:id/process       // Resize, optimize
```

**Integration**: Cloudinary / AWS S3 + Lambda

---

## Database Schema (Core Entities)

```sql
-- Users
users (id, email, password_hash, role, created_at, updated_at)
seller_profiles (user_id, shop_name, bio, avatar, verified, rating)
user_preferences (user_id, notifications, currency, language)

-- Products
products (id, seller_id, title, description, price, category_id, status)
product_variants (id, product_id, name, price_modifier, stock)
product_images (id, product_id, url, position, is_primary)
categories (id, name, slug, parent_id)
reviews (id, product_id, user_id, rating, content, created_at)

-- Orders
orders (id, buyer_id, seller_id, status, total, created_at)
order_items (id, order_id, product_id, variant_id, quantity, price)
carts (id, user_id, updated_at)
cart_items (id, cart_id, product_id, variant_id, quantity)

-- Custom Orders
custom_orders (id, buyer_id, concept_image_url, description, status)
custom_order_proposals (id, custom_order_id, seller_id, price, message)
custom_order_milestones (id, custom_order_id, title, amount, status)

-- Payments
payments (id, order_id, stripe_payment_intent, amount, status)
escrows (id, custom_order_id, amount, status, released_at)
payouts (id, seller_id, amount, status, processed_at)

-- Chat
conversations (id, buyer_id, seller_id, product_id, created_at)
messages (id, conversation_id, sender_id, content, created_at)

-- AI Vision
vision_sessions (id, user_id, prompt, images, created_at)
vision_saved (id, session_id, image_url, title)
```

---

## Security Considerations

### Authentication & Authorization

- JWT tokens with short expiry (15min access, 7d refresh)
- Role-based access control (RBAC)
- OAuth 2.0 for social login
- Rate limiting per user/IP
- Brute force protection

### Data Protection

- HTTPS everywhere
- Encryption at rest (database)
- PCI DSS compliance (payments via Stripe)
- GDPR compliance (EU users)
- Regular security audits

### API Security

- Input validation (all endpoints)
- SQL injection prevention (Prisma ORM)
- XSS prevention (sanitized output)
- CORS configuration
- API key rotation

---

## Deployment Architecture

### Development

```bash
docker-compose up -d
# All services run locally with hot-reload
```

### Staging

- Kubernetes cluster (GKE/EKS)
- Separate database instance
- Full service mesh
- E2E testing environment

### Production

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE                              │
│                    (CDN, DDoS Protection)                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      LOAD BALANCER                              │
│                   (AWS ALB / GCP LB)                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    KUBERNETES CLUSTER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Pod 1     │  │   Pod 2     │  │   Pod 3     │             │
│  │  (Service)  │  │  (Service)  │  │  (Service)  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐           │
│  │              Horizontal Pod Autoscaler          │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MANAGED SERVICES                           │
├─────────────────────────────────────────────────────────────────┤
│  • AWS RDS (PostgreSQL)                                         │
│  • AWS ElastiCache (Redis)                                      │
│  • AWS OpenSearch (Elasticsearch)                               │
│  • AWS S3 (Media Storage)                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Monitoring & Observability

| Tool | Purpose |
|------|---------|
| **DataDog** | Infrastructure monitoring, APM |
| **Sentry** | Error tracking, alerting |
| **Prometheus + Grafana** | Metrics dashboards |
| **ELK Stack** | Log aggregation, analysis |
| **PagerDuty** | On-call alerting |

---

*This architecture is designed to scale from MVP to millions of users.*
