# Learning Guide: Nx Monorepo And Microservices

This folder is a learning path for understanding the Artistry Cart base project from first principles. It explains the ideas behind the repository, then connects those ideas back to the actual codebase.

Use this guide when you want to answer questions like:

- Why use an Nx monorepo?
- How does Nx know what to build and test?
- Why split a backend into services?
- What is the difference between monolith, monorepo, and microservices?
- What are the tradeoffs interviewers expect you to understand?
- How should you explain this project in a system design interview?

## Recommended Reading Order

1. [Computer Science And Web Basics](./01-computer-science-and-web-basics/README.md)
2. [JavaScript And TypeScript Foundation](./02-javascript-and-typescript-foundation/README.md)
3. [Node.js And Express Backend](./03-nodejs-and-express-backend/README.md)
4. [Frontend Basics For Full-Stack Confidence](./04-frontend-basics-for-full-stack-confidence/README.md)
5. [Nx Monorepo Fundamentals](./05-nx-monorepo-fundamentals/README.md)
6. [Package And Shared Library Architecture](./06-package-and-shared-library-architecture/README.md)
7. [Microservices Basics](./07-microservices-basics/README.md)
8. [Monolith, Modular Monolith, Monorepo, Microservices](./08-monolith-modular-monolith-monorepo-microservices/README.md)
9. [Artistry Cart Architecture Deep Dive](./09-artistry-cart-architecture-deep-dive/README.md)
10. [Database And Prisma](./10-database-and-prisma/README.md)
11. [Redis And Caching](./11-redis-and-caching/README.md)
12. [Kafka And Event-Driven Architecture](./12-kafka-and-event-driven-architecture/README.md)
13. [Payments And Webhooks](./13-payments-and-webhooks/README.md)
14. [Authentication And Security](./14-authentication-and-security/README.md)
15. [Testing Strategy](./15-testing-strategy/README.md)
16. [Docker And Local Infrastructure](./16-docker-and-local-infrastructure/README.md)
17. [Kubernetes Basics To Advanced](./17-kubernetes-basics-to-advanced/README.md)
18. [CI/CD And DevOps](./18-ci-cd-and-devops/README.md)
19. [Observability And Operations](./19-observability-and-operations/README.md)
20. [Performance And Scalability](./20-performance-and-scalability/README.md)
21. [System Design Interview Preparation](./21-system-design-interview-preparation/README.md)
22. [Senior-Level Architecture Thinking](./22-senior-level-architecture-thinking/README.md)
23. [AI/ML Integration For Modern Roles](./23-ai-ml-integration-for-modern-roles/README.md)
24. [Interview Storytelling](./24-interview-storytelling/README.md)
25. [First Principles](./01-first-principles.md)
26. [Nx Monorepo Fundamentals Overview](./02-nx-monorepo-fundamentals.md)
27. [Nx In This Repository](./03-nx-in-this-repository.md)
28. [Microservices Fundamentals Overview](./04-microservices-fundamentals.md)
29. [Artistry Cart Microservices Architecture](./05-artistry-cart-microservices.md)
30. [Monolith, Monorepo, And Microservices Overview](./06-monolith-monorepo-microservices.md)
31. [Benefits, Tradeoffs, And Risks](./07-benefits-tradeoffs-risks.md)
32. [Interview Guide](./08-interview-guide.md)
33. [Glossary And Cheat Sheet](./09-glossary-cheat-sheet.md)

## How This Learning Pack Relates To The Existing Docs

The numbered docs under `docs/00-overview`, `docs/02-architecture`, `docs/03-applications`, and `docs/08-decisions` describe what the project currently contains. This folder teaches the underlying concepts and gives you interview-ready language.

Think of it this way:

- existing docs: "What is built?"
- learn docs: "Why is it built this way, how does it work, and how do I explain it?"

## Project Context In One Paragraph

Artistry Cart is an Nx and pnpm workspace that contains two Next.js frontends, multiple Express backend services, shared infrastructure packages, Prisma/MongoDB data access, Redis support, Kafka analytics ingestion, Docker/Kubernetes deployment assets, and CI workflows. It is not a pure monolith and not a fully independent microservice ecosystem. It is a pragmatic service-oriented monorepo: separate deployable/service boundaries where they help, shared code and tooling where they reduce friction.
