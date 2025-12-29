import { RequestHandler } from 'express';
import { visualSearch, findSimilarConcepts } from '../services/search/visual-search.service';
import { hybridSearch } from '../services/search/hybrid-search.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import prisma from '../../../../packages/libs/prisma';

// ============================================
// Visual Search
// ============================================
export const visualSearchHandler: RequestHandler = async (req, res, next): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const startTime = Date.now();

    try {
        const { imageUrl, filters, threshold, limit } = req.body;

        logger.info('Visual search request', {
            userId: authReq.user?.id,
            hasFilters: !!filters,
        });

        const result = await visualSearch({
            imageUrl,
            filters,
            threshold: threshold || 0.7,
            limit: limit || 20,
        });

        await logSearchUsage(authReq, 'visual', startTime, result.success, result.results.length);

        if (!result.success) {
            res.status(400).json({
                success: false,
                error: { code: 'SEARCH_FAILED', message: result.error },
            });
            return;
        }

        res.json({
            success: true,
            data: {
                results: result.results,
                total: result.total,
                searchType: 'visual',
            },
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// Hybrid Search
// ============================================
export const hybridSearchHandler: RequestHandler = async (req, res, next): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const startTime = Date.now();

    try {
        const { query, imageUrl, weights, filters, limit } = req.body;

        logger.info('Hybrid search request', {
            userId: authReq.user?.id,
            hasQuery: !!query,
            hasImage: !!imageUrl,
        });

        const result = await hybridSearch({
            query,
            imageUrl,
            weights: weights || { text: 0.5, visual: 0.5 },
            filters,
            limit: limit || 20,
        });

        await logSearchUsage(authReq, 'hybrid', startTime, result.success, result.results.length);

        if (!result.success) {
            res.status(400).json({
                success: false,
                error: { code: 'SEARCH_FAILED', message: result.error },
            });
            return;
        }

        res.json({
            success: true,
            data: {
                results: result.results,
                total: result.total,
                searchType: result.searchType,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// Similar Concepts Search
// ============================================
export const similarConceptsHandler: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        const { imageUrl, limit, threshold } = req.body;

        if (!imageUrl) {
            res.status(400).json({
                success: false,
                error: { code: 'BAD_REQUEST', message: 'imageUrl required' },
            });
            return;
        }

        logger.info('Similar concepts search');

        const results = await findSimilarConcepts(
            imageUrl,
            limit || 10,
            threshold || 0.7
        );

        res.json({
            success: true,
            data: {
                concepts: results,
                total: results.length,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// Quick Product Search (text only)
// ============================================
export const quickSearchHandler: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        const { q, category, limit = '10' } = req.query;

        if (!q || typeof q !== 'string') {
            res.status(400).json({
                success: false,
                error: { code: 'BAD_REQUEST', message: 'Search query required' },
            });
            return;
        }

        const where: any = {
            isDeleted: false,
            status: 'Active',
            OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
            ],
        };

        if (category && typeof category === 'string') {
            where.category = category;
        }

        const products = await prisma.products.findMany({
            where,
            select: {
                id: true,
                title: true,
                images: true,
                current_price: true,
                category: true,
            },
            take: Math.min(parseInt(limit as string) || 10, 50),
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            data: {
                results: products.map(p => ({
                    id: p.id,
                    title: p.title,
                    thumbnail: (p.images as any)?.[0]?.url || '',
                    price: p.current_price,
                    category: p.category,
                })),
                total: products.length,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// HELPER
// ============================================

async function logSearchUsage(
    req: AuthenticatedRequest,
    searchType: string,
    startTime: number,
    success: boolean,
    resultCount: number
) {
    try {
        await prisma.aPIUsageLog.create({
            data: {
                userId: req.user?.id,
                sessionToken: req.sessionToken,
                requestId: req.requestId,
                endpoint: `search/${searchType}`,
                service: 'embedding',
                success,
                durationMs: Date.now() - startTime,
            },
        });
    } catch (error) {
        logger.error('Failed to log search usage', { error });
    }
}
