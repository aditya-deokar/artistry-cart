import cron from "node-cron";
import prisma from "../../../../packages/libs/prisma";

/**
 * Cron job to permanently delete soft-deleted products
 * Runs every hour
 * 
 * Important: Must delete related records first due to foreign key constraints:
 * - ProductPricing
 * - EventProductDiscount
 * - productAnalytics
 */
cron.schedule("0 * * * *", async () => {
    try {
        const now = new Date();

        // Find products that should be permanently deleted
        const productsToDelete = await prisma.products.findMany({
            where: {
                isDeleted: true,
                deletedAt: {
                    lte: now
                },
            },
            select: {
                id: true
            }
        });

        if (productsToDelete.length === 0) {
            return; // No products to delete
        }

        const productIds = productsToDelete.map(p => p.id);

        // Use a transaction to ensure all deletes succeed or none do
        const result = await prisma.$transaction(async (tx) => {
            // 1. Delete related ProductPricing records
            await tx.productPricing.deleteMany({
                where: {
                    productId: { in: productIds }
                }
            });

            // 2. Delete related EventProductDiscount records
            await tx.eventProductDiscount.deleteMany({
                where: {
                    productId: { in: productIds }
                }
            });

            // 3. Delete related productAnalytics records
            await tx.productAnalytics.deleteMany({
                where: {
                    productId: { in: productIds }
                }
            });

            // 4. Delete related OrderItems (set productId to null or handle appropriately)
            // Note: OrderItems should typically be kept for order history
            // We'll update them to remove the product reference instead of deleting
            // This depends on your business requirements

            // 5. Finally, delete the products
            const deletedProducts = await tx.products.deleteMany({
                where: {
                    id: { in: productIds }
                }
            });

            return deletedProducts;
        });

        if (result.count > 0) {
            console.log(`✅ ${result.count} expired products permanently deleted.`);
        }

    } catch (error) {
        console.error("❌ Error in product deletion cron job:", error);
    }
});
