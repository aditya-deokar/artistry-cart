# Microservices Basics

This folder is the seventh learning block for preparing for a bigger engineering role. It explains microservices from first principles, with practical language you can use in interviews.

The goal is not to say "microservices are always better." The goal is to understand when service boundaries help, what complexity they introduce, and how to reason about a real service-oriented system like Artistry Cart.

## Learning Outcome

After completing this topic, you should be able to explain:

- what a microservice is
- what a service boundary means
- how to split services by business capability
- synchronous versus asynchronous communication
- API gateway basics
- service discovery basics
- database ownership and consistency tradeoffs
- distributed system failure modes
- resilience patterns like timeouts, retries, idempotency, and circuit breakers
- observability needs for microservices
- how to test and run microservices locally
- where Artistry Cart is microservice-like and where it is still shared

## Files In This Topic

1. [What Is A Microservice](./01-what-is-a-microservice.md)
2. [Service Boundaries And Business Capabilities](./02-service-boundaries-and-business-capabilities.md)
3. [Synchronous And Asynchronous Communication](./03-synchronous-and-asynchronous-communication.md)
4. [API Gateway And Service Discovery Basics](./04-api-gateway-and-service-discovery-basics.md)
5. [Data Ownership, Transactions, And Consistency](./05-data-ownership-transactions-consistency.md)
6. [Failure Handling, Resilience, And Observability](./06-failure-handling-resilience-observability.md)
7. [Local Development, Testing, And Deployment](./07-local-development-testing-deployment.md)
8. [Interview Questions And Answer Patterns](./08-interview-questions-and-answer-patterns.md)

## How To Study This Topic

Keep this sentence in mind:

> Microservices trade local simplicity for independent ownership, deployment, scaling, and failure isolation.

A strong engineer can explain both sides:

- why services help
- why services are harder
- when a modular monolith is better
- what migration path makes sense

## Connection To Artistry Cart

Artistry Cart contains multiple backend services:

- `api-gateway`
- `auth-service`
- `product-service`
- `order-service`
- `recommendation-service`
- `aivision-service`
- `kafka-service`

It also has shared packages and a shared Prisma/MongoDB layer, so it is best described as a practical service-oriented monorepo rather than a textbook fully autonomous microservices system.

