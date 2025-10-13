import { EventProductDiscount, events, products } from "@prisma/client";

import prisma from "../../../../packages/libs/prisma";

export interface EventDiscountContext {
  product: Pick<products, "id" | "regular_price" | "sale_price" | "current_price">;
  event?: Pick<
    events,
    | "id"
    | "title"
    | "discount_percent"
    | "max_discount"
    | "is_active"
    | "starting_date"
    | "ending_date"
  > | null;
  productDiscount?: Pick<
    EventProductDiscount,
    | "productId"
    | "discountType"
    | "discountValue"
    | "maxDiscount"
    | "specialPrice"
    | "isActive"
  > | null;
}

export interface DiscountComputationResult {
  basePrice: number;
  discountedPrice: number;
  discountAmount: number;
  discountPercent: number;
  sourceId?: string;
  sourceName?: string;
}

export class PricingService {
  static isEventActive(
    event?: EventDiscountContext["event"] | null,
    referenceDate: Date = new Date(),
  ): boolean {
    if (!event) return false;

    const startsAt = new Date(event.starting_date);
    const endsAt = new Date(event.ending_date);

    return Boolean(
      event.is_active &&
        startsAt.getTime() <= referenceDate.getTime() &&
        endsAt.getTime() > referenceDate.getTime(),
    );
  }

  static deriveEventDiscount(
    context: EventDiscountContext,
  ): DiscountComputationResult | null {
    const { product, event, productDiscount } = context;

    if (!event || !PricingService.isEventActive(event)) {
      return null;
    }

    const basePrice = product.sale_price ?? product.regular_price;
    let discountedPrice = basePrice;
    let discountAmount = 0;
    let discountPercent = 0;

    if (productDiscount && productDiscount.isActive) {
      if (productDiscount.specialPrice !== null && productDiscount.specialPrice !== undefined) {
        discountedPrice = productDiscount.specialPrice;
        discountAmount = basePrice - discountedPrice;
        discountPercent = PricingService.calculatePercent(basePrice, discountAmount);
      } else if (productDiscount.discountType === "PERCENTAGE") {
        discountAmount = (basePrice * productDiscount.discountValue) / 100;
        if (productDiscount.maxDiscount) {
          discountAmount = Math.min(discountAmount, productDiscount.maxDiscount);
        }
        discountedPrice = basePrice - discountAmount;
        discountPercent = productDiscount.discountValue;
      } else if (productDiscount.discountType === "FIXED_AMOUNT") {
        discountAmount = Math.min(productDiscount.discountValue, basePrice);
        discountedPrice = basePrice - discountAmount;
        discountPercent = PricingService.calculatePercent(basePrice, discountAmount);
      }
    } else if (event.discount_percent && event.discount_percent > 0) {
      discountAmount = (basePrice * event.discount_percent) / 100;
      if (event.max_discount) {
        discountAmount = Math.min(discountAmount, event.max_discount);
      }
      discountedPrice = basePrice - discountAmount;
      discountPercent = event.discount_percent;
    }

    if (discountAmount <= 0) {
      return null;
    }

    return {
      basePrice,
      discountedPrice: Math.max(discountedPrice, 0),
      discountAmount,
      discountPercent: PricingService.roundPercent(discountPercent),
      sourceId: event.id,
      sourceName: event.title,
    };
  }

  static async calculateProductPrice(productId: string): Promise<{
    productId: string;
    originalPrice: number;
    finalPrice: number;
    discountInfo: DiscountComputationResult | null;
    savings: number;
  }> {
    const product = await prisma.products.findUnique({
      where: { id: productId },
      include: {
        event: {
          include: {
            productDiscounts: {
              where: { productId, isActive: true },
            },
          },
        },
        priceHistory: {
          where: {
            isActive: true,
            validFrom: { lte: new Date() },
            OR: [{ validUntil: { gte: new Date() } }, { validUntil: null }],
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    const discountInfo = PricingService.deriveEventDiscount({
      product,
      event: product.event,
      productDiscount: product.event?.productDiscounts?.[0],
    });

    const originalPrice = product.sale_price ?? product.regular_price;
    const finalPrice = discountInfo ? discountInfo.discountedPrice : originalPrice;

    return {
      productId,
      originalPrice,
      finalPrice: Math.max(finalPrice, 0),
      discountInfo,
      savings: discountInfo ? discountInfo.discountAmount : 0,
    };
  }

  static async updateCachedPricing(productId: string) {
    const pricing = await PricingService.calculateProductPrice(productId);

    await prisma.products.update({
      where: { id: productId },
      data: {
        current_price: pricing.finalPrice,
        is_on_discount: pricing.savings > 0,
      },
    });

    return pricing;
  }

  static buildPricingRecord(args: {
    product: Pick<products, "id" | "regular_price" | "sale_price" | "current_price">;
    event: EventDiscountContext["event"];
    productDiscount?: EventDiscountContext["productDiscount"];
    validFrom: Date;
    validUntil: Date;
  }) {
    const discountInfo = PricingService.deriveEventDiscount({
      product: args.product,
      event: args.event,
      productDiscount: args.productDiscount,
    });

    const basePrice = args.product.sale_price ?? args.product.regular_price;
    const discountedPrice = discountInfo ? discountInfo.discountedPrice : basePrice;
    const discountAmount = discountInfo ? discountInfo.discountAmount : 0;
    const discountPercent = discountInfo ? discountInfo.discountPercent : 0;

    return {
      create: {
        productId: args.product.id,
        basePrice,
        discountedPrice,
        discountAmount,
        discountPercent,
        discountSource: "EVENT" as const,
        sourceId: discountInfo?.sourceId ?? args.event?.id ?? null,
        sourceName: discountInfo?.sourceName ?? args.event?.title ?? null,
        validFrom: args.validFrom,
        validUntil: args.validUntil,
        reason: args.event ? `Event pricing: ${args.event.title}` : null,
      },
      productUpdate: {
        current_price: discountedPrice,
        is_on_discount: discountAmount > 0,
      },
    };
  }

  private static calculatePercent(base: number, amount: number) {
    if (base <= 0) return 0;
    return (amount / base) * 100;
  }

  private static roundPercent(value: number) {
    return Math.round(value * 100) / 100;
  }
}
