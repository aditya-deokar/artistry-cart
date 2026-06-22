# System Design Interview Preparation

This folder is the twenty-first learning block for preparing for a bigger engineering role. It teaches system design interviews from first principles, then shows how to use Artistry Cart as a real architecture case study.

The goal is to stop answering system design questions as a list of technologies and start answering like an engineer who can clarify requirements, design boundaries, reason about data, handle scale, explain tradeoffs, and improve the design under pressure.

## Learning Outcome

After completing this topic, you should be able to explain:

- how system design interviews are evaluated
- how to clarify functional and non-functional requirements
- how to estimate traffic, storage, throughput, and bottlenecks
- how to choose APIs, data models, caches, queues, and services
- how to draw high-level and deep-dive architecture diagrams
- how to reason about consistency, reliability, security, observability, and cost
- how to discuss tradeoffs without sounding defensive
- how to present Artistry Cart as a strong system design story
- how to answer follow-up questions from basic to senior level

## Files In This Topic

1. [System Design Interview Mental Model](./01-system-design-interview-mental-model.md)
2. [Requirements, Scope, Assumptions, And Constraints](./02-requirements-scope-assumptions-constraints.md)
3. [Capacity Estimation, APIs, Data Model, And Core Flows](./03-capacity-estimation-apis-data-model-core-flows.md)
4. [High-Level Design, Components, Boundaries, And Diagrams](./04-high-level-design-components-boundaries-diagrams.md)
5. [Scaling, Reliability, Security, Observability, And Cost](./05-scaling-reliability-security-observability-cost.md)
6. [Tradeoffs, Deep Dives, And Senior-Level Discussion](./06-tradeoffs-deep-dives-senior-level-discussion.md)
7. [Artistry Cart System Design Walkthrough](./07-artistry-cart-system-design-walkthrough.md)
8. [Mock Questions And Answer Patterns](./08-mock-questions-and-answer-patterns.md)

## Core Mental Model

```text
clarify problem
  -> define requirements
  -> estimate scale
  -> design APIs and data
  -> draw high-level architecture
  -> deep dive key bottlenecks
  -> discuss tradeoffs
  -> improve the design
```

The best system design answers are not perfect diagrams. They are clear engineering conversations.

## Connection To Artistry Cart

Artistry Cart is a useful interview case study because it has:

- two user personas: buyers and sellers
- two frontend applications
- an API gateway
- multiple backend services
- shared packages
- MongoDB and Prisma
- Redis
- Kafka analytics ingestion
- Stripe payments and webhooks
- AI Vision workflows
- Docker, Kubernetes, CI/CD, observability, and performance tradeoffs

The honest pitch is:

> Artistry Cart is a service-oriented Nx monorepo for an artisan commerce platform. It has meaningful runtime and domain boundaries, but it is not pretending to be fully autonomous microservices because persistence is still shared through MongoDB and Prisma.
