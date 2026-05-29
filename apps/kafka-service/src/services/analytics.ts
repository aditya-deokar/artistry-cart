import { Prisma } from "@prisma/client";

import prisma from "@artistry-cart/libs/prisma";
import type { AnalyticsEvent, UserAction } from "./events";
import { PermanentEventError } from "./events";

const ACTION_HISTORY_LIMIT = 250;
const PROCESSED_EVENT_KEY_LIMIT = 500;

type StoredAction = {
  action: Exclude<UserAction, "shop_visit">;
  eventKey: string;
  source?: string;
  timestamp: string;
  productId?: string;
  shopId?: string;
  country?: string;
  city?: string;
  device?: string;
  quantity?: number;
};

type AnalyticsPrismaClient = Pick<
  typeof prisma,
  "productAnalytics" | "products" | "shopAnalytics" | "uniqueShopVisitor" | "userAnalytics"
>;

function getEventDate(event: AnalyticsEvent): Date {
  return event.timestamp ? new Date(event.timestamp) : new Date();
}

function normalizeProcessedEventKeys(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string" && entry.length > 0);
}

function appendProcessedEventKey(existing: unknown, eventKey: string): string[] {
  const keys = normalizeProcessedEventKeys(existing);

  if (keys.includes(eventKey)) {
    return keys;
  }

  const nextKeys = [...keys, eventKey];

  if (nextKeys.length > PROCESSED_EVENT_KEY_LIMIT) {
    nextKeys.splice(0, nextKeys.length - PROCESSED_EVENT_KEY_LIMIT);
  }

  return nextKeys;
}

function toStoredAction(value: unknown): StoredAction | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const rawAction = (value as Record<string, unknown>).action;
  const rawTimestamp = (value as Record<string, unknown>).timestamp;
  const rawEventKey = (value as Record<string, unknown>).eventKey;
  const rawSource = (value as Record<string, unknown>).source;
  const rawQuantity = (value as Record<string, unknown>).quantity;

  if (
    typeof rawAction !== "string" ||
    rawAction === "shop_visit" ||
    typeof rawTimestamp !== "string" ||
    typeof rawEventKey !== "string"
  ) {
    return null;
  }

  const action = rawAction as StoredAction["action"];
  const storedAction: StoredAction = {
    action,
    eventKey: rawEventKey,
    timestamp: rawTimestamp,
    ...(typeof rawSource === "string" && rawSource.trim().length > 0
      ? { source: rawSource.trim() }
      : {}),
    ...(typeof rawQuantity === "number" && Number.isFinite(rawQuantity) && rawQuantity > 0
      ? { quantity: rawQuantity }
      : {}),
  };

  for (const key of ["productId", "shopId", "country", "city", "device"] as const) {
    const valueForKey = (value as Record<string, unknown>)[key];

    if (typeof valueForKey === "string" && valueForKey.trim().length > 0) {
      storedAction[key] = valueForKey.trim();
    }
  }

  return storedAction;
}

function normalizeStoredActions(value: unknown): StoredAction[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => toStoredAction(entry))
    .filter((entry): entry is StoredAction => entry !== null);
}

function trimActionHistory(actions: StoredAction[]): StoredAction[] {
  if (actions.length <= ACTION_HISTORY_LIMIT) {
    return actions;
  }

  return actions.slice(actions.length - ACTION_HISTORY_LIMIT);
}

function findLatestActionIndex(
  actions: StoredAction[],
  action: StoredAction["action"],
  productId?: string,
): number {
  for (let index = actions.length - 1; index >= 0; index -= 1) {
    const entry = actions[index];

    if (entry?.action === action && entry.productId === productId) {
      return index;
    }
  }

  return -1;
}

function serializeStoredActions(actions: StoredAction[]): Prisma.InputJsonValue[] {
  return actions.map<Prisma.InputJsonValue>((entry) => ({
    action: entry.action,
    eventKey: entry.eventKey,
    timestamp: entry.timestamp,
    ...(entry.productId ? { productId: entry.productId } : {}),
    ...(entry.shopId ? { shopId: entry.shopId } : {}),
    ...(entry.country ? { country: entry.country } : {}),
    ...(entry.city ? { city: entry.city } : {}),
    ...(entry.device ? { device: entry.device } : {}),
    ...(entry.source ? { source: entry.source } : {}),
    ...(entry.quantity ? { quantity: entry.quantity } : {}),
  }));
}

function normalizeCountMap(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, number>>(
    (result, [key, entryValue]) => {
      if (typeof entryValue === "number" && Number.isFinite(entryValue)) {
        result[key] = entryValue;
      }

      return result;
    },
    {},
  );
}

function incrementCount(map: Record<string, number>, key?: string): Record<string, number> {
  if (!key) {
    return map;
  }

  const normalizedKey = key.trim();

  if (!normalizedKey) {
    return map;
  }

  return {
    ...map,
    [normalizedKey]: (map[normalizedKey] ?? 0) + 1,
  };
}

function clampAtZero(value: number): number {
  return value < 0 ? 0 : value;
}

function isKnownUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

async function resolveShopId(
  event: AnalyticsEvent,
  db: AnalyticsPrismaClient,
): Promise<string | undefined> {
  if (event.shopId) {
    return event.shopId;
  }

  if (!event.productId) {
    return undefined;
  }

  const product = await db.products.findUnique({
    where: { id: event.productId },
    select: { shopId: true },
  });

  return product?.shopId;
}

export async function updateUserAnalytics(
  event: AnalyticsEvent,
  eventKey: string,
  db: AnalyticsPrismaClient = prisma,
): Promise<void> {
  const eventDate = getEventDate(event);
  const eventTimestamp = eventDate.toISOString();
  const existingData = await db.userAnalytics.findUnique({
    where: { userId: event.userId },
    select: {
      actions: true,
      processedEventKeys: true,
    },
  });

  if (normalizeProcessedEventKeys(existingData?.processedEventKeys).includes(eventKey)) {
    return;
  }

  const actions = normalizeStoredActions(existingData?.actions);

  const pushAction = (action: StoredAction["action"]) => {
    actions.push({
      action,
      eventKey,
      timestamp: eventTimestamp,
      ...(event.productId ? { productId: event.productId } : {}),
      ...(event.shopId ? { shopId: event.shopId } : {}),
      ...(event.country ? { country: event.country } : {}),
      ...(event.city ? { city: event.city } : {}),
      ...(event.device ? { device: event.device } : {}),
      ...(event.source ? { source: event.source } : {}),
      ...(event.quantity && event.quantity > 0 ? { quantity: event.quantity } : {}),
    });
  };

  if (event.action === "product_view") {
    pushAction("product_view");
  } else if (event.action === "purchase") {
    pushAction("purchase");
  } else if (
    event.action === "add_to_cart" &&
    findLatestActionIndex(actions, "add_to_cart", event.productId) === -1
  ) {
    pushAction("add_to_cart");
  } else if (
    event.action === "add_to_wishlist" &&
    findLatestActionIndex(actions, "add_to_wishlist", event.productId) === -1
  ) {
    pushAction("add_to_wishlist");
  } else if (event.action === "remove_from_cart") {
    const actionIndex = findLatestActionIndex(actions, "add_to_cart", event.productId);

    if (actionIndex >= 0) {
      actions.splice(actionIndex, 1);
    }
  } else if (event.action === "remove_from_wishlist") {
    const actionIndex = findLatestActionIndex(actions, "add_to_wishlist", event.productId);

    if (actionIndex >= 0) {
      actions.splice(actionIndex, 1);
    }
  }

  const data = {
    lastVisited: eventDate,
    actions: serializeStoredActions(trimActionHistory(actions)),
    processedEventKeys: appendProcessedEventKey(
      existingData?.processedEventKeys,
      eventKey,
    ),
    ...(event.country ? { country: event.country } : {}),
    ...(event.city ? { city: event.city } : {}),
    ...(event.device ? { device: event.device } : {}),
  };

  if (existingData) {
    await db.userAnalytics.update({
      where: { userId: event.userId },
      data,
    });

    return;
  }

  await db.userAnalytics.create({
    data: {
      userId: event.userId,
      recommendations: [],
      ...data,
    },
  });
}

export async function updateProductAnalytics(
  event: AnalyticsEvent,
  eventKey: string,
  db: AnalyticsPrismaClient = prisma,
): Promise<void> {
  if (!event.productId || event.action === "shop_visit") {
    return;
  }

  const shopId = await resolveShopId(event, db);

  if (!shopId) {
    throw new PermanentEventError("Unable to resolve shopId for product analytics update", {
      event,
    });
  }

  const eventDate = getEventDate(event);
  const existingData = await db.productAnalytics.findUnique({
    where: { productId: event.productId },
    select: {
      views: true,
      cartAdds: true,
      wishlistAdds: true,
      purchases: true,
      processedEventKeys: true,
    },
  });

  if (normalizeProcessedEventKeys(existingData?.processedEventKeys).includes(eventKey)) {
    return;
  }

  const nextValues = {
    views: existingData?.views ?? 0,
    cartAdds: existingData?.cartAdds ?? 0,
    wishlistAdds: existingData?.wishlistAdds ?? 0,
    purchases: existingData?.purchases ?? 0,
  };

  if (event.action === "product_view") {
    nextValues.views += 1;
  } else if (event.action === "add_to_cart") {
    nextValues.cartAdds += event.quantity ?? 1;
  } else if (event.action === "add_to_wishlist") {
    nextValues.wishlistAdds += 1;
  } else if (event.action === "purchase") {
    nextValues.purchases += event.quantity ?? 1;
  } else if (event.action === "remove_from_cart") {
    nextValues.cartAdds = clampAtZero(nextValues.cartAdds - (event.quantity ?? 1));
  } else if (event.action === "remove_from_wishlist") {
    nextValues.wishlistAdds = clampAtZero(nextValues.wishlistAdds - 1);
  }

  const data = {
    shopId,
    views: nextValues.views,
    cartAdds: nextValues.cartAdds,
    wishlistAdds: nextValues.wishlistAdds,
    purchases: nextValues.purchases,
    lastViewedAt: eventDate,
    processedEventKeys: appendProcessedEventKey(
      existingData?.processedEventKeys,
      eventKey,
    ),
  };

  const hasSignals =
    data.views > 0 ||
    data.cartAdds > 0 ||
    data.wishlistAdds > 0 ||
    data.purchases > 0;

  if (!existingData && !hasSignals) {
    return;
  }

  await db.productAnalytics.upsert({
    where: { productId: event.productId },
    update: data,
    create: {
      productId: event.productId,
      ...data,
    },
  });
}

export async function updateShopAnalytics(
  event: AnalyticsEvent,
  eventKey: string,
  db: AnalyticsPrismaClient = prisma,
): Promise<void> {
  if (event.action !== "shop_visit") {
    return;
  }

  const shopId = await resolveShopId(event, db);

  if (!shopId) {
    throw new PermanentEventError("Unable to resolve shopId for shop analytics update", {
      event,
    });
  }

  const eventDate = getEventDate(event);
  const existingData = await db.shopAnalytics.findUnique({
    where: { shopId },
    select: {
      totalVisitors: true,
      countryStats: true,
      cityStats: true,
      deviceStats: true,
      processedEventKeys: true,
    },
  });

  if (normalizeProcessedEventKeys(existingData?.processedEventKeys).includes(eventKey)) {
    return;
  }

  let isNewVisitor = false;

  const existingVisitor = await db.uniqueShopVisitor.findFirst({
    where: {
      shopId,
      userId: event.userId,
    },
    select: { id: true },
  });

  if (!existingVisitor) {
    try {
      await db.uniqueShopVisitor.create({
        data: {
          shopId,
          userId: event.userId,
          visitedAt: eventDate,
        },
      });
      isNewVisitor = true;
    } catch (error) {
      if (!isKnownUniqueConstraintError(error)) {
        throw error;
      }
    }
  }

  const data = {
    totalVisitors: (existingData?.totalVisitors ?? 0) + (isNewVisitor ? 1 : 0),
    countryStats: incrementCount(
      normalizeCountMap(existingData?.countryStats),
      event.country,
    ),
    cityStats: incrementCount(normalizeCountMap(existingData?.cityStats), event.city),
    deviceStats: incrementCount(
      normalizeCountMap(existingData?.deviceStats),
      event.device,
    ),
    lastVisitedAt: eventDate,
    processedEventKeys: appendProcessedEventKey(
      existingData?.processedEventKeys,
      eventKey,
    ),
  };

  await db.shopAnalytics.upsert({
    where: { shopId },
    update: data,
    create: {
      shopId,
      ...data,
    },
  });
}

export async function processAnalyticsEvent(
  event: AnalyticsEvent,
  eventKey: string,
  db: AnalyticsPrismaClient = prisma,
): Promise<void> {
  await updateUserAnalytics(event, eventKey, db);
  await updateProductAnalytics(event, eventKey, db);
  await updateShopAnalytics(event, eventKey, db);
}
