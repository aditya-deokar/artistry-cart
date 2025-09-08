import express, { Router } from "express";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";

import prisma from "../../../../packages/libs/prisma";
import isAdmin from "../../../../packages/middleware/isAdmin";

const router: Router = express.Router();

// =============================================
// PRICING MANAGEMENT ROUTES
// =============================================

// Get product pricing history
router.get("/products/:productId/history", async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    const pricingHistory = await prisma.productPricing.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({
      success: true,
      data: pricingHistory
    });
  } catch (error) {
    next(error);
  }
});

// Update product pricing (Admin only)
router.post("/products/:productId/update", isAuthenticated, isAdmin, async (req:any, res, next) => {
  try {
    const { productId } = req.params;
    const { basePrice, discountedPrice, reason } = req.body;

    const pricing = await prisma.productPricing.create({
      data: {
        productId,
        basePrice,
        discountedPrice,
        discountAmount: discountedPrice ? basePrice - discountedPrice : undefined,
        discountPercent: discountedPrice ? ((basePrice - discountedPrice) / basePrice) * 100 : undefined,
        discountSource: 'MANUAL',
        validFrom: new Date(),
        createdBy: req.user.id,
        reason: reason || 'Manual price update'
      }
    });

    // Update cached pricing
    await prisma.products.update({
      where: { id: productId },
      data: {
        current_price: discountedPrice || basePrice,
        is_on_discount: !!discountedPrice
      }
    });

    res.json({
      success: true,
      message: "Pricing updated successfully",
      data: pricing
    });
  } catch (error) {
    next(error);
  }
});

export default router;
