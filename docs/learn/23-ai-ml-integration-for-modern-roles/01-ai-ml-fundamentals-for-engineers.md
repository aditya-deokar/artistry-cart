# AI/ML Fundamentals For Engineers

## What AI Means

AI means building systems that perform tasks that normally require human-like intelligence.

Examples:

- generate text
- classify images
- recommend products
- summarize content
- search by meaning
- detect patterns
- match users to items

In product engineering, AI is usually a capability inside a larger system.

## What ML Means

ML means machine learning.

Instead of hand-coding every rule, the system learns patterns from data.

Examples:

- learn which products users may like
- classify an image category
- predict fraud risk
- estimate product similarity

## Model

A model is the learned function used for prediction or generation.

Examples:

- LLM for text generation
- embedding model for semantic vectors
- recommendation model for product ranking
- image model for visual understanding

## Training Versus Inference

Training:

```text
learn model parameters from data
```

Inference:

```text
use the model to generate or predict output
```

Most application engineers integrate inference. They may not train foundation models from scratch.

## LLM

LLM means large language model.

LLMs are used for:

- text generation
- structured extraction
- classification
- reasoning assistance
- code generation
- product descriptions
- prompt-driven workflows

An LLM is probabilistic. It can produce different outputs for similar inputs.

## Embeddings

An embedding is a numeric vector that represents meaning.

Example:

```text
"blue ceramic vase" -> [0.12, -0.44, 0.91, ...]
```

Similar things should have similar vectors.

Embeddings are useful for:

- semantic search
- visual search
- recommendations
- clustering
- duplicate detection

## Recommendation Systems

Recommendation systems rank items for a user.

Signals can include:

- product views
- add to cart
- wishlist
- purchases
- category preference
- similar users
- similar items

Recommendation systems are both ML and product design problems.

## AI Product Integration

AI product integration means wrapping model behavior inside a real workflow.

You need:

- input validation
- output validation
- persistence
- auth and rate limits
- cost controls
- fallback behavior
- observability
- user experience for slow or failed model calls

## Strong Interview Answer

If asked "What should a backend engineer know about AI/ML?", say:

> A backend engineer should understand inference, prompts, embeddings, recommendations, model latency, provider failures, input/output validation, cost controls, privacy, observability, and how AI fits into a product workflow. Most roles do not require training foundation models, but they do require integrating model capabilities reliably.

## Artistry Cart Connection

Artistry Cart uses AI in product-facing ways: AI Vision helps users generate and search concepts, while recommendation logic uses behavior analytics to personalize product discovery.
