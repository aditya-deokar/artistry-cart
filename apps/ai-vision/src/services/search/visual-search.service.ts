import prisma from '../../config/database';
import {
    generateImageEmbedding,
    cosineSimilarity,
    findSimilarProducts
} from '../embedding.service';
import { logger } from '../../utils/logger';

export interface VisualSearchInput {
    imageUrl?: string;
    imageBase64?: string;
    filters?: {
        category?: string[];
        priceRange?: { min?: number; max?: number };
        inStock?: boolean;
        artisanId?: string;
    };
    threshold?: number;
    limit?: number;
}

export interface SearchResult {
    productId: string;
    title: string;
    thumbnail: string;
    price: number;
    category: string;
    similarity: number;
    shop?: {
        id: string;
        name: string;
    };
}

export interface VisualSearchResult {
    success: boolean;
    results: SearchResult[];
    total: number;
    queryEmbedding?: number[];
    error?: string;
}

/**
 * Visual search - find products similar to an uploaded image
 */
export async function visualSearch(input: VisualSearchInput): Promise<VisualSearchResult> {
    try {
        const { imageUrl, imageBase64, filters, threshold = 0.7, limit = 20 } = input;

        if (!imageUrl && !imageBase64) {
            return { success: false, results: [], total: 0, error: 'Image required' };
        }

        let queryEmbedding: number[];

        if (imageUrl) {
            const result = await generateImageEmbedding(imageUrl);
            if (!result.success || !result.embedding) {
                return { success: false, results: [], total: 0, error: result.error };
            }
            queryEmbedding = result.embedding;
        } else if (imageBase64) {
            return { success: false, results: [], total: 0, error: 'Base64 images not yet supported' };
        } else {
            return { success: false, results: [], total: 0, error: 'No image provided' };
        }

        logger.info('Running visual search', {
            hasFilters: !!filters,
            threshold,
            limit,
        });

        const similarProducts = await findSimilarProducts(
            queryEmbedding,
            filters,
            limit,
            threshold
        );

        if (similarProducts.length === 0) {
            return {
                success: true,
                results: [],
                total: 0,
                queryEmbedding,
            };
        }

        const productIds = similarProducts.map(p => p.productId);
        const products = await prisma.products.findMany({
            where: { id: { in: productIds } },
            select: {
                id: true,
                title: true,
                images: true,
                current_price: true,
                category: true,
                Shop: {
                    select: { id: true, name: true },
                },
            },
        });

        const productMap = new Map(products.map(p => [p.id, p]));
        const results: SearchResult[] = [];

        for (const sp of similarProducts) {
            const product = productMap.get(sp.productId);
            if (!product) continue;

            const images = product.images as { url?: string; thumbnailUrl?: string }[] | null;
            const thumbnail = images?.[0]?.url || images?.[0]?.thumbnailUrl || '';

            results.push({
                productId: product.id,
                title: product.title,
                thumbnail,
                price: product.current_price,
                category: product.category,
                similarity: sp.similarity,
                shop: product.Shop ? {
                    id: product.Shop.id,
                    name: product.Shop.name,
                } : undefined,
            });
        }

        logger.info('Visual search complete', { resultCount: results.length });

        return {
            success: true,
            results,
            total: results.length,
            queryEmbedding,
        };
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Visual search failed', { error: errorMsg });
        return { success: false, results: [], total: 0, error: errorMsg };
    }
}

/**
 * Find similar concepts in the gallery
 */
export async function findSimilarConcepts(
    imageUrl: string,
    limit: number = 10,
    threshold: number = 0.7
): Promise<{ conceptId: string; similarity: number; thumbnailUrl: string }[]> {
    const embeddingResult = await generateImageEmbedding(imageUrl);

    if (!embeddingResult.success || !embeddingResult.embedding) {
        return [];
    }

    const conceptImages = await prisma.conceptImage.findMany({
        where: {
            embedding: { isEmpty: false },
            isPrimary: true,
        },
        select: {
            conceptId: true,
            embedding: true,
            thumbnailUrl: true,
        },
    });

    const results = conceptImages
        .map(img => ({
            conceptId: img.conceptId,
            similarity: cosineSimilarity(embeddingResult.embedding!, img.embedding),
            thumbnailUrl: img.thumbnailUrl,
        }))
        .filter(r => r.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

    return results;
}
