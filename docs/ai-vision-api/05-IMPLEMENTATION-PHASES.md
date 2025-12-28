# AI Vision API - Implementation Phases

> **Document:** 05-IMPLEMENTATION-PHASES.md  
> **Updated:** December 28, 2024 (Post Technical Review)  
> **Total Duration:** 6-8 weeks

---

## 📅 Phase Overview

| Phase | Duration | Focus |
|-------|----------|-------|
| **1. Foundation** | Week 1 | Setup, database, middleware |
| **2. Core AI** | Week 2-3 | Gemini, LangGraph, error handling |
| **3. Generation APIs** | Week 3-4 | Text-to-Image, Variation, Product Gen |
| **4. Search APIs** | Week 4-5 | Visual Search, Embeddings |
| **5. Matching & Orders** | Week 5-6 | Artisan Matching, Custom Orders |
| **6. Polish & Deploy** | Week 6-8 | Testing, Docs, Optimization |

---

## 🔧 Phase 1: Foundation (Week 1)

### 1.1 Install Dependencies

```bash
cd apps/ai-vision
pnpm add @google/genai
pnpm add @langchain/core @langchain/google-genai @langchain/langgraph
pnpm add @huggingface/inference
pnpm add agenda sharp zod uuid winston jsonwebtoken
pnpm add express cors helmet morgan
pnpm add -D @types/cors @types/morgan @types/jsonwebtoken
```

### 1.2 Core Setup Tasks

- [ ] Create `src/app.ts` with Express config, CORS, helmet
- [ ] Create `src/config/index.ts` - environment variables
- [ ] Create `src/config/database.ts` - Prisma client
- [ ] Create `src/config/gemini.ts` - Gemini client (`@google/genai`)
- [ ] Create `src/config/queue.ts` - Agenda.js setup
- [ ] Create `src/utils/helpers/logger.ts` - Winston logger
- [ ] Create `src/utils/helpers/retry.ts` - Retry utility

### 1.3 Middleware

- [ ] `src/middleware/auth.middleware.ts` - JWT + session tokens
- [ ] `src/middleware/rate-limit.middleware.ts` - MongoDB-based
- [ ] `src/middleware/timeout.middleware.ts` - Request timeouts
- [ ] `src/middleware/error.middleware.ts` - Global error handler
- [ ] `src/middleware/validation.middleware.ts` - Zod validator

### 1.4 Database

- [ ] Add new models to `prisma/schema.prisma`
  - [ ] VisionSession, Concept, ConceptImage
  - [ ] AIGeneratedProduct
  - [ ] RateLimitEntry (for rate limiting)
  - [ ] ProductEmbedding (for visual search)
  - [ ] APIUsageLog
- [ ] Run `npx prisma generate`
- [ ] Create MongoDB TTL indexes
- [ ] Create vector search indexes

### Phase 1 Checklist
- [ ] Express app with health check
- [ ] All middleware working
- [ ] Prisma models generated
- [ ] Logger configured
- [ ] Environment variables set

---

## 🧠 Phase 2: Core AI (Week 2-3)

### 2.1 Gemini Setup

- [ ] Configure `genAI` with `@google/genai`
- [ ] Test text generation with `gemini-1.5-pro`
- [ ] Test image generation with `gemini-2.0-flash-exp`
- [ ] Verify image output format (base64)

### 2.2 Validation Schemas

- [ ] Create `src/validators/llm-schemas.ts`
  - [ ] `GeneratedProductSchema` with Zod
  - [ ] `safeParseLLMResponse()` function
- [ ] Create `src/validators/generation.validators.ts`
  - [ ] `TextToImageSchema`
  - [ ] `ProductVariationSchema`
  - [ ] `RefineConceptSchema`

### 2.3 LangGraph Workflow

- [ ] Create `src/agents/concept-generator.agent.ts`
  - [ ] `analyzeIntent` node
  - [ ] `enhancePrompt` node
  - [ ] `generateImages` node
  - [ ] `generateProduct` node
  - [ ] Error handling wrapper for all nodes
  - [ ] Conditional routing for partial success

### 2.4 Services

- [ ] `src/services/generation/gemini-image.service.ts`
  - [ ] Image generation with retry
  - [ ] Partial success handling
- [ ] `src/services/common/imagekit.service.ts`
  - [ ] Upload with data URI format
  - [ ] Thumbnail generation
  - [ ] Delete helper

### Phase 2 Checklist
- [ ] Gemini models responding
- [ ] LangGraph workflow executing
- [ ] Partial failures handled gracefully
- [ ] Images uploading to ImageKit
- [ ] LLM output validated with Zod

---

## 🎨 Phase 3: Generation APIs (Week 3-4)

### 3.1 Text-to-Image Endpoint

- [ ] Route: `POST /api/v1/ai/generate/text-to-image`
- [ ] Request validation
- [ ] Session creation in MongoDB
- [ ] Run LangGraph workflow
- [ ] Return concepts with images + product data

### 3.2 Product Variation Endpoint

- [ ] Route: `POST /api/v1/ai/generate/product-variation`
- [ ] Fetch base product
- [ ] Run variation workflow
- [ ] Calculate price adjustments
- [ ] Return variations + suggested artisans

### 3.3 Refinement Endpoint

- [ ] Route: `POST /api/v1/ai/generate/refine`
- [ ] Load original concept
- [ ] Run Gemini image editing
- [ ] Update product data
- [ ] Link to parent concept

### 3.4 Product Generation Service

- [ ] Create `src/services/generation/product-generator.service.ts`
- [ ] Prompt template with category constraints
- [ ] Validation against `site_config`
- [ ] Save to `AIGeneratedProduct`

### Phase 3 Checklist
- [ ] All generation endpoints working
- [ ] Sessions tracked
- [ ] Product data generated and validated
- [ ] Partial failures return partial results

---

## 🔍 Phase 4: Search APIs (Week 4-5)

### 4.1 Embedding Service

- [ ] `src/services/search/embedding.service.ts`
- [ ] CLIP embedding via HuggingFace
- [ ] MongoDB vector search query
- [ ] Similarity scoring

### 4.2 Visual Search Endpoint

- [ ] Route: `POST /api/v1/ai/search/visual`
- [ ] Image upload handling
- [ ] Embedding generation
- [ ] Vector search
- [ ] Filter application
- [ ] Return ranked products

### 4.3 Product Embedding Backfill

- [ ] Agenda.js job: `backfillProductEmbeddings`
- [ ] Process existing products
- [ ] Run on schedule or manual trigger

### Phase 4 Checklist
- [ ] Visual search returning results
- [ ] Search < 500ms
- [ ] Existing products have embeddings
- [ ] Filters working

---

## 👥 Phase 5: Matching & Orders (Week 5-6)

### 5.1 Artisan Matching

- [ ] Matching algorithm using `AIGeneratedProduct` data
- [ ] Score by: skills, materials, price, complexity
- [ ] Generate match reasons
- [ ] Route: `GET /api/v1/ai/artisans/match`

### 5.2 Send to Artisans

- [ ] Route: `POST /api/v1/ai/concepts/:id/send-to-artisans`
- [ ] Create ArtisanMatch records
- [ ] Email notifications (Agenda job)
- [ ] Track responses

### 5.3 Custom Order Flow

- [ ] Order creation endpoint
- [ ] Milestone management
- [ ] Message system

### Phase 5 Checklist
- [ ] Artisan matching working
- [ ] Notifications sending
- [ ] Custom orders trackable

---

## 🚀 Phase 6: Polish & Deploy (Week 6-8)

### 6.1 Testing

- [ ] Unit tests for services
- [ ] Integration tests for APIs
- [ ] Error scenario tests
- [ ] Load testing

### 6.2 Documentation

- [ ] Swagger/OpenAPI spec
- [ ] Developer README
- [ ] Deployment guide

### 6.3 Deployment

- [ ] Docker configuration
- [ ] Graceful shutdown
- [ ] Health checks
- [ ] CI/CD pipeline
- [ ] Production deployment

### Phase 6 Checklist
- [ ] Test coverage > 80%
- [ ] API docs complete
- [ ] Response times acceptable
- [ ] Error rate < 0.1%
- [ ] Deployed successfully

---

## 📊 Success Criteria

| Metric | Target |
|--------|--------|
| API Response Time (p95) | < 200ms (non-generation) |
| Image Generation Time | < 15s |
| Visual Search Time | < 500ms |
| Product Data Generation | < 5s |
| Uptime | 99.9% |
| Error Rate | < 0.1% |

---

*Previous: [04-AI-INFRASTRUCTURE.md](./04-AI-INFRASTRUCTURE.md) | Next: [06-TECHNICAL-REVIEW.md](./06-TECHNICAL-REVIEW.md)*
