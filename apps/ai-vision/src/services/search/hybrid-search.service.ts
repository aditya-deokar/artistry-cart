import prisma from '../../config/database';
import { generateTextEmbedding, cosineSimilarity } from '../embedding.service';
import { visualSearch, SearchResult } from './visual-search.service';
import { logger } from '../../utils/logger';

export interface HybridSearchInput {
    query?: string;
    imageUrl?: string;
    weights?: {
        text: number;
        visual: number;
    };
    filters?: {
        category?: string[];
        priceRange?: { min?: number; max?: number };
        inStock?: boolean;
    };
    limit?: number;
}

export interface HybridSearchResult {
    success: boolean;
    results: SearchResult[];
    total: number;
    searchType: 'text' | 'visual' | 'hybrid';
    error?: string;
}

/**
 * Hybrid search combining text and visual similarity
 */
export async function hybridSearch(input: HybridSearchInput): Promise<HybridSearchResult> {
    const {
        query,
        imageUrl,
        weights = { text: 0.5, visual: 0.5 },
        filters,
        limit = 20,
    } = input;

    // Determine search type
    const hasText = !!query?.trim();
    const hasImage = !!imageUrl;

    if (!hasText && !hasImage) {
        return {
            success: false,
            results: [],
            total: 0,
            searchType: 'hybrid',
            error: 'Query or image required'
        };
    }

    try {
        // Text-only search
        if (hasText && !hasImage) {
            return await textSearch(query!, filters, limit);
        }

        // Visual-only search
        if (hasImage && !hasText) {
            const visualResult = await visualSearch({ imageUrl, filters, limit });
            return {
                ...visualResult,
                searchType: 'visual',
            };
        }

        // Hybrid search
        logger.info('Running hybrid search', { query, hasImage: true, weights });

        const [textResults, visualResults] = await Promise.all([
            textSearch(query!, filters, limit * 2),
            visualSearch({ imageUrl, filters, limit: limit * 2 }),
        ]);

        // Merge and re-rank results
        const merged = mergeResults(
            textResults.results,
            visualResults.results,
            weights.text,
            weights.visual
        );

        return {
            success: true,
            results: merged.slice(0, limit),
            total: merged.length,
            searchType: 'hybrid',
        };
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Hybrid search failed', { error: errorMsg });
        return { success: false, results: [], total: 0, searchType: 'hybrid', error: errorMsg };
    }
}

/**
 * Text-based search using embeddings
 */
async function textSearch(
    query: string,
    filters?: HybridSearchInput['filters'],
    limit: number = 20
): Promise<HybridSearchResult> {
    // Generate text embedding
    const embeddingResult = await generateTextEmbedding(query);

    if (!embeddingResult.success || !embeddingResult.embedding) {
        // Fallback to keyword search
        return keywordSearch(query, filters, limit);
    }

    // Get product embeddings
    const productEmbeddings = await prisma.productEmbedding.findMany({
        select: {
            productId: true,
            embedding: true,
        },
    });

    // Calculate similarities
    const similarities = productEmbeddings
        .map(pe => ({
            productId: pe.productId,
            similarity: cosineSimilarity(embeddingResult.embedding!, pe.embedding),
        }))
        .filter(s => s.similarity > 0.3)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit * 2);

    // Build filter query
    const where: any = {
        id: { in: similarities.map(s => s.productId) },
        isDeleted: false,
        status: 'Active',
    };

    if (filters?.category?.length) {
        where.category = { in: filters.category };
    }
    if (filters?.priceRange?.min) {
        where.current_price = { ...where.current_price, gte: filters.priceRange.min };
    }
    if (filters?.priceRange?.max) {
        where.current_price = { ...where.current_price, lte: filters.priceRange.max };
    }
    if (filters?.inStock) {
        where.stock = { gt: 0 };
    }

    const products = await prisma.products.findMany({
        where,
        select: {
            id: true,
            title: true,
            images: true,
            current_price: true,
            category: true,
            Shop: { select: { id: true, name: true } },
        },
    });

    const similarityMap = new Map(similarities.map(s => [s.productId, s.similarity]));

    const results: SearchResult[] = products
        .map(p => {
            const images = p.images as any[];
            return {
                productId: p.id,
                title: p.title,
                thumbnail: images?.[0]?.url || images?.[0]?.thumbnailUrl || '',
                price: p.current_price,
                category: p.category,
                similarity: similarityMap.get(p.id) || 0,
                shop: p.Shop ? { id: p.Shop.id, name: p.Shop.name } : undefined,
            };
        })
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

    return {
        success: true,
        results,
        total: results.length,
        searchType: 'text',
    };
}

/**
 * Fallback keyword search
 */
async function keywordSearch(
    query: string,
    filters?: HybridSearchInput['filters'],
    limit: number = 20
): Promise<HybridSearchResult> {
    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2);

    if (keywords.length === 0) {
        return { success: true, results: [], total: 0, searchType: 'text' };
    }

    // Build where clause for keyword matching
    const where: any = {
        isDeleted: false,
        status: 'Active',
        OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
            { tags: { hasSome: keywords } },
        ],
    };

    if (filters?.category?.length) {
        where.category = { in: filters.category };
    }
    if (filters?.priceRange?.min) {
        where.current_price = { gte: filters.priceRange.min };
    }
    if (filters?.priceRange?.max) {
        where.current_price = { ...where.current_price, lte: filters.priceRange.max };
    }
    if (filters?.inStock) {
        where.stock = { gt: 0 };
    }

    const products = await prisma.products.findMany({
        where,
        select: {
            id: true,
            title: true,
            images: true,
            current_price: true,
            category: true,
            Shop: { select: { id: true, name: true } },
        },
        take: limit,
        orderBy: { current_price: 'asc' },
    });

    const results: SearchResult[] = products.map(p => {
        const images = p.images as any[];
        return {
            productId: p.id,
            title: p.title,
            thumbnail: images?.[0]?.url || '',
            price: p.current_price,
            category: p.category,
            similarity: 0.5, // Default for keyword matches
            shop: p.Shop ? { id: p.Shop.id, name: p.Shop.name } : undefined,
        };
    });

    return {
        success: true,
        results,
        total: results.length,
        searchType: 'text',
    };
}

/**
 * Merge and re-rank results from text and visual search
 */
function mergeResults(
    textResults: SearchResult[],
    visualResults: SearchResult[],
    textWeight: number,
    visualWeight: number
): SearchResult[] {
    const productScores = new Map<string, { result: SearchResult; textScore: number; visualScore: number }>();

    // Process text results
    for (const result of textResults) {
        productScores.set(result.productId, {
            result,
            textScore: result.similarity,
            visualScore: 0,
        });
    }

    // Process visual results
    for (const result of visualResults) {
        const existing = productScores.get(result.productId);
        if (existing) {
            existing.visualScore = result.similarity;
        } else {
            productScores.set(result.productId, {
                result,
                textScore: 0,
                visualScore: result.similarity,
            });
        }
    }

    // Calculate combined scores and sort
    return Array.from(productScores.values())
        .map(({ result, textScore, visualScore }) => ({
            ...result,
            similarity: textScore * textWeight + visualScore * visualWeight,
        }))
        .sort((a, b) => b.similarity - a.similarity);
}
