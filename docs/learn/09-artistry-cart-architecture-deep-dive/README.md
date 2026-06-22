# Artistry Cart Architecture Deep Dive

This folder is the ninth learning block for preparing for a bigger engineering role. It explains the Artistry Cart project as a real architecture case study.

The goal is to help you explain this repo in interviews as a complete platform: product context, source layout, service topology, request flows, event flows, shared packages, data layer, DevOps shape, tradeoffs, and future improvements.

## Learning Outcome

After completing this topic, you should be able to explain:

- what Artistry Cart is as a product and platform
- how the Nx monorepo is organized
- what each frontend, backend service, and shared package owns
- how requests flow through the frontend, gateway, services, and database
- how Kafka analytics and background jobs fit the architecture
- how Prisma/MongoDB, Redis, Stripe, ImageKit, AI providers, and Kafka are used
- how Docker, Kubernetes, and CI/CD support the system
- what the architecture does well
- what tradeoffs and risks exist
- how to present the project confidently in an interview

## Files In This Topic

1. [Project Story And Product Context](./01-project-story-and-product-context.md)
2. [Repository And Nx Workspace Map](./02-repository-and-nx-workspace-map.md)
3. [Runtime Topology And Service Responsibilities](./03-runtime-topology-and-service-responsibilities.md)
4. [Request Flows Through The System](./04-request-flows-through-the-system.md)
5. [Event Flows, Kafka, And Background Jobs](./05-event-flows-kafka-background-jobs.md)
6. [Shared Packages And Cross-Cutting Infrastructure](./06-shared-packages-and-cross-cutting-infrastructure.md)
7. [Data, Integrations, DevOps, And Deployment Shape](./07-data-integrations-devops-deployment-shape.md)
8. [Interview Narrative, Tradeoffs, And Answer Patterns](./08-interview-narrative-tradeoffs-answer-patterns.md)

## Best One-Line Description

> Artistry Cart is a service-oriented Nx monorepo for an artisan commerce platform, with two Next.js frontends, multiple Express backend services, shared TypeScript packages, Prisma/MongoDB persistence, Redis support, Kafka analytics ingestion, AI Vision workflows, Docker/Kubernetes assets, and CI validation.

## Honest Architecture Label

The most accurate label is:

> Practical service-oriented monorepo.

It is not a single backend monolith. It is also not fully autonomous microservices because services share a Prisma/MongoDB data layer.

