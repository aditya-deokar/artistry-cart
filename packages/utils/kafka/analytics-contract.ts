import { z } from "zod";

const trimmedOptionalString = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .optional();

export const ANALYTICS_EVENT_SCHEMA_VERSION = 1;

export const ANALYTICS_USER_ACTIONS = [
  "add_to_wishlist",
  "add_to_cart",
  "product_view",
  "remove_from_wishlist",
  "remove_from_cart",
  "purchase",
  "shop_visit",
] as const;

export const analyticsActionSchema = z.enum(ANALYTICS_USER_ACTIONS);

export const analyticsTrackRequestSchema = z
  .object({
    action: analyticsActionSchema,
    productId: trimmedOptionalString,
    shopId: trimmedOptionalString,
    quantity: z.number().int().min(1).max(1000).optional(),
    country: trimmedOptionalString,
    city: trimmedOptionalString,
    device: trimmedOptionalString,
    source: z.string().trim().min(1).max(120).optional(),
  })
  .superRefine((event, context) => {
    if (event.action === "shop_visit" && !event.shopId && !event.productId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "shop_visit events require shopId or productId",
        path: ["shopId"],
      });
    }

    if (event.action !== "shop_visit" && !event.productId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${event.action} events require productId`,
        path: ["productId"],
      });
    }
  });

export const analyticsEventSchema = analyticsTrackRequestSchema.extend({
  eventId: z.string().trim().min(1).max(255),
  schemaVersion: z.literal(ANALYTICS_EVENT_SCHEMA_VERSION),
  source: z.string().trim().min(1).max(120),
  timestamp: z
    .string()
    .trim()
    .refine((value) => !Number.isNaN(Date.parse(value)), "timestamp must be an ISO date"),
  userId: z.string().trim().min(1).max(255),
});

export type AnalyticsUserAction = (typeof ANALYTICS_USER_ACTIONS)[number];
export type AnalyticsTrackRequest = z.infer<typeof analyticsTrackRequestSchema>;
export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>;
