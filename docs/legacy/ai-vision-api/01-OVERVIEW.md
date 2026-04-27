# AI Vision Backend API - Implementation Plan

> Canonical status: this file is a legacy planning document retained for historical detail. For the current project view, start with [AI Vision Service](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/03-applications/aivision-service.md>), [AI Vision Domain](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/05-domain/ai-vision.md>), and [API Inventory](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/06-data-and-api/api-inventory.md>).

> **Version:** 1.1  
> **Updated:** December 28, 2024 (Post Technical Review)  
> **Stack:** Express.js, LangChain, LangGraph, Google Gemini, MongoDB, ImageKit, Agenda.js

---

## 📋 Executive Summary

Complete backend implementation plan for AI Vision service with all technical review fixes applied.

### Technology Stack (Verified & Corrected)

| Component | Technology | Notes |
|-----------|------------|-------|
| **Runtime** | Node.js + Express | API Server |
| **AI SDK** | `@google/genai` | **NEW SDK** (replaces legacy) |
| **AI Framework** | LangChain + LangGraph | With error handling |
| **LLM** | Gemini 1.5 Pro | Text analysis & product generation |
| **Image Gen** | Gemini 2.0 Flash | Native image generation |
| **Database** | MongoDB (Prisma) | All data + rate limiting + jobs |
| **Image Storage** | ImageKit | Existing setup |
| **Job Queue** | Agenda.js | MongoDB-based (NOT BullMQ) |
| **Validation** | Zod | All inputs + LLM outputs |
| **Logging** | Winston | Structured JSON logs |

> **IMPORTANT:** No Redis required. All state in MongoDB.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API GATEWAY (Express)                         │
│  • Rate Limiting (MongoDB) • Auth • Validation • Timeouts       │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              LangGraph Orchestrator (Error-Tolerant)            │
│  • Analyze → Enhance → Generate → ProductGen                    │
│  • Partial success support • Retry logic                        │
└───────────────────────────────┬─────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│  Gemini Pro   │      │ Gemini 2.0    │      │    CLIP       │
│     LLM       │      │ Flash Image   │      │  Embeddings   │
│               │      │               │      │               │
│ • Analysis    │      │ • Text→Image  │      │ • HuggingFace │
│ • Product Gen │      │ • Editing     │      │ • Similarity  │
└───────────────┘      └───────────────┘      └───────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│    MongoDB (Prisma)           │       ImageKit                  │
│    • Sessions, Concepts       │       • Concept images          │
│    • AIGeneratedProducts      │       • Thumbnails              │
│    • Rate limits              │       • Reference images        │
│    • Job queue (Agenda)       │                                 │
│    • Product embeddings       │                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
apps/ai-vision/src/
├── main.ts                      # Entry point + graceful shutdown
├── app.ts                       # Express configuration
│
├── config/
│   ├── index.ts                 # Environment
│   ├── gemini.ts                # @google/genai setup
│   ├── database.ts              # Prisma
│   ├── queue.ts                 # Agenda.js
│   └── imagekit.ts              # ImageKit helpers
│
├── routes/
│   ├── index.ts
│   ├── generation.routes.ts
│   ├── search.routes.ts
│   ├── concepts.routes.ts
│   └── artisans.routes.ts
│
├── controllers/
│   └── *.controller.ts
│
├── services/
│   ├── generation/
│   │   ├── gemini-image.service.ts
│   │   └── product-generator.service.ts
│   ├── search/
│   │   └── embedding.service.ts
│   └── common/
│       └── imagekit.service.ts
│
├── agents/
│   └── concept-generator.agent.ts  # LangGraph workflow
│
├── middleware/
│   ├── auth.middleware.ts
│   ├── rate-limit.middleware.ts
│   ├── timeout.middleware.ts
│   ├── validation.middleware.ts
│   └── error.middleware.ts
│
├── validators/
│   ├── generation.validators.ts
│   └── llm-schemas.ts              # Zod schemas for LLM output
│
├── utils/
│   ├── helpers/
│   │   ├── retry.ts
│   │   └── logger.ts
│   └── prompts/
│       └── product-generation.prompts.ts
│
└── types/
    └── *.types.ts
```

---

## 📚 Document Index

| Document | Description |
|----------|-------------|
| [01-OVERVIEW.md](./01-OVERVIEW.md) | Architecture overview |
| [02-DATABASE-SCHEMA.md](./02-DATABASE-SCHEMA.md) | Prisma models, indexes |
| [03-API-ENDPOINTS.md](./03-API-ENDPOINTS.md) | API specification |
| [04-AI-INFRASTRUCTURE.md](./04-AI-INFRASTRUCTURE.md) | Code examples (UPDATED) |
| [05-IMPLEMENTATION-PHASES.md](./05-IMPLEMENTATION-PHASES.md) | Step-by-step guide |
| [06-TECHNICAL-REVIEW.md](./06-TECHNICAL-REVIEW.md) | Issues & solutions |

---

*Next: [02-DATABASE-SCHEMA.md](./02-DATABASE-SCHEMA.md)*
