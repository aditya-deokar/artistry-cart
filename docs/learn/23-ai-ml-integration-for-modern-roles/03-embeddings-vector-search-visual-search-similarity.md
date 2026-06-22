# Embeddings, Vector Search, Visual Search, And Similarity

## What Embeddings Are

Embeddings are numeric vectors that represent semantic meaning.

Example:

```text
"red handmade necklace" -> [0.23, -0.11, 0.84, ...]
```

Similar items should have vectors close to each other.

## Why Embeddings Matter

Embeddings let software search by meaning, not only exact keywords.

They support:

- semantic search
- visual search
- similar product search
- concept matching
- recommendation features
- clustering

## Vector Similarity

Vector similarity measures how close two embeddings are.

Common measure:

```text
cosine similarity
```

Cosine similarity compares direction rather than raw magnitude.

Higher similarity usually means more related.

## Vector Search

Vector search finds nearest embeddings.

Simple approach:

```text
load embeddings -> compute similarity -> sort -> return top results
```

This works for small datasets.

At larger scale, use a vector index or vector database.

## Visual Search

Visual search uses image-derived embeddings.

Flow:

```text
user image -> embedding -> compare with product embeddings -> return similar products
```

This is useful when users know what something looks like but do not know the right search keywords.

## Hybrid Search

Hybrid search combines text and visual signals.

Example:

```text
query text + image -> weighted semantic/visual match -> filtered product results
```

Hybrid search can outperform pure keyword or pure image search when users provide mixed intent.

## Embedding Freshness

Embeddings can become stale.

Examples:

- product image changes
- concept is refined
- embedding model changes
- product category changes

You need background jobs to keep embeddings fresh.

## Artistry Cart Embedding Flow

`aivision-service` has:

- `generateTextEmbedding`
- `generateImageEmbedding`
- `storeConceptImageEmbedding`
- `storeProductEmbedding`
- `cosineSimilarity`
- similar concept/product lookup

It stores embeddings on concept images and product embedding records.

## Scaling Concern

Current simple similarity search can scan stored embeddings.

That is fine for a learning/product baseline.

At larger scale, the next step would be:

- vector index
- vector database
- ANN search
- batch embedding jobs
- embedding versioning
- freshness metrics

ANN means approximate nearest neighbor search.

## Strong Interview Answer

If asked "What are embeddings used for?", say:

> Embeddings convert text, images, or items into numeric vectors where semantic similarity becomes measurable. They are useful for semantic search, visual search, recommendations, and similarity matching. At small scale you can compare vectors directly; at larger scale you usually need a vector index or vector database.

## Artistry Cart Connection

Artistry Cart uses embeddings for visual and concept similarity. Agenda jobs backfill concept embeddings and sync product embeddings so AI search can improve over time.
