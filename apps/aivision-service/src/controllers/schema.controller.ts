import { RequestHandler } from 'express';
import prisma from '../../../../packages/libs/prisma';
import { logger } from '../utils/logger';

// ============================================
// Get Categories
// ============================================
export const getCategories: RequestHandler = async (req, res, next) => {
    try {
        const siteConfig = await prisma.site_config.findFirst();

        res.json({
            success: true,
            data: {
                categories: siteConfig?.categories || [],
                subCategories: siteConfig?.subCategories || {},
            },
        });
    } catch (error) {
        logger.error('Failed to get categories', { error });
        next(error);
    }
};

// ============================================
// Get Materials
// ============================================
export const getMaterials: RequestHandler = async (req, res, next) => {
    try {
        const materials = [
            'Wood', 'Metal', 'Ceramic', 'Glass', 'Leather', 'Fabric', 'Clay',
            'Stone', 'Paper', 'Bamboo', 'Brass', 'Copper', 'Silver', 'Gold',
            'Cotton', 'Silk', 'Wool', 'Jute', 'Terracotta', 'Marble',
        ];

        res.json({
            success: true,
            data: { materials },
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// Get Styles
// ============================================
export const getStyles: RequestHandler = async (req, res, next) => {
    try {
        const styles = [
            'Traditional', 'Modern', 'Minimalist', 'Rustic', 'Bohemian',
            'Contemporary', 'Vintage', 'Ethnic', 'Folk Art', 'Abstract',
            'Geometric', 'Organic', 'Industrial', 'Art Deco', 'Scandinavian',
        ];

        res.json({
            success: true,
            data: { styles },
        });
    } catch (error) {
        next(error);
    }
};
