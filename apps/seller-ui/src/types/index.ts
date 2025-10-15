export type { Event, EventProductDiscount, EventFormData, EventFilters } from './event';

export interface DiscountCode {
  id: string;
  publicName: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  discountValue: number;
  discountCode: string;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  currentUsageCount: number;
  isActive: boolean;
  validFrom: string;
  validUntil?: string;
  applicableToAll: boolean;
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedProducts?: string[];
  sellerId: string;
  shopId: string;
  createdAt: string;
  updatedAt: string;
  usageHistory: DiscountUsage[];
  shop: {
    name: string;
    slug: string;
  };
}

export interface DiscountUsage {
  id: string;
  discountAmount: number;
  usedAt: string;
  user: {
    name: string;
    email: string;
  };
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  images: any[];
  regular_price: number;
  sale_price?: number;
  current_price?: number;
  category: string;
  ratings?: number;
  rating?: number;
  stock: number;
  status?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  banner_image?: {
    url: string;
    file_id: string;
  };
  event_type: string;
  discount_percent?: number;
  starting_date: string;
  ending_date: string;
  product_ids?: string[];
}

export interface CreateDiscountData {
  publicName: string;
  description?: string;
  discountType: string;
  discountValue: number;
  discountCode: string;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  validFrom?: string;
  validUntil?: string;
  applicableToAll: boolean;
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedProducts?: string[];
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}
