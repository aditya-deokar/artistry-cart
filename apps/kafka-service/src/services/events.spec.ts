import { describe, expect, it } from "vitest";

import {
  PermanentEventError,
  buildKafkaEventKey,
  parseAnalyticsEvent,
} from "./events";

function createRawAnalyticsEvent(overrides: Record<string, unknown> = {}) {
  return {
    eventId: "evt-1",
    schemaVersion: 1,
    source: "kafka-service.spec",
    timestamp: "2026-05-29T00:00:00.000Z",
    userId: "user-1",
    productId: "product-1",
    action: "product_view",
    ...overrides,
  };
}

describe("parseAnalyticsEvent", () => {
  it("parses a valid analytics event", () => {
    const event = parseAnalyticsEvent(
      JSON.stringify(createRawAnalyticsEvent()),
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
        JSON.stringify(
          createRawAnalyticsEvent({
            action: "add_to_cart",
            productId: undefined,
          }),
        ),
      ),
    ).toThrow(PermanentEventError);
  });

  it("rejects shop visits without a shopId or productId", () => {
    expect(() =>
      parseAnalyticsEvent(
        JSON.stringify(
          createRawAnalyticsEvent({
            action: "shop_visit",
            productId: undefined,
          }),
        ),
      ),
    ).toThrow(PermanentEventError);
  });
});

describe("buildKafkaEventKey", () => {
  it("builds a stable event key from topic, partition, and offset", () => {
    expect(buildKafkaEventKey("user-events", 2, "42")).toBe("user-events:2:42");
  });
});
