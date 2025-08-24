import { Request, Response, NextFunction } from "express";
import prisma from "../../../../packages/libs/prisma";

/**
Controller to fetch all data needed for the main offers page.
This version uses the existing discount_codes model and a new banners model.
*/
export const getOffersPageData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const now = new Date();

    const [activeBanners, siteCoupons, weeklyDeals, flashSaleItems] =
      await Promise.all([
        // 1. Get active, unexpired promotional banners
        prisma.banners.findMany({
          where: {
            isActive: true,
            endDate: { gte: now },
            startDate: { lte: now },
          },
          orderBy: { createdAt: "desc" },
          take: 3,
        }),

        // 2. Get active, sitewide coupon codes.
        // We need a way to identify "sitewide" codes. Let's assume they are linked to a specific admin seller ID.
        // Replace 'ADMIN_SELLER_ID' with the actual ID from your environment variables.
        prisma.discount_codes.findMany({
          where: {
            sellerId: process.env.ADMIN_SELLER_ID,
          },
          orderBy: { createdAt: "desc" },
        }),

        // 3. Get best-selling products that are currently on sale
        prisma.products.findMany({
          where: {
            NOT: { sale_price: null },
            stock: { gt: 0 },
          },
          orderBy: { totalSales: "desc" },
          take: 8, // For a "Best Deals" carousel
        }),

        // 4. Get products that have a limited-time event attached (Flash Sale)
        prisma.products.findMany({
          where: {
            isEvent: true,
            ending_date: { not: null, gte: now },
            starting_date: { lte: now },
            stock: { gt: 0 },
          },
          orderBy: { ending_date: "asc" }, // Show items ending soonest first
          take: 8, // For a "Flash Sale" carousel
        }),
      ]);

    res.status(200).json({
      success: true,
      data: {
        banners: activeBanners,
        coupons: siteCoupons,
        weeklyDeals,
        flashSaleItems,
      },
    });
  } catch (error) {
    next(error);
  }
};
