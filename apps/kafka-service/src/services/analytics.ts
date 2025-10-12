import { Prisma } from "@prisma/client";

import prisma from "../../../../packages/libs/prisma";

export type UserAction =
    | "add_to_wishlist"
    | "add_to_cart"
    | "product_view"
    | "remove_from_wishlist"
    | "remove_from_cart"
    | "purchase"
    | "shop_visit";

export interface AnalyticsEvent {
    action?: UserAction;
    userId: string;
    productId?: string;
    shopId?: string;
    country?: string;
    city?: string;
    device?: string;
    timestamp?: string;
}

type StoredAction = {
    action: Exclude<UserAction, "shop_visit">;
    timestamp: string;
    productId?: string;
    shopId?: string;
};

export const updateUserAnalytics = async (event: AnalyticsEvent) => {
    try {
        if (!event.userId) return;

        const existingData = await prisma.userAnalytics.findUnique({
            where: {
                userId: event.userId,
            },
            select: { actions: true },
        });

        const actions = (existingData?.actions as StoredAction[] | undefined) ?? [];
        const now = new Date().toISOString();

        const findAction = (action: StoredAction["action"]) =>
            actions.find(
                (entry) => entry.productId === event.productId && entry.action === action,
            );

            const pushAction = (action: StoredAction["action"]) => {
                const payload: StoredAction = {
                    action,
                    timestamp: now,
                };

                if (event.productId) {
                    payload.productId = event.productId;
                }

                if (event.shopId) {
                    payload.shopId = event.shopId;
                }

                actions.push(payload);
            };

            if (event.action === "product_view") {
                pushAction("product_view");
            } else if (event.action === "add_to_cart" && !findAction("add_to_cart")) {
                pushAction("add_to_cart");
            } else if (event.action === "add_to_wishlist" && !findAction("add_to_wishlist")) {
                pushAction("add_to_wishlist");
        } else if (event.action === "remove_from_cart") {
            const index = actions.findIndex(
                (entry) => entry.productId === event.productId && entry.action === "add_to_cart",
            );
            if (index >= 0) actions.splice(index, 1);
        } else if (event.action === "remove_from_wishlist") {
            const index = actions.findIndex(
                (entry) => entry.productId === event.productId && entry.action === "add_to_wishlist",
            );
            if (index >= 0) actions.splice(index, 1);
        }

        if (actions.length > 100) {
            actions.splice(0, actions.length - 100);
        }

        const extraFields: Record<string, string> = {};

        if (event.country) {
            extraFields.country = event.country;
        }

        if (event.city) {
            extraFields.city = event.city;
        }

        if (event.device) {
            extraFields.device = event.device;
        }

                    const serializedActions = actions.map<Prisma.InputJsonValue>((entry) => ({
                        action: entry.action,
                        timestamp: entry.timestamp,
                        ...(entry.productId ? { productId: entry.productId } : {}),
                        ...(entry.shopId ? { shopId: entry.shopId } : {}),
                    }));

            await prisma.userAnalytics.upsert({
            where: { userId: event.userId },
            update: {
                lastVisited: new Date(),
                    actions: serializedActions,
                ...extraFields,
            },
            create: {
                userId: event.userId,
                lastVisited: new Date(),
                    actions: serializedActions,
                ...extraFields,
            },
        });

        await updateProductAnalytics(event);
    } catch (error) {
        console.log("Error in storing user analytics", error);
    }
};

export const updateProductAnalytics = async (event: AnalyticsEvent) => {
    try {
        if (!event.productId) return;

        const now = new Date();

        let shopId = event.shopId;

        if (!shopId) {
            const product = await prisma.products.findUnique({
                where: { id: event.productId },
                select: { shopId: true },
            });

            shopId = product?.shopId;
        }

        if (!shopId) return;

        await prisma.productAnalytics.upsert({
            where: {
                productId: event.productId,
            },
            update: {
                shopId,
                lastViewedAt: now,
                ...(event.action === "product_view"
                    ? { views: { increment: 1 } }
                    : {}),
                ...(event.action === "add_to_cart"
                    ? { cartAdds: { increment: 1 } }
                    : {}),
                ...(event.action === "add_to_wishlist"
                    ? { wishlistAdds: { increment: 1 } }
                    : {}),
                ...(event.action === "purchase"
                    ? { purchases: { increment: 1 } }
                    : {}),
                ...(event.action === "remove_from_cart"
                    ? { cartAdds: { decrement: 1 } }
                    : {}),
                ...(event.action === "remove_from_wishlist"
                    ? { wishlistAdds: { decrement: 1 } }
                    : {}),
            },
            create: {
                productId: event.productId,
                        shopId,
                views: event.action === "product_view" ? 1 : 0,
                cartAdds: event.action === "add_to_cart" ? 1 : 0,
                wishlistAdds: event.action === "add_to_wishlist" ? 1 : 0,
                purchases: event.action === "purchase" ? 1 : 0,
                lastViewedAt: now,
            },
        });
    } catch (error) {
        console.error("Error in Product Analytics", error);
    }
};