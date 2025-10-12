import { NextFunction, Request, Response } from "express";
import prisma from "../../../../packages/libs/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// Interfaces
interface ShopFilters {
  category?: string;
  rating?: number;
  location?: string;
  search?: string;
}

// Validation schemas
const reviewSchema = z.object({
  shopId: z.string(),
  rating: z.number().min(1).max(5),
  review: z.string().max(1000).optional(),
});

export const getAllShops = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;
    
    const category = req.query.category as string;
    const minRating = req.query.minRating ? parseFloat(req.query.minRating as string) : undefined;
    const search = req.query.search as string;
    const sortBy = req.query.sortBy as string || 'rating';

    // Build where clause
    const whereClause: Prisma.shopsWhereInput = {};
    
    if (category && category !== 'all') {
      whereClause.category = category;
    }

    if (minRating) {
      whereClause.ratings = { gte: minRating };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build order by clause
    let orderByClause: Prisma.shopsOrderByWithRelationInput = {};
    switch (sortBy) {
      case 'rating':
        orderByClause = { ratings: 'desc' };
        break;
      case 'newest':
        orderByClause = { createdAt: 'desc' };
        break;
      case 'name':
        orderByClause = { name: 'asc' };
        break;
      default:
        orderByClause = { ratings: 'desc' };
    }

    const [shops, totalShops] = await Promise.all([
      prisma.shops.findMany({
        where: whereClause,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          avatar: true,
          coverBanner: true,
          bio: true,
          ratings: true,
          address: true,
          opening_hours: true,
          website: true,
          socialLinks: true,
          createdAt: true,
          _count: { 
            select: { 
              reviews: true,
              products: {
                where: {
                  isDeleted: false,
                  status: 'Active',
                  stock: { gt: 0 }
                }
              }
            } 
          }
        },
        orderBy: orderByClause
      }),
      prisma.shops.count({ where: whereClause })
    ]);

    res.status(200).json({
      success: true,
      data: {
        shops,
        pagination: {
          total: totalShops,
          currentPage: page,
          totalPages: Math.ceil(totalShops / limit),
          limit,
          hasNext: page * limit < totalShops,
          hasPrev: page > 1,
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

export const getShopBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    
    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Shop slug is required"
      });
    }

    const shop = await prisma.shops.findUnique({
      where: { slug },
      include: {
        sellers: {
          select: {
            id: true,
            name: true,
            email: true,
            country: true,
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        events: {
          where: {
            is_active: true,
            starting_date: { lte: new Date() },
            ending_date: { gte: new Date() }
          },
          select: {
            id: true,
            title: true,
            event_type: true,
            discount_percent: true,
            banner_image: true,
            starting_date: true,
            ending_date: true,
          },
          take: 3
        },
        _count: { 
          select: { 
            products: {
              where: {
                isDeleted: false,
                status: 'Active'
              }
            },
            reviews: true 
          } 
        }
      }
    });

    if (!shop) {
      return res.status(404).json({ 
        success: false, 
        message: "Shop not found." 
      });
    }

    // Get featured products (on sale or high-rated)
    const featuredProducts = await prisma.products.findMany({
      where: {
        shopId: shop.id,
        isDeleted: false,
        status: 'Active',
        stock: { gt: 0 },
        OR: [
          { is_on_discount: true },
          { ratings: { gte: 4.5 } }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        images: true,
        regular_price: true,
        current_price: true,
        is_on_discount: true,
        ratings: true,
        category: true,
      },
      orderBy: [
        { is_on_discount: 'desc' },
        { ratings: 'desc' }
      ],
      take: 8
    });

    res.status(200).json({ 
      success: true, 
      data: {
        shop: {
          ...shop,
          featuredProducts
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

export const getProductsForShop = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shopId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;
    
    const category = req.query.category as string;
    const search = req.query.search as string;
    const sortBy = req.query.sortBy as string || 'newest';
    const onSale = req.query.onSale === 'true';

    // Build where clause
    const whereClause: Prisma.productsWhereInput = {
      shopId,
      isDeleted: false,
      status: 'Active',
      stock: { gt: 0 }
    };

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } }
      ];
    }

    if (onSale) {
      whereClause.is_on_discount = true;
    }

    // Build order by clause
    let orderByClause: Prisma.productsOrderByWithRelationInput = {};
    switch (sortBy) {
      case 'price-asc':
        orderByClause = { current_price: 'asc' };
        break;
      case 'price-desc':
        orderByClause = { current_price: 'desc' };
        break;
      case 'rating':
        orderByClause = { ratings: 'desc' };
        break;
      case 'popularity':
        orderByClause = { totalSales: 'desc' };
        break;
      case 'newest':
      default:
        orderByClause = { createdAt: 'desc' };
        break;
    }

    const [products, totalProducts] = await Promise.all([
      prisma.products.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          slug: true,
          images: true,
          regular_price: true,
          current_price: true,
          is_on_discount: true,
          ratings: true,
          category: true,
          stock: true,
          totalSales: true,
          createdAt: true,
          event: {
            select: {
              id: true,
              title: true,
              event_type: true,
              ending_date: true,
            }
          }
        },
        skip,
        take: limit,
        orderBy: orderByClause
      }),
      prisma.products.count({ where: whereClause })
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          total: totalProducts,
          currentPage: page,
          totalPages: Math.ceil(totalProducts / limit),
          hasNext: page * limit < totalProducts,
          hasPrev: page > 1,
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

export const getReviewsForShop = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shopId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const rating = req.query.rating ? parseInt(req.query.rating as string) : undefined;

    const whereClause: Prisma.shopReviewsWhereInput = {
      shopsId: shopId
    };

    if (rating) {
      whereClause.rating = rating;
    }

    const [reviews, totalReviews, ratingsStats] = await Promise.all([
      prisma.shopReviews.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.shopReviews.count({ where: whereClause }),
      prisma.shopReviews.groupBy({
        by: ['rating'],
        where: { shopsId: shopId },
        _count: { rating: true },
        orderBy: { rating: 'desc' }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        ratingsStats,
        pagination: {
          total: totalReviews,
          currentPage: page,
          totalPages: Math.ceil(totalReviews / limit),
          hasNext: page * limit < totalReviews,
          hasPrev: page > 1,
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

export const createShopReview = async (req: any, res: Response, next: NextFunction) => {
  try {
    const validatedData = reviewSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { shopId, rating, review } = validatedData;

    // Check if user already reviewed this shop
    const existingReview = await prisma.shopReviews.findFirst({
      where: {
        userId,
        shopsId: shopId
      }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this shop"
      });
    }

    // Verify shop exists
    const shop = await prisma.shops.findUnique({
      where: { id: shopId }
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found"
      });
    }

    // Use transaction to ensure both operations succeed
    const [newReview] = await prisma.$transaction(async (tx) => {
      const createdReview = await tx.shopReviews.create({
        data: {
          shopsId: shopId,
          userId,
          rating,
          reviews: review
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            }
          }
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

    res.status(201).json({ 
      success: true, 
      message: "Review created successfully",
      data: newReview 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error
      });
    }
    next(error);
  }
};

export const getShopCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.shops.findMany({
      select: {
        category: true,
        _count: {
          select: {
            products: {
              where: {
                isDeleted: false,
                status: 'Active'
              }
            }
          }
        }
      },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error) {
    next(error);
  }
};
