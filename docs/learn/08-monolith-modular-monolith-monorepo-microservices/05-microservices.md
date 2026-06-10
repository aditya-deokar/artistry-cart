# Microservices

## What Are Microservices

Microservices are independently runnable services split around business or technical capabilities.

Each service usually owns:

- its API
- its business behavior
- its deployment unit
- its logs and health checks
- ideally its data ownership

## Typical Shape

```text
client -> gateway -> auth-service
                  -> product-service
                  -> order-service
                  -> recommendation-service
```

Services communicate through:

- HTTP
- gRPC
- events
- queues
- streams

## Benefits

### Independent Deployment

Teams can deploy one service without redeploying the whole backend.

### Independent Scaling

High-traffic services can scale separately.

Example:

```text
scale product-service more than auth-service
```

### Failure Isolation

A failure in recommendations should not necessarily break checkout.

### Team Ownership

Teams can own services around business capabilities.

### Technology Flexibility

Different services can use different tools when justified.

## Costs

### Distributed System Complexity

Network calls fail. Messages duplicate. Services deploy at different times.

### Data Consistency

Cross-service transactions are hard.

### More Operations

More services means more:

- deployments
- health checks
- logs
- metrics
- alerts
- configs
- secrets

### Harder Local Development

Developers may need many services and dependencies running.

### Contract Management

APIs and event schemas need versioning and compatibility.

## Database Per Service

Textbook microservices prefer each service owning its own database or schema.

This improves autonomy but makes joins and transactions harder.

Shared databases are simpler but reduce service independence.

## When Microservices Make Sense

Good fit when:

- domain boundaries are clear
- teams need independent ownership
- services scale differently
- failure isolation matters
- independent deployment matters
- organization can handle DevOps complexity

## When Microservices Are Premature

Risky when:

- team is small
- domain is unclear
- product changes rapidly
- infrastructure maturity is low
- one database transaction spans everything
- operational overhead would slow delivery

## Interview Explanation

If asked "What are microservices?", say:

> Microservices split a system into independently runnable services around business capabilities. They improve independent deployment, scaling, ownership, and failure isolation, but introduce distributed system problems such as network failures, data consistency, observability, testing, and deployment coordination.

## Connection To Artistry Cart

Artistry Cart has service boundaries for:

- auth
- product/catalog
- orders/payments
- recommendations
- AI Vision
- gateway
- Kafka analytics

But it still shares Prisma/MongoDB, so it is service-oriented rather than fully autonomous microservices.

