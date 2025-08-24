import { Request, Response, NextFunction } from 'express';

import {  Prisma } from '@prisma/client';
import prisma from '../../../../packages/libs/prisma';


export const liveSearch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query.q as string;

        if (!query || query.trim().length < 2) {
            return res.status(200).json({ success: true, products: [], shops: [] });
        }

        // 2. Explicitly type the search condition objects with Prisma's generated types
        const productSearchCondition: Prisma.productsWhereInput = {
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { category: { contains: query, mode: 'insensitive' } }
            ]
        };

        const shopSearchCondition: Prisma.shopsWhereInput = {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { bio: { contains: query, mode: 'insensitive' } }
            ]
        };

        const [products, shops] = await Promise.all([
            prisma.products.findMany({
                where: productSearchCondition, // Now this is fully type-safe
                take: 4,
                select: { id: true, title: true, slug: true, images: true, sale_price: true, regular_price: true }
            }),
            prisma.shops.findMany({
                where: shopSearchCondition, // This is also type-safe
                take: 2,
                select: { id: true, name: true, slug: true, avatar: true }
            })
        ]);

        res.status(200).json({ success: true, products, shops });

    } catch (error) {
        next(error);
    }
};

/**
 * Controller for the full, paginated search results page.
 */
export const fullSearch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. --- Extract all query parameters with defaults ---
        const query = req.query.q as string;
        const page = parseInt(req.query.page as string) || 1;
        const limit = 12;
        const skip = (page - 1) * limit;

        // New filter and sort parameters
        const category = req.query.category as string;
        const sortBy = req.query.sortBy as string || 'relevance';
        const minPrice = parseInt(req.query.minPrice as string) || 0;
        const maxPrice = parseInt(req.query.maxPrice as string) || 50000;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Search query is required.' });
        }

        // 2. --- Build the 'where' clause for filtering ---
        const whereClause: Prisma.productsWhereInput = {
            // Main text search logic
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { tags: { has: query.toLowerCase() } }
            ],
            // Add price range filter. This is implicitly AND'ed with the OR clause.
            // We filter on `regular_price` as a baseline. A more complex setup could
            // consider the sale_price if it exists.
            regular_price: {
                gte: minPrice,
                lte: maxPrice,
            },
        };

        // Add category filter only if it's not 'all'
        if (category && category !== 'all') {
            whereClause.category = category;
        }

        // 3. --- Build the 'orderBy' clause for sorting ---
        let orderByClause: Prisma.productsOrderByWithRelationInput = {};

        switch (sortBy) {
            case 'price-asc':
                orderByClause = { regular_price: 'asc' };
                break;
            case 'price-desc':
                orderByClause = { regular_price: 'desc' };
                break;
            case 'newest':
                orderByClause = { createdAt: 'desc' };
                break;
            case 'relevance':
            default:
                // IMPORTANT: The `contains` search method does not provide a true relevance score.
                // The best fallback is to sort by newest. If you need true relevance,
                // you must use the MongoDB `$text` index approach.
                orderByClause = { createdAt: 'desc' };
                break;
        }

        // 4. --- Execute queries in parallel ---
        const [products, totalProducts] = await Promise.all([
            prisma.products.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: orderByClause // Use the dynamically created orderBy clause
            }),
            prisma.products.count({ where: whereClause })
        ]);

        res.status(200).json({
            success: true,
            products,
            pagination: {
                total: totalProducts,
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

export const searchProducts = async ( req: Request, res: Response, next: NextFunction )=>{
    try {
        const query = req.query.q as string;

        if(!query || query.trim().length == 0){
            return res.status(400).json({
                message: "Search Query is required!"
            })
        }

        const products= await prisma.products.findMany({
            where:{
                OR:[
                    {
                        title:{
                            contains:query,
                            mode: "insensitive"
                        },
                    },
                    {
                        description:{
                            contains:query,
                            mode:"insensitive",

                        }
                    }
                ]
            },
            select:{
                id:true,
                title:true,
                slug:true
            },
            take:10,
            orderBy:{
                createdAt:"desc"
            },
        });

        return res.status(200).json({
            products
        })
    } catch (error) {
        return next(error)
    }

}