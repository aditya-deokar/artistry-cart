// Unified types for Project Showcase components
// Single source of truth - used by both data and components

// ============================================
// Core Data Types
// ============================================

export interface Technology {
  name: string;
  category: string;
  description?: string;
  version?: string;
}

export interface TechStats {
  totalTechnologies: string;
  typescriptCoverage: string;
  microservices?: string;
  aiModels?: string;
  mcpTools?: string;
  nodeTypes?: string;
}

export interface OverviewKeyPoint {
  number: string;
  title: string;
  description: string;
}

export interface OverviewQuote {
  text: string;
  label: string;
}

// ============================================
// Architecture Highlight Types
// ============================================

export interface ArchitectureHighlight {
  title: string;
  description: string;
  icon?: string;
}

// ============================================
// Feature Types
// ============================================

export interface FeatureImpact {
  metric: string;
  label: string;
}

export interface Feature {
  number: string;
  title: string;
  description: string;
  tags: string[];
  impact: FeatureImpact[];
}

// ============================================
// Process Types
// ============================================

export interface ProcessPhase {
  phase: string;
  title: string;
  subtitle: string;
  description: string;
  keywords: string[];
}

export interface ProcessStats {
  phases: string;
  technologies: string;
  ciTimeReduction?: string;
  uptime?: string;
  dropOffReduction?: string;
  dauIncrease?: string;
  designIterations?: string;
  aiWorkflows?: string;
  nodeTypes?: string;
  documentationArtifacts?: string;
  mcpTools?: string;
  realtimeChannels?: string;
}

// ============================================
// Outcome Types
// ============================================

export interface Outcome {
  metric: string;
  label: string;
}

// ============================================
// Footer & CTA Types
// ============================================

export interface ContactInfo {
  label: string;
  value: string;
  url: string | null;
  hasIndicator?: boolean;
}

export interface FooterCta {
  heading: {
    text: string;
    highlight: string;
    suffix: string;
  };
  primaryButton: {
    text: string;
    url: string;
  };
  secondaryButton: {
    text: string;
    url: string;
  };
  contactInfo: ContactInfo[];
}

export interface SocialLink {
  name: string;
  url: string;
}

export interface Footer {
  description: string;
  social: SocialLink[];
  quickLinks: string[];
  projects: string[];
  resources: string[];
  legal: string[];
  copyright: string;
  rightsReserved: string;
}

// ============================================
// Component-Specific Types
// ============================================

export interface SelectedPoint {
  number: string;
  title: string;
  description: string;
  summary?: string;
}

// ============================================
// Main Project Interface
// ============================================

export interface DetailedProject {
  name: string;
  tagline: string;
  year: string;
  role: string;
  duration: string;
  team: string;
  category: string;
  liveUrl?: string;
  repoUrl?: string;
  docsUrl?: string;
  navigation: string[];
  overviewDescription: string;
  overviewKeyPoints: OverviewKeyPoint[];
  overviewQuote: OverviewQuote;
  architectureHighlights?: ArchitectureHighlight[];
  technologies: {
    frontend: Technology[];
    backend: Technology[];
    ai?: Technology[];
    infrastructure?: Technology[];
    devops?: Technology[];
  };
  techStats: TechStats;
  overview: string;
  features: Feature[];
  process: ProcessPhase[];
  processStats: ProcessStats;
  outcomes: Outcome[];
  videos?: string[];
  footerCta: FooterCta;
  footer: Footer;
}

// Alias for backward compatibility with components
export type ProjectData = DetailedProject;
export type FooterCtaData = FooterCta;
export type FooterData = Footer;



// ============================================
// Artistry Cart — Authentic Project Data
// Derived from the actual codebase at:
// https://github.com/aditya-deokar/artistry-cart
// ============================================

export const artistryCart: DetailedProject = {
  name: "Artistry Cart",
  tagline:
    "A Service-Oriented Multi-Vendor Commerce Platform with AI-Powered Discovery, Built on an Nx Monorepo.",
  year: "2024–2025",
  role: "Full-Stack Architect & DevOps Engineer",
  duration: "10+ months (active development)",
  team: "Solo — Architecture, Backend, Frontend, AI, DevOps, and Documentation",
  category: "SaaS · E-Commerce · AI/ML · DevOps",
  repoUrl: "https://github.com/aditya-deokar/artistry-cart",
  docsUrl: "https://github.com/aditya-deokar/artistry-cart/tree/master/docs",
  navigation: ["Work", "About", "Process", "Contact"],

  // ── Overview ──────────────────────────────────────────
  overviewDescription:
    "Artistry Cart is a production-grade, multi-vendor commerce platform built as a single Nx monorepo. It combines two Next.js 15 frontends, seven Express microservices, a shared MongoDB data layer via Prisma, Kafka-based analytics ingestion, Redis caching, Stripe payment infrastructure, and a dedicated AI Vision service powered by Google Gemini & Hugging Face — all orchestrated through a fully automated GitHub Actions CI/CD pipeline with Docker containerization and Kubernetes deployment manifests.",

  overviewKeyPoints: [
    {
      number: "01",
      title: "Problem",
      description:
        "Independent artisans and small creators were locked into high-commission marketplaces with no control over branding, pricing, or customer relationships. There was no affordable platform that combined seller autonomy with AI-powered product discovery.",
    },
    {
      number: "02",
      title: "Architecture",
      description:
        "Designed a service-oriented backend with 7 discrete microservices — auth, catalog, orders, recommendations, AI Vision, analytics ingestion, and gateway routing — sharing a unified Prisma schema across a 900+ line MongoDB data model with 25+ entities.",
    },
    {
      number: "03",
      title: "AI Integration",
      description:
        "Built a dedicated AI Vision service with Google Gemini for concept generation, Hugging Face CLIP for visual embeddings, LangChain orchestration, and Agenda-based background jobs — enabling AI-assisted product ideation, visual search, and artisan matching.",
    },
    {
      number: "04",
      title: "DevOps Pipeline",
      description:
        "Engineered a multi-stage CI/CD pipeline with GitHub Actions — unit tests, E2E service orchestration, NX-affected builds, multi-stage Docker images, Trivy vulnerability scanning, SBOM generation, and automated GHCR publishing across all 9 deployable targets.",
    },
  ],

  overviewQuote: {
    text: "The architecture is a practical middle ground between a pure monolith and a fully decoupled distributed system — monorepo for source organization and shared tooling, service-oriented backend boundaries, and a shared database access layer to keep local development and code reuse manageable.",
    label: "Architectural Philosophy",
  },

  // ── Architecture Highlights ───────────────────────────
  architectureHighlights: [
    {
      title: "API Gateway Pattern",
      description:
        "Single entry point (Express) proxying traffic to internal services via environment-driven upstream URLs. Rate-limited, CORS-standardized, with /healthz and /readyz endpoints for Kubernetes liveness and readiness probes.",
    },
    {
      title: "Event-Driven Analytics",
      description:
        "Kafka-based asynchronous ingestion pipeline decouples user activity tracking from the transactional request path. A dedicated kafka-service consumer materializes events into MongoDB for recommendation model training.",
    },
    {
      title: "AI Vision Service Boundary",
      description:
        "AI-heavy workloads — Gemini LLM calls, Hugging Face embeddings, ImageKit uploads, and Agenda background jobs — are fully isolated from core commerce APIs, enabling independent scaling and different compute profiles.",
    },
    {
      title: "Multi-Stage Docker Builds",
      description:
        "Reusable backend.Dockerfile and frontend.Dockerfile patterns with BuildKit cache mounts, non-root runtime users, and Next.js standalone output — producing minimal, production-ready images for all 9 deployable targets.",
    },
  ],

  // ── Technologies (grounded in actual package.json) ────
  technologies: {
    frontend: [
      {
        name: "Next.js 15",
        category: "React Framework",
        version: "15.2.4",
        description:
          "Server-rendered React framework powering both the buyer storefront (user-ui) and seller dashboard (seller-ui) with App Router, Server Components, and View Transitions.",
      },
      {
        name: "React 19",
        category: "UI Library",
        version: "19.0.0",
        description:
          "Latest React with concurrent features. Used across both frontends with Jotai and Zustand for client-side state management.",
      },
      {
        name: "Tailwind CSS 4",
        category: "CSS Framework",
        version: "4.1.11",
        description:
          "Utility-first CSS framework with PostCSS integration for rapid, responsive UI development across both storefronts.",
      },
      {
        name: "Framer Motion",
        category: "Animation",
        version: "12.23.12",
        description:
          "Declarative animations and page transitions for premium UX. Used alongside GSAP for complex scroll-driven interactions.",
      },
      {
        name: "TanStack Query + Table",
        category: "Data Management",
        description:
          "React Query for server-state management with automatic caching and invalidation. React Table for data-heavy seller dashboard views.",
      },
      {
        name: "React Hook Form + Zod",
        category: "Forms & Validation",
        description:
          "Type-safe form management with Zod schema validation (v4). Used across auth flows, product creation, checkout, and seller onboarding.",
      },
    ],
    backend: [
      {
        name: "Express + TypeScript",
        category: "API Framework",
        description:
          "TypeScript-first Express services with shared middleware, centralized error handling, and Swagger auto-generated API docs across all 7 backend services.",
      },
      {
        name: "MongoDB + Prisma",
        category: "Database & ORM",
        version: "Prisma 6.11",
        description:
          "Shared Prisma schema (939 lines, 25+ models) serving all services. Covers users, sellers, shops, products, orders, payments, AI vision sessions, concepts, and analytics.",
      },
      {
        name: "Apache Kafka + KafkaJS",
        category: "Event Streaming",
        description:
          "Asynchronous event backbone for user activity ingestion. Dedicated kafka-service consumer materializes analytics events for recommendation model training.",
      },
      {
        name: "Redis (ioredis)",
        category: "In-Memory Cache",
        description:
          "Used for session management, auth token caching, and fast-path runtime behavior in auth-service and order-service.",
      },
      {
        name: "Stripe",
        category: "Payment Infrastructure",
        description:
          "Full Stripe Connect integration — payment intents, seller onboarding, platform fee splitting (10% admin / 90% seller), webhook handling, refund processing, and payout tracking.",
      },
      {
        name: "Swagger (Auto-gen)",
        category: "API Documentation",
        description:
          "swagger-autogen + swagger-ui-express for live API documentation across all backend services.",
      },
    ],
    ai: [
      {
        name: "Google Gemini (2.5 Pro)",
        category: "LLM / Generative AI",
        description:
          "Powers the AI Vision concept generation pipeline — product ideation, detailed descriptions, category classification, pricing estimation, and feasibility scoring.",
      },
      {
        name: "Hugging Face (CLIP ViT-Large)",
        category: "Visual Embeddings",
        description:
          "Generates high-dimensional image embeddings for visual similarity search, concept matching, and artisan recommendation scoring.",
      },
      {
        name: "LangChain + LangGraph",
        category: "AI Orchestration",
        description:
          "LangChain with Google GenAI bindings for structured LLM pipelines. LangGraph for stateful, multi-step AI agent workflows.",
      },
      {
        name: "TensorFlow.js",
        category: "ML Runtime",
        description:
          "Powers the recommendation engine in recommendation-service for personalized product suggestions based on user behavior analytics.",
      },
      {
        name: "Agenda.js",
        category: "Background Jobs",
        description:
          "MongoDB-backed job scheduler in aivision-service for recurring AI tasks — session cleanup, embedding generation, and batch concept processing.",
      },
    ],
    devops: [
      {
        name: "Nx 21 Monorepo",
        category: "Build System",
        version: "21.2.2",
        description:
          "Workspace orchestration for 16 apps + 7 shared packages. NX-affected builds, parallel task execution, dependency graph, and build caching across the entire monorepo.",
      },
      {
        name: "Docker (Multi-Stage)",
        category: "Containerization",
        description:
          "Reusable Dockerfiles with BuildKit cache mounts, node:20-bookworm-slim base, non-root users, and Next.js standalone output. 9 independent deployable container images.",
      },
      {
        name: "GitHub Actions CI/CD",
        category: "Continuous Integration",
        description:
          "Two-pipeline CI: test.yml (unit + integration + E2E with live service orchestration) and build-publish.yml (validate → E2E → detect-images → build/scan/publish matrix).",
      },
      {
        name: "Kubernetes",
        category: "Orchestration",
        description:
          "Production deployment manifests with Kustomize overlays (dev/staging/prod), HPA autoscaling, PodDisruptionBudgets, ConfigMaps, Secrets, and KEDA-based Kafka consumer scaling.",
      },
      {
        name: "Trivy + SBOM",
        category: "Security Scanning",
        description:
          "Container vulnerability scanning integrated into CI. Trivy scans published images for HIGH/CRITICAL CVEs, generates SARIF reports, and uploads to GitHub Security tab.",
      },
      {
        name: "GHCR (GitHub Container Registry)",
        category: "Image Registry",
        description:
          "Automated image publishing with SHA-based tags, semantic version tags, and branch-pinned latest references. Provenance attestation and SBOM generation for supply chain security.",
      },
    ],
  },

  techStats: {
    totalTechnologies: "30+",
    typescriptCoverage: "100%",
    microservices: "7",
  },

  overview:
    "Artistry Cart is a production-grade, multi-vendor commerce platform architected as a service-oriented Nx monorepo. It combines two Next.js 15 frontends, seven Express microservices, Kafka event streaming, Redis caching, Stripe payments, and a dedicated AI Vision service — all backed by a fully automated CI/CD pipeline with Docker containerization and Kubernetes deployment.",

  // ── Features ──────────────────────────────────────────
  features: [
    {
      number: "01",
      title: "Service-Oriented Monorepo Architecture",
      description:
        "The platform is organized as a single Nx monorepo containing 16 projects (9 deployable apps, 7 shared packages). Services are split by domain responsibility — auth, catalog, orders, recommendations, AI Vision, analytics, and gateway — with shared Prisma, Redis, Kafka, middleware, and error-handling packages. This is a deliberate middle ground: monorepo for code reuse and shared tooling, service boundaries for independent deployment and scaling.",
      tags: [
        "Nx Monorepo",
        "Microservices",
        "Express",
        "Shared Packages",
        "Domain Separation",
      ],
      impact: [
        { metric: "16", label: "Nx Projects" },
        { metric: "7", label: "Backend Services" },
        { metric: "7", label: "Shared Packages" },
      ],
    },
    {
      number: "02",
      title: "Full-Stack AI Vision Pipeline",
      description:
        "A dedicated aivision-service isolates all AI-heavy workloads from core commerce APIs. Users can generate product concepts from text prompts via Google Gemini 2.5 Pro, get CLIP-based visual embeddings from Hugging Face for similarity search, receive AI-generated product metadata (category, pricing, feasibility), and get matched to artisans based on scoring algorithms. Agenda.js handles background jobs for session cleanup, batch embedding generation, and concept processing — all stored in a rich data model with VisionSession, Concept, ConceptImage, AIGeneratedProduct, and ArtisanMatch entities.",
      tags: [
        "Google Gemini",
        "Hugging Face CLIP",
        "LangChain",
        "Agenda.js",
        "Visual Search",
      ],
      impact: [
        { metric: "5", label: "AI Data Models" },
        { metric: "Gemini 2.5", label: "LLM Engine" },
        { metric: "CLIP ViT", label: "Embeddings" },
      ],
    },
    {
      number: "03",
      title: "Production-Grade CI/CD & Container Pipeline",
      description:
        "Engineered a two-pipeline GitHub Actions system: test.yml runs NX-affected unit/integration tests on PRs and full coverage + builds on master pushes, then orchestrates a live E2E environment with MongoDB, Redis, and 5 backend services started in parallel. build-publish.yml validates, E2E-tests, then dynamically detects which of the 9 deployable apps need rebuilding, builds multi-stage Docker images in a matrix strategy, scans with Trivy for HIGH/CRITICAL CVEs, generates SBOMs with provenance attestation, and publishes to GHCR.",
      tags: [
        "GitHub Actions",
        "Docker Multi-Stage",
        "Trivy",
        "GHCR",
        "NX Affected",
      ],
      impact: [
        { metric: "9", label: "Container Targets" },
        { metric: "2", label: "CI Pipelines" },
        { metric: "5", label: "E2E Service Orchestration" },
      ],
    },
    {
      number: "04",
      title: "Event-Driven Analytics & Recommendation Engine",
      description:
        "Kafka-based asynchronous ingestion decouples user activity tracking from the transactional request path. A dedicated kafka-service consumer processes analytics events and materializes them into MongoDB. The recommendation-service runs a TensorFlow.js model trained on user behavior data (views, cart adds, wishlist adds, purchases) to generate personalized product suggestions. Product and shop analytics are tracked separately with dedicated models for views, conversions, and revenue attribution.",
      tags: [
        "Apache Kafka",
        "TensorFlow.js",
        "Event Sourcing",
        "Analytics Pipeline",
      ],
      impact: [
        { metric: "Async", label: "Event Processing" },
        { metric: "TF.js", label: "ML Runtime" },
        { metric: "3", label: "Analytics Models" },
      ],
    },
    {
      number: "05",
      title: "Stripe Connect Payment Infrastructure",
      description:
        "Full Stripe Connect integration handling the complete payment lifecycle: customer payment intents, Stripe Connect seller onboarding with stripeId tracking, platform fee splitting (10% admin margin / 90% seller payout), webhook-driven status updates, refund processing with multi-party accounting, and seller payout scheduling with period tracking. The payments, payouts, and refunds models capture the full financial audit trail with Stripe identifiers for reconciliation.",
      tags: [
        "Stripe Connect",
        "Webhooks",
        "Fee Splitting",
        "Refund Processing",
      ],
      impact: [
        { metric: "3", label: "Payment Models" },
        { metric: "90/10", label: "Revenue Split" },
        { metric: "Full", label: "Audit Trail" },
      ],
    },
    {
      number: "06",
      title: "Comprehensive Pricing & Discount Engine",
      description:
        "A sophisticated pricing system supporting multiple discount strategies: event-based discounts (flash sales, seasonal, clearance), product-level sale pricing, category-wide promotions, and reusable coupon codes with usage limits, per-user caps, and minimum order thresholds. The ProductPricing model tracks price history with discount source attribution, while EventProductDiscount enables per-product overrides within events. Three-tier pricing resolution: regular_price → sale_price → event-adjusted current_price.",
      tags: [
        "Dynamic Pricing",
        "Discount Engine",
        "Price History",
        "Coupon System",
      ],
      impact: [
        { metric: "5", label: "Discount Types" },
        { metric: "3-Tier", label: "Price Resolution" },
        { metric: "Full", label: "Price History" },
      ],
    },
  ],

  // ── Process / Journey ─────────────────────────────────
  process: [
    {
      phase: "01",
      title: "The Problem Space",
      subtitle: "Discovery & System Design",
      description:
        "Identified that independent artisans needed a platform combining seller autonomy with AI-powered discovery. Mapped the domain into 7 bounded contexts (auth, catalog, orders, recommendations, AI vision, analytics, gateway) and designed a 25+ entity data model covering users, sellers, shops, products, orders, payments, AI concepts, and analytics.",
      keywords: [
        "Domain Decomposition",
        "Entity Modeling",
        "Bounded Contexts",
        "Prisma Schema Design",
      ],
    },
    {
      phase: "02",
      title: "The Architecture",
      subtitle: "Service Boundaries & Data Flow",
      description:
        "Chose a hybrid architecture: Nx monorepo for source organization with service-oriented backend boundaries. Designed the API Gateway pattern for traffic routing, Kafka for async event decoupling, Redis for caching, and a dedicated AI Vision service boundary to isolate compute-heavy AI workloads. Documented every architectural decision in ADR format (5 formal ADRs).",
      keywords: [
        "API Gateway",
        "Event-Driven Design",
        "Service Topology",
        "ADR Documentation",
      ],
    },
    {
      phase: "03",
      title: "The Build",
      subtitle: "Implementation & Integration",
      description:
        "Built the full stack incrementally: auth with OAuth (Google, GitHub, Facebook) via Arctic.js, catalog with rich pricing/discount engine, orders with Stripe Connect, AI Vision with Gemini + Hugging Face, and analytics with Kafka. Created 7 shared packages (error-handler, middleware, Prisma, Redis, Kafka, ImageKit, test-utils) to eliminate cross-service duplication.",
      keywords: [
        "OAuth Integration",
        "Stripe Connect",
        "AI Pipeline",
        "Shared Package Design",
      ],
    },
    {
      phase: "04",
      title: "The Pipeline",
      subtitle: "DevOps & Delivery",
      description:
        "Engineered the full CI/CD lifecycle: NX-affected testing on PRs, full E2E orchestration with live services on master, multi-stage Docker builds with BuildKit caching, Trivy vulnerability scanning, SBOM generation, and automated GHCR publishing. Designed Kubernetes manifests with Kustomize overlays for dev/staging/production environments.",
      keywords: [
        "CI/CD Pipeline",
        "Container Security",
        "Kubernetes Manifests",
        "Image Registry",
      ],
    },
    {
      phase: "05",
      title: "The Documentation",
      subtitle: "Knowledge Architecture",
      description:
        "Built a canonical 11-section documentation system covering: overview, onboarding, architecture, application deep-dives, shared packages, domain models, data/API contracts, quality/operations, architectural decisions (5 ADRs), interview prep, and reference material. Every doc serves dual audiences: engineers extending the system and interviewers evaluating technical depth.",
      keywords: [
        "Technical Writing",
        "ADR Framework",
        "Knowledge System",
        "Interview-Ready Docs",
      ],
    },
  ],

  processStats: {
    phases: "5",
    technologies: "30+",
    ciTimeReduction: "NX-Affected",
    uptime: "Container-Ready",
  },

  // ── Outcomes ──────────────────────────────────────────
  outcomes: [
    { metric: "7", label: "Microservices" },
    { metric: "25+", label: "Database Models" },
    { metric: "9", label: "Deployable Containers" },
    { metric: "5", label: "AI Data Entities" },
    { metric: "2", label: "CI/CD Pipelines" },
    { metric: "11", label: "Documentation Sections" },
    { metric: "5", label: "Architectural Decision Records" },
    { metric: "100%", label: "TypeScript Coverage" },
  ],

  videos: [
    "/videos/Replace_the_products_1080p_202601120029.mp4",
    "/videos/Replace_the_products_1080p_202601120029 (1).mp4",
  ],

  // ── Footer CTA ────────────────────────────────────────
  footerCta: {
    heading: {
      text: "Let's build something",
      highlight: "production-grade",
      suffix: "together",
    },
    primaryButton: {
      text: "Get in touch",
      url: "mailto:adityadeokar0204@gmail.com",
    },
    secondaryButton: {
      text: "View Source",
      url: "https://github.com/aditya-deokar/artistry-cart",
    },
    contactInfo: [
      {
        label: "Email",
        value: "adityadeokar0204@gmail.com",
        url: "mailto:adityadeokar0204@gmail.com",
      },
      {
        label: "Location",
        value: "India · Available Worldwide",
        url: null,
      },
      {
        label: "Availability",
        value: "Open for opportunities",
        url: null,
        hasIndicator: true,
      },
    ],
  },

  // ── Footer ────────────────────────────────────────────
  footer: {
    description:
      "Full-Stack Architect & DevOps Engineer — building service-oriented platforms with AI integration, production-grade CI/CD, and comprehensive documentation.",
    social: [
      {
        name: "GitHub",
        url: "https://github.com/aditya-deokar",
      },
      {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/aditya-deokar/",
      },
      { name: "Twitter", url: "https://x.com/aditya_deokar" },
    ],
    quickLinks: ["Work", "About", "Process", "Contact"],
    projects: [
      "Artistry Cart",
      "Verto AI",
      "a8n",
      "Portfolio",
    ],
    resources: [
      "Documentation",
      "Architecture Docs",
      "DevOps Guide",
      "API Reference",
    ],
    legal: ["Privacy Policy", "Terms of Service"],
    copyright: "© 2025 Aditya Deokar",
    rightsReserved: "All Rights Reserved",
  },
};