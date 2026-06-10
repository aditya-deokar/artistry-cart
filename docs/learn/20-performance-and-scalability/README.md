# Performance And Scalability

This folder is the twentieth learning block for preparing for a bigger engineering role. It explains performance and scalability from first principles, then connects those ideas to the Artistry Cart architecture.

The goal is to understand how systems become slow, how teams measure bottlenecks, how they improve latency and throughput, and how they scale frontend, backend, database, cache, queue, and Kubernetes layers responsibly.

## Learning Outcome

After completing this topic, you should be able to explain:

- latency, throughput, capacity, saturation, and bottlenecks
- vertical scaling versus horizontal scaling
- load balancing and stateless services
- caching with Redis, browser cache, CDN, and server-state cache
- database performance, indexes, pagination, and query shape
- async processing with Kafka and queues
- frontend performance and Core Web Vitals
- Node.js and Express performance concerns
- Kubernetes resource requests, limits, replicas, and HPA
- performance testing, load testing, and capacity planning
- how Artistry Cart already improves performance and where it still has scale limits

## Files In This Topic

1. [Performance And Scalability Fundamentals](./01-performance-and-scalability-fundamentals.md)
2. [Latency, Throughput, Bottlenecks, And Capacity](./02-latency-throughput-bottlenecks-capacity.md)
3. [Caching, Redis, CDN, And Server-State Strategy](./03-caching-redis-cdn-server-state-strategy.md)
4. [Database, Query, Pagination, And Data Model Performance](./04-database-query-pagination-data-model-performance.md)
5. [Async Processing, Kafka, Queues, And Backpressure](./05-async-processing-kafka-queues-backpressure.md)
6. [Frontend, API, Node.js, And Gateway Performance](./06-frontend-api-nodejs-gateway-performance.md)
7. [Kubernetes Scaling, Load Testing, And Capacity Planning](./07-kubernetes-scaling-load-testing-capacity-planning.md)
8. [Performance In Artistry Cart And Interview Answers](./08-performance-in-artistry-cart-and-interview-answers.md)

## Core Mental Model

```text
measure first
  -> find bottleneck
  -> reduce wasted work
  -> cache safe reads
  -> move non-critical work async
  -> optimize data access
  -> scale the constrained layer
  -> monitor after the change
```

Performance is not just making code "fast". It is making user-facing workflows reliably meet expected response times under expected load.

## Connection To Artistry Cart

Artistry Cart already has several performance-oriented choices:

- Kafka keeps analytics writes off foreground commerce paths
- Redis exists as a shared cache/fast-path layer with graceful degradation
- product pricing stores effective values like `current_price` and `is_on_discount`
- recommendation outputs are cached with a reuse window
- React Query reduces repeated frontend fetch pressure
- API gateway rate limiting protects backend services
- Kubernetes manifests define resources, replicas, and HPA for main stateless services
- observability exposes request count, errors, duration totals, inflight requests, and Kafka queue signals

The honest scale story: the project has practical performance foundations, while the next maturity steps are deeper measurement, tuned indexes, domain metrics, offline recommendation work, CDN strategy, central dashboards, and load testing.
