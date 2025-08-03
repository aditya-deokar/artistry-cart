// get Product Category

import { NextFunction, Request, Response } from "express";
import prisma from "../../../../packages/libs/prisma";
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "../../../../packages/error-handler";
import { imagekit } from "../../../../packages/libs/imageKit";

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

// Create Discount Codes
export const CreateDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { publicName, discountType, discountValue, discountCode } = req.body;

    const isDiscountCodeExist = await prisma.discount_codes.findUnique({
      where: {
        discountCode,
      },
    });

    if (isDiscountCodeExist) {
      return next(
        new ValidationError(
          "Discount code already available please use a different code!"
        )
      );
    }

    const discount_code = await prisma.discount_codes.create({
      data: {
        publicName,
        discountType,
        discountCode,
        discountValue: parseFloat(discountValue),
        sellerId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      discount_code,
    });
  } catch (error) {
    next(error);
  }
};

// get discount codes
export const getDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const discount_codes = await prisma.discount_codes.findMany({
      where: {
        sellerId: req?.user?.id,
      },
    });

    res.status(200).json({
      success: true,
      discount_codes,
    });
  } catch (error) {
    next(error);
  }
};

// delete discount code
export const deleteDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const sellerId = req.user?.id;

    const discountCode = await prisma.discount_codes.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        sellerId: true,
      },
    });

    if (!discountCode) {
      return next(new NotFoundError("Discount code not found!"));
    }

    if (discountCode.sellerId !== sellerId) {
      return next(new ValidationError("Unauthorized access"));
    }

    await prisma.discount_codes.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      message: "Discount code successfully deleted!",
    });
  } catch (error) {
    next(error);
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
      image
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
        customProperties: customProperties || [],
        custom_specifications: custom_specifications || [],
        regular_price: parseFloat(regular_price),
        sale_price: parseFloat(sale_price),
        slug,
        warranty,
        cash_on_delivery: cashOnDelivery,
        shopId: req.user?.shop?.id,
        tags: Array.isArray(tags) ? tags : tags.split(","),
        brand,
        video_url,
        colors: colors || [],
        discountCodes: discounts,
        sizes: selectedSizes || [],
        stock: parseInt(stocks),
        images: {
          create: images,
        },
      },
      include: {
        images: true,
        Shop: true,
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
        const products= await prisma.products.findMany({
            where:{
                shopId: req.user?.shop?.id,
            },
            include:{
                images: true,
            }
        });

        res.status(200).json({
            success: true,
            products
        })

        
    } catch (error) {
        next(error)
    }

}


