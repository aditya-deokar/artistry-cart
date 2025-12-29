import { RequestHandler } from 'express';
import prisma from '../../../../packages/libs/prisma';
import { Prisma } from '@prisma/client';
import { findMatchingArtisans, updateArtisanResponse, getConceptMatches } from '../services/artisan-matching.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import { MatchStatus } from '@prisma/client';

// ============================================
// Get Artisan Matches for a Concept
// ============================================
export const getMatches: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        const { conceptId } = req.query;

        if (!conceptId) {
            res.status(400).json({
                success: false,
                error: { code: 'BAD_REQUEST', message: 'conceptId query param required' },
            });
            return;
        }

        logger.info('Get artisan matches', { conceptId });

        let matches = await getConceptMatches(conceptId as string);

        if (matches.length === 0) {
            const scored = await findMatchingArtisans(conceptId as string, 10);

            if (scored.length > 0) {
                await prisma.artisanMatch.createMany({
                    data: scored.map(s => ({
                        conceptId: conceptId as string,
                        sellerId: s.sellerId,
                        overallScore: s.overallScore,
                        scores: s.scores as unknown as Prisma.InputJsonValue,
                        matchReasons: s.matchReasons,
                    })),
                });

                matches = await getConceptMatches(conceptId as string);
            }
        }

        const sellerIds = matches.map(m => m.sellerId);
        const shops = await prisma.shops.findMany({
            where: { sellerId: { in: sellerIds } },
            select: {
                sellerId: true,
                name: true,
                avatar: true,
                ratings: true,
                category: true,
            },
        });

        const shopMap = new Map(shops.map(s => [s.sellerId, s]));

        res.json({
            success: true,
            data: {
                matches: matches.map(m => {
                    const shop = shopMap.get(m.sellerId);
                    return {
                        id: m.id,
                        sellerId: m.sellerId,
                        shop: shop ? {
                            name: shop.name,
                            avatar: shop.avatar,
                            rating: shop.ratings,
                            category: shop.category,
                        } : null,
                        overallScore: m.overallScore,
                        scores: m.scores,
                        matchReasons: m.matchReasons,
                        status: m.status,
                        response: m.responseMessage,
                        quote: m.proposedPrice ? {
                            price: m.proposedPrice,
                            timeline: m.proposedTimeline,
                        } : null,
                        respondedAt: m.respondedAt,
                    };
                }),
                total: matches.length,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// Artisan Respond to Match
// ============================================
export const respond: RequestHandler = async (req, res, next): Promise<void> => {
    const authReq = req as AuthenticatedRequest;

    try {
        const { matchId, response, message, quote } = req.body;

        if (!authReq.user) {
            res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
            });
            return;
        }

        logger.info('Artisan respond', {
            sellerId: authReq.user.id,
            matchId,
            response,
        });

        const statusMap: Record<string, MatchStatus> = {
            'INTERESTED': MatchStatus.INTERESTED,
            'QUOTED': MatchStatus.QUOTED,
            'DECLINED': MatchStatus.DECLINED,
        };

        const status = statusMap[response];
        if (!status) {
            res.status(400).json({
                success: false,
                error: { code: 'BAD_REQUEST', message: 'Invalid response type' },
            });
            return;
        }

        const updated = await updateArtisanResponse(
            matchId,
            authReq.user.id,
            status,
            message,
            quote
        );

        res.json({
            success: true,
            data: {
                matchId: updated.id,
                status: updated.status,
                respondedAt: updated.respondedAt,
            },
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: error.message },
            });
            return;
        }
        next(error);
    }
};

// ============================================
// Get Seller's Pending Matches
// ============================================
export const getSellerMatches: RequestHandler = async (req, res, next): Promise<void> => {
    const authReq = req as AuthenticatedRequest;

    try {
        if (!authReq.user || authReq.user.role !== 'seller') {
            res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Seller access required' },
            });
            return;
        }

        const { status } = req.query;

        const where: Prisma.ArtisanMatchWhereInput = { sellerId: authReq.user.id };
        if (status) {
            where.status = status as MatchStatus;
        }

        const matches = await prisma.artisanMatch.findMany({
            where,
            include: {
                concept: {
                    include: {
                        images: { where: { isPrimary: true }, take: 1 },
                        generatedProduct: {
                            select: {
                                title: true,
                                description: true,
                                category: true,
                                estimatedPriceMin: true,
                                estimatedPriceMax: true,
                                materials: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            data: {
                matches: matches.map(m => ({
                    id: m.id,
                    concept: {
                        id: m.concept.id,
                        thumbnailUrl: m.concept.images[0]?.thumbnailUrl || m.concept.thumbnailUrl,
                        title: m.concept.generatedProduct?.title || m.concept.generationPrompt.substring(0, 50),
                        description: m.concept.generatedProduct?.description,
                        category: m.concept.generatedProduct?.category,
                        priceRange: m.concept.generatedProduct ? {
                            min: m.concept.generatedProduct.estimatedPriceMin,
                            max: m.concept.generatedProduct.estimatedPriceMax,
                        } : null,
                        materials: m.concept.generatedProduct?.materials,
                    },
                    overallScore: m.overallScore,
                    matchReasons: m.matchReasons,
                    status: m.status,
                    createdAt: m.createdAt,
                })),
                total: matches.length,
            },
        });
    } catch (error) {
        next(error);
    }
};
