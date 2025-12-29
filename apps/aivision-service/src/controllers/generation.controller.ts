import { RequestHandler } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { VisionMode } from '@prisma/client';
import { generateConcept } from '../agents/concept-generator.agent';
import { getOrCreateSession, createConcept, addConceptImages } from '../services/session.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import prisma from '../../../../packages/libs/prisma';


// ============================================
// Text-to-Image Generation
// ============================================
export const textToImage: RequestHandler = async (req, res, next): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const startTime = Date.now();

    try {
        const { prompt, category, style, material, count } = req.body;

        logger.info('Text-to-image request', {
            userId: authReq.user?.id,
            prompt: prompt.substring(0, 50),
        });

        const session = await getOrCreateSession({
            userId: authReq.user?.id,
            sessionToken: authReq.sessionToken || uuidv4(),
            mode: VisionMode.TEXT_TO_IMAGE,
            prompt,
        });

        const conceptId = uuidv4();

        const result = await generateConcept({
            prompt,
            conceptId,
            sessionId: session.id,
            mode: 'text',
            category,
            style,
            material,
            imageCount: count || 4,
        });

        if (!result.success || result.images.length === 0) {
            await logAPIUsage(authReq, 'text-to-image', startTime, false, result.error);

            res.status(422).json({
                success: false,
                error: {
                    code: 'GENERATION_FAILED',
                    message: result.error || 'Failed to generate images',
                    details: result.imageErrors,
                },
            });
            return;
        }

        const concept = await createConcept({
            sessionId: session.id,
            generationPrompt: prompt,
            enhancedPrompt: result.enhancedPrompt || undefined,
            primaryImageUrl: result.images[0].url,
            thumbnailUrl: result.images[0].thumbnailUrl,
            analyzedFeatures: result.analyzedIntent || undefined,
            estimatedPrice: result.product ? {
                min: result.product.estimatedPriceMin,
                max: result.product.estimatedPriceMax,
            } : undefined,
        });

        await addConceptImages(concept.id, result.images);

        if (result.product) {
            await prisma.aIGeneratedProduct.updateMany({
                where: { conceptId },
                data: { conceptId: concept.id },
            });
        }

        await logAPIUsage(authReq, 'text-to-image', startTime, true, undefined, result.images.length);

        res.json({
            success: true,
            data: {
                conceptId: concept.id,
                sessionId: session.id,
                sessionToken: session.sessionToken,
                images: result.images,
                product: result.product ? {
                    title: result.product.title,
                    description: result.product.description,
                    category: result.product.category,
                    priceRange: {
                        min: result.product.estimatedPriceMin,
                        max: result.product.estimatedPriceMax,
                    },
                    materials: result.product.materials,
                    complexity: result.product.complexityLevel,
                } : null,
                enhancedPrompt: result.enhancedPrompt,
                analyzedIntent: result.analyzedIntent,
                partialSuccess: result.imageErrors.length > 0,
                errors: result.imageErrors.length > 0 ? result.imageErrors : undefined,
            },
        });
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Text-to-image failed', { error: errorMsg });
        await logAPIUsage(authReq, 'text-to-image', startTime, false, errorMsg);
        next(error);
    }
};

// ============================================
// Product Variation
// ============================================
export const productVariation: RequestHandler = async (req, res, next): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const startTime = Date.now();

    try {
        const { productId, modifications, adjustments, count } = req.body;

        logger.info('Product variation request', { productId });

        const baseProduct = await prisma.products.findUnique({
            where: { id: productId },
            include: { Shop: { select: { name: true } } },
        });

        if (!baseProduct) {
            res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Product not found' },
            });
            return;
        }

        const variationPrompt = buildVariationPrompt(baseProduct, modifications, adjustments);

        const session = await getOrCreateSession({
            userId: authReq.user?.id,
            sessionToken: authReq.sessionToken || uuidv4(),
            mode: VisionMode.PRODUCT_VARIATION,
            baseProductId: productId,
        });

        const conceptId = uuidv4();

        const result = await generateConcept({
            prompt: variationPrompt,
            conceptId,
            sessionId: session.id,
            mode: 'variation',
            category: baseProduct.category,
            imageCount: count || 4,
        });

        if (!result.success || result.images.length === 0) {
            await logAPIUsage(authReq, 'product-variation', startTime, false, result.error);
            res.status(422).json({
                success: false,
                error: {
                    code: 'GENERATION_FAILED',
                    message: result.error || 'Failed to generate variations',
                },
            });
            return;
        }

        const concept = await createConcept({
            sessionId: session.id,
            generationPrompt: variationPrompt,
            enhancedPrompt: result.enhancedPrompt || undefined,
            primaryImageUrl: result.images[0].url,
            thumbnailUrl: result.images[0].thumbnailUrl,
        });

        await addConceptImages(concept.id, result.images);
        await logAPIUsage(authReq, 'product-variation', startTime, true, undefined, result.images.length);

        res.json({
            success: true,
            data: {
                conceptId: concept.id,
                baseProduct: {
                    id: baseProduct.id,
                    title: baseProduct.title,
                    thumbnailUrl: (baseProduct.images as any)?.[0]?.url,
                },
                images: result.images,
                product: result.product,
                modifications: modifications,
            },
        });
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Product variation failed', { error: errorMsg });
        await logAPIUsage(authReq, 'product-variation', startTime, false, errorMsg);
        next(error);
    }
};

// ============================================
// From Image Generation
// ============================================
export const fromImage: RequestHandler = async (_req, res): Promise<void> => {
    logger.info('From-image request');

    res.status(501).json({
        success: false,
        message: 'From-image generation requires multimodal support - coming soon',
        phase: 'Phase 3',
    });
};

// ============================================
// Refine Concept
// ============================================
export const refineConcept: RequestHandler = async (req, res, next): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const startTime = Date.now();

    try {
        const { conceptId, adjustments, preserveElements } = req.body;

        logger.info('Refine concept request', { conceptId });

        const existingConcept = await prisma.concept.findUnique({
            where: { id: conceptId },
            include: {
                generatedProduct: true,
                session: true,
            },
        });

        if (!existingConcept) {
            res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Concept not found' },
            });
            return;
        }

        const refinementPrompt = `Based on the original concept "${existingConcept.generationPrompt}",
make these adjustments: ${adjustments}
${preserveElements?.length ? `Keep these elements: ${preserveElements.join(', ')}` : ''}`;

        const newConceptId = uuidv4();

        const result = await generateConcept({
            prompt: refinementPrompt,
            conceptId: newConceptId,
            sessionId: existingConcept.sessionId,
            mode: 'text',
            imageCount: 4,
        });

        if (!result.success || result.images.length === 0) {
            await logAPIUsage(authReq, 'refine-concept', startTime, false, result.error);
            res.status(422).json({
                success: false,
                error: {
                    code: 'GENERATION_FAILED',
                    message: result.error || 'Failed to refine concept',
                },
            });
            return;
        }

        const newConcept = await createConcept({
            sessionId: existingConcept.sessionId,
            generationPrompt: refinementPrompt,
            enhancedPrompt: result.enhancedPrompt || undefined,
            primaryImageUrl: result.images[0].url,
            thumbnailUrl: result.images[0].thumbnailUrl,
        });

        await addConceptImages(newConcept.id, result.images);
        await logAPIUsage(authReq, 'refine-concept', startTime, true, undefined, result.images.length);

        res.json({
            success: true,
            data: {
                originalConceptId: conceptId,
                newConceptId: newConcept.id,
                images: result.images,
                product: result.product,
                adjustmentsApplied: adjustments,
            },
        });
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Refine concept failed', { error: errorMsg });
        await logAPIUsage(authReq, 'refine-concept', startTime, false, errorMsg);
        next(error);
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function buildVariationPrompt(
    product: any,
    modifications: string,
    adjustments?: { color?: string[]; size?: any; material?: string[]; style?: string }
): string {
    let prompt = `Create a variation of "${product.title}": ${modifications}`;

    if (adjustments) {
        if (adjustments.color?.length) {
            prompt += ` Change colors to: ${adjustments.color.join(', ')}.`;
        }
        if (adjustments.material?.length) {
            prompt += ` Use materials: ${adjustments.material.join(', ')}.`;
        }
        if (adjustments.style) {
            prompt += ` Style: ${adjustments.style}.`;
        }
    }

    return prompt;
}

async function logAPIUsage(
    req: AuthenticatedRequest,
    endpoint: string,
    startTime: number,
    success: boolean,
    errorMessage?: string,
    imagesGenerated?: number
) {
    try {
        await prisma.aPIUsageLog.create({
            data: {
                userId: req.user?.id,
                sessionToken: req.sessionToken,
                requestId: req.requestId,
                endpoint,
                service: 'gemini',
                imagesGenerated,
                success,
                errorMessage,
                durationMs: Date.now() - startTime,
            },
        });
    } catch (error) {
        logger.error('Failed to log API usage', { error });
    }
}
