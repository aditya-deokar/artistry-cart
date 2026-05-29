import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAnalyticsEvent } from "../../../../packages/utils/kafka";

const mocks = vi.hoisted(() => {
  const prismaMock = {
    userAnalytics: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    productAnalytics: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    shopAnalytics: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    uniqueShopVisitor: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    products: {
      findUnique: vi.fn(),
    },
  };

  const reset = () => {
    for (const value of Object.values(prismaMock)) {
      for (const fn of Object.values(value)) {
        if (typeof (fn as { mockReset?: () => void })?.mockReset === "function") {
          (fn as { mockReset: () => void }).mockReset();
        }
      }
    }
  };

  return { prismaMock, reset };
});

vi.mock("../../../../packages/libs/prisma", () => ({
  __esModule: true,
  default: mocks.prismaMock,
}));

import { processAnalyticsEvent, updateProductAnalytics, updateShopAnalytics, updateUserAnalytics } from "./analytics";

function buildAnalyticsEvent(
  input: Parameters<typeof createAnalyticsEvent>[0],
) {
  return createAnalyticsEvent({
    source: "test-suite",
    ...input,
  });
}

describe("analytics service", () => {
  beforeEach(() => {
    mocks.reset();
  });

  it("creates user analytics records with recommendations and processed event keys", async () => {
    mocks.prismaMock.userAnalytics.findUnique.mockResolvedValue(null);
    mocks.prismaMock.userAnalytics.create.mockResolvedValue({});

    await updateUserAnalytics(
      buildAnalyticsEvent({
        userId: "user-1",
        productId: "product-1",
        shopId: "shop-1",
        action: "product_view",
        country: "India",
        city: "Delhi",
        device: "Desktop",
        timestamp: "2026-05-29T00:00:00.000Z",
      }),
      "user-events:0:1",
    );

    expect(mocks.prismaMock.userAnalytics.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-1",
        recommendations: [],
        processedEventKeys: ["user-events:0:1"],
        country: "India",
        city: "Delhi",
        device: "Desktop",
        actions: [
          expect.objectContaining({
            action: "product_view",
            eventKey: "user-events:0:1",
            productId: "product-1",
            shopId: "shop-1",
          }),
        ],
      }),
    });
  });

  it("skips duplicate product analytics updates for the same event key", async () => {
    mocks.prismaMock.productAnalytics.findUnique.mockResolvedValue({
      views: 2,
      cartAdds: 0,
      wishlistAdds: 0,
      purchases: 0,
      processedEventKeys: ["user-events:0:7"],
    });

    await updateProductAnalytics(
      buildAnalyticsEvent({
        userId: "user-1",
        productId: "product-1",
        shopId: "shop-1",
        action: "product_view",
      }),
      "user-events:0:7",
    );

    expect(mocks.prismaMock.productAnalytics.upsert).not.toHaveBeenCalled();
  });

  it("prevents product counters from dropping below zero on removal events", async () => {
    mocks.prismaMock.productAnalytics.findUnique.mockResolvedValue({
      views: 0,
      cartAdds: 0,
      wishlistAdds: 0,
      purchases: 0,
      processedEventKeys: [],
    });

    await updateProductAnalytics(
      buildAnalyticsEvent({
        userId: "user-1",
        productId: "product-1",
        shopId: "shop-1",
        action: "remove_from_cart",
      }),
      "user-events:0:8",
    );

    expect(mocks.prismaMock.productAnalytics.upsert).toHaveBeenCalledWith({
      where: { productId: "product-1" },
      update: expect.objectContaining({
        cartAdds: 0,
      }),
      create: expect.objectContaining({
        cartAdds: 0,
      }),
    });
  });

  it("materializes shop visit analytics and unique visitor state", async () => {
    mocks.prismaMock.shopAnalytics.findUnique.mockResolvedValue(null);
    mocks.prismaMock.uniqueShopVisitor.findFirst.mockResolvedValue(null);
    mocks.prismaMock.uniqueShopVisitor.create.mockResolvedValue({});
    mocks.prismaMock.shopAnalytics.upsert.mockResolvedValue({});

    await updateShopAnalytics(
      buildAnalyticsEvent({
        userId: "user-1",
        shopId: "shop-1",
        action: "shop_visit",
        country: "India",
        city: "Delhi",
        device: "Mobile",
        timestamp: "2026-05-29T00:00:00.000Z",
      }),
      "user-events:0:9",
    );

    expect(mocks.prismaMock.uniqueShopVisitor.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        shopId: "shop-1",
        userId: "user-1",
      }),
    });
    expect(mocks.prismaMock.shopAnalytics.upsert).toHaveBeenCalledWith({
      where: { shopId: "shop-1" },
      update: expect.objectContaining({
        totalVisitors: 1,
        countryStats: { India: 1 },
        cityStats: { Delhi: 1 },
        deviceStats: { Mobile: 1 },
      }),
      create: expect.objectContaining({
        shopId: "shop-1",
        totalVisitors: 1,
      }),
    });
  });

  it("processes user, product, and shop analytics together", async () => {
    mocks.prismaMock.userAnalytics.findUnique.mockResolvedValue(null);
    mocks.prismaMock.userAnalytics.create.mockResolvedValue({});
    mocks.prismaMock.productAnalytics.findUnique.mockResolvedValue(null);
    mocks.prismaMock.productAnalytics.upsert.mockResolvedValue({});
    mocks.prismaMock.shopAnalytics.findUnique.mockResolvedValue(null);
    mocks.prismaMock.shopAnalytics.upsert.mockResolvedValue({});
    mocks.prismaMock.uniqueShopVisitor.findFirst.mockResolvedValue({
      id: "visitor-1",
    });

    await processAnalyticsEvent(
      buildAnalyticsEvent({
        userId: "user-1",
        productId: "product-1",
        shopId: "shop-1",
        action: "product_view",
        timestamp: "2026-05-29T00:00:00.000Z",
      }),
      "user-events:0:10",
    );

    expect(mocks.prismaMock.userAnalytics.create).toHaveBeenCalled();
    expect(mocks.prismaMock.productAnalytics.upsert).toHaveBeenCalled();
    expect(mocks.prismaMock.shopAnalytics.upsert).not.toHaveBeenCalled();
  });
});
