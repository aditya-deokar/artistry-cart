# Performance And Scalability Fundamentals

## What Performance Means

Performance is how efficiently a system responds to work.

In web systems, performance usually means:

- pages load quickly
- APIs respond quickly
- jobs complete in expected time
- resources are not wasted
- users do not feel delay

Performance is about speed and efficiency at a given load.

## What Scalability Means

Scalability is the system's ability to handle more work by adding resources or changing architecture.

More work can mean:

- more users
- more requests per second
- larger catalog
- more orders
- more images
- more Kafka events
- more AI jobs
- more tenants or sellers

Scalability is not the same as current speed. A system can be fast for 10 users and fail for 10,000 users.

## Performance Versus Scalability

Performance asks:

```text
how fast is the system now?
```

Scalability asks:

```text
what happens when load grows?
```

A senior engineer cares about both.

## Optimization Rule

The first rule:

```text
measure before optimizing
```

Without measurement, performance work becomes guessing.

Good measurements:

- API latency by route
- p95 and p99 latency
- error rate
- request rate
- CPU and memory
- database query time
- cache hit rate
- queue size or lag
- frontend Core Web Vitals

## Local Optimization Versus System Optimization

Local optimization improves one piece of code.

System optimization improves the whole user flow.

Example:

```text
optimizing a function by 5 ms does not help if the database query takes 2 seconds
```

Interviewers like when you can reason about the whole path.

## Vertical Scaling

Vertical scaling means making one machine or instance bigger.

Examples:

- more CPU
- more memory
- faster disk
- larger database instance

Pros:

- simple
- fewer distributed-system problems

Cons:

- hard upper limit
- can become expensive
- one instance may remain a failure point

## Horizontal Scaling

Horizontal scaling means adding more instances.

Examples:

- more API gateway pods
- more backend service pods
- more workers
- more frontend servers

Pros:

- can handle more traffic
- better availability
- natural fit for stateless services

Cons:

- requires load balancing
- requires stateless app design or externalized state
- can expose shared bottlenecks like database or cache

## Stateless Services

A stateless service does not depend on local instance memory for user state.

State should live in:

- database
- Redis
- object storage
- external queue
- signed tokens or sessions

Stateless services scale horizontally more easily because any instance can handle any request.

## Strong Interview Answer

If asked "What is the difference between performance and scalability?", say:

> Performance is how quickly and efficiently the system handles work under current conditions. Scalability is how well the system handles growth in users, traffic, data, or jobs. I measure first, find the bottleneck, reduce wasted work, cache safe reads, move non-critical work async, optimize data access, and then scale the constrained layer.

## Artistry Cart Connection

Artistry Cart is built as a service-oriented monorepo, which gives it several scale levers: independent backend services, a gateway, Redis, Kafka, Kubernetes replicas, HPA, and separate frontend apps. But shared MongoDB and some request-time recommendation/AI work are still important constraints.
