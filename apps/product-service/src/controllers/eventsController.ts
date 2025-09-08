import { Request, Response, NextFunction } from "express";
import prisma from "../../../../packages/libs/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";


// Enhanced validation schemas
const createEventSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  banner_image: z.object({
    url: z.string(),
    file_id: z.string()
  }).optional(),
  event_type: z.enum(["FLASH_SALE", "SEASONAL", "CLEARANCE", "NEW_ARRIVAL"]),
  discount_percent: z.number().min(0).max(100).optional(),
  discount_type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "TIERED"]).optional(),
  discount_value: z.number().min(0).optional(),
  max_discount: z.number().min(0).optional(),
  min_order_value: z.number().min(0).optional(),
  starting_date: z.string().datetime(),
  ending_date: z.string().datetime(),
  product_ids: z.array(z.string()).optional(),
  product_pricing: z.array(z.object({
    productId: z.string(),
    discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "SPECIAL_PRICE"]),
    discountValue: z.number().min(0),
    maxDiscount: z.number().min(0).optional(),
    specialPrice: z.number().min(0).optional(),
    minQuantity: z.number().int().min(1).optional(),
    maxQuantity: z.number().int().min(1).optional(),
  })).optional()
});


// Enhanced validation schema with product-specific pricing
const createEventWithProductsSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  banner_image: z.object({
    url: z.string(),
    file_id: z.string()
  }).optional(),
  event_type: z.enum(['FLASH_SALE', 'SEASONAL', 'CLEARANCE', 'NEW_ARRIVAL'], {
    error: 'Please select an event type',
  }),
  discount_percent: z.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%').optional(),
  discount_type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'TIERED']).optional(),
  discount_value: z.number().min(0).optional(),
  max_discount: z.number().min(0).optional(),
  min_order_value: z.number().min(0).optional(),
  starting_date: z.string().datetime({
    message: 'Invalid start date format'
  }),
  ending_date: z.string().datetime({
    message: 'Invalid end date format'
  }),
  product_ids: z.array(z.string()).min(1, 'At least one product is required'),
  product_pricing: z.array(z.object({
    productId: z.string(),
    discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'SPECIAL_PRICE']),
    discountValue: z.number().min(0),
    maxDiscount: z.number().min(0).optional(),
    specialPrice: z.number().min(0).optional(),
    minQuantity: z.number().int().min(1).optional(),
    maxQuantity: z.number().int().min(1).optional(),
  })).optional()
}).refine(data => new Date(data.ending_date) > new Date(data.starting_date), {
  message: "End date must be after start date",
  path: ["ending_date"],
}).refine(data => new Date(data.starting_date) >= new Date(new Date().setHours(0, 0, 0, 0)), {
  message: "Start date cannot be in the past",
  path: ["starting_date"],
});



// Pricing Service for Event Products
class EventPricingService {


  static async updateEventPricing(eventId: string, startDate: Date, endDate: Date) {
    const event = await prisma.events.findUnique({
      where: { id: eventId },
      include: {
        products: true,
        productDiscounts: true
      }
    });

    if (!event) return;

    // Update product pricing records
    const pricingPromises = event.products.map(async (product) => {
      const productDiscount = event.productDiscounts.find(pd => pd.productId === product.id);
      let discountedPrice = product.current_price;
      let discountAmount = 0;
      let discountPercent = 0;

      if (productDiscount && productDiscount.isActive) {
        if (productDiscount.specialPrice) {
          discountedPrice = productDiscount.specialPrice;
          discountAmount = product.regular_price - discountedPrice;
          discountPercent = (discountAmount / product.regular_price) * 100;
        } else if (productDiscount.discountType === 'PERCENTAGE') {
          discountAmount = (product.regular_price * productDiscount.discountValue) / 100;
          if (productDiscount.maxDiscount) {
            discountAmount = Math.min(discountAmount, productDiscount.maxDiscount);
          }
          discountedPrice = product.regular_price - discountAmount;
          discountPercent = productDiscount.discountValue;
        } else if (productDiscount.discountType === 'FIXED_AMOUNT') {
          discountAmount = Math.min(productDiscount.discountValue, product.regular_price);
          discountedPrice = product.regular_price - discountAmount;
          discountPercent = (discountAmount / product.regular_price) * 100;
        }
      } else if (event.discount_percent && event.discount_percent > 0) {
        discountAmount = (product.regular_price * event.discount_percent) / 100;
        if (event.max_discount) {
          discountAmount = Math.min(discountAmount, event.max_discount);
        }
        discountedPrice = product.regular_price - discountAmount;
        discountPercent = event.discount_percent;
      }

      // Create pricing record
      await prisma.productPricing.create({
        data: {
          productId: product.id,
          basePrice: product.regular_price,
          discountedPrice: Math.max(discountedPrice, 0),
          discountAmount,
          discountPercent: Math.round(discountPercent * 100) / 100,
          discountSource: 'EVENT',
          sourceId: eventId,
          sourceName: event.title,
          validFrom: startDate,
          validUntil: endDate,
          reason: `Event pricing: ${event.title}`,
        }
      });

      // Update cached pricing
      await prisma.products.update({
        where: { id: product.id },
        data: {
          current_price: Math.max(discountedPrice, 0),
          is_on_discount: discountAmount > 0
        }
      });
    });

    await Promise.all(pricingPromises);
  }


  static async updateEventProductPricing(eventId: string, productIds: string[], startDate: Date, endDate: Date, eventData: any) {
    const event = await prisma.events.findUnique({
      where: { id: eventId },
      include: {
        productDiscounts: true
      }
    });

    if (!event) return;

    // Update pricing for each product
    const pricingPromises = productIds.map(async (productId) => {
      const product = await prisma.products.findUnique({
        where: { id: productId }
      });

      if (!product) return;

      // Find product-specific discount or use event-level discount
      const productDiscount = event.productDiscounts.find(pd => pd.productId === productId && pd.isActive);
      let discountedPrice = product.regular_price;
      let discountAmount = 0;
      let discountPercent = 0;

      if (productDiscount) {
        if (productDiscount.specialPrice) {
          discountedPrice = productDiscount.specialPrice;
          discountAmount = product.regular_price - discountedPrice;
          discountPercent = (discountAmount / product.regular_price) * 100;
        } else if (productDiscount.discountType === 'PERCENTAGE') {
          discountAmount = (product.regular_price * productDiscount.discountValue) / 100;
          if (productDiscount.maxDiscount) {
            discountAmount = Math.min(discountAmount, productDiscount.maxDiscount);
          }
          discountedPrice = product.regular_price - discountAmount;
          discountPercent = productDiscount.discountValue;
        } else if (productDiscount.discountType === 'FIXED_AMOUNT') {
          discountAmount = Math.min(productDiscount.discountValue, product.regular_price);
          discountedPrice = product.regular_price - discountAmount;
          discountPercent = (discountAmount / product.regular_price) * 100;
        }
      } else if (event.discount_percent && event.discount_percent > 0) {
        discountAmount = (product.regular_price * event.discount_percent) / 100;
        if (event.max_discount) {
          discountAmount = Math.min(discountAmount, event.max_discount);
        }
        discountedPrice = product.regular_price - discountAmount;
        discountPercent = event.discount_percent;
      }

      // Create pricing record
      await prisma.productPricing.create({
        data: {
          productId,
          basePrice: product.regular_price,
          discountedPrice: Math.max(discountedPrice, 0),
          discountAmount,
          discountPercent: Math.round(discountPercent * 100) / 100,
          discountSource: 'EVENT',
          sourceId: eventId,
          sourceName: event.title,
          validFrom: startDate,
          validUntil: endDate,
          reason: `Event pricing: ${event.title}`,
        }
      });

      // Update cached pricing
      await prisma.products.update({
        where: { id: productId },
        data: {
          current_price: Math.max(discountedPrice, 0),
          is_on_discount: discountAmount > 0
        }
      });
    });

    await Promise.all(pricingPromises);
  }



}

const updateEventSchema = createEventSchema.partial();


// Create Event with Enhanced Pricing
export const createEvent = async (
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

    const validatedData = createEventSchema.parse(req.body);
    
    // Validate dates
    const startDate = new Date(validatedData.starting_date);
    const endDate = new Date(validatedData.ending_date);
    
    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date"
      });
    }

    if (startDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be in the past"
      });
    }

    // Check if products belong to the seller
    if (validatedData.product_ids && validatedData.product_ids.length > 0) {
      const products = await prisma.products.findMany({
        where: {
          id: { in: validatedData.product_ids },
          shopId: shopId
        }
      });

      if (products.length !== validatedData.product_ids.length) {
        return res.status(400).json({
          success: false,
          message: "Some products don't belong to your shop"
        });
      }
    }

    const event = await prisma.$transaction(async (tx) => {
      // Create event
      const newEvent = await tx.events.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          banner_image: validatedData.banner_image,
          event_type: validatedData.event_type,
          discount_percent: validatedData.discount_percent,
          discount_type: validatedData.discount_type,
          discount_value: validatedData.discount_value,
          max_discount: validatedData.max_discount,
          min_order_value: validatedData.min_order_value,
          starting_date: startDate,
          ending_date: endDate,
          sellerId,
          shopId,
        },
      });

      // Create product-specific discounts if provided
      if (validatedData.product_pricing && validatedData.product_pricing.length > 0) {
        await tx.eventProductDiscount.createMany({
          data: validatedData.product_pricing.map((pricing) => ({
            eventId: newEvent.id,
            productId: pricing.productId,
            discountType: pricing.discountType,
            discountValue: pricing.discountValue,
            maxDiscount: pricing.maxDiscount,
            specialPrice: pricing.specialPrice,
            minQuantity: pricing.minQuantity,
            maxQuantity: pricing.maxQuantity,
          }))
        });
      }

      // Connect products to event
      if (validatedData.product_ids && validatedData.product_ids.length > 0) {
        await tx.products.updateMany({
          where: { id: { in: validatedData.product_ids } },
          data: { 
            eventId: newEvent.id,
            isEvent: true,
            starting_date: startDate,
            ending_date: endDate
          }
        });
      }

      return newEvent;
    });

    // Update pricing for all products in the event
    if (validatedData.product_ids && validatedData.product_ids.length > 0) {
      await EventPricingService.updateEventPricing(event.id, startDate, endDate);
    }

    // Fetch complete event data
    const eventWithProducts = await prisma.events.findUnique({
      where: { id: event.id },
      include: {
        products: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: true,
            regular_price: true,
            current_price: true,
            is_on_discount: true,
            stock: true
          }
        },
        productDiscounts: {
          select: {
            productId: true,
            discountType: true,
            discountValue: true,
            maxDiscount: true,
            specialPrice: true,
          }
        },
        shop: {
          select: {
            name: true,
            slug: true,
            avatar: true,
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: eventWithProducts
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

// Get All Events (Public)
export const getAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { 
      page = "1", 
      limit = "12", 
      event_type,
      shop_id,
      category,
      search,
      status = "active"
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    const now = new Date();

    // Build where clause
    const where: Prisma.eventsWhereInput = {};

    if (status === "active") {
      where.is_active = true;
      where.starting_date = { lte: now };
      where.ending_date = { gte: now };
    } else if (status === "upcoming") {
      where.is_active = true;
      where.starting_date = { gt: now };
    } else if (status === "expired") {
      where.ending_date = { lt: now };
    }

    if (event_type) {
      where.event_type = event_type as string;
    }

    if (shop_id) {
      where.shopId = shop_id as string;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Category filter through products
    if (category) {
      where.products = {
        some: {
          category: category as string,
          isDeleted: false,
          status: 'Active'
        }
      };
    }

    const [events, totalCount] = await Promise.all([
      prisma.events.findMany({
        where,
        include: {
          products: {
            where: {
              stock: { gt: 0 },
              isDeleted: { not: true },
              status: 'Active'
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
              stock: true,
            },
            take: 8
          },
          productDiscounts: {
            where: { isActive: true },
            select: {
              productId: true,
              discountType: true,
              discountValue: true,
              specialPrice: true,
            }
          },
          shop: {
            select: {
              id: true,
              name: true,
              slug: true,
              avatar: true,
              ratings: true
            }
          }
        },
        orderBy: [
          { ending_date: "asc" },
          { views: "desc" }
        ],
        skip,
        take: limitNum
      }),
      prisma.events.count({ where })
    ]);

    // Update view counts (consider background job for this)
    const eventIds = events.map(event => event.id);
    if (eventIds.length > 0) {
      await prisma.events.updateMany({
        where: { id: { in: eventIds } },
        data: { views: { increment: 1 } }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        events,
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

// Get Seller Events
export const getSellerEvents = async (
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
      event_type,
      search 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    const now = new Date();

    // Build where clause
    const where: Prisma.eventsWhereInput = {
      sellerId,
      shopId
    };

    if (status === "active") {
      where.is_active = true;
      where.starting_date = { lte: now };
      where.ending_date = { gte: now };
    } else if (status === "expired") {
      where.ending_date = { lt: now };
    } else if (status === "upcoming") {
      where.starting_date = { gt: now };
    } else if (status === "draft") {
      where.is_active = false;
    }

    if (event_type) {
      where.event_type = event_type as string;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [events, totalCount] = await Promise.all([
      prisma.events.findMany({
        where,
        include: {
          products: {
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
            }
          },
          productDiscounts: {
            where: { isActive: true },
            select: {
              productId: true,
              discountType: true,
              discountValue: true,
              maxDiscount: true,
              specialPrice: true,
            }
          },
          shop: {
            select: {
              name: true,
              slug: true
            }
          },
          _count: {
            select: {
              products: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum
      }),
      prisma.events.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: {
        events,
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

// Get Single Event
export const getEventById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId } = req.params;

    const event = await prisma.events.findUnique({
      where: { id: eventId },
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
            totalSales: true,
          }
        },
        productDiscounts: {
          where: { isActive: true },
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: true,
              }
            }
          }
        },
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatar: true,
            ratings: true,
            bio: true,
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Update click count
    await prisma.events.update({
      where: { id: eventId },
      data: { clicks: { increment: 1 } }
    });

    res.status(200).json({
      success: true,
      data: event
    });

  } catch (error) {
    next(error);
  }
};

// Update Event
export const updateEvent = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId } = req.params;
    const sellerId = req.user?.id;
    const shopId = req.user?.shop?.id;

    if (!sellerId || !shopId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const validatedData = updateEventSchema.parse(req.body);

    // Check if event belongs to seller
    const existingEvent = await prisma.events.findFirst({
      where: {
        id: eventId,
        sellerId,
        shopId
      }
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found or unauthorized"
      });
    }

    // Validate dates if provided
    let updateData: any = { ...validatedData };
    if (validatedData.starting_date || validatedData.ending_date) {
      const startDate = validatedData.starting_date 
        ? new Date(validatedData.starting_date) 
        : existingEvent.starting_date;
      const endDate = validatedData.ending_date 
        ? new Date(validatedData.ending_date) 
        : existingEvent.ending_date;
      
      if (startDate >= endDate) {
        return res.status(400).json({
          success: false,
          message: "End date must be after start date"
        });
      }
      
      updateData.starting_date = startDate;
      updateData.ending_date = endDate;
    }

    const updatedEvent = await prisma.$transaction(async (tx) => {
      const updated = await tx.events.update({
        where: { id: eventId },
        data: updateData,
      });

      // Update product-specific discounts if provided
      if (validatedData.product_pricing) {
        // Remove existing discounts
        await tx.eventProductDiscount.deleteMany({
          where: { eventId }
        });

        // Add new discounts
        if (validatedData.product_pricing.length > 0) {
          await tx.eventProductDiscount.createMany({
            data: validatedData.product_pricing.map((pricing) => ({
              eventId,
              productId: pricing.productId,
              discountType: pricing.discountType,
              discountValue: pricing.discountValue,
              maxDiscount: pricing.maxDiscount,
              specialPrice: pricing.specialPrice,
              minQuantity: pricing.minQuantity,
              maxQuantity: pricing.maxQuantity,
            }))
          });
        }
      }

      return updated;
    });

    // Update pricing if dates or discounts changed
    if (validatedData.starting_date || validatedData.ending_date || validatedData.product_pricing) {
      await EventPricingService.updateEventPricing(
        eventId, 
        updateData.starting_date || existingEvent.starting_date,
        updateData.ending_date || existingEvent.ending_date
      );
    }

    // Fetch updated event with relations
    const eventWithProducts = await prisma.events.findUnique({
      where: { id: eventId },
      include: {
        products: {
          select: {
            id: true,
            title: true,
            images: true,
            regular_price: true,
            current_price: true,
            is_on_discount: true,
            stock: true
          }
        },
        productDiscounts: {
          where: { isActive: true }
        },
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
      message: "Event updated successfully",
      data: eventWithProducts
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

// Delete Event
export const deleteEvent = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId } = req.params;
    const sellerId = req.user?.id;
    const shopId = req.user?.shop?.id;

    if (!sellerId || !shopId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // Check if event belongs to seller
    const existingEvent = await prisma.events.findFirst({
      where: {
        id: eventId,
        sellerId,
        shopId
      },
      include: {
        products: true,
        productDiscounts: true
      }
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found or unauthorized"
      });
    }

    await prisma.$transaction(async (tx) => {
      // Deactivate pricing records
      await tx.productPricing.updateMany({
        where: {
          sourceId: eventId,
          discountSource: 'EVENT'
        },
        data: {
          isActive: false,
          validUntil: new Date()
        }
      });

      // Remove event association from products and reset pricing
      if (existingEvent.products.length > 0) {
        const productIds = existingEvent.products.map(p => p.id);

        // Reset products to non-event pricing
        await tx.products.updateMany({
          where: { id: { in: productIds } },
          data: {
            eventId: null,
            isEvent: false,
            starting_date: null,
            ending_date: null,
            current_price: { /* You'll need to recalculate this */ },
            is_on_discount: false
          }
        });

        // Recalculate current pricing for each product
        for (const product of existingEvent.products) {
          const currentPrice = product.sale_price || product.regular_price;
          await tx.products.update({
            where: { id: product.id },
            data: {
              current_price: currentPrice,
              is_on_discount: !!product.sale_price
            }
          });
        }
      }

      // Delete product discounts
      await tx.eventProductDiscount.deleteMany({
        where: { eventId }
      });

      // Delete the event
      await tx.events.delete({
        where: { id: eventId }
      });
    });

    res.status(200).json({
      success: true,
      message: "Event deleted successfully"
    });

  } catch (error) {
    next(error);
  }
};

// Get seller's products for event selection
export const getSellerProductsForEvent = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.user?.id;
    const shopId = req.user?.shop?.id;
    const { search, category, page = 1, limit = 20 } = req.query;

    if (!sellerId || !shopId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const where: Prisma.productsWhereInput = {
      shopId,
      isDeleted: { not: true },
      status: 'Active',
      stock: { gt: 0 }
    };

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = category as string;
    }

    const [products, totalCount] = await Promise.all([
      prisma.products.findMany({
        where,
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
          eventId: true,
          event: {
            select: {
              id: true,
              title: true,
              ending_date: true,
            }
          }
        },
        orderBy: [
          { eventId: 'asc' }, // Non-event products first
          { createdAt: 'desc' }
        ],
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.products.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalCount / Number(limit)),
          totalCount,
          hasNext: Number(page) * Number(limit) < totalCount,
          hasPrev: Number(page) > 1
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// Update event products
export const updateEventProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId } = req.params;
    const { product_ids } = req.body;
    const sellerId = req.user?.id;
    const shopId = req.user?.shop?.id;

    if (!sellerId || !shopId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // Verify event ownership
    const event = await prisma.events.findFirst({
      where: {
        id: eventId,
        sellerId,
        shopId
      }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Validate new products belong to seller
    if (product_ids && product_ids.length > 0) {
      const sellerProducts = await prisma.products.findMany({
        where: {
          id: { in: product_ids },
          shopId: shopId
        },
        select: { id: true }
      });

      if (sellerProducts.length !== product_ids.length) {
        return res.status(400).json({
          success: false,
          message: "Some products don't belong to your shop"
        });
      }
    }

    await prisma.$transaction(async (tx) => {
      // Get current products to reset their pricing
      const currentProducts = await tx.products.findMany({
        where: { eventId: eventId }
      });

      // Remove event association from all current products
      await tx.products.updateMany({
        where: { eventId: eventId },
        data: {
          eventId: null,
          isEvent: false,
          starting_date: null,
          ending_date: null
        }
      });

      // Reset pricing for removed products
      for (const product of currentProducts) {
        const currentPrice = product.sale_price || product.regular_price;
        await tx.products.update({
          where: { id: product.id },
          data: {
            current_price: currentPrice,
            is_on_discount: !!product.sale_price
          }
        });
      }

      // Add event association to new products
      if (product_ids && product_ids.length > 0) {
        await tx.products.updateMany({
          where: {
            id: { in: product_ids }
          },
          data: {
            eventId: eventId,
            isEvent: true,
            starting_date: event.starting_date,
            ending_date: event.ending_date
          }
        });
      }

      // Deactivate old pricing records
      await tx.productPricing.updateMany({
        where: {
          sourceId: eventId,
          discountSource: 'EVENT'
        },
        data: {
          isActive: false,
          validUntil: new Date()
        }
      });
    });

    // Update pricing for new products
    if (product_ids && product_ids.length > 0) {
      await EventPricingService.updateEventPricing(eventId, event.starting_date, event.ending_date);
    }

    // Fetch updated event with products
    const updatedEvent = await prisma.events.findUnique({
      where: { id: eventId },
      include: {
        products: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: true,
            regular_price: true,
            current_price: true,
            is_on_discount: true,
            stock: true
          }
        },
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
      message: "Event products updated successfully",
      data: updatedEvent
    });

  } catch (error) {
    next(error);
  }
};








export const createEventWithProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.user?.id;
    const shopId = req.user?.shop?.id;

    // Authentication check
    if (!sellerId || !shopId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Seller authentication required"
      });
    }

    // Validate request body
    const validatedData = createEventWithProductsSchema.parse(req.body);
    
    // Parse dates
    const startDate = new Date(validatedData.starting_date);
    const endDate = new Date(validatedData.ending_date);

    // Verify products belong to seller
    const sellerProducts = await prisma.products.findMany({
      where: {
        id: { in: validatedData.product_ids },
        shopId: shopId,
        isDeleted: { not: true },
        status: 'Active'
      },
      select: {
        id: true,
        title: true,
        regular_price: true,
        current_price: true,
        stock: true,
        eventId: true
      }
    });

    if (sellerProducts.length !== validatedData.product_ids.length) {
      return res.status(400).json({
        success: false,
        message: "Some products don't belong to your shop or are not available"
      });
    }

    // Check if any products are already in active events
    const productsInEvents = sellerProducts.filter(p => p.eventId !== null);
    if (productsInEvents.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Some products are already in other events: ${productsInEvents.map(p => p.title).join(', ')}`,
        conflictingProducts: productsInEvents
      });
    }

    // Check stock availability
    const outOfStockProducts = sellerProducts.filter(p => p.stock <= 0);
    if (outOfStockProducts.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Some products are out of stock: ${outOfStockProducts.map(p => p.title).join(', ')}`,
        outOfStockProducts
      });
    }

    // Create event with products in a transaction
    const event = await prisma.$transaction(async (tx) => {
      // Create the event
      const newEvent = await tx.events.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          banner_image: validatedData.banner_image || null,
          event_type: validatedData.event_type,
          discount_percent: validatedData.discount_percent,
          discount_type: validatedData.discount_type,
          discount_value: validatedData.discount_value,
          max_discount: validatedData.max_discount,
          min_order_value: validatedData.min_order_value,
          starting_date: startDate,
          ending_date: endDate,
          sellerId,
          shopId,
        },
      });

      // Create product-specific discounts if provided
      if (validatedData.product_pricing && validatedData.product_pricing.length > 0) {
        await tx.eventProductDiscount.createMany({
          data: validatedData.product_pricing.map((pricing) => ({
            eventId: newEvent.id,
            productId: pricing.productId,
            discountType: pricing.discountType,
            discountValue: pricing.discountValue,
            maxDiscount: pricing.maxDiscount,
            specialPrice: pricing.specialPrice,
            minQuantity: pricing.minQuantity,
            maxQuantity: pricing.maxQuantity,
            isActive: true,
          }))
        });
      }

      // Associate products with the event
      await tx.products.updateMany({
        where: {
          id: { in: validatedData.product_ids }
        },
        data: {
          eventId: newEvent.id,
          isEvent: true,
          starting_date: startDate,
          ending_date: endDate
        }
      });

      return newEvent;
    });

    // Update pricing for all products (outside transaction for performance)
    await EventPricingService.updateEventProductPricing(
      event.id, 
      validatedData.product_ids, 
      startDate, 
      endDate, 
      validatedData
    );

    // Fetch complete event data with all relations
    const eventWithProducts = await prisma.events.findUnique({
      where: { id: event.id },
      include: {
        products: {
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
          }
        },
        productDiscounts: {
          where: { isActive: true },
          select: {
            productId: true,
            discountType: true,
            discountValue: true,
            maxDiscount: true,
            specialPrice: true,
          }
        },
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatar: true,
            ratings: true,
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    // Calculate event statistics
    const totalSavings = eventWithProducts?.products.reduce((total, product) => {
      const savings = product.regular_price - product.current_price;
      return total + (savings > 0 ? savings : 0);
    }, 0) || 0;

    const averageDiscount = eventWithProducts?.products.length ? 
      (totalSavings / eventWithProducts.products.reduce((sum, p) => sum + p.regular_price, 0)) * 100 : 0;

    res.status(201).json({
      success: true,
      message: "Event created successfully with products and pricing",
      data: {
        event: eventWithProducts,
        statistics: {
          totalProducts: validatedData.product_ids.length,
          totalSavings: Math.round(totalSavings * 100) / 100,
          averageDiscount: Math.round(averageDiscount * 100) / 100,
        }
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error
      });
    }
    
    console.error("Create event with products error:", error);
    next(error);
  }
};