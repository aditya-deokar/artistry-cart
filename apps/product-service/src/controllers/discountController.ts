import { Request, Response, NextFunction } from "express";
import prisma from "../../../../packages/libs/prisma";
import { z } from "zod";

// Validation schemas
const createDiscountSchema = z.object({
  publicName: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]),
  discountValue: z.number().min(0),
  discountCode: z.string().min(3).max(20).regex(/^[A-Z0-9]+$/),
  minimumOrderAmount: z.number().min(0).optional(),
  maximumDiscountAmount: z.number().min(0).optional(),
  usageLimit: z.number().min(1).optional(),
  usageLimitPerUser: z.number().min(1).optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  applicableToAll: z.boolean().default(true),
  applicableCategories: z.array(z.string()).optional(),
  applicableProducts: z.array(z.string()).optional(),
  excludedProducts: z.array(z.string()).optional()
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
    if (validatedData.validFrom && validatedData.validUntil) {
      const validFrom = new Date(validatedData.validFrom);
      const validUntil = new Date(validatedData.validUntil);
      
      if (validFrom >= validUntil) {
        return res.status(400).json({
          success: false,
          message: "Valid until date must be after valid from date"
        });
      }
    }

    // Validate percentage discount
    if (validatedData.discountType === "PERCENTAGE" && validatedData.discountValue > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100%"
      });
    }

    // Validate applicable products belong to seller
    if (validatedData.applicableProducts && validatedData.applicableProducts.length > 0) {
      const products = await prisma.products.findMany({
        where: {
          id: { in: validatedData.applicableProducts },
          shopId: shopId
        }
      });

      if (products.length !== validatedData.applicableProducts.length) {
        return res.status(400).json({
          success: false,
          message: "Some applicable products don't belong to your shop"
        });
      }
    }

    const discountCode = await prisma.discount_codes.create({
      data: {
        ...validatedData,
        validFrom: validatedData.validFrom ? new Date(validatedData.validFrom) : new Date(),
        validUntil: validatedData.validUntil ? new Date(validatedData.validUntil) : undefined,
        sellerId,
        shopId
      }
    });

    res.status(201).json({
      success: true,
      message: "Discount code created successfully",
      data: discountCode
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error
      });
    }
    next(error);
  }
};

// Get All Discount Codes for Seller
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

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    const now = new Date();

    // Build where clause
    const where: any = {
      sellerId,
      shopId
    };

    if (status === "active") {
      where.isActive = true;
      where.OR = [
        { validUntil: null },
        { validUntil: { gte: now } }
      ];
    } else if (status === "expired") {
      where.validUntil = { lt: now };
    } else if (status === "inactive") {
      where.isActive = false;
    }

    if (discount_type) {
      where.discountType = discount_type;
    }

    if (search) {
      where.OR = [
        { publicName: { contains: search, mode: 'insensitive' } },
        { discountCode: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [discountCodes, totalCount] = await Promise.all([
      prisma.discount_codes.findMany({
        where,
        include: {
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
            orderBy: { usedAt: "desc" },
            take: 5 // Show recent 5 usages
          },
          shop: {
            select: {
              name: true,
              slug: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum
      }),
      prisma.discount_codes.count({ where })
    ]);

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
    next(error);
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

    // Check if new discount code already exists (if being updated)
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

    let updateData: any = { ...validatedData };
    
    // Handle date updates
    if (validatedData.validFrom) {
      updateData.validFrom = new Date(validatedData.validFrom);
    }
    if (validatedData.validUntil) {
      updateData.validUntil = new Date(validatedData.validUntil);
    }

    const updatedDiscount = await prisma.discount_codes.update({
      where: { id: discountId },
      data: updateData,
      include: {
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
          orderBy: { usedAt: "desc" },
          take: 5
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Discount code updated successfully",
      data: updatedDiscount
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error
      });
    }
    next(error);
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
      },
      include: {
        usageHistory: true
      }
    });

    if (!existingDiscount) {
      return res.status(404).json({
        success: false,
        message: "Discount code not found or unauthorized"
      });
    }

    // Check if discount has been used
    if (existingDiscount.usageHistory.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete discount code that has been used. You can deactivate it instead."
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
    next(error);
  }
};

// Validate and Apply Discount Code (for checkout)
export const validateDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { discountCode, cartItems, shopId } = req.body;
    const userId = req.user?.id; // Assuming user auth middleware

    if (!discountCode || !cartItems || !shopId) {
      return res.status(400).json({
        success: false,
        message: "Discount code, cart items, and shop ID are required"
      });
    }

    const now = new Date();

    // Find the discount code
    const discount = await prisma.discount_codes.findFirst({
      where: {
        discountCode: discountCode.toUpperCase(),
        shopId,
        isActive: true,
        validFrom: { lte: now },
        OR: [
          { validUntil: null },
          { validUntil: { gte: now } }
        ]
      },
      include: {
        usageHistory: userId ? {
          where: { userId }
        } : false
      }
    });

    if (!discount) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired discount code"
      });
    }

    // Check usage limits
    if (discount.usageLimit && discount.currentUsageCount >= discount.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Discount code usage limit exceeded"
      });
    }

    if (userId && discount.usageLimitPerUser && discount.usageHistory) {
      if (discount.usageHistory.length >= discount.usageLimitPerUser) {
        return res.status(400).json({
          success: false,
          message: "You have reached the usage limit for this discount code"
        });
      }
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
    
    if (discount.discountType === "PERCENTAGE") {
      discountAmount = (cartTotal * discount.discountValue) / 100;
      
      // Apply maximum discount limit
      if (discount.maximumDiscountAmount && discountAmount > discount.maximumDiscountAmount) {
        discountAmount = discount.maximumDiscountAmount;
      }
    } else if (discount.discountType === "FIXED_AMOUNT") {
      discountAmount = Math.min(discount.discountValue, cartTotal);
    }

    const finalAmount = cartTotal - discountAmount;

    res.status(200).json({
      success: true,
      message: "Discount code applied successfully",
      data: {
        discountCode: discount.discountCode,
        discountType: discount.discountType,
        discountValue: discount.discountValue,
        discountAmount,
        cartTotal,
        finalAmount,
        savings: discountAmount
      }
    });

  } catch (error) {
    next(error);
  }
};
