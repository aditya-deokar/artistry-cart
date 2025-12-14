import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../../../../packages/libs/prisma';

// Helper to build advanced search conditions splitting by terms
const buildSearchQuery = (query: string): Prisma.productsWhereInput => {
  if (!query) return {};

  const terms = query.trim().split(/\s+/).filter(t => t.length > 0);
  if (terms.length === 0) return {};

  const termConditions = terms.map(term => ({
    OR: [
      { title: { contains: term, mode: 'insensitive' as const } },
      { description: { contains: term, mode: 'insensitive' as const } },
      { category: { contains: term, mode: 'insensitive' as const } },
      { brand: { contains: term, mode: 'insensitive' as const } },
      { tags: { has: term.toLowerCase() } },
    ]
  }));

  return {
    AND: termConditions
  };
};

const buildShopSearchQuery = (query: string): Prisma.shopsWhereInput => {
  if (!query) return {};
  const terms = query.trim().split(/\s+/).filter(t => t.length > 0);

  const termConditions = terms.map(term => ({
    OR: [
      { name: { contains: term, mode: 'insensitive' as const } },
      { bio: { contains: term, mode: 'insensitive' as const } },
      { category: { contains: term, mode: 'insensitive' as const } }
    ]
  }));

  return {
    AND: termConditions
  };
};

export const liveSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length < 2) {
      return res.status(200).json({
        success: true,
        data: { products: [], shops: [], events: [] }
      });
    }

    const now = new Date();

    // Enhanced search conditions
    const productSearchCondition: Prisma.productsWhereInput = {
      ...buildSearchQuery(query),
      isDeleted: false,
      status: 'Active',
      stock: { gt: 0 }
    };

    const shopSearchCondition: Prisma.shopsWhereInput = {
      ...buildShopSearchQuery(query)
    };

    const eventSearchCondition: Prisma.eventsWhereInput = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ],
      is_active: true,
      starting_date: { lte: now },
      ending_date: { gte: now }
    };

    const [products, shops, events] = await Promise.all([
      prisma.products.findMany({
        where: productSearchCondition,
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
          Shop: {
            select: {
              name: true,
              slug: true,
              avatar: true,
            }
          },
          event: {
            select: {
              title: true,
              event_type: true,
              ending_date: true,
            }
          }
        },
        take: 6,
        orderBy: [
          { is_on_discount: 'desc' },
          { ratings: 'desc' }
        ]
      }),

      prisma.shops.findMany({
        where: shopSearchCondition,
        select: {
          id: true,
          name: true,
          slug: true,
          avatar: true,
          category: true,
          ratings: true,
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
        take: 3,
        orderBy: { ratings: 'desc' }
      }),

      prisma.events.findMany({
        where: eventSearchCondition,
        select: {
          id: true,
          title: true,
          event_type: true,
          discount_percent: true,
          banner_image: true,
          ending_date: true,
          shop: {
            select: {
              name: true,
              slug: true,
            }
          },
          _count: {
            select: {
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
        take: 3,
        orderBy: { views: 'desc' }
      })
    ]);

    res.status(200).json({
      success: true,
      data: { products, shops, events }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Enhanced full search with pricing awareness and event filtering
 */
export const fullSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    // Enhanced filter parameters
    const category = req.query.category as string;
    const sortBy = req.query.sortBy as string || 'relevance';
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
    const onSale = req.query.onSale === 'true';
    const inEvent = req.query.inEvent === 'true';
    const shopId = req.query.shopId as string;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required.'
      });
    }

    // Build comprehensive where clause
    const whereClause: Prisma.productsWhereInput = {
      ...buildSearchQuery(query),
      isDeleted: false,
      status: 'Active',
      stock: { gt: 0 }
    };

    // Price range filter using current_price
    if (minPrice !== undefined && maxPrice !== undefined) {
      whereClause.current_price = {
        gte: minPrice,
        lte: maxPrice,
      };
    } else if (minPrice !== undefined) {
      whereClause.current_price = { gte: minPrice };
    } else if (maxPrice !== undefined) {
      whereClause.current_price = { lte: maxPrice };
    }

    // Category filter
    if (category && category !== 'all') {
      whereClause.category = category;
    }

    // On sale filter
    if (onSale) {
      whereClause.is_on_discount = true;
    }

    // Event filter
    if (inEvent) {
      const now = new Date();
      whereClause.event = {
        is_active: true,
        starting_date: { lte: now },
        ending_date: { gte: now }
      };
    }

    // Shop filter
    if (shopId) {
      whereClause.shopId = shopId;
    }

    // Build dynamic orderBy clause
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
      case 'discount':
        orderByClause = { is_on_discount: 'desc' };
        break;
      case 'newest':
        orderByClause = { createdAt: 'desc' };
        break;
      case 'relevance':
      default:
        // For relevance, prioritize exact title matches, then on-sale items
        orderByClause = [
          { is_on_discount: 'desc' },
          { ratings: 'desc' },
          { totalSales: 'desc' }
        ] as any;
        break;
    }

    // Execute search queries
    const [products, totalProducts, categoryFacets, shopFacets, priceRange] = await Promise.all([
      prisma.products.findMany({
        where: whereClause,
        include: {
          Shop: {
            select: {
              id: true,
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
              discount_percent: true,
            }
          }
        },
        skip,
        take: limit,
        orderBy: orderByClause
      }),

      prisma.products.count({ where: whereClause }),

      // Category facets
      prisma.products.groupBy({
        by: ['category'],
        where: whereClause,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }),

      // Shop facets
      prisma.products.groupBy({
        by: ['shopId'],
        where: whereClause,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }).then(async (shopGroups) => {
        const shopIds = shopGroups.map(g => g.shopId);
        const shops = await prisma.shops.findMany({
          where: { id: { in: shopIds } },
          select: { id: true, name: true, slug: true, avatar: true }
        });

        return shopGroups.map(group => ({
          ...group,
          shop: shops.find(s => s.id === group.shopId)
        }));
      }),

      // Price range for filters
      prisma.products.aggregate({
        where: whereClause,
        _min: { current_price: true },
        _max: { current_price: true }
      })
    ]);

    // Get search suggestions if no results
    let suggestions: string[] = [];
    if (totalProducts === 0) {
      const suggestionProducts = await prisma.products.findMany({
        where: {
          isDeleted: false,
          status: 'Active',
          stock: { gt: 0 }
        },
        select: { category: true, tags: true },
        distinct: ['category'],
        take: 5
      });

      suggestions = suggestionProducts
        .map(p => p.category)
        .filter(cat => cat.toLowerCase().includes(query.toLowerCase().substring(0, 3)));
    }

    res.status(200).json({
      success: true,
      data: {
        products,
        facets: {
          categories: categoryFacets,
          shops: shopFacets,
          priceRange: {
            min: priceRange._min.current_price || 0,
            max: priceRange._max.current_price || 10000
          }
        },
        suggestions,
        pagination: {
          total: totalProducts,
          currentPage: page,
          totalPages: Math.ceil(totalProducts / limit),
          hasNext: page * limit < totalProducts,
          hasPrev: page > 1,
        },
        searchQuery: query,
        appliedFilters: {
          category,
          priceRange: { min: minPrice, max: maxPrice },
          onSale,
          inEvent,
          shopId
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Enhanced product search with autocomplete
export const searchProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required!"
      });
    }

    const products = await prisma.products.findMany({
      where: {
        ...buildSearchQuery(query),
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
        Shop: {
          select: {
            name: true,
            slug: true,
          }
        }
      },
      take: limit,
      orderBy: [
        { is_on_discount: "desc" },
        { totalSales: "desc" },
        { createdAt: "desc" }
      ],
    });

    return res.status(200).json({
      success: true,
      data: { products }
    });
  } catch (error) {
    return next(error);
  }
};

// Search events
export const searchEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;
    const eventType = req.query.eventType as string;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required!"
      });
    }

    const now = new Date();

    const terms = query.trim().split(/\s+/).filter(t => t.length > 0);
    const termConditions = terms.map(term => ({
      OR: [
        { title: { contains: term, mode: "insensitive" as const } },
        { description: { contains: term, mode: "insensitive" as const } }
      ]
    }));

    const whereClause: Prisma.eventsWhereInput = {
      AND: termConditions,
      is_active: true,
      starting_date: { lte: now },
      ending_date: { gte: now }
    };

    if (eventType && eventType !== 'all') {
      whereClause.event_type = eventType;
    }

    const [events, totalEvents] = await Promise.all([
      prisma.events.findMany({
        where: whereClause,
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
            },
            take: 4
          },
          shop: {
            select: {
              name: true,
              slug: true,
              avatar: true,
            }
          },
          _count: {
            select: {
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
        skip,
        take: limit,
        orderBy: [
          { views: "desc" },
          { createdAt: "desc" }
        ],
      }),
      prisma.events.count({ where: whereClause })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        events,
        pagination: {
          total: totalEvents,
          currentPage: page,
          totalPages: Math.ceil(totalEvents / limit),
          hasNext: page * limit < totalEvents,
          hasPrev: page > 1,
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};

// Search shops
export const searchShops = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;
    const category = req.query.category as string;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required!"
      });
    }


    const whereClause: Prisma.shopsWhereInput = {
      ...buildShopSearchQuery(query)
    };

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    const [shops, totalShops] = await Promise.all([
      prisma.shops.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          slug: true,
          bio: true,
          category: true,
          avatar: true,
          coverBanner: true,
          ratings: true,
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
        },
        skip,
        take: limit,
        orderBy: { ratings: "desc" },
      }),
      prisma.shops.count({ where: whereClause })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        shops,
        pagination: {
          total: totalShops,
          currentPage: page,
          totalPages: Math.ceil(totalShops / limit),
          hasNext: page * limit < totalShops,
          hasPrev: page > 1,
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};

// Get search suggestions (enhanced with popular searches and typeahead support)
export const getSearchSuggestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string;

    // Return popular searches when no query or query too short
    if (!query || query.trim().length < 1) {
      const [popularProducts, popularCategories] = await Promise.all([
        prisma.products.findMany({
          where: { isDeleted: false, status: 'Active', stock: { gt: 0 } },
          select: { title: true, slug: true, category: true },
          orderBy: { totalSales: 'desc' },
          distinct: ['title'],
          take: 5
        }),
        prisma.products.groupBy({
          by: ['category'],
          where: { isDeleted: false, status: 'Active' },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 3
        })
      ]);

      return res.status(200).json({
        success: true,
        data: {
          suggestions: [],
          popular: [
            ...popularProducts.map(p => ({
              type: 'popular' as const,
              value: p.title,
              slug: p.slug,
              category: p.category
            })),
            ...popularCategories.map(c => ({
              type: 'category' as const,
              value: c.category,
              count: c._count.id
            }))
          ]
        }
      });
    }

    // Get suggestions from multiple sources with improved matching
    const searchTerm = query.trim();

    const [productSuggestions, categorySuggestions, shopSuggestions] = await Promise.all([
      // Product title suggestions - ordered by sales for better relevance
      prisma.products.findMany({
        where: {
          OR: [
            { title: { startsWith: searchTerm, mode: 'insensitive' } },
            { title: { contains: searchTerm, mode: 'insensitive' } },
          ],
          isDeleted: false,
          status: 'Active',
          stock: { gt: 0 }
        },
        select: { title: true, slug: true, category: true, images: true },
        distinct: ['title'],
        orderBy: { totalSales: 'desc' },
        take: 6
      }),

      // Category suggestions
      prisma.products.groupBy({
        by: ['category'],
        where: {
          category: { contains: searchTerm, mode: 'insensitive' },
          isDeleted: false,
          status: 'Active'
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 3
      }),

      // Shop name suggestions
      prisma.shops.findMany({
        where: {
          OR: [
            { name: { startsWith: searchTerm, mode: 'insensitive' } },
            { name: { contains: searchTerm, mode: 'insensitive' } },
          ]
        },
        select: { name: true, slug: true, avatar: true },
        orderBy: { ratings: 'desc' },
        distinct: ['name'],
        take: 3
      })
    ]);

    const suggestions = [
      ...productSuggestions.map(p => ({
        type: 'product' as const,
        value: p.title,
        slug: p.slug,
        category: p.category,
        image: p.images?.[0]?.url || null
      })),
      ...categorySuggestions.map(c => ({
        type: 'category' as const,
        value: c.category,
        count: c._count.id
      })),
      ...shopSuggestions.map(s => ({
        type: 'shop' as const,
        value: s.name,
        slug: s.slug,
        avatar: s.avatar?.url || null
      }))
    ];

    return res.status(200).json({
      success: true,
      data: {
        suggestions,
        query: searchTerm
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Seller Dashboard Search - Search across seller's products, orders, events, and discounts
 */
export const sellerSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellerId = (req as any).user?.shop?.id;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Seller authentication required.'
      });
    }

    const query = (req.query.q as string) || '';
    const category = (req.query.category as string) || 'all';
    const limit = parseInt(req.query.limit as string) || 20;

    if (query.trim().length < 2) {
      return res.status(200).json({
        success: true,
        data: { results: [] }
      });
    }

    const searchResults: any[] = [];

    // Search Products
    if (category === 'all' || category === 'products') {
      const products = await prisma.products.findMany({
        where: {
          shopId: sellerId,
          ...buildSearchQuery(query),
          isDeleted: false
        },
        select: {
          id: true,
          title: true,
          slug: true,
          images: true,
          current_price: true,
          status: true,
          stock: true,
          category: true,
        },
        take: limit,
        orderBy: { createdAt: 'desc' }
      });

      searchResults.push(...products.map(product => ({
        id: product.id,
        title: product.title,
        description: `${product.category} - ${product.stock} in stock`,
        category: 'products' as const,
        url: `/dashboard/all-products/${product.slug}`,
        imageUrl: product.images?.[0]?.url || null,
        metadata: {
          status: product.status,
          price: `$${product.current_price}`,
          stock: product.stock
        }
      })));
    }

    // Search Orders (if needed in future)
    // Note: Orders are typically in a separate service, so this would need to be adjusted
    // based on your microservices architecture

    // Search Events
    if (category === 'all' || category === 'events') {
      const eTerms = query.trim().split(/\s+/).filter(t => t.length > 0);
      const eTermConditions = eTerms.map(term => ({
        OR: [
          { title: { contains: term, mode: 'insensitive' as const } },
          { description: { contains: term, mode: 'insensitive' as const } }
        ]
      }));

      const events = await prisma.events.findMany({
        where: {
          shopId: sellerId,
          AND: eTermConditions
        },
        select: {
          id: true,
          title: true,
          event_type: true,
          banner_image: true,
          starting_date: true,
          ending_date: true,
          is_active: true,
          _count: {
            select: { products: true }
          }
        },
        take: limit,
        orderBy: { createdAt: 'desc' }
      });

      const now = new Date();
      searchResults.push(...events.map(event => ({
        id: event.id,
        title: event.title,
        description: `${event.event_type} - ${event._count.products} products`,
        category: 'events' as const,
        url: `/dashboard/events/${event.id}`,
        imageUrl: typeof event.banner_image === 'object' && event.banner_image !== null
          ? (event.banner_image as any).url
          : event.banner_image || null,
        metadata: {
          status: event.is_active && event.ending_date > now ? 'Active' : 'Inactive',
          type: event.event_type,
          products: event._count.products
        }
      })));
    }

    // Search Discounts
    if (category === 'all' || category === 'discounts') {
      const dTerms = query.trim().split(/\s+/).filter(t => t.length > 0);
      const dTermConditions = dTerms.map(term => ({
        OR: [
          { discountCode: { contains: term, mode: 'insensitive' as const } },
          { description: { contains: term, mode: 'insensitive' as const } },
          { publicName: { contains: term, mode: 'insensitive' as const } }
        ]
      }));

      const discountCodes = await prisma.discount_codes.findMany({
        where: {
          shopId: sellerId,
          AND: dTermConditions
        },
        select: {
          id: true,
          discountCode: true,
          publicName: true,
          description: true,
          discountType: true,
          discountValue: true,
          isActive: true,
          validFrom: true,
          validUntil: true,
          currentUsageCount: true,
          usageLimit: true
        },
        take: limit,
        orderBy: { createdAt: 'desc' }
      });

      const now = new Date();
      searchResults.push(...discountCodes.map((discount) => ({
        id: discount.id,
        title: discount.discountCode,
        description: discount.description || `${discount.publicName}`,
        category: 'discounts' as const,
        url: `/dashboard/discounts/${discount.id}`,
        imageUrl: null,
        metadata: {
          status: discount.isActive && (!discount.validUntil || discount.validUntil > now) ? 'Active' : 'Inactive',
          type: discount.discountType,
          value: discount.discountType === 'PERCENTAGE'
            ? `${discount.discountValue}%`
            : `$${discount.discountValue}`,
          usage: `${discount.currentUsageCount}/${discount.usageLimit || '∞'}`
        }
      })));
    }

    return res.status(200).json({
      success: true,
      data: {
        results: searchResults.slice(0, limit),
        total: searchResults.length,
        query
      }
    });

  } catch (error) {
    return next(error);
  }
};
