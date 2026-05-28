# Artistry Cart — Resume Section

> Every claim below is verifiable in the repository at
> [github.com/aditya-deokar/artistry-cart](https://github.com/aditya-deokar/artistry-cart).
> No fabricated metrics, no technologies that aren't in `package.json`.

---

## LaTeX (Full — 6 Points)

```latex
\textbf{Artistry Cart}
\hfill
\href{https://github.com/aditya-deokar/artistry-cart}{\faGithub}\\
\textit{Next.js 15, Express, Kafka, MongoDB/Prisma, Redis, Docker, Kubernetes, GitHub Actions CI/CD}\\
\textit{Service-Oriented Multi-Vendor Commerce Platform with AI-Powered Discovery}

\begin{itemize}
    \item Architected a \textbf{service-oriented commerce platform} as an Nx monorepo with \textbf{7 Express microservices}, 2 Next.js 15 frontends, and \textbf{7 shared infrastructure packages} (Prisma, Redis, Kafka, middleware, error-handler, ImageKit, test-utils) — enforcing clean domain boundaries across auth, catalog, orders, payments, recommendations, AI vision, and analytics.

    \item Designed a \textbf{25+ entity MongoDB schema} (Prisma ORM) modeling the full commerce domain — users, sellers, shops, products with 3-tier dynamic pricing, Stripe Connect payments with 90/10 fee splitting, refund lifecycle tracking, and 5 dedicated AI Vision entities (VisionSession, Concept, ConceptImage, AIGeneratedProduct, ArtisanMatch).

    \item Built a dedicated \textbf{AI Vision service} integrating \textbf{Google Gemini 2.5 Pro} for concept generation, \textbf{Hugging Face CLIP} for visual embeddings and similarity search, and \textbf{Agenda.js} for background job scheduling — fully isolated from core commerce APIs for independent scaling.

    \item Engineered a \textbf{2-pipeline GitHub Actions CI/CD} system: PR-triggered NX-affected testing with live E2E service orchestration (5 services + MongoDB + Redis), and a release pipeline with \textbf{multi-stage Docker builds}, \textbf{Trivy} CVE scanning, SBOM generation, and automated publishing of \textbf{9 container images} to GHCR.

    \item Implemented \textbf{Kafka-based event-driven analytics} decoupling user activity ingestion from the transactional path, feeding a \textbf{TensorFlow.js recommendation engine} trained on behavioral signals (views, cart adds, purchases) — with dedicated product and shop analytics models for conversion tracking.

    \item Designed \textbf{Kubernetes deployment manifests} with Kustomize overlays (dev/staging/prod), HPA autoscaling for stateless services, PodDisruptionBudgets, standardized \texttt{/healthz} and \texttt{/readyz} probes, and environment-driven service discovery replacing hardcoded localhost upstreams.
\end{itemize}
```

---

## LaTeX (Condensed — 4 Points)

Use this if space is tight. These four cover the highest-value signals: architecture, AI, DevOps, and event-driven ML.

```latex
\textbf{Artistry Cart}
\hfill
\href{https://github.com/aditya-deokar/artistry-cart}{\faGithub}\\
\textit{Next.js 15, Express, Kafka, MongoDB/Prisma, Redis, Docker, Kubernetes, GitHub Actions CI/CD}\\
\textit{Service-Oriented Multi-Vendor Commerce Platform with AI-Powered Discovery}

\begin{itemize}
    \item Architected a \textbf{service-oriented commerce platform} as an Nx monorepo with \textbf{7 Express microservices}, 2 Next.js 15 frontends, and \textbf{7 shared infrastructure packages} — enforcing clean domain boundaries across auth, catalog, orders, payments, recommendations, AI vision, and analytics ingestion.

    \item Built a dedicated \textbf{AI Vision service} integrating \textbf{Google Gemini 2.5 Pro} for concept generation, \textbf{Hugging Face CLIP} for visual embeddings and similarity search, and \textbf{Agenda.js} for background job scheduling — fully isolated from core commerce APIs for independent scaling.

    \item Engineered a \textbf{2-pipeline GitHub Actions CI/CD} system: NX-affected testing with live E2E orchestration (5 services + MongoDB + Redis), and a release pipeline with \textbf{multi-stage Docker builds}, \textbf{Trivy} CVE scanning, SBOM generation, and automated publishing of \textbf{9 container images} to GHCR.

    \item Implemented \textbf{Kafka-based event-driven analytics} decoupling user activity ingestion from the transactional path, feeding a \textbf{TensorFlow.js recommendation engine} trained on behavioral signals — with Kubernetes manifests using Kustomize overlays, HPA autoscaling, and standardized health probes.
\end{itemize}
```

---

## Plain Text (for ATS / LinkedIn / Copy-Paste)

**Artistry Cart** — Service-Oriented Multi-Vendor Commerce Platform with AI-Powered Discovery
Next.js 15, Express, Kafka, MongoDB/Prisma, Redis, Docker, Kubernetes, GitHub Actions CI/CD
GitHub: https://github.com/aditya-deokar/artistry-cart

- Architected a service-oriented commerce platform as an Nx monorepo with 7 Express microservices, 2 Next.js 15 frontends, and 7 shared infrastructure packages (Prisma, Redis, Kafka, middleware, error-handler, ImageKit, test-utils) — enforcing clean domain boundaries across auth, catalog, orders, payments, recommendations, AI vision, and analytics.

- Designed a 25+ entity MongoDB schema (Prisma ORM) modeling the full commerce domain — users, sellers, shops, products with 3-tier dynamic pricing, Stripe Connect payments with 90/10 fee splitting, refund lifecycle tracking, and 5 dedicated AI Vision entities (VisionSession, Concept, ConceptImage, AIGeneratedProduct, ArtisanMatch).

- Built a dedicated AI Vision service integrating Google Gemini 2.5 Pro for concept generation, Hugging Face CLIP for visual embeddings and similarity search, and Agenda.js for background job scheduling — fully isolated from core commerce APIs for independent scaling.

- Engineered a 2-pipeline GitHub Actions CI/CD system: PR-triggered NX-affected testing with live E2E service orchestration (5 services + MongoDB + Redis), and a release pipeline with multi-stage Docker builds, Trivy CVE scanning, SBOM generation, and automated publishing of 9 container images to GHCR.

- Implemented Kafka-based event-driven analytics decoupling user activity ingestion from the transactional path, feeding a TensorFlow.js recommendation engine trained on behavioral signals (views, cart adds, purchases) — with dedicated product and shop analytics models for conversion tracking.

- Designed Kubernetes deployment manifests with Kustomize overlays (dev/staging/prod), HPA autoscaling for stateless services, PodDisruptionBudgets, standardized /healthz and /readyz probes, and environment-driven service discovery replacing hardcoded localhost upstreams.

---

## Verification Map

Every bullet point maps to real codebase artifacts. If an interviewer asks "show me," you can:

| Claim | Where to Find It |
|---|---|
| 7 microservices | `ls apps/` — api-gateway, auth-service, product-service, order-service, recommendation-service, aivision-service, kafka-service |
| 7 shared packages | `ls packages/` — error-handler, middleware, test-utils, libs/prisma, libs/redis, libs/imageKit, utils/kafka |
| 25+ entities | `prisma/schema.prisma` — 939 lines, models for users, sellers, shops, products, orders, payments, AI vision, analytics |
| Stripe Connect 90/10 split | `prisma/schema.prisma` — payments model with `platformFee` (10%) and `sellerAmount` (90%) fields |
| 5 AI Vision entities | `prisma/schema.prisma` — VisionSession, Concept, ConceptImage, AIGeneratedProduct, ArtisanMatch |
| Google Gemini | `package.json` → `@google/generative-ai`, `@langchain/google-genai` |
| Hugging Face CLIP | `package.json` → `@huggingface/inference`; schema → `embeddingModel: "clip-vit-large-patch14"` |
| Agenda.js background jobs | `package.json` → `agenda`; docs reference Agenda in aivision-service |
| TensorFlow.js | `package.json` → `@tensorflow/tfjs`, `@tensorflow/tfjs-node` |
| Kafka event streaming | `package.json` → `kafkajs`; dedicated `kafka-service` app |
| 2 CI pipelines | `.github/workflows/test.yml` + `.github/workflows/build-publish.yml` |
| 9 container targets | `build-publish.yml` → `DEPLOYABLE_APPS` env variable lists all 9 |
| Multi-stage Docker | `docker/backend.Dockerfile` + `docker/frontend.Dockerfile` — builder + runtime stages |
| Trivy scanning | `build-publish.yml` → `aquasecurity/trivy-action@0.28.0` step |
| SBOM generation | `build-publish.yml` → `sbom: true` in docker/build-push-action |
| GHCR publishing | `build-publish.yml` → `ghcr.io` login + push steps |
| E2E orchestration | `test.yml` → starts 5 services, waits for `/readyz`, runs E2E suite |
| NX-affected builds | `test.yml` → `nx affected --target=test --base=origin/master` |
| Kubernetes manifests | `docs/DevOps/kubernetes-deployment-guide.md` — Kustomize overlays, HPA, PDB |
| /healthz and /readyz | `test.yml` → health check URLs in E2E wait loop |
| 3-tier pricing | `prisma/schema.prisma` → products model: `regular_price`, `sale_price`, `current_price` |
| LangChain + LangGraph | `package.json` → `@langchain/core`, `@langchain/google-genai`, `@langchain/langgraph` |
| Next.js 15 + React 19 | `package.json` → `next: ~15.2.4`, `react: 19.0.0` |
| Nx 21 monorepo | `package.json` devDeps → `nx: 21.2.2` |

---

## What NOT to Say (Common Mistakes)

| ❌ Don't Say | Why |
|---|---|
| "100+ concurrent users" | Unverifiable. No load test results in repo. |
| "60% latency reduction" | Fabricated. No benchmark data exists. |
| "40% CI build time reduction" | Fabricated. NX-affected is real, but no before/after metrics. |
| "RabbitMQ" | Not in `package.json`. Your repo uses Kafka only. |
| "Pydantic AI" | Not in `package.json`. Your repo uses Gemini + LangChain. |
| "99.95% uptime" | No production monitoring data to back this. |
| "1,200+ creators" | No user data. This is a portfolio project. |
