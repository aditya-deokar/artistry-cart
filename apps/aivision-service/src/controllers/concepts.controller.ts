import { RequestHandler } from 'express';
import { getUserConcepts, getConceptById, saveConcept as saveConceptService, deleteConcept as deleteConceptService } from '../services/session.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import prisma from '../../../../packages/libs/prisma';

// ============================================
// List Concepts
// ============================================
export const listConcepts: RequestHandler = async (req, res, next): Promise<void> => {
    const authReq = req as AuthenticatedRequest;

    try {
        const { saved, limit, offset } = req.query;

        logger.info('List concepts', { userId: authReq.user?.id });

        const result = await getUserConcepts(
            authReq.user?.id,
            authReq.sessionToken,
            {
                savedOnly: saved === 'true',
                limit: limit ? parseInt(limit as string, 10) : 20,
                offset: offset ? parseInt(offset as string, 10) : 0,
            }
        );

        res.json({
            success: true,
            data: {
                concepts: result.concepts.map(c => ({
                    id: c.id,
                    prompt: c.generationPrompt,
                    thumbnailUrl: c.images[0]?.thumbnailUrl || c.primaryImageUrl,
                    isSaved: c.isSaved,
                    isFavorite: c.isFavorite,
                    status: c.status,
                    product: c.generatedProduct ? {
                        title: c.generatedProduct.title,
                        category: c.generatedProduct.category,
                        priceRange: {
                            min: c.generatedProduct.estimatedPriceMin,
                            max: c.generatedProduct.estimatedPriceMax,
                        },
                    } : null,
                    createdAt: c.createdAt,
                })),
                total: result.total,
                limit: limit ? parseInt(limit as string, 10) : 20,
                offset: offset ? parseInt(offset as string, 10) : 0,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// Get Single Concept
// ============================================
export const getConcept: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        const { id } = req.params;
        logger.info('Get concept', { conceptId: id });

        const concept = await getConceptById(id);

        if (!concept) {
            res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Concept not found' },
            });
            return;
        }

        res.json({
            success: true,
            data: {
                id: concept.id,
                prompt: concept.generationPrompt,
                enhancedPrompt: concept.enhancedPrompt,
                images: concept.images.map(img => ({
                    id: img.id,
                    url: img.originalUrl,
                    thumbnailUrl: img.thumbnailUrl,
                    isPrimary: img.isPrimary,
                    position: img.position,
                })),
                product: concept.generatedProduct ? {
                    id: concept.generatedProduct.id,
                    title: concept.generatedProduct.title,
                    description: concept.generatedProduct.description,
                    detailedDescription: concept.generatedProduct.detailedDescription,
                    category: concept.generatedProduct.category,
                    subCategory: concept.generatedProduct.subCategory,
                    tags: concept.generatedProduct.tags,
                    materials: concept.generatedProduct.materials,
                    colors: concept.generatedProduct.colors,
                    priceRange: {
                        min: concept.generatedProduct.estimatedPriceMin,
                        max: concept.generatedProduct.estimatedPriceMax,
                        confidence: concept.generatedProduct.priceConfidence,
                    },
                    complexity: concept.generatedProduct.complexityLevel,
                    feasibility: {
                        score: concept.generatedProduct.feasibilityScore,
                        notes: concept.generatedProduct.feasibilityNotes,
                    },
                } : null,
                analyzedFeatures: concept.analyzedFeatures,
                isSaved: concept.isSaved,
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
// Save Concept
// ============================================
export const saveConcept: RequestHandler = async (req, res, next): Promise<void> => {
    const authReq = req as AuthenticatedRequest;

    try {
        const { id } = req.params;
        const { title } = req.body;

        logger.info('Save concept', { conceptId: id, userId: authReq.user?.id });

        const concept = await getConceptById(id);
        if (!concept) {
            res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Concept not found' },
            });
            return;
        }

        if (concept.session?.userId && concept.session.userId !== authReq.user?.id) {
            res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Not authorized to save this concept' },
            });
            return;
        }

        await saveConceptService(id, title);

        res.json({
            success: true,
            data: { conceptId: id, saved: true },
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// Delete Concept
// ============================================
export const deleteConcept: RequestHandler = async (req, res, next): Promise<void> => {
    const authReq = req as AuthenticatedRequest;

    try {
        const { id } = req.params;
        logger.info('Delete concept', { conceptId: id, userId: authReq.user?.id });

        const concept = await getConceptById(id);
        if (!concept) {
            res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Concept not found' },
            });
            return;
        }

        if (concept.session?.userId && concept.session.userId !== authReq.user?.id) {
            res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Not authorized to delete this concept' },
            });
            return;
        }

        await deleteConceptService(id);

        res.json({
            success: true,
            data: { conceptId: id, deleted: true },
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// Send to Artisans
// ============================================
export const sendToArtisans: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        const { id } = req.params;
        const { artisanIds } = req.body;

        logger.info('Send to artisans', { conceptId: id, artisanCount: artisanIds.length });

        const concept = await getConceptById(id);
        if (!concept) {
            res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Concept not found' },
            });
            return;
        }

        const matches = await Promise.all(
            artisanIds.map(async (sellerId: string) => {
                return prisma.artisanMatch.create({
                    data: {
                        conceptId: id,
                        sellerId,
                        overallScore: 0.5,
                        scores: {},
                        matchReasons: ['User selected'],
                    },
                });
            })
        );

        await prisma.concept.update({
            where: { id },
            data: {
                status: 'SENT_TO_ARTISANS',
                sentToArtisans: artisanIds,
            },
        });

        res.json({
            success: true,
            data: {
                conceptId: id,
                matchesSent: matches.length,
                artisanIds,
            },
        });
    } catch (error) {
        next(error);
    }
};
