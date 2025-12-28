import { RequestHandler } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

// ============================================
// List Gallery (Public concepts)
// ============================================
export const listGallery: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        const {
            page = '1',
            limit = '20',
            category,
            sortBy = 'recent',
        } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = Math.min(parseInt(limit as string, 10), 50);
        const offset = (pageNum - 1) * limitNum;

        logger.info('List gallery', { page: pageNum, limit: limitNum, category });

        const where: any = {
            isSaved: true,
            status: { in: ['GENERATED', 'SAVED', 'SENT_TO_ARTISANS', 'REALIZED'] },
        };

        if (category) {
            where.generatedProduct = {
                category: category as string,
            };
        }

        let orderBy: any = { createdAt: 'desc' };
        if (sortBy === 'popular') {
            orderBy = { viewCount: 'desc' };
        } else if (sortBy === 'favorites') {
            orderBy = { isFavorite: 'desc' };
        }

        const [items, total] = await Promise.all([
            prisma.concept.findMany({
                where,
                include: {
                    images: {
                        where: { isPrimary: true },
                        take: 1,
                    },
                    generatedProduct: {
                        select: {
                            title: true,
                            category: true,
                            subCategory: true,
                            estimatedPriceMin: true,
                            estimatedPriceMax: true,
                            materials: true,
                            styleKeywords: true,
                        },
                    },
                    session: {
                        select: {
                            userId: true,
                        },
                    },
                    _count: {
                        select: {
                            artisanMatches: true,
                        },
                    },
                },
                orderBy,
                take: limitNum,
                skip: offset,
            }),
            prisma.concept.count({ where }),
        ]);

        const galleryItems = items.map(item => ({
            id: item.id,
            title: item.generatedProduct?.title || item.generationPrompt.substring(0, 50),
            thumbnailUrl: item.images[0]?.thumbnailUrl || item.thumbnailUrl || item.primaryImageUrl,
            imageUrl: item.images[0]?.originalUrl || item.primaryImageUrl,
            category: item.generatedProduct?.category,
            subCategory: item.generatedProduct?.subCategory,
            priceRange: item.generatedProduct ? {
                min: item.generatedProduct.estimatedPriceMin,
                max: item.generatedProduct.estimatedPriceMax,
            } : null,
            materials: item.generatedProduct?.materials || [],
            styleKeywords: item.generatedProduct?.styleKeywords || [],
            viewCount: item.viewCount,
            isFavorite: item.isFavorite,
            matchCount: item._count.artisanMatches,
            status: item.status,
            createdAt: item.createdAt,
        }));

        res.json({
            success: true,
            data: {
                items: galleryItems,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    pages: Math.ceil(total / limitNum),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// Get Gallery Item Details
// ============================================
export const getGalleryItem: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        const { id } = req.params;
        logger.info('Get gallery item', { itemId: id });

        const concept = await prisma.concept.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
            include: {
                images: {
                    orderBy: { position: 'asc' },
                },
                generatedProduct: true,
                artisanMatches: {
                    where: {
                        status: { in: ['INTERESTED', 'QUOTED', 'ACCEPTED'] },
                    },
                    orderBy: { overallScore: 'desc' },
                    take: 5,
                },
                session: {
                    select: { userId: true },
                },
            },
        });

        if (!concept) {
            res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Gallery item not found' },
            });
            return;
        }

        res.json({
            success: true,
            data: {
                id: concept.id,
                title: concept.generatedProduct?.title || concept.generationPrompt,
                prompt: concept.generationPrompt,
                enhancedPrompt: concept.enhancedPrompt,
                images: concept.images.map(img => ({
                    id: img.id,
                    url: img.originalUrl,
                    thumbnailUrl: img.thumbnailUrl,
                    isPrimary: img.isPrimary,
                    position: img.position,
                    dominantColors: img.dominantColors,
                })),
                product: concept.generatedProduct ? {
                    title: concept.generatedProduct.title,
                    description: concept.generatedProduct.description,
                    detailedDescription: concept.generatedProduct.detailedDescription,
                    category: concept.generatedProduct.category,
                    subCategory: concept.generatedProduct.subCategory,
                    tags: concept.generatedProduct.tags,
                    materials: concept.generatedProduct.materials,
                    colors: concept.generatedProduct.colors,
                    sizes: concept.generatedProduct.sizes,
                    priceRange: {
                        min: concept.generatedProduct.estimatedPriceMin,
                        max: concept.generatedProduct.estimatedPriceMax,
                        confidence: concept.generatedProduct.priceConfidence,
                        rationale: concept.generatedProduct.pricingRationale,
                    },
                    complexity: concept.generatedProduct.complexityLevel,
                    estimatedDuration: concept.generatedProduct.estimatedDuration,
                    requiredSkills: concept.generatedProduct.requiredSkills,
                    feasibility: {
                        score: concept.generatedProduct.feasibilityScore,
                        notes: concept.generatedProduct.feasibilityNotes,
                    },
                    styleKeywords: concept.generatedProduct.styleKeywords,
                    designNotes: concept.generatedProduct.designNotes,
                } : null,
                interestedArtisans: concept.artisanMatches.length,
                viewCount: concept.viewCount,
                isFavorite: concept.isFavorite,
                status: concept.status,
                createdAt: concept.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// Toggle Favorite
// ============================================
export const toggleFavorite: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        const { id } = req.params;
        logger.info('Toggle favorite', { conceptId: id });

        const concept = await prisma.concept.findUnique({
            where: { id },
            select: { isFavorite: true },
        });

        if (!concept) {
            res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Concept not found' },
            });
            return;
        }

        const updated = await prisma.concept.update({
            where: { id },
            data: { isFavorite: !concept.isFavorite },
            select: { id: true, isFavorite: true },
        });

        res.json({
            success: true,
            data: updated,
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// Get Related Items
// ============================================
export const getRelatedItems: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        const { id } = req.params;
        const limit = parseInt(req.query.limit as string || '6', 10);

        const concept = await prisma.concept.findUnique({
            where: { id },
            include: { generatedProduct: true },
        });

        if (!concept) {
            res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Concept not found' },
            });
            return;
        }

        const related = await prisma.concept.findMany({
            where: {
                id: { not: id },
                isSaved: true,
                generatedProduct: concept.generatedProduct ? {
                    OR: [
                        { category: concept.generatedProduct.category },
                        { styleKeywords: { hasSome: concept.generatedProduct.styleKeywords } },
                    ],
                } : undefined,
            },
            include: {
                images: { where: { isPrimary: true }, take: 1 },
                generatedProduct: {
                    select: { title: true, category: true, estimatedPriceMin: true, estimatedPriceMax: true },
                },
            },
            take: limit,
            orderBy: { viewCount: 'desc' },
        });

        res.json({
            success: true,
            data: {
                items: related.map(item => ({
                    id: item.id,
                    title: item.generatedProduct?.title || item.generationPrompt.substring(0, 50),
                    thumbnailUrl: item.images[0]?.thumbnailUrl || item.thumbnailUrl,
                    category: item.generatedProduct?.category,
                    priceRange: item.generatedProduct ? {
                        min: item.generatedProduct.estimatedPriceMin,
                        max: item.generatedProduct.estimatedPriceMax,
                    } : null,
                })),
            },
        });
    } catch (error) {
        next(error);
    }
};
