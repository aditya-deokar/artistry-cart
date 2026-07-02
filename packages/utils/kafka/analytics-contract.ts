import { z } from "zod";

const trimmedOptionalString = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .optional();

const analyticsEventContextRules = (
  event: {
    action: string;
    productId?: string;
    shopId?: string;
  },
  context: z.RefinementCtx,
) => {
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
};

/** Current schema version for analytics events. */
export const ANALYTICS_EVENT_SCHEMA_VERSION = 1;

/**
 * All schema versions this consumer can handle.
 * When evolving the schema, add older versions here to maintain
 * backward-compatibility until all producers have migrated.
 */
export const SUPPORTED_SCHEMA_VERSIONS = [1] as const;

/** All valid user action types for analytics tracking. */
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

const analyticsTrackRequestBaseSchema = z.object({
  action: analyticsActionSchema,
  productId: trimmedOptionalString,
  shopId: trimmedOptionalString,
  quantity: z.number().int().min(1).max(1000).optional(),
  country: trimmedOptionalString,
  city: trimmedOptionalString,
  device: trimmedOptionalString,
  source: z.string().trim().min(1).max(120).optional(),
});

export const analyticsTrackRequestSchema = analyticsTrackRequestBaseSchema.superRefine(
  analyticsEventContextRules,
);

/**
 * Full analytics event schema — includes server-side fields (eventId, userId,
 * timestamp, source, correlationId) that are not present in the client request.
 */
export const analyticsEventSchema = analyticsTrackRequestBaseSchema
  .extend({
    eventId: z.string().trim().min(1).max(255),
    schemaVersion: z.literal(ANALYTICS_EVENT_SCHEMA_VERSION),
    source: z.string().trim().min(1).max(120),
    timestamp: z
      .string()
      .trim()
      .refine((value) => !Number.isNaN(Date.parse(value)), "timestamp must be an ISO date"),
    userId: z.string().trim().min(1).max(255),
    /** Optional correlation ID for end-to-end request tracing. */
    correlationId: z.string().trim().min(1).max(255).optional(),
  })
  .superRefine(analyticsEventContextRules);

export type AnalyticsUserAction = (typeof ANALYTICS_USER_ACTIONS)[number];
export type AnalyticsTrackRequest = z.infer<typeof analyticsTrackRequestSchema>;
export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>;
