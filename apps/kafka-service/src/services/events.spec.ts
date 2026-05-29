import { describe, expect, it } from "vitest";

import {
  PermanentEventError,
  buildKafkaEventKey,
  parseAnalyticsEvent,
} from "./events";

describe("parseAnalyticsEvent", () => {
  it("parses a valid analytics event", () => {
    const event = parseAnalyticsEvent(
      JSON.stringify({
        userId: "user-1",
        productId: "product-1",
        action: "product_view",
      }),
      "2026-05-29T00:00:00.000Z",
    );

    expect(event).toMatchObject({
      userId: "user-1",
      productId: "product-1",
      action: "product_view",
      timestamp: "2026-05-29T00:00:00.000Z",
    });
  });

  it("rejects invalid JSON", () => {
    expect(() => parseAnalyticsEvent("{not-json}")).toThrow(PermanentEventError);
  });

  it("rejects non-shop events that do not include productId", () => {
    expect(() =>
      parseAnalyticsEvent(
        JSON.stringify({
          userId: "user-1",
          action: "add_to_cart",
        }),
      ),
    ).toThrow(PermanentEventError);
  });

  it("rejects shop visits without a shopId or productId", () => {
    expect(() =>
      parseAnalyticsEvent(
        JSON.stringify({
          userId: "user-1",
          action: "shop_visit",
        }),
      ),
    ).toThrow(PermanentEventError);
  });
});

describe("buildKafkaEventKey", () => {
  it("builds a stable event key from topic, partition, and offset", () => {
    expect(buildKafkaEventKey("user-events", 2, "42")).toBe("user-events:2:42");
  });
});
