import { Request, Response, NextFunction } from "express";
import prisma from "../../../../packages/libs/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { ValidationError } from "../../../../packages/error-handler";

const ensureProductsBelongToShop = async (productIds: string[] | undefined, shopId: string) => {
  if (!productIds?.length) {
    return;
  }

  const ownedCount = await prisma.products.count({
    where: {
      id: { in: productIds },
      shopId
    }
  });

  if (ownedCount !== productIds.length) {
    throw new ValidationError("Some products don't belong to your shop");
  }
};

// Validation schemas
const createDiscountSchema = z.object({
  publicName: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]),
  discountValue: z.number().min(0),
  discountCode: z.string().min(3).max(20).regex(/^[A-Z0-9]+$/, "Code must be uppercase letters and numbers only"),
  minimumOrderAmount: z.number().min(0).optional(),
  maximumDiscountAmount: z.number().min(0).optional(),
  usageLimit: z.number().int().min(1).optional(),
  usageLimitPerUser: z.number().int().min(1).optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  applicableToAll: z.boolean().default(true),
  applicableCategories: z.array(z.string()).optional(),
  applicableProducts: z.array(z.string()).optional(),
  excludedProducts: z.array(z.string()).optional(),
}).refine(data => {
  if (data.discountType === 'PERCENTAGE' && data.discountValue > 100) {
    return false;
  }
  return true;
}, {
  message: "Percentage discount cannot exceed 100%",
  path: ["discountValue"],
}).refine(data => {
  if (data.discountType === 'FREE_SHIPPING' && data.discountValue !== 0) {
    return false;
  }
  return true;
}, {
  message: "Free shipping discount value should be 0",
  path: ["discountValue"],
});

const updateDiscountSchema = createDiscountSchema.partial();

// Create Discount Code
export const createDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.user?.id;
    const shopId = req.user?.shop?.id;

    if (!sellerId || !shopId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Seller authentication required"
      });
    }

    const validatedData = createDiscountSchema.parse(req.body);

    // Check if discount code already exists
    const existingCode = await prisma.discount_codes.findUnique({
      where: { discountCode: validatedData.discountCode }
    });

    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: "Discount code already exists"
      });
    }

    // Validate dates
    let validFrom = new Date();
    let validUntil = undefined;

    if (validatedData.validFrom) {
      validFrom = new Date(validatedData.validFrom);
    }

    if (validatedData.validUntil) {
      validUntil = new Date(validatedData.validUntil);
      if (validUntil <= validFrom) {
        return res.status(400).json({
          success: false,
          message: "Valid until date must be after valid from date"
        });
      }
    }

    await ensureProductsBelongToShop(validatedData.applicableProducts, shopId);

    const discountCode = await prisma.discount_codes.create({
      data: {
        ...validatedData,
        validFrom,
        validUntil,
        sellerId,
        shopId,
      },
      include: {
        shop: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: "Discount code created successfully",
      data: discountCode
    });

  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error
      });
    }
    return next(error);
  }
};

// Get Seller Discount Codes
export const getSellerDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.user?.id;
    const shopId = req.user?.shop?.id;

    if (!sellerId || !shopId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const {
      page = "1",
      limit = "10",
      status = "all",
      discount_type,
      search
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    const now = new Date();

    const normalizedStatus = typeof status === "string" ? status.toLowerCase() : "all";
    const searchTerm = typeof search === "string" ? search.trim() : undefined;
    const filters: Prisma.discount_codesWhereInput[] = [];
    const isUsedUpFilter = normalizedStatus === "used_up";

    if (normalizedStatus === "active") {
      filters.push({ isActive: true });
      filters.push({ validFrom: { lte: now } });
      filters.push({ OR: [{ validUntil: null }, { validUntil: { gte: now } }] });
    } else if (normalizedStatus === "expired") {
      filters.push({ validUntil: { lt: now } });
    } else if (normalizedStatus === "inactive") {
      filters.push({ isActive: false });
    } else if (isUsedUpFilter) {
      filters.push({ usageLimit: { not: null } });
    }

    if (discount_type) {
      filters.push({ discountType: discount_type as string });
    }

    if (searchTerm) {
      filters.push({
        OR: [
          { publicName: { contains: searchTerm, mode: 'insensitive' } },
          { discountCode: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } }
        ]
      });
    }

    const baseWhere: Prisma.discount_codesWhereInput = {
      sellerId,
      shopId,
    };

    if (filters.length > 0) {
      baseWhere.AND = filters;
    }

    const includeRelations = {
      shop: {
        select: {
          name: true,
          slug: true
        }
      },
      usageHistory: {
        select: {
          id: true,
          discountAmount: true,
          usedAt: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { usedAt: 'desc' },
        take: 5
      }
    } satisfies Prisma.discount_codesInclude;

    type DiscountCodeWithRelations = Prisma.discount_codesGetPayload<{ include: typeof includeRelations }>;

    let discountCodes: DiscountCodeWithRelations[] = [];
    let totalCount = 0;

    if (isUsedUpFilter) {
      const candidates = await prisma.discount_codes.findMany({
        where: baseWhere,
        select: {
          id: true,
          usageLimit: true,
          currentUsageCount: true,
        },
        orderBy: { createdAt: "desc" }
      });

      const usedUpIds = candidates
        .filter((code) => code.usageLimit !== null && code.currentUsageCount >= (code.usageLimit ?? 0))
        .map((code) => code.id);

      totalCount = usedUpIds.length;

      const paginatedIds = usedUpIds.slice(skip, skip + limitNum);

      if (paginatedIds.length > 0) {
        const records = await prisma.discount_codes.findMany({
          where: { id: { in: paginatedIds } },
          include: includeRelations,
          orderBy: { createdAt: "desc" }
        });

        const orderMap = new Map(paginatedIds.map((id, index) => [id, index]));
        discountCodes = records.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
      }
    } else {
      const [records, count] = await Promise.all([
        prisma.discount_codes.findMany({
          where: baseWhere,
          include: includeRelations,
          orderBy: { createdAt: "desc" },
          skip,
          take: limitNum
        }),
        prisma.discount_codes.count({ where: baseWhere })
      ]);

      discountCodes = records;
      totalCount = count;
    }

    res.status(200).json({
      success: true,
      data: {
        discountCodes,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
          hasNext: pageNum * limitNum < totalCount,
          hasPrev: pageNum > 1
        }
      }
    });

  } catch (error) {
    return next(error);
  }
};

// Update Discount Code
export const updateDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { discountId } = req.params;
    const sellerId = req.user?.id;
    const shopId = req.user?.shop?.id;

    if (!sellerId || !shopId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const validatedData = updateDiscountSchema.parse(req.body);

    // Check if discount code belongs to seller
    const existingDiscount = await prisma.discount_codes.findFirst({
      where: {
        id: discountId,
        sellerId,
        shopId
      }
    });

    if (!existingDiscount) {
      return res.status(404).json({
        success: false,
        message: "Discount code not found or unauthorized"
      });
    }

    // Check if code is being changed and if it already exists
    if (validatedData.discountCode && validatedData.discountCode !== existingDiscount.discountCode) {
      const codeExists = await prisma.discount_codes.findUnique({
        where: { discountCode: validatedData.discountCode }
      });

      if (codeExists) {
        return res.status(400).json({
          success: false,
          message: "Discount code already exists"
        });
      }
    }

    // Validate dates if provided
    let updateData: any = { ...validatedData };
    if (validatedData.validFrom || validatedData.validUntil) {
      const validFrom = validatedData.validFrom 
        ? new Date(validatedData.validFrom) 
        : existingDiscount.validFrom;
      const validUntil = validatedData.validUntil 
        ? new Date(validatedData.validUntil) 
        : existingDiscount.validUntil;

      if (validUntil && validUntil <= validFrom) {
        return res.status(400).json({
          success: false,
          message: "Valid until date must be after valid from date"
        });
      }

      updateData.validFrom = validFrom;
      updateData.validUntil = validUntil;
    }

    // Prevent reducing usage limit below current usage
    if (validatedData.usageLimit !== undefined && 
        validatedData.usageLimit < existingDiscount.currentUsageCount) {
      return res.status(400).json({
        success: false,
        message: "Usage limit cannot be less than current usage count"
      });
    }

    await ensureProductsBelongToShop(validatedData.applicableProducts, shopId);

    const updatedDiscount = await prisma.discount_codes.update({
      where: { id: discountId },
      data: updateData,
      include: {
        shop: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Discount code updated successfully",
      data: updatedDiscount
    });

  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error
      });
    }
    return next(error);
  }
};

// Delete Discount Code
export const deleteDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { discountId } = req.params;
    const sellerId = req.user?.id;
    const shopId = req.user?.shop?.id;

    if (!sellerId || !shopId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // Check if discount code belongs to seller
    const existingDiscount = await prisma.discount_codes.findFirst({
      where: {
        id: discountId,
        sellerId,
        shopId
      }
    });

    if (!existingDiscount) {
      return res.status(404).json({
        success: false,
        message: "Discount code not found or unauthorized"
      });
    }

    // Check if discount has been used
    if (existingDiscount.currentUsageCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete discount code that has been used"
      });
    }

    await prisma.discount_codes.delete({
      where: { id: discountId }
    });

    res.status(200).json({
      success: true,
      message: "Discount code deleted successfully"
    });

  } catch (error) {
    return next(error);
  }
};

// Validate Discount Code (Public)
export const validateDiscountCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { discountCode, cartItems, shopId } = req.body;

    if (!discountCode || typeof discountCode !== "string") {
      return res.status(400).json({
        success: false,
        message: "Discount code is required"
      });
    }

    if (!cartItems || !Array.isArray(cartItems)) {
      return res.status(400).json({
        success: false,
        message: "Cart items are required"
      });
    }

    const discount = await prisma.discount_codes.findUnique({
      where: {
        discountCode: discountCode.toUpperCase(),
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
        message: "Invalid discount code"
      });
    }

    // Check if discount is active and within valid period
    const now = new Date();
    if (!discount.isActive || 
        now < discount.validFrom || 
        (discount.validUntil && now > discount.validUntil)) {
      return res.status(400).json({
        success: false,
        message: "This discount code has expired or is not active"
      });
    }

    // Check shop restriction
    if (shopId && discount.shopId !== shopId) {
      return res.status(400).json({
        success: false,
        message: "This discount code is not valid for this shop"
      });
    }

    // Check usage limits
    if (discount.usageLimit && discount.currentUsageCount >= discount.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "This discount code has reached its usage limit"
      });
    }

    // Calculate cart total and check minimum order amount
    const cartTotal = cartItems.reduce((total: number, item: any) => {
      return total + (item.price * item.quantity);
    }, 0);

    if (discount.minimumOrderAmount && cartTotal < discount.minimumOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${discount.minimumOrderAmount} required`
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.discountType === 'PERCENTAGE') {
      discountAmount = (cartTotal * discount.discountValue) / 100;
      if (discount.maximumDiscountAmount) {
        discountAmount = Math.min(discountAmount, discount.maximumDiscountAmount);
      }
    } else if (discount.discountType === 'FIXED_AMOUNT') {
      discountAmount = Math.min(discount.discountValue, cartTotal);
    } else if (discount.discountType === 'FREE_SHIPPING') {
      // Handle free shipping logic
      discountAmount = 0; // Shipping cost would be handled separately
    }

    const finalAmount = Math.max(cartTotal - discountAmount, 0);

    res.status(200).json({
      success: true,
      data: {
        discount,
        discountAmount,
        cartTotal,
        finalAmount,
        savings: discountAmount
      }
    });

  } catch (error) {
    console.error("Discount validation error:", error);
    return next(error);
  }
};

// Apply Discount Code (when order is placed)
export const applyDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { discountCode, orderId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    if (!discountCode || typeof discountCode !== "string") {
      return res.status(400).json({
        success: false,
        message: "Discount code is required"
      });
    }

    if (!orderId || typeof orderId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Order id is required"
      });
    }

    const normalizedCode = discountCode.toUpperCase();

    const discount = await prisma.discount_codes.findUnique({
      where: { discountCode: normalizedCode }
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Invalid discount code"
      });
    }

    const order = await prisma.orders.findFirst({
      where: {
        id: orderId,
        userId
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                category: true,
                shopId: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (discount.shopId !== order.shopId) {
      return res.status(400).json({
        success: false,
        message: "This discount code is not valid for this order"
      });
    }

    const now = new Date();
    if (!discount.isActive || now < discount.validFrom || (discount.validUntil && now > discount.validUntil)) {
      return res.status(400).json({
        success: false,
        message: "This discount code has expired or is not active"
      });
    }

    if (discount.usageLimit && discount.currentUsageCount >= discount.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "This discount code has reached its usage limit"
      });
    }

    const excludedProducts = new Set(discount.excludedProducts ?? []);
    const applicableProducts = new Set(discount.applicableProducts ?? []);
    const applicableCategories = new Set(discount.applicableCategories ?? []);

    const orderSubtotal = order.items.reduce((total, item) => total + item.price * item.quantity, 0);

    if (orderSubtotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Order total must be greater than 0 to apply a discount"
      });
    }

    if (discount.minimumOrderAmount && orderSubtotal < discount.minimumOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${discount.minimumOrderAmount} required`
      });
    }

    const eligibleItems = order.items.filter((item) => {
      const productId = item.productId;
      const productCategory = item.product?.category ?? null;

      if (excludedProducts.has(productId)) {
        return false;
      }

      if (discount.applicableToAll) {
        return true;
      }

      const matchesProduct = applicableProducts.size === 0 || applicableProducts.has(productId);
      const matchesCategory = applicableCategories.size === 0 || (productCategory ? applicableCategories.has(productCategory) : false);

      return matchesProduct && matchesCategory;
    });

    const eligibleSubtotal = eligibleItems.reduce((total, item) => total + item.price * item.quantity, 0);

    if (eligibleSubtotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Discount code is not applicable to the items in this order"
      });
    }

    let computedDiscountAmount = 0;
    if (discount.discountType === "PERCENTAGE") {
      computedDiscountAmount = (eligibleSubtotal * discount.discountValue) / 100;
      if (discount.maximumDiscountAmount) {
        computedDiscountAmount = Math.min(computedDiscountAmount, discount.maximumDiscountAmount);
      }
    } else if (discount.discountType === "FIXED_AMOUNT") {
      computedDiscountAmount = Math.min(discount.discountValue, eligibleSubtotal);
    } else if (discount.discountType === "FREE_SHIPPING") {
      computedDiscountAmount = 0;
    }

    const finalAmount = Math.max(orderSubtotal - computedDiscountAmount, 0);

    await prisma.$transaction(async (tx) => {
      const discountSnapshot = await tx.discount_codes.findUnique({
        where: { id: discount.id },
        select: {
          id: true,
          usageLimit: true,
          usageLimitPerUser: true,
          currentUsageCount: true
        }
      });

      if (!discountSnapshot) {
        throw new ValidationError("Discount code is no longer available");
      }

      if (discountSnapshot.usageLimit && discountSnapshot.currentUsageCount >= discountSnapshot.usageLimit) {
        throw new ValidationError("This discount code has reached its usage limit");
      }

      if (discountSnapshot.usageLimitPerUser) {
        const usageForUser = await tx.discount_usage.count({
          where: {
            discountCodeId: discountSnapshot.id,
            userId
          }
        });

        if (usageForUser >= discountSnapshot.usageLimitPerUser) {
          throw new ValidationError("You have reached the usage limit for this discount code");
        }
      }

      const existingUsage = await tx.discount_usage.findFirst({
        where: {
          discountCodeId: discountSnapshot.id,
          orderId
        }
      });

      if (existingUsage) {
        throw new ValidationError("This order already has an applied discount");
      }

      await tx.discount_usage.create({
        data: {
          discountCodeId: discountSnapshot.id,
          userId,
          orderId,
          discountAmount: computedDiscountAmount
        }
      });

      await tx.discount_codes.update({
        where: { id: discountSnapshot.id },
        data: {
          currentUsageCount: { increment: 1 }
        }
      });

      await tx.orders.update({
        where: { id: orderId },
        data: {
          couponCode: normalizedCode,
          discountAmount: computedDiscountAmount
        }
      });
    });

    res.status(200).json({
      success: true,
      message: "Discount applied successfully",
      data: {
        discountCode: normalizedCode,
        discountAmount: computedDiscountAmount,
        orderTotal: orderSubtotal,
        finalAmount
      }
    });

  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    return next(error);
  }
};

// Get Discount Usage Statistics
export const getDiscountUsageStats = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { discountId } = req.params;
    const sellerId = req.user?.id;
    const shopId = req.user?.shop?.id;

    if (!sellerId || !shopId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // Verify discount belongs to seller
    const discount = await prisma.discount_codes.findFirst({
      where: {
        id: discountId,
        sellerId,
        shopId
      }
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount code not found"
      });
    }

    const [usageHistory, usageStats] = await Promise.all([
      prisma.discount_usage.findMany({
        where: { discountCodeId: discountId },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          order: {
            select: {
              id: true,
              totalAmount: true,
              status: true
            }
          }
        },
        orderBy: { usedAt: 'desc' },
        take: 50
      }),
      prisma.discount_usage.aggregate({
        where: { discountCodeId: discountId },
        _sum: { discountAmount: true },
        _count: { id: true }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        discount,
        usageHistory,
        stats: {
          totalUsages: usageStats._count.id,
          totalSavings: usageStats._sum.discountAmount || 0,
          remainingUsages: discount.usageLimit 
            ? Math.max(0, discount.usageLimit - discount.currentUsageCount)
            : null
        }
      }
    });

  } catch (error) {
    return next(error);
  }
};
