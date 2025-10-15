import { NextFunction, Request, Response } from "express";
import prisma from "../../../../packages/libs/prisma";
import {
  AuthError,
  ValidationError,
} from "../../../../packages/error-handler";
import { imagekit } from "../../../../packages/libs/imageKit";
import { Prisma, productStatus } from "@prisma/client";
import { z } from "zod";
import { PricingService } from "../lib/pricing.service";

// Enhanced validation schemas
const createProductSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  detailed_description: z.string().min(1),
  warranty: z.string().optional(),
  custom_specifications: z.any().optional(),
  slug: z.string().min(1),
  tags: z.array(z.string()),
  cash_on_delivery: z.boolean().default(true),
  brand: z.string().optional(),
  video_url: z.string().url().optional(),
  category: z.string().min(1),
  subCategory: z.string().min(1),
  colors: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  discountCodes: z.string().optional(),
  stock: z.number().int().min(0),
  sale_price: z.number().optional(),
  regular_price: z.number().min(0),
  customProperties: z.any().default({}),
  images: z.array(z.any()),
  status: z.enum(['Active', 'Pending', 'Draft']).default('Active'),
});

const updateProductSchema = createProductSchema.partial().extend({
  id: z.string()
});

// =============================================
// COMMON/UTILITY FUNCTIONS
// =============================================

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.site_config.findFirst();

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Categories not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        categories: config.categories,
        subCategories: config.subCategories,
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const uploadProductImage = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      return next(new ValidationError("File name is required"));
    }

    const response = await imagekit.upload({
      file: fileName,
      fileName: `product-${Date.now()}.jpg`,
      folder: "/products",
    });

    res.status(201).json({
      success: true,
      data: {
        file_url: response.url,
        file_id: response.fileId,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProductImage = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.body;

    if (!fileId) {
      return next(new ValidationError("File ID is required"));
    }

    const response = await imagekit.deleteFile(fileId);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      data: response
    });
  } catch (error) {
    next(error);
  }
};

// =============================================
// USER/PUBLIC ROUTES
// =============================================

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const category = req.query.category as string;
    const sortBy = (req.query.sortBy as string) || "newest";
    const minPrice = req.query.minPrice
      ? parseFloat(req.query.minPrice as string)
      : undefined;
    const maxPrice = req.query.maxPrice
      ? parseFloat(req.query.maxPrice as string)
      : undefined;
    const search = req.query.search as string;
  const eventOnly = req.query.eventOnly === "true";

    // Build dynamic where clause
    const whereClause: Prisma.productsWhereInput = {
      isDeleted: false,
      status: productStatus.Active,
      stock: { gt: 0 }, // Only show products in stock
    };

    // Event filter
    if (eventOnly) {
      const now = new Date();
      whereClause.event = {
        is_active: true,
        starting_date: { lte: now },
        ending_date: { gte: now },
      };
    }

    // Category filter
    if (category && category !== "all") {
      whereClause.category = category;
    }

    // Price filter (using current_price for accurate filtering)
    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.current_price = {
        ...(minPrice !== undefined ? { gte: minPrice } : {}),
        ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
      };
    }

    // Search filter
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    // Build order by clause
    let orderByClause: Prisma.productsOrderByWithRelationInput = {};
    switch (sortBy) {
      case "price-asc":
        orderByClause = { current_price: "asc" };
        break;
      case "price-desc":
        orderByClause = { current_price: "desc" };
        break;
      case "popularity":
        orderByClause = { totalSales: "desc" };
        break;
      case "rating":
        orderByClause = { ratings: "desc" };
        break;
      case "discount":
        orderByClause = { is_on_discount: "desc" };
        break;
      case "newest":
      default:
        orderByClause = { createdAt: "desc" };
        break;
    }

    // Execute queries
    const [products, total] = await Promise.all([
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
              discount_percent: true,
              starting_date: true,
              ending_date: true,
              is_active: true,
            }
          }
        },
        skip,
        take: limit,
        orderBy: orderByClause,
      }),
      prisma.products.count({
        where: whereClause,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          limit,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Product slug is required.",
      });
    }

    const product = await prisma.products.findUnique({
      where: { slug: slug },
      include: {
        Shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            bio: true,
            avatar: true,
            ratings: true,
            address: true,
            opening_hours: true,
            website: true,
            socialLinks: true,
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            event_type: true,
            discount_percent: true,
            starting_date: true,
            ending_date: true,
            is_active: true,
          }
        },
        eventProductDiscounts: {
          where: { isActive: true },
          select: {
            discountType: true,
            discountValue: true,
            maxDiscount: true,
            specialPrice: true,
          }
        }
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Update view count (consider using background job for this)
    await prisma.products.update({
      where: { id: product.id },
      data: {
        // Increment view count if you add this field
      }
    });

    // Calculate current pricing
    const pricing = await PricingService.calculateProductPrice(product.id);

    return res.status(200).json({
      success: true,
      data: {
        product: {
          ...product,
          pricing,
        }
      }
    });
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return next(error);
  }
};

export const getProductsByIds = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({
        success: false,
        message: "Product IDs are required"
      });
    }

    const productIds = (ids as string).split(',').filter(Boolean);

    if (productIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const products = await prisma.products.findMany({
      where: {
        id: { in: productIds },
        isDeleted: { not: true },
        status: 'Active'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        images: true,
        regular_price: true,
        sale_price: true,
        current_price: true,
        is_on_discount: true,
        stock: true,
        category: true,
        ratings: true,
        eventId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      data: products,
      message: `Found ${products.length} products`
    });

  } catch (error) {
    console.error('Error fetching products by IDs:', error);
    return next(error);
  }
};

// =============================================
// SELLER ROUTES
// =============================================

export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate input
    const result = createProductSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error
      });
    }

    const validatedData = result.data;

    // Check authentication
    if (!req.user?.id || !req.user?.shop?.id) {
      return next(new AuthError("Only sellers can create products!"));
    }

    // Check slug uniqueness
    const existingProduct = await prisma.products.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingProduct) {
      return next(new ValidationError("Slug already exists! Please use a different slug!"));
    }

    // Create product with pricing
    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.products.create({
        data: {
          ...validatedData,
          current_price: validatedData.sale_price || validatedData.regular_price,
          // FIX: Use shop relation connect instead of direct shopId assignment
          Shop: {
            connect: { 
              id: req.user.shop.id 
            }
          },
          // Remove this line: shopId: req.user.shop.id,
          customProperties: validatedData.customProperties || {},
        },
      });

      // Create initial pricing record and update cached price
      await PricingService.updateCachedPricing(newProduct.id);

      return newProduct;
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });
  } catch (error) {
    next(error);
  }
};


export const getSellerProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const shopId = req.user?.shop?.id;
    if (!shopId) {
      return next(new AuthError("Unauthorized"));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const sortBy = req.query.sortBy as string;

    const whereClause: Prisma.productsWhereInput = {
      shopId,
    };

    // Handle status filter
    if (status && status !== 'all') {
      if (status === 'deleted') {
        whereClause.isDeleted = true;
      } else if (status === 'out_of_stock') {
        whereClause.isDeleted = false;
        whereClause.stock = 0;
      } else if (status === 'active') {
        whereClause.isDeleted = false;
        whereClause.status = 'Active';
      } else if (status === 'draft') {
        whereClause.isDeleted = false;
        whereClause.status = 'Draft';
      } else {
        whereClause.isDeleted = false;
        whereClause.status = status as productStatus;
      }
    } else {
      whereClause.isDeleted = false;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    // Build orderBy clause based on sortBy parameter
    let orderByClause: any = { createdAt: 'desc' };
    if (sortBy) {
      switch (sortBy) {
        case 'price_asc':
          orderByClause = { regular_price: 'asc' };
          break;
        case 'price_desc':
          orderByClause = { regular_price: 'desc' };
          break;
        case 'popularity':
          orderByClause = { totalSales: 'desc' };
          break;
        case 'rating':
          orderByClause = { ratings: 'desc' };
          break;
        case 'newest':
        default:
          orderByClause = { createdAt: 'desc' };
          break;
      }
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: whereClause,
        include: {
          event: {
            select: {
              id: true,
              title: true,
              event_type: true,
              starting_date: true,
              ending_date: true,
              is_active: true,
            }
          },
          priceHistory: {
            where: { isActive: true },
            take: 1,
            orderBy: { createdAt: 'desc' }
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
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalCount: total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.user?.shop?.id;

    if (!sellerId) {
      return next(new AuthError("Unauthorized"));
    }

    // Validate input
    const result = updateProductSchema.safeParse({ ...req.body, id: productId });
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error
      });
    }

    const { id, ...updateData } = result.data;

    // Check if product exists and belongs to seller
    const existingProduct = await prisma.products.findFirst({
      where: {
        id: productId,
        shopId: sellerId,
        isDeleted: false,
      }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Check for slug uniqueness if slug is being updated
    if (updateData.slug && updateData.slug !== existingProduct.slug) {
      const slugExists = await prisma.products.findUnique({
        where: { slug: updateData.slug }
      });

      if (slugExists) {
        return next(new ValidationError("Slug already exists!"));
      }
    }

    // Update product with pricing recalculation
    const updatedProduct = await prisma.$transaction(async (tx) => {
      const updated = await tx.products.update({
        where: { id: productId },
        data: {
          ...updateData,
        }
      });

      // If pricing changed, create new pricing record and update cache
      if (updateData.regular_price || updateData.sale_price) {
        await PricingService.updateCachedPricing(productId);
      }

      return updated;
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.user?.shop?.id;

    const product = await prisma.products.findFirst({
      where: {
        id: productId,
        shopId: sellerId,
      },
      select: {
        id: true,
        title: true,
        isDeleted: true,
      },
    });

    if (!product) {
      return next(new ValidationError("Product not found"));
    }

    if (product.isDeleted) {
      return next(new ValidationError("Product is already deleted"));
    }

    // Soft delete with 24-hour grace period
    await prisma.products.update({
      where: { id: productId },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
    });

    res.status(200).json({
      success: true,
      message: "Product scheduled for deletion in 24 hours. You can restore it within this period."
    });
  } catch (error) {
    next(error);
  }
};

export const restoreProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.user?.shop?.id;

    const product = await prisma.products.findFirst({
      where: {
        id: productId,
        shopId: sellerId,
      },
      select: {
        id: true,
        isDeleted: true,
        deletedAt: true,
      },
    });

    if (!product) {
      return next(new ValidationError("Product not found"));
    }

    if (!product.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Product is not in deleted state",
      });
    }

    // Check if still within grace period
    if (product.deletedAt && new Date() > product.deletedAt) {
      return res.status(400).json({
        success: false,
        message: "Product deletion grace period has expired",
      });
    }

    await prisma.products.update({
      where: { id: productId },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Product successfully restored!"
    });
  } catch (error) {
    next(error);
  }
};

// =============================================
// ADMIN ROUTES
// =============================================

export const getAllProductsAdmin = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check admin role
    if (req.user?.role !== 'ADMIN') {
      return next(new AuthError("Admin access required"));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;
    const shopId = req.query.shopId as string;

    const whereClause: Prisma.productsWhereInput = {};

    if (status && status !== 'all') {
      whereClause.status = status as productStatus;
    }

    if (shopId) {
      whereClause.shopId = shopId;
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: whereClause,
        include: {
          Shop: {
            select: {
              id: true,
              name: true,
              slug: true,
              sellerId: true,
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.products.count({ where: whereClause })
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
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

export const updateProductStatusAdmin = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check admin role
    if (req.user?.role !== 'ADMIN') {
      return next(new AuthError("Admin access required"));
    }

  const { productId } = req.params;
  const { status } = req.body;

    if (!['Active', 'Pending', 'Draft'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const product = await prisma.products.update({
      where: { id: productId },
      data: { status }
    });

    // Optional: Log admin action
    // await logAdminAction({
    //   adminId: req.user.id,
    //   action: 'UPDATE_PRODUCT_STATUS',
    //   targetId: productId,
    //   reason
    // });

    return res.status(200).json({
      success: true,
      message: `Product status updated to ${status}`,
      data: product
    });
  } catch (error) {
    return next(error);
  }
};

// =============================================
// SEARCH & VALIDATION
// =============================================

export const validateCoupon = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { couponCode } = req.body;

    if (!couponCode || typeof couponCode !== "string") {
      return res.status(400).json({ 
        success: false,
        message: "Coupon code is required." 
      });
    }

    const discount = await prisma.discount_codes.findUnique({
      where: {
        discountCode: couponCode.toUpperCase(),
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    });

    if (!discount) {
      return res.status(404).json({ 
        success: false,
        message: "This coupon code is not valid." 
      });
    }

    // Check if discount is active and within valid period
    const now = new Date();
    if (!discount.isActive || 
        now < discount.validFrom || 
        (discount.validUntil && now > discount.validUntil)) {
      return res.status(400).json({
        success: false,
        message: "This coupon code has expired or is not active."
      });
    }

    // Check usage limits
    if (discount.usageLimit && discount.currentUsageCount >= discount.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "This coupon code has reached its usage limit."
      });
    }

    return res.status(200).json({
      success: true,
      data: discount
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return next(error);
  }
};

// =============================================
// SELLER STATISTICS/ANALYTICS
// =============================================

export const getSellerProductsSummary = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const shopId = req.user?.shop?.id;
    if (!shopId) {
      return next(new AuthError("Unauthorized"));
    }

    // Get all statistics in parallel for better performance
    const [
      totalProducts,
      activeProducts,
      draftProducts,
      outOfStockProducts,
      deletedProducts,
    ] = await Promise.all([
      // Total products (excluding deleted)
      prisma.products.count({
        where: {
          shopId,
          isDeleted: false,
        }
      }),
      // Active products
      prisma.products.count({
        where: {
          shopId,
          isDeleted: false,
          status: 'Active',
        }
      }),
      // Draft products
      prisma.products.count({
        where: {
          shopId,
          isDeleted: false,
          status: 'Draft',
        }
      }),
      // Out of stock products
      prisma.products.count({
        where: {
          shopId,
          isDeleted: false,
          stock: 0,
        }
      }),
      // Deleted products
      prisma.products.count({
        where: {
          shopId,
          isDeleted: true,
        }
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        draftProducts,
        outOfStockProducts,
        deletedProducts,
      }
    });
  } catch (error) {
    console.error("Error fetching seller products summary:", error);
    next(error);
  }
};

// Export all functions - keeping original names for backward compatibility
export {
  getSellerProducts as getShopProducts,
  deleteProduct as deleteShopProducts,
  restoreProduct as restoreShopProducts,
};
