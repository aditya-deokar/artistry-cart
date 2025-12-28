import { HfInference } from '@huggingface/inference';

import { config } from '../config';
import { logger } from '../utils/logger';
import { withRetry } from '../utils/retry';
import prisma from '../config/database';

// HuggingFace client (lazy init)
let hfClient: HfInference | null = null;

function getHfClient(): HfInference | null {
    if (!config.huggingfaceApiKey) {
        logger.warn('HuggingFace API key not configured');
        return null;
    }
    if (!hfClient) {
        hfClient = new HfInference(config.huggingfaceApiKey);
    }
    return hfClient;
}

const EMBEDDING_MODEL = 'openai/clip-vit-large-patch14';

export interface EmbeddingResult {
    success: boolean;
    embedding?: number[];
    error?: string;
}

/**
 * Generate image embedding using CLIP
 */
export async function generateImageEmbedding(imageUrl: string): Promise<EmbeddingResult> {
    const client = getHfClient();

    if (!client) {
        return { success: false, error: 'HuggingFace not configured' };
    }

    try {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            return { success: false, error: `Failed to fetch image: ${imageResponse.status}` };
        }

        const imageBlob = await imageResponse.blob();

        const embedding = await withRetry(async () => {
            // Use any to bypass strict type checking for HuggingFace inputs
            const result = await client.featureExtraction({
                model: EMBEDDING_MODEL,
                inputs: imageBlob as unknown as string,
            });

            if (Array.isArray(result)) {
                if (Array.isArray(result[0])) {
                    return (result as number[][]).flat();
                }
                return result as number[];
            }

            throw new Error('Unexpected embedding format');
        }, { maxRetries: 2, delayMs: 1000 });

        logger.info('Generated image embedding', {
            dimension: embedding.length,
            url: imageUrl.substring(0, 50),
        });

        return { success: true, embedding };
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Embedding generation failed', { error: errorMsg });
        return { success: false, error: errorMsg };
    }
}

/**
 * Generate text embedding using CLIP
 */
export async function generateTextEmbedding(text: string): Promise<EmbeddingResult> {
    const client = getHfClient();

    if (!client) {
        return { success: false, error: 'HuggingFace not configured' };
    }

    try {
        const embedding = await withRetry(async () => {
            const result = await client.featureExtraction({
                model: EMBEDDING_MODEL,
                inputs: text,
            });

            if (Array.isArray(result)) {
                if (Array.isArray(result[0])) {
                    return (result as number[][]).flat();
                }
                return result as number[];
            }

            throw new Error('Unexpected embedding format');
        }, { maxRetries: 2, delayMs: 1000 });

        return { success: true, embedding };
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Text embedding failed', { error: errorMsg });
        return { success: false, error: errorMsg };
    }
}

/**
 * Store embedding for a concept image
 */
export async function storeConceptImageEmbedding(
    imageId: string,
    embedding: number[]
): Promise<void> {
    await prisma.conceptImage.update({
        where: { id: imageId },
        data: {
            embedding,
            embeddingModel: EMBEDDING_MODEL,
        },
    });
}

/**
 * Store embedding for a product
 */
export async function storeProductEmbedding(
    productId: string,
    embedding: number[]
): Promise<void> {
    await prisma.productEmbedding.upsert({
        where: { productId },
        create: {
            productId,
            embedding,
            embeddingModel: EMBEDDING_MODEL,
        },
        update: {
            embedding,
            embeddingModel: EMBEDDING_MODEL,
        },
    });
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
}

/**
 * Find similar concepts by embedding
 */
export async function findSimilarConcepts(
    embedding: number[],
    limit: number = 10,
    threshold: number = 0.7
): Promise<Array<{ conceptId: string; similarity: number }>> {
    const images = await prisma.conceptImage.findMany({
        where: {
            embedding: { isEmpty: false },
            isPrimary: true,
        },
        select: {
            conceptId: true,
            embedding: true,
        },
    });

    const similarities = images
        .map(img => ({
            conceptId: img.conceptId,
            similarity: cosineSimilarity(embedding, img.embedding),
        }))
        .filter(item => item.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

    return similarities;
}

/**
 * Find similar products by embedding
 */
export async function findSimilarProducts(
    embedding: number[],
    filters?: {
        category?: string[];
        priceRange?: { min?: number; max?: number };
        inStock?: boolean;
    },
    limit: number = 20,
    threshold: number = 0.7
): Promise<Array<{ productId: string; similarity: number }>> {
    const productEmbeddings = await prisma.productEmbedding.findMany({
        select: {
            productId: true,
            embedding: true,
        },
    });

    let results = productEmbeddings
        .map(pe => ({
            productId: pe.productId,
            similarity: cosineSimilarity(embedding, pe.embedding),
        }))
        .filter(item => item.similarity >= threshold);

    if (filters && Object.keys(filters).length > 0) {
        const productIds = results.map(r => r.productId);

        const validProducts = await prisma.products.findMany({
            where: {
                id: { in: productIds },
                isDeleted: false,
                status: 'Active',
                ...(filters.category?.length && { category: { in: filters.category } }),
                ...(filters.priceRange?.min && { current_price: { gte: filters.priceRange.min } }),
                ...(filters.priceRange?.max && { current_price: { lte: filters.priceRange.max } }),
                ...(filters.inStock && { stock: { gt: 0 } }),
            },
            select: { id: true },
        });

        const validIds = new Set(validProducts.map(p => p.id));
        results = results.filter(r => validIds.has(r.productId));
    }

    return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
}
