import { NextFunction, Request, Response } from "express";
import prisma from "../../../../packages/libs/prisma";
import {
  AuthError,
  ValidationError,
} from "../../../../packages/error-handler";
import { imagekit } from "../../../../packages/libs/imageKit";
import { Prisma } from "@prisma/client";


// get Categories
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.site_config.findFirst();

    if (!config) {
      return res.status(404).json({
        message: "Categories not found",
      });
    }

    return res.status(200).json({
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (error) {
    return next(error);
  }
};






// Upload Product Image

export const uploadProductImage = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileName } = req.body;

    const response = await imagekit.upload({
      file: fileName,
      fileName: `product-${Date.now()}.jpg`,
      folder: "/products",
    });

    res.status(201).json({
      file_url: response.url,
      file_id: response.fileId,
    });
  } catch (error) {
    next(error);
  }
};

// delete Product image
export const deleteProductImage = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.body;

    const response = await imagekit.deleteFile(fileId);

    res.status(200).json({
      success: true,
      response,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      description,
      detailed_desc,
      warranty,
      custom_specifications = [],
      slug,
      tags,
      cashOnDelivery,
      brand,
      video_url,
      category,
      colors = [],
      selectedSizes = [],
      discounts,
      stocks,
      sale_price,
      regular_price,
      subcategory,
      customProperties = [],
      image = [],
    } = req.body;

    if (
      !title ||
      !description ||
      !detailed_desc ||
      !slug ||
      !tags ||
      !warranty ||
      !brand ||
      !video_url ||
      !regular_price ||
      !sale_price ||
      !stocks ||
      !colors ||
      !customProperties ||
      !cashOnDelivery ||
      !subcategory ||
      !selectedSizes ||
      !custom_specifications ||
      !category ||
      !discounts ||
      !image
    ) {
      return next(new ValidationError("Missing or invalid required fields"));
    }

    const images = image.filter(Boolean);

    if (!req.user?.id) {
      return next(new AuthError("Only Seller can create products!"));
    }

    const slugChecking = await prisma.products.findUnique({
      where: {
        slug,
      },
    });

    if (slugChecking) {
      return next(
        new ValidationError(
          "Slug is Already exist! Please use a diffrent slug!"
        )
      );
    }

    const newProduct = await prisma.products.create({
      data: {
        title,
        description,
        detailed_description: detailed_desc,
        category,
        subCategory: subcategory,
        customProperties,
        custom_specifications,
        regular_price: parseFloat(regular_price),
        sale_price: parseFloat(sale_price),
        slug,
        warranty,
        cash_on_delivery: cashOnDelivery,
        shopId: req.user.shop.id,
        tags: Array.isArray(tags) ? tags : tags.split(","),
        brand,
        video_url,
        colors,
        discountCodes: discounts,
        sizes: selectedSizes,
        stock: parseInt(stocks),
        images,
      },
    });

    res.status(201).json({
      success: true,
      newProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const getShopProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.products.findMany({
      where: {
        shopId: req.user?.shop?.id,
      },
    });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// delete product
export const deleteShopProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.user?.shop?.id;

    const product = await prisma.products.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        shopId: true,
        isDeleted: true,
      },
    });

    if (!product) {
      return next(new ValidationError("Product not found"));
    }

    if (product.shopId !== sellerId) {
      return next(new ValidationError("Unauthorized action"));
    }

    if (product.isDeleted) {
      return next(new ValidationError("Product is already deleted"));
    }

    const deletedProduct = await prisma.products.update({
      where: {
        id: productId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return res.status(200).json({
      message:
        "Product is scheduled for deletion in 24 hours. You can restore it within this 24 hr",
    });
  } catch (error) {
    next(error);
  }
};

// restore product
export const restoreShopProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.user?.shop?.id;

    const product = await prisma.products.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        shopId: true,
        isDeleted: true,
      },
    });

    if (!product) {
      return next(new ValidationError("Product not found"));
    }

    if (product.shopId !== sellerId) {
      return next(new ValidationError("Unauthorized action"));
    }

    if (!product.isDeleted) {
      return res.status(400).json({
        message: "Product is not in deleted state",
      });
    }

    await prisma.products.update({
      where: {
        id: productId,
      },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return res.status(200).json({
      message: "Product successfully restored!",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error restoring product",
      error,
    });
  }
};

export const getAllProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // --- 1. PARSE & VALIDATE QUERY PARAMS ---
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12; // A limit of 12 is common for 3-col grids
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

    // --- 2. BUILD DYNAMIC PRISMA 'where' CLAUSE ---
    const whereClause: Prisma.productsWhereInput = {
      // Base conditions for all queries
      isDeleted: false,
      status: "Active",
      // Correctly handle events: show non-events OR active events
      OR: [
        { isEvent: false },
        { isEvent: null }, // Also handle cases where isEvent is not set
        {
          isEvent: true,
          starting_date: { lte: new Date() }, // Event has started
          ending_date: { gte: new Date() }, // Event has not ended
        },
      ],
    };

    // Conditionally add filters to the 'where' clause
    if (category && category !== "all") {
      whereClause.category = category;
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      // Filter by the final sale price
      whereClause.sale_price = {
        gte: minPrice,
        lte: maxPrice,
      };
    }

    if (search) {
      whereClause.AND = [
        ...((whereClause.AND as any[]) || []), // Keep existing AND conditions if any
        {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { brand: { contains: search, mode: "insensitive" } },
            { tags: { has: search.toLowerCase() } },
          ],
        },
      ];
    }

    // --- 3. BUILD DYNAMIC PRISMA 'orderBy' CLAUSE ---
    let orderByClause: Prisma.productsOrderByWithRelationInput = {};
    switch (sortBy) {
      case "price-asc":
        orderByClause = { sale_price: "asc" };
        break;
      case "price-desc":
        orderByClause = { sale_price: "desc" };
        break;
      // case 'popularity':
      //   orderByClause = { totalSales: 'desc' };
      //   break;
      case "newest":
      default:
        orderByClause = { createdAt: "desc" };
        break;
    }

    // --- 4. EXECUTE EFFICIENT QUERIES ---
    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: whereClause,
        include: {
          Shop: true, // Include artist/shop info
        },
        skip,
        take: limit,
        orderBy: orderByClause,
      }),
      prisma.products.count({
        where: whereClause,
      }),
    ]);

    // --- 5. SEND THE RESPONSE ---
    res.status(200).json({
      products,
      pagination: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
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
      where: {
        slug: slug,
      },

      include: {
        Shop: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      product: product,
    });
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    next(error);
  }
};

export const validateCoupon = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const { couponCode } = req.body;

  // 1. Input Validation
  if (!couponCode || typeof couponCode !== "string") {
    return res.status(400).json({ message: "Coupon code is required." });
  }

  try {
    const discount = await prisma.discount_codes.findUnique({
      where: {
        discountCode: couponCode.toUpperCase(),
      },
    });

    if (!discount) {
      return res
        .status(404)
        .json({ message: "This coupon code is not valid." });
    }

    return res.status(200).json(discount);
  } catch (error) {
    console.error("Coupon validation error:", error);
    next(error);
  }
};


