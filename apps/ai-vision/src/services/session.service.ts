
import { VisionMode, SessionStatus, ConceptStatus } from '@prisma/client';
import { logger } from '../utils/logger';
import { GeneratedImage } from './generation/image.service';
import prisma from '../config/database';

// Default session expiry: 24 hours
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000;

export interface CreateSessionInput {
    userId?: string;
    sessionToken: string;
    mode: VisionMode;
    prompt?: string;
    baseProductId?: string;
    uploadedImageUrl?: string;
    settings?: Record<string, unknown>;
}

export interface CreateConceptInput {
    sessionId: string;
    generationPrompt: string;
    enhancedPrompt?: string;
    primaryImageUrl: string;
    thumbnailUrl?: string;
    analyzedFeatures?: Record<string, unknown>;
    estimatedPrice?: { min: number; max: number };
}

/**
 * Create or retrieve a vision session
 */
export async function getOrCreateSession(input: CreateSessionInput) {
    const existing = await prisma.visionSession.findFirst({
        where: {
            sessionToken: input.sessionToken,
            status: SessionStatus.ACTIVE,
            expiresAt: { gt: new Date() },
        },
        include: {
            concepts: {
                take: 10,
                orderBy: { createdAt: 'desc' },
            },
        },
    });

    if (existing) {
        logger.info('Found existing session', { sessionId: existing.id });
        return existing;
    }

    const session = await prisma.visionSession.create({
        data: {
            userId: input.userId,
            sessionToken: input.sessionToken,
            mode: input.mode,
            status: SessionStatus.ACTIVE,
            prompt: input.prompt,
            baseProductId: input.baseProductId,
            uploadedImageUrl: input.uploadedImageUrl,
            settings: input.settings as object ?? {},
            expiresAt: new Date(Date.now() + SESSION_EXPIRY_MS),
        },
    });

    logger.info('Created new session', { sessionId: session.id, mode: input.mode });
    return session;
}

/**
 * Create a new concept within a session
 */
export async function createConcept(input: CreateConceptInput) {
    return prisma.concept.create({
        data: {
            sessionId: input.sessionId,
            generationPrompt: input.generationPrompt,
            enhancedPrompt: input.enhancedPrompt,
            primaryImageUrl: input.primaryImageUrl,
            thumbnailUrl: input.thumbnailUrl,
            analyzedFeatures: input.analyzedFeatures as object ?? {},
            estimatedPrice: input.estimatedPrice as object ?? {},
            status: ConceptStatus.GENERATED,
        },
    });
}

/**
 * Add images to a concept
 */
export async function addConceptImages(
    conceptId: string,
    images: GeneratedImage[],
    embeddings?: number[][]
) {
    const imageData = images.map((img, index) => ({
        conceptId,
        originalUrl: img.url,
        thumbnailUrl: img.thumbnailUrl,
        fileId: img.fileId,
        filePath: img.filePath,
        fileSize: 0,
        mimeType: 'image/png',
        dimensions: { width: 1024, height: 1024 },
        embedding: embeddings?.[index] || [],
        dominantColors: [],
        detectedObjects: [],
        styleKeywords: [],
        position: index,
        isPrimary: index === 0,
    }));

    await prisma.conceptImage.createMany({
        data: imageData,
    });
}

/**
 * Update concept status
 */
export async function updateConceptStatus(
    conceptId: string,
    status: ConceptStatus,
    error?: string
) {
    return prisma.concept.update({
        where: { id: conceptId },
        data: {
            status,
            generationError: error,
        },
    });
}

/**
 * Get concept by ID with related data
 */
export async function getConceptById(conceptId: string) {
    return prisma.concept.findUnique({
        where: { id: conceptId },
        include: {
            images: { orderBy: { position: 'asc' } },
            generatedProduct: true,
            session: true,
        },
    });
}

/**
 * Get user's concepts
 */
export async function getUserConcepts(
    userId?: string,
    sessionToken?: string,
    options?: {
        limit?: number;
        offset?: number;
        savedOnly?: boolean;
    }
) {
    const where: any = {};

    if (userId) {
        where.session = { userId };
    } else if (sessionToken) {
        where.session = { sessionToken };
    } else {
        return { concepts: [], total: 0 };
    }

    if (options?.savedOnly) {
        where.isSaved = true;
    }

    const [concepts, total] = await Promise.all([
        prisma.concept.findMany({
            where,
            include: {
                images: { take: 1, where: { isPrimary: true } },
                generatedProduct: {
                    select: { title: true, category: true, estimatedPriceMin: true, estimatedPriceMax: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: options?.limit || 20,
            skip: options?.offset || 0,
        }),
        prisma.concept.count({ where }),
    ]);

    return { concepts, total };
}

/**
 * Save concept for user
 */
export async function saveConcept(conceptId: string, title?: string) {
    return prisma.concept.update({
        where: { id: conceptId },
        data: {
            isSaved: true,
            ...(title && { generationPrompt: title.substring(0, 100) }),
        },
    });
}

/**
 * Delete concept and related data
 */
export async function deleteConcept(conceptId: string) {
    await prisma.conceptImage.deleteMany({ where: { conceptId } });
    await prisma.aIGeneratedProduct.deleteMany({ where: { conceptId } });
    await prisma.artisanMatch.deleteMany({ where: { conceptId } });
    await prisma.concept.delete({ where: { id: conceptId } });
}

/**
 * Expire old sessions
 */
export async function expireOldSessions() {
    const result = await prisma.visionSession.updateMany({
        where: {
            status: SessionStatus.ACTIVE,
            expiresAt: { lt: new Date() },
        },
        data: {
            status: SessionStatus.EXPIRED,
        },
    });

    if (result.count > 0) {
        logger.info('Expired sessions', { count: result.count });
    }

    return result.count;
}
