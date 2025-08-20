import { NextFunction, Request, Response } from "express";
import prisma from "../../../../packages/libs/prisma";

export const getAllShops = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;
    const category = req.query.category as string;

    const whereClause: any = {};
    if (category && category !== 'all') {
      whereClause.category = category;
    }

    const shops = await prisma.shops.findMany({
      where: whereClause,
      skip,
      take: limit,
      select: { // Select only the data needed for the shop cards
        id: true,
        name: true,
        slug: true,
        category: true,
        avatar: true,
        ratings: true,
        _count: { select: { reviews: true } } // Get total review count
      },
      orderBy: { ratings: 'desc' }
    });

    const totalShops = await prisma.shops.count({ where: whereClause });
    const totalPages = Math.ceil(totalShops / limit);

    res.status(200).json({
      success: true,
      shops,
      pagination: {
        total: totalShops,
        currentPage: page,
        totalPages,
        limit
      }
    });

  } catch (error) {
    next(error);
  }
};


//  Controller to get detailed information for a single shop by its slug.

export const getShopBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const shop = await prisma.shops.findUnique({
            where: { slug },
            include: {
                _count: { select: { products: true, reviews: true } }
            }
        });

        if (!shop) {
            return res.status(404).json({ success: false, message: "Shop not found." });
        }

        res.status(200).json({ success: true, shop });

    } catch (error) {
        next(error);
    }
};


//  Controller to get a paginated list of products for a specific shop.
 
export const getProductsForShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { shopId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = 9;
        const skip = (page - 1) * limit;

        const products = await prisma.products.findMany({
            where: { shopId },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        });

        const totalProducts = await prisma.products.count({ where: { shopId } });

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


//   Controller to get reviews for a specific shop.

export const getReviewsForShop = async (req: Request, res: Response, next: NextFunction) => {
    // Similar pagination logic as getProductsForShop, but for reviews
    // Remember to include the user's name/avatar in the response
    // ... implementation left for brevity
    res.status(200).json({ success: true, message: "Reviews endpoint placeholder" });
};


//   Controller to create a new review for a shop.
//   This is a critical function that also updates the shop's average rating.
 
export const createShopReview = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { shopId, rating, review } = req.body;
        const userId = req.user.id; // From isAuthenticated middleware

        // Use a transaction to ensure both operations succeed or fail together
        const [newReview] = await prisma.$transaction(async (tx) => {
            const createdReview = await tx.shopReviews.create({
                data: {
                    shopsId: shopId,
                    userId,
                    rating,
                    reviews: review
                }
            });

            // Recalculate the average rating
            const aggregate = await tx.shopReviews.aggregate({
                _avg: { rating: true },
                where: { shopsId: shopId }
            });
            const newAverageRating = aggregate._avg.rating || 0;

            // Update the shop with the new rating
            await tx.shops.update({
                where: { id: shopId },
                data: { ratings: parseFloat(newAverageRating.toFixed(2)) }
            });

            return [createdReview];
        });

        res.status(201).json({ success: true, review: newReview });

    } catch (error) {
        next(error);
    }
};