import { Request, Response, NextFunction } from "express";
import prisma from "../../../../packages/libs/prisma";
import { Prisma } from "@prisma/client";

/**
 * Enhanced controller to fetch all data needed for the main offers page.
 * Now includes pricing-aware queries and event support.
 */
export const getOffersPageData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const now = new Date();

    const [activeBanners, siteCoupons, weeklyDeals, flashSaleItems, trendingEvents, categoryDeals] =
      await Promise.all([
        // 1. Get active, unexpired promotional banners
        prisma.banners.findMany({
          where: {
            isActive: true,
            endDate: { gte: now },
            startDate: { lte: now },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),

        // 2. Get active, sitewide coupon codes
        prisma.discount_codes.findMany({
          where: {
            // Only get coupons that are active and valid
            isActive: true,
            validFrom: { lte: now },
            OR: [
              { validUntil: null },
              { validUntil: { gte: now } }
            ]
          },
          orderBy: { discountValue: "desc" },
          take: 6,
          select: {
            id: true,
            publicName: true,
            description: true,
            discountType: true,
            discountValue: true,
            discountCode: true,
            minimumOrderAmount: true,
            maximumDiscountAmount: true,
            validUntil: true,
          }
        }),

        // 3. Get best-selling products with current pricing
        prisma.products.findMany({
          where: {
            isDeleted: false,
            status: 'Active',
            stock: { gt: 0 },
            is_on_discount: true, // Only discounted products
          },
          include: {
            Shop: {
              select: {
                name: true,
                slug: true,
                avatar: true,
                ratings: true,
              }
            },
            event: {
              select: {
                id: true,
                title: true,
                event_type: true,
                ending_date: true,
              }
            }
          },
          orderBy: [
            { totalSales: "desc" },
            { ratings: "desc" }
          ],
          take: 12, // For a "Best Deals" section
        }),

        // 4. Get active flash sale events with products
        prisma.events.findMany({
          where: {
            is_active: true,
            event_type: "FLASH_SALE",
            ending_date: { gte: now },
            starting_date: { lte: now },
          },
          include: {
            products: {
              where: {
                isDeleted: false,
                status: 'Active',
                stock: { gt: 0 }
              },
              select: {
                id: true,
                title: true,
                slug: true,
                images: true,
                regular_price: true,
                current_price: true,
                is_on_discount: true,
                stock: true,
                category: true,
                ratings: true,
              },
              take: 6
            },
            shop: {
              select: {
                name: true,
                slug: true,
                avatar: true,
              }
            }
          },
          orderBy: { ending_date: "asc" }, // Show items ending soonest first
          take: 6,
        }),

        // 5. Get trending events (most viewed/clicked)
        prisma.events.findMany({
          where: {
            is_active: true,
            ending_date: { gte: now },
            starting_date: { lte: now },
          },
          include: {
            products: {
              where: {
                isDeleted: false,
                status: 'Active',
                stock: { gt: 0 }
              },
              select: {
                id: true,
                title: true,
                slug: true,
                images: true,
                current_price: true,
                is_on_discount: true,
                category: true,
              },
              take: 4
            },
            shop: {
              select: {
                name: true,
                slug: true,
                avatar: true,
              }
            }
          },
          orderBy: [
            { views: "desc" },
            { clicks: "desc" }
          ],
          take: 8,
        }),

        // 6. Get category-wise deals
        prisma.products.groupBy({
          by: ['category'],
          where: {
            isDeleted: false,
            status: 'Active',
            stock: { gt: 0 },
            is_on_discount: true,
          },
          _count: {
            id: true
          },
          orderBy: {
            _count: {
              id: 'desc'
            }
          },
          take: 8
        })
      ]);

    // Get sample products for each category with deals
    const categoryDealsWithProducts = await Promise.all(
      categoryDeals.map(async (cat) => {
        const products = await prisma.products.findMany({
          where: {
            category: cat.category,
            isDeleted: false,
            status: 'Active',
            stock: { gt: 0 },
            is_on_discount: true,
          },
          select: {
            id: true,
            title: true,
            slug: true,
            images: true,
            regular_price: true,
            current_price: true,
            is_on_discount: true,
            category: true,
          },
          take: 4,
          orderBy: { totalSales: 'desc' }
        });

        return {
          category: cat.category,
          count: cat._count.id,
          products
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        banners: activeBanners,
        coupons: siteCoupons,
        weeklyDeals,
        flashSaleItems,
        trendingEvents,
        categoryDeals: categoryDealsWithProducts,
        stats: {
          totalActiveEvents: trendingEvents.length,
          totalDealsAvailable: weeklyDeals.length,
          totalCoupons: siteCoupons.length,
        }
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User-facing offers page
 * Simplified endpoint that focuses on the most relevant offer data for users
 * Returns active events with their products, banners, and available coupons
 */
export const getUserOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const now = new Date();

    // Get active events with their associated products
    const activeEvents = await prisma.events.findMany({
      where: {
        is_active: true,
        ending_date: { gte: now },
        starting_date: { lte: now },
      },
      select: {
        id: true,
        title: true,
        description: true,
        banner_image: true,
        event_type: true,
        discount_percent: true,
        discount_type: true,
        starting_date: true,
        ending_date: true,
        products: {
          where: {
            isDeleted: false,
            status: 'Active',
            stock: { gt: 0 }
          },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            regular_price: true,
            sale_price: true,
            current_price: true,
            images: true,
            stock: true,
            ratings: true,
            Shop: {
              select: {
                id: true,
                name: true,
                slug: true,
                avatar: true,
              }
            }
          },
          take: 12
        }
      }
    });

    // Get promotional banners
    const banners = await prisma.banners.findMany({
      where: {
        isActive: true,
        endDate: { gte: now },
        startDate: { lte: now },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    // Get available coupons
    const coupons = await prisma.discount_codes.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        OR: [
          { validUntil: null },
          { validUntil: { gte: now } }
        ],
        // Only show coupons meant for public display
        applicableToAll: true,
      },
      select: {
        id: true,
        publicName: true,
        description: true,
        discountType: true,
        discountValue: true,
        discountCode: true,
        minimumOrderAmount: true,
        maximumDiscountAmount: true,
        validUntil: true,
      },
      orderBy: { discountValue: "desc" },
      take: 6,
    });

    res.status(200).json({
      success: true,
      data: {
        events: activeEvents,
        banners,
        coupons,
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get deals by category
export const getDealsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy as string || 'discount';

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
      case 'newest':
        orderByClause = { createdAt: 'desc' };
        break;
      case 'discount':
      default:
        orderByClause = { is_on_discount: 'desc' };
        break;
    }

    const whereClause: Prisma.productsWhereInput = {
      category: category || undefined,
      isDeleted: false,
      status: 'Active',
      stock: { gt: 0 },
      is_on_discount: true,
    };

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: whereClause,
        include: {
          Shop: {
            select: {
              name: true,
              slug: true,
              avatar: true,
              ratings: true,
            }
          },
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
        orderBy: orderByClause,
      }),
      prisma.products.count({ where: whereClause })
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        category,
        pagination: {
          total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get limited time offers (ending soon)
export const getLimitedTimeOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const urgentDeals = await prisma.events.findMany({
      where: {
        is_active: true,
        starting_date: { lte: now },
        ending_date: { 
          gte: now,
          lte: next24Hours // Ending within 24 hours
        },
      },
      include: {
        products: {
          where: {
            isDeleted: false,
            status: 'Active',
            stock: { gt: 0 }
          },
          select: {
            id: true,
            title: true,
            slug: true,
            images: true,
            regular_price: true,
            current_price: true,
            is_on_discount: true,
            stock: true,
          },
          take: 4
        },
        shop: {
          select: {
            name: true,
            slug: true,
            avatar: true,
          }
        }
      },
      orderBy: { ending_date: "asc" },
      take: 10,
    });

    res.status(200).json({
      success: true,
      data: {
        urgentDeals,
        message: `${urgentDeals.length} deals ending within 24 hours`
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get seasonal offers
export const getSeasonalOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const now = new Date();
    const { season } = req.query;

    let eventTypeFilter: string[] = ['SEASONAL'];
    
    // Add more specific filtering based on season if needed
    if (season) {
      // This could be expanded based on your business logic
      eventTypeFilter = ['SEASONAL'];
    }

    const seasonalEvents = await prisma.events.findMany({
      where: {
        is_active: true,
        event_type: { in: eventTypeFilter },
        starting_date: { lte: now },
        ending_date: { gte: now },
      },
      include: {
        products: {
          where: {
            isDeleted: false,
            status: 'Active',
            stock: { gt: 0 }
          },
          select: {
            id: true,
            title: true,
            slug: true,
            images: true,
            regular_price: true,
            current_price: true,
            is_on_discount: true,
            category: true,
            ratings: true,
          },
          take: 6
        },
        shop: {
          select: {
            name: true,
            slug: true,
            avatar: true,
          }
        }
      },
      orderBy: { views: "desc" },
      take: 8,
    });

    res.status(200).json({
      success: true,
      data: {
        seasonalEvents,
        season: season || 'all'
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get offer statistics
export const getOfferStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const now = new Date();

    const [
      totalActiveEvents,
      totalDiscountCodes,
      totalDiscountedProducts,
      topCategories,
      recentActivity
    ] = await Promise.all([
      prisma.events.count({
        where: {
          is_active: true,
          starting_date: { lte: now },
          ending_date: { gte: now },
        }
      }),
      
      prisma.discount_codes.count({
        where: {
          isActive: true,
          validFrom: { lte: now },
          OR: [
            { validUntil: null },
            { validUntil: { gte: now } }
          ]
        }
      }),
      
      prisma.products.count({
        where: {
          is_on_discount: true,
          isDeleted: false,
          status: 'Active',
          stock: { gt: 0 }
        }
      }),
      
      prisma.products.groupBy({
        by: ['category'],
        where: {
          is_on_discount: true,
          isDeleted: false,
          status: 'Active',
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5
      }),
      
      prisma.events.findMany({
        where: {
          is_active: true,
          starting_date: { lte: now },
          ending_date: { gte: now },
        },
        select: {
          id: true,
          title: true,
          event_type: true,
          views: true,
          clicks: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        statistics: {
          totalActiveEvents,
          totalDiscountCodes,
          totalDiscountedProducts,
          topCategories,
        },
        recentActivity
      }
    });

  } catch (error) {
    next(error);
  }
};
