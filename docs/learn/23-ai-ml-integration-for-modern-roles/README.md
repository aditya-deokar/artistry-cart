# AI/ML Integration For Modern Roles

This folder is the twenty-third learning block for preparing for a bigger engineering role. It explains AI/ML integration from first principles, then connects those ideas to Artistry Cart's AI Vision and recommendation architecture.

The goal is not to become a research scientist overnight. The goal is to explain how modern engineers integrate AI systems responsibly: model providers, prompts, embeddings, recommendations, validation, background jobs, cost, latency, observability, safety, and product boundaries.

## Learning Outcome

After completing this topic, you should be able to explain:

- AI, ML, LLMs, embeddings, recommendations, and inference
- the difference between model research and product integration
- how to integrate external AI providers into backend services
- prompt design, structured output, and output validation
- embeddings, cosine similarity, visual search, and hybrid search
- recommendation systems and behavior-based personalization
- async AI jobs, queues, retries, and background maintenance
- rate limits, cost control, latency, fallback, and provider failures
- AI safety, privacy, and data governance basics
- how Artistry Cart uses AI Vision and recommendations as real product capabilities

## Files In This Topic

1. [AI/ML Fundamentals For Engineers](./01-ai-ml-fundamentals-for-engineers.md)
2. [LLMs, Prompts, Structured Output, And Validation](./02-llms-prompts-structured-output-validation.md)
3. [Embeddings, Vector Search, Visual Search, And Similarity](./03-embeddings-vector-search-visual-search-similarity.md)
4. [Recommendation Systems And Behavior Analytics](./04-recommendation-systems-behavior-analytics.md)
5. [Backend AI Service Architecture And Provider Integration](./05-backend-ai-service-architecture-provider-integration.md)
6. [Async Jobs, Cost, Latency, Reliability, And Observability](./06-async-jobs-cost-latency-reliability-observability.md)
7. [AI/ML In Artistry Cart](./07-ai-ml-in-artistry-cart.md)
8. [Interview Questions And Answer Patterns](./08-interview-questions-and-answer-patterns.md)

## Core Mental Model

```text
user need
  -> AI capability
  -> model/provider choice
  -> prompt/input design
  -> validation and safety
  -> persistence and product workflow
  -> cost/latency controls
  -> observability and improvement loop
```

For modern full-stack and backend roles, the important skill is not only calling an AI API. It is turning AI into a reliable product capability.

## Connection To Artistry Cart

Artistry Cart has two major AI/ML areas:

- `aivision-service`: AI-assisted concept generation, visual search, hybrid search, embeddings, artisan matching, collections, comments, and background jobs
- `recommendation-service`: behavior-based product recommendations using analytics materialized from Kafka events

The senior framing is:

> AI is isolated behind a dedicated service because its latency, provider dependencies, media handling, embeddings, background jobs, cost, and failure modes are different from normal commerce APIs.
