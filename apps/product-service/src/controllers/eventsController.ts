import { Request, Response, NextFunction } from "express";
import prisma from "../../../../packages/libs/prisma";
import { z } from "zod";

// Validation schemas
const createEventSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  banner_image: z.object({
    url: z.string(),
    file_id: z.string()
  }).optional(),
  event_type: z.enum(["FLASH_SALE", "SEASONAL", "CLEARANCE", "NEW_ARRIVAL"]),
  discount_percent: z.number().min(0).max(100).optional(),
  starting_date: z.string().datetime(),
  ending_date: z.string().datetime(),
  product_ids: z.array(z.string()).optional()
});

const updateEventSchema = createEventSchema.partial();

// Create Event
export const createEvent = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.user?.id; // Assuming you have seller auth middleware
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

    const event = await prisma.events.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        banner_image: validatedData.banner_image,
        event_type: validatedData.event_type,
        discount_percent: validatedData.discount_percent,
        starting_date: startDate,
        ending_date: endDate,
        sellerId,
        shopId,
        products: validatedData.product_ids ? {
          connect: validatedData.product_ids.map(id => ({ id }))
        } : undefined
      },
      include: {
        products: {
          select: {
            id: true,
            title: true,
            images: true,
            regular_price: true,
            sale_price: true
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

    // Update product event fields for quick queries
    if (validatedData.product_ids && validatedData.product_ids.length > 0) {
      await prisma.products.updateMany({
        where: {
          id: { in: validatedData.product_ids }
        },
        data: {
          isEvent: true,
          starting_date: startDate,
          ending_date: endDate
        }
      });
    }

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event
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

// Get All Events for Seller
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

    // Build where clause
    const where: any = {
      sellerId,
      shopId
    };

    if (status === "active") {
      where.is_active = true;
      where.ending_date = { gte: new Date() };
    } else if (status === "expired") {
      where.ending_date = { lt: new Date() };
    } else if (status === "upcoming") {
      where.starting_date = { gt: new Date() };
    }

    if (event_type) {
      where.event_type = event_type;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
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
              images: true,
              regular_price: true,
              sale_price: true,
              stock: true
            }
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

// Get All Events (Public - for customers)
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
      search 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    const now = new Date();

    // Build where clause
    const where: any = {
      is_active: true,
      starting_date: { lte: now },
      ending_date: { gte: now }
    };

    if (event_type) {
      where.event_type = event_type;
    }

    if (shop_id) {
      where.shopId = shop_id;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Category filter through products
    if (category) {
      where.products = {
        some: {
          category: category
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
              isDeleted: { not: true }
            },
            select: {
              id: true,
              title: true,
              images: true,
              regular_price: true,
              sale_price: true,
              category: true,
              ratings: true,
              stock: true,
              slug: true
            },
            take: 8 // Limit products per event for performance
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
          { ending_date: "asc" }, // Show ending soonest first
          { views: "desc" }
        ],
        skip,
        take: limitNum
      }),
      prisma.events.count({ where })
    ]);

    // Update view counts
    const eventIds = events.map(event => event.id);
    if (eventIds.length > 0) {
      await prisma.events.updateMany({
        where: {
          id: { in: eventIds }
        },
        data: {
          views: { increment: 1 }
        }
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
    if (validatedData.starting_date && validatedData.ending_date) {
      const startDate = new Date(validatedData.starting_date);
      const endDate = new Date(validatedData.ending_date);
      
      if (startDate >= endDate) {
        return res.status(400).json({
          success: false,
          message: "End date must be after start date"
        });
      }
      
      updateData.starting_date = startDate;
      updateData.ending_date = endDate;
    }

    const updatedEvent = await prisma.events.update({
      where: { id: eventId },
      data: updateData,
      include: {
        products: {
          select: {
            id: true,
            title: true,
            images: true,
            regular_price: true,
            sale_price: true
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
      message: "Event updated successfully",
      data: updatedEvent
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
        products: true
      }
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found or unauthorized"
      });
    }

    // Remove event fields from products
    if (existingEvent.products.length > 0) {
      await prisma.products.updateMany({
        where: {
          eventId: eventId
        },
        data: {
          isEvent: false,
          starting_date: null,
          ending_date: null,
          eventId: null
        }
      });
    }

    // Delete the event
    await prisma.events.delete({
      where: { id: eventId }
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

    const where: any = {
      shopId,
      isDeleted: { not: true },
      stock: { gt: 0 }
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = category;
    }

    const [products, totalCount] = await Promise.all([
      prisma.products.findMany({
        where,
        select: {
          id: true,
          title: true,
          images: true,
          regular_price: true,
          sale_price: true,
          stock: true,
          category: true,
          eventId: true,
        },
        orderBy: { createdAt: 'desc' },
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

// Modified create event to include products
export const createEventWithProducts = async (
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
    const { product_ids, ...eventData } = validatedData;

    // Validate dates
    const startDate = new Date(validatedData.starting_date);
    const endDate = new Date(validatedData.ending_date);
    
    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date"
      });
    }

    // Validate products belong to seller
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

    // Create event and update products
    const event = await prisma.$transaction(async (tx) => {
      const newEvent = await tx.events.create({
        data: {
          ...eventData,
          starting_date: startDate,
          ending_date: endDate,
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

      // Update products to associate with event
      if (product_ids && product_ids.length > 0) {
        await tx.products.updateMany({
          where: {
            id: { in: product_ids }
          },
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

    // Fetch event with products
    const eventWithProducts = await prisma.events.findUnique({
      where: { id: event.id },
      include: {
        products: {
          select: {
            id: true,
            title: true,
            images: true,
            regular_price: true,
            sale_price: true,
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
    });

    // Fetch updated event with products
    const updatedEvent = await prisma.events.findUnique({
      where: { id: eventId },
      include: {
        products: {
          select: {
            id: true,
            title: true,
            images: true,
            regular_price: true,
            sale_price: true,
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
