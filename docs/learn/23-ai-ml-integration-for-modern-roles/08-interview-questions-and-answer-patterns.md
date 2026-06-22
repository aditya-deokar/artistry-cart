# Interview Questions And Answer Patterns

This file gives interview-ready answers for AI/ML integration.

## Question: What Is The Difference Between AI And ML?

Strong answer:

> AI is the broad goal of making systems perform intelligent tasks. ML is a way to build those systems by learning patterns from data. In product engineering, we often integrate trained models through inference APIs rather than training foundation models ourselves.

## Question: What Is Inference?

Strong answer:

> Inference is using a trained model to produce an output for a new input, such as generating product data from a prompt, creating an embedding, classifying an image, or ranking recommended products.

## Question: How Do You Integrate An LLM Safely?

Strong answer:

> I keep provider calls on the backend, protect API keys, validate inputs, design prompts carefully, request structured output, validate model responses with schemas, apply rate limits and timeouts, avoid sending secrets, and log latency, errors, and validation failures.

## Question: What Are Embeddings?

Strong answer:

> Embeddings are numeric vectors that represent semantic meaning. Similar text, images, or products should have similar vectors. They are useful for semantic search, visual search, recommendations, clustering, and similarity matching.

## Question: What Is Vector Search?

Strong answer:

> Vector search finds items with embeddings close to a query embedding. At small scale you can compute cosine similarity directly. At larger scale, you usually need an approximate nearest neighbor index or vector database.

## Question: How Would You Design Visual Search?

Strong answer:

> I would generate an embedding for the uploaded image, compare it with stored product image embeddings, apply filters like category and price, rank by similarity, and return the top matches. I would precompute product embeddings in background jobs and use a vector index as the dataset grows.

## Question: How Would You Design Recommendations?

Strong answer:

> I would capture user behavior events asynchronously, materialize analytics state, start with simple fallback and content-based ranking, then add collaborative or model-based ranking as data grows. At scale I would move heavy training and scoring offline and keep online serving fast and cached.

## Question: Why Should AI Work Be Async?

Strong answer:

> AI work can be slow, expensive, and provider-dependent. Long-running generation, embedding backfills, media processing, and batch scoring should often run as background jobs so the user-facing request path stays responsive.

## Question: What Are Common AI Production Risks?

Strong answer:

> Common risks include provider outages, high latency, runaway cost, invalid output, prompt injection, privacy leaks, unsafe content, stale embeddings, job backlog, weak observability, and users trusting generated content too much.

## Question: How Does Artistry Cart Use AI?

Strong answer:

> Artistry Cart uses a dedicated AI Vision service for concept generation, visual search, hybrid search, embeddings, artisan matching, collections, comments, and background jobs. It also uses behavior analytics and TensorFlow.js-style recommendation logic to personalize product discovery.

## Question: Why Is AI Vision A Separate Service?

Strong answer:

> AI Vision has different runtime behavior from normal commerce APIs: external model providers, media handling, embeddings, background jobs, higher latency, higher cost, and different failure modes. A dedicated service keeps core product, auth, and order services cleaner.

## Question: What Would You Improve Next?

Strong answer:

> I would add stronger provider fallback strategy, deeper test coverage for AI failure paths, cost dashboards, latency dashboards, embedding freshness metrics, vector index support as data grows, and more offline recommendation generation.

## Best Short Project Pitch For This Topic

> Artistry Cart treats AI as a real product boundary. AI Vision is isolated behind its own service with validation, embeddings, generation, background jobs, and persistence, while recommendations use Kafka-backed behavior analytics. The architecture is practical because it accounts for AI latency, cost, provider failures, safety, and operational visibility.
