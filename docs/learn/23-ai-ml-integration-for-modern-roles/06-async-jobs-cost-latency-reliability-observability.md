# Async Jobs, Cost, Latency, Reliability, And Observability

## AI Work Is Often Slow

AI workflows can be slower than normal CRUD APIs.

Reasons:

- model inference latency
- image upload/download
- embedding generation
- provider queueing
- large payloads
- retries
- post-processing

Some AI work should be async.

## Sync Versus Async AI

Synchronous AI:

```text
request waits for model output
```

Good for:

- small classification
- quick text extraction
- low-latency provider calls

Asynchronous AI:

```text
request creates job, worker processes later
```

Good for:

- image generation
- batch embeddings
- large media processing
- long-running recommendations
- cleanup and sync jobs

## Background Jobs

Artistry Cart uses Agenda in `aivision-service`.

Recurring jobs include:

- cleanup expired sessions
- cleanup rate limits
- backfill embeddings
- sync product embeddings
- aggregate API usage

This keeps maintenance work out of normal request paths.

## Retry Policy

AI providers can fail temporarily.

Retries help, but careless retries can multiply cost.

Good retry rules:

- retry transient failures
- do not retry validation failures
- use backoff
- limit attempts
- log failures
- avoid duplicate persistence

## Cost Control

AI cost can grow quickly.

Controls:

- rate limits
- quotas
- caching
- batching
- max prompt length
- max output size
- result reuse
- cheaper model for simple tasks
- usage logging
- per-user/session limits

Cost is an architecture concern, not only a billing concern.

## Latency Control

Latency controls:

- timeouts
- async jobs
- progress state
- cached results
- streaming where appropriate
- provider fallback
- precomputed embeddings
- smaller payloads

For user experience, sometimes it is better to return a job ID quickly than to block the request.

## Observability

AI observability should track:

- request count
- provider latency
- error rate
- retry count
- token or unit usage
- cost estimate
- output validation failures
- job duration
- queue lag
- embedding coverage
- rate-limit hits

Without observability, AI features become expensive black boxes.

## Reliability And Fallbacks

Fallback examples:

- show popular products if recommendations fail
- return saved/generated concepts if provider is down
- queue embedding generation for later
- degrade visual search to text/category search
- show retryable status instead of failing silently

## Strong Interview Answer

If asked "What are the production concerns for AI features?", say:

> AI features need cost controls, rate limits, timeouts, retries with backoff, input and output validation, provider failure handling, async jobs for slow work, privacy protections, and observability around latency, errors, usage, validation failures, and job lag.

## Artistry Cart Connection

Artistry Cart uses Agenda jobs for embedding and cleanup work, route validation for AI inputs, output validation for generated product data, rate-limit cleanup, usage aggregation, and service-level observability through shared runtime metrics and logs.
