import { NextFunction, Response } from "express";
import prisma from "../../../../packages/libs/prisma";

// Get orders for a specific seller/shop
export const getSellerOrders = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const sellerId = req.user.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as string;
        const skip = (page - 1) * limit;

        // Find the shop associated with this seller
        const shop = await prisma.shops.findUnique({
            where: { sellerId },
        });

        if (!shop) {
            return res.status(404).json({ error: "Shop not found for this seller." });
        }

        const whereClause: any = { shopId: shop.id };
        if (status && status !== "all") {
            whereClause.status = status.toUpperCase();
        }

        const [orders, total] = await Promise.all([
            prisma.orders.findMany({
                where: whereClause,
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    title: true,
                                    images: true,
                                    slug: true,
                                },
                            },
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.orders.count({ where: whereClause }),
        ]);

        return res.status(200).json({
            orders,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        return next(error);
    }
};

// Update order status
export const updateOrderStatus = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const { orderId } = req.params;
        const { status, deliveryStatus } = req.body;
        const sellerId = req.user.id;

        // Verify ownership
        const shop = await prisma.shops.findUnique({
            where: { sellerId },
        });

        if (!shop) {
            return res.status(404).json({ error: "Shop not found." });
        }

        const order = await prisma.orders.findFirst({
            where: {
                id: orderId,
                shopId: shop.id,
            },
        });

        if (!order) {
            return res.status(404).json({ error: "Order not found." });
        }

        const updateData: any = {};
        if (status) updateData.status = status;
        if (deliveryStatus) updateData.deliveryStatus = deliveryStatus;

        const updatedOrder = await prisma.orders.update({
            where: { id: orderId },
            data: updateData,
        });

        return res.status(200).json({
            success: true,
            order: updatedOrder,
        });
    } catch (error) {
        return next(error);
    }
};

// Get seller analytics (Basic for Phase 1)
export const getSellerAnalytics = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const sellerId = req.user.id;
        const shop = await prisma.shops.findUnique({ where: { sellerId } });

        if (!shop) return res.status(404).json({ error: "Shop not found" });

        // Simple aggregations
        const totalOrders = await prisma.orders.count({
            where: { shopId: shop.id },
        });

        const totalRevenue = await prisma.orders.aggregate({
            where: { shopId: shop.id, status: "PAID" },
            _sum: { totalAmount: true },
        });

        return res.status(200).json({
            totalOrders,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
        });
    } catch (error) {
        return next(error);
    }
};

// Get single order details for seller
export const getSellerOrderDetails = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const { orderId } = req.params;
        const sellerId = req.user.id;

        const shop = await prisma.shops.findUnique({
            where: { sellerId },
        });

        if (!shop) {
            return res.status(404).json({ error: "Shop not found." });
        }

        const order = await prisma.orders.findFirst({
            where: {
                id: orderId,
                shopId: shop.id,
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                title: true,
                                images: true,
                                slug: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,

                    },
                },
                payment: true,
            },
        });

        if (!order) {
            return res.status(404).json({ error: "Order not found." });
        }

        let shippingAddress = null;
        if (order.shippingAddressId) {
            shippingAddress = await prisma.addresses.findUnique({
                where: { id: order.shippingAddressId }
            });
        }

        return res.status(200).json({
            order: {
                ...order,
                shippingAddress
            }
        });
    } catch (error) {
        return next(error);
    }
};
