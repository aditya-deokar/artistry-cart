import prisma from '../config/database';
import { logger } from '../utils/logger';
import { MatchStatus, Prisma } from '@prisma/client';

export interface ArtisanScore {
    sellerId: string;
    shopId: string;
    shopName: string;
    overallScore: number;
    scores: {
        categoryMatch: number;
        skillMatch: number;
        priceMatch: number;
        ratingScore: number;
        availabilityScore: number;
    };
    matchReasons: string[];
}

/**
 * Find best matching artisans for a concept
 */
export async function findMatchingArtisans(
    conceptId: string,
    limit: number = 10
): Promise<ArtisanScore[]> {
    const concept = await prisma.concept.findUnique({
        where: { id: conceptId },
        include: {
            generatedProduct: true,
        },
    });

    if (!concept?.generatedProduct) {
        logger.warn('Concept has no generated product data', { conceptId });
        return [];
    }

    const product = concept.generatedProduct;

    const shops = await prisma.shops.findMany({
        include: {
            sellers: {
                select: { id: true, name: true },
            },
            products: {
                where: { isDeleted: false, status: 'Active' },
                select: {
                    category: true,
                    subCategory: true,
                    tags: true,
                    current_price: true,
                },
                take: 50,
            },
        },
    });

    const scores: ArtisanScore[] = shops.map(shop => {
        const categoryMatch = calculateCategoryMatch(
            product.category,
            product.subCategory,
            shop.products
        );

        const skillMatch = calculateSkillMatch(
            product.requiredSkills,
            shop.category,
            shop.products.flatMap(p => p.tags)
        );

        const priceMatch = calculatePriceMatch(
            product.estimatedPriceMin,
            product.estimatedPriceMax,
            shop.products.map(p => p.current_price)
        );

        const ratingScore = Math.min(shop.ratings / 5, 1);
        const availabilityScore = shop.products.length > 0 ? 1 : 0.5;

        const overallScore = (
            categoryMatch * 0.30 +
            skillMatch * 0.25 +
            priceMatch * 0.20 +
            ratingScore * 0.15 +
            availabilityScore * 0.10
        );

        const matchReasons: string[] = [];
        if (categoryMatch > 0.7) matchReasons.push('Category specialist');
        if (skillMatch > 0.6) matchReasons.push('Has required skills');
        if (priceMatch > 0.7) matchReasons.push('Price range match');
        if (ratingScore > 0.8) matchReasons.push('Highly rated');

        return {
            sellerId: shop.sellerId,
            shopId: shop.id,
            shopName: shop.name,
            overallScore,
            scores: {
                categoryMatch,
                skillMatch,
                priceMatch,
                ratingScore,
                availabilityScore,
            },
            matchReasons,
        };
    });

    return scores
        .filter(s => s.overallScore > 0.3)
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, limit);
}

/**
 * Create artisan matches in database
 */
export async function createArtisanMatches(
    conceptId: string,
    matches: ArtisanScore[]
): Promise<number> {
    const data = matches.map(m => ({
        conceptId,
        sellerId: m.sellerId,
        overallScore: m.overallScore,
        scores: m.scores as unknown as Prisma.InputJsonValue,
        matchReasons: m.matchReasons,
        status: MatchStatus.PENDING,
    }));

    const result = await prisma.artisanMatch.createMany({
        data,
    });

    return result.count;
}

/**
 * Get matches for a concept
 */
export async function getConceptMatches(conceptId: string) {
    return prisma.artisanMatch.findMany({
        where: { conceptId },
        orderBy: { overallScore: 'desc' },
    });
}

/**
 * Update artisan response to a match
 */
export async function updateArtisanResponse(
    matchId: string,
    sellerId: string,
    response: MatchStatus,
    message?: string,
    quote?: { price: number; timeline: string }
) {
    const match = await prisma.artisanMatch.findFirst({
        where: { id: matchId, sellerId },
    });

    if (!match) {
        throw new Error('Match not found or not authorized');
    }

    return prisma.artisanMatch.update({
        where: { id: matchId },
        data: {
            status: response,
            responseMessage: message,
            proposedPrice: quote?.price,
            proposedTimeline: quote?.timeline,
            respondedAt: new Date(),
        },
    });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateCategoryMatch(
    targetCategory: string,
    targetSubCategory: string,
    shopProducts: Array<{ category: string; subCategory: string }>
): number {
    if (shopProducts.length === 0) return 0.3;

    const categoryMatches = shopProducts.filter(
        p => p.category.toLowerCase() === targetCategory.toLowerCase()
    ).length;

    const subCategoryMatches = shopProducts.filter(
        p => p.subCategory.toLowerCase() === targetSubCategory.toLowerCase()
    ).length;

    const categoryScore = categoryMatches / shopProducts.length;
    const subCategoryScore = subCategoryMatches / shopProducts.length;

    return categoryScore * 0.6 + subCategoryScore * 0.4;
}

function calculateSkillMatch(
    requiredSkills: string[],
    shopCategory: string,
    shopTags: string[]
): number {
    if (requiredSkills.length === 0) return 0.5;

    const normalizedSkills = requiredSkills.map(s => s.toLowerCase());
    const normalizedTags = shopTags.map(t => t.toLowerCase());
    normalizedTags.push(shopCategory.toLowerCase());

    let matchCount = 0;
    for (const skill of normalizedSkills) {
        if (normalizedTags.some(tag => tag.includes(skill) || skill.includes(tag))) {
            matchCount++;
        }
    }

    return matchCount / requiredSkills.length;
}

function calculatePriceMatch(
    minPrice: number,
    maxPrice: number,
    shopPrices: number[]
): number {
    if (shopPrices.length === 0) return 0.5;

    const avgShopPrice = shopPrices.reduce((a, b) => a + b, 0) / shopPrices.length;
    const targetRange = maxPrice - minPrice;

    if (avgShopPrice >= minPrice && avgShopPrice <= maxPrice) {
        return 1.0;
    }

    const distance = avgShopPrice < minPrice
        ? minPrice - avgShopPrice
        : avgShopPrice - maxPrice;

    const normalizedDistance = distance / targetRange;
    return Math.max(0, 1 - normalizedDistance * 0.5);
}
