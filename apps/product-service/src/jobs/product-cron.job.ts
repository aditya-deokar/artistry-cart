import cron from "node-cron";

import prisma from "@artistry-cart/libs/prisma";
import {
  createLogger,
  type AppLogger,
} from "@artistry-cart/utils/runtime";

export type ProductCleanupResult = {
  checkedProducts: number;
  deletedProducts: number;
};

export async function deleteExpiredProducts(): Promise<ProductCleanupResult> {
  const now = new Date();

  const productsToDelete = await prisma.products.findMany({
    where: {
      isDeleted: true,
      deletedAt: {
        lte: now,
      },
    },
    select: {
      id: true,
    },
  });

  if (productsToDelete.length === 0) {
    return {
      checkedProducts: 0,
      deletedProducts: 0,
    };
  }

  const productIds = productsToDelete.map((product) => product.id);

  const result = await prisma.$transaction(async (tx) => {
    await tx.productPricing.deleteMany({
      where: {
        productId: { in: productIds },
      },
    });

    await tx.eventProductDiscount.deleteMany({
      where: {
        productId: { in: productIds },
      },
    });

    await tx.productAnalytics.deleteMany({
      where: {
        productId: { in: productIds },
      },
    });

    return tx.products.deleteMany({
      where: {
        id: { in: productIds },
      },
    });
  });

  return {
    checkedProducts: productsToDelete.length,
    deletedProducts: result.count,
  };
}

export function registerProductCleanupCron(
  logger: AppLogger = createLogger("product-service"),
): void {
  if (process.env.PRODUCT_CLEANUP_CRON_ENABLED === "false") {
    logger.info("Product cleanup cron disabled for this runtime");
    return;
  }

  cron.schedule("0 * * * *", async () => {
    try {
      const result = await deleteExpiredProducts();

      if (result.deletedProducts > 0) {
        logger.info("Product cleanup removed expired products", result);
      }
    } catch (error) {
      logger.error("Error in product deletion cron job", { error });
    }
  });
}
