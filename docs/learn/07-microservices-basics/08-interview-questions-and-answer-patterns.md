# Interview Questions And Answer Patterns

This file gives interview-ready answers for microservices basics.

## Question: What Is A Microservice?

Strong answer:

> A microservice is an independently runnable service focused on a specific business capability. It owns its API and behavior, can be deployed and scaled separately, and communicates with other services through HTTP, messaging, or events. The benefit is independence and clearer ownership; the cost is distributed system complexity.

## Question: Are Microservices Always Better Than A Monolith?

Strong answer:

> No. Microservices add operational complexity, network failure, data consistency problems, and harder debugging. A monolith or modular monolith is often better early on. Microservices make sense when independent deployment, scaling, ownership, or failure isolation are worth the extra complexity.

## Question: How Do You Decide Service Boundaries?

Strong answer:

> I split services around business capabilities and reasons to change. I look for high cohesion inside the service and low coupling outside it. I also consider scaling needs, data ownership, security, failure isolation, and team ownership. I avoid splitting only by technical layers.

## Question: What Is Synchronous Communication?

Strong answer:

> Synchronous communication means the caller waits for the result, usually through HTTP, GraphQL, or gRPC. It is simple and useful for immediate user-facing operations, but it couples caller latency and failure to the downstream service.

## Question: What Is Asynchronous Communication?

Strong answer:

> Asynchronous communication sends work through a queue or event stream so the producer does not wait for immediate processing. It helps decouple services and protect request latency, but introduces eventual consistency, retries, ordering issues, duplicate messages, and observability needs.

## Question: What Is An API Gateway?

Strong answer:

> An API gateway is a client-facing entry point that routes requests to backend services and can apply cross-cutting policies like CORS, request ids, simple auth checks, and rate limits. It simplifies clients, but it should stay thin so business logic remains in the owning services.

## Question: How Should Microservices Handle Data?

Strong answer:

> Ideally each service owns its own data and other services interact through APIs or events. This improves autonomy but makes cross-service queries and transactions harder. Systems often use eventual consistency, sagas, read models, and events. A shared database is simpler early on but weakens service boundaries.

## Question: What Is Eventual Consistency?

Strong answer:

> Eventual consistency means different parts of the system may not reflect the same state immediately, but they converge over time. It is common in event-driven microservices, especially for analytics, recommendations, notifications, and read models.

## Question: What Is Idempotency?

Strong answer:

> Idempotency means processing the same operation more than once has the same final effect. It is important for retries, webhooks, and message consumers because distributed systems can deliver duplicate requests or events.

## Question: What Are Common Microservice Failure Modes?

Strong answer:

> Common failures include service downtime, network timeouts, DNS issues, database failures, queue lag, duplicate messages, schema mismatches, downstream rate limits, and deployment incompatibilities. Microservices need timeouts, retries with backoff, idempotency, circuit breakers, health checks, and observability.

## Question: How Do You Observe Microservices?

Strong answer:

> I use logs, metrics, and traces. Logs show what happened, metrics show service health and trends, and traces follow a request across services. In microservices, request ids or trace ids are important because one user action may touch multiple services.

## Question: How Do You Test Microservices?

Strong answer:

> I use layered testing: unit tests for pure logic, integration tests for service and database behavior, contract tests for service boundaries, and e2e tests for important cross-service flows. I do not rely only on e2e tests because they are slower and harder to debug.

## Question: Is Artistry Cart Fully Microservices?

Strong answer:

> Artistry Cart is service-oriented and has multiple runnable backend services, but it is not fully autonomous microservices because several services share the same Prisma/MongoDB layer. I would describe it as a practical service-oriented Nx monorepo with clear runtime boundaries and shared infrastructure.

## Best Short Project Pitch For This Topic

> Artistry Cart splits backend responsibilities into services like auth, product, order, recommendations, AI Vision, gateway, and Kafka analytics. This gives clearer domain boundaries and a path to independent deployment and scaling. The main tradeoff is shared persistence through Prisma/MongoDB, so data ownership is not fully microservice-pure yet.

