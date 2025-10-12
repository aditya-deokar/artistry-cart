// types/discount.ts
export interface DiscountCode {
  id: string;
  publicName: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
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
  applicableCategories: string[];
  applicableProducts: string[];
  excludedProducts: string[];
  sellerId: string;
  shopId: string;
  createdAt: string;
  updatedAt: string;
  usageHistory?: DiscountUsage[];
}

export interface DiscountUsage {
  id: string;
  discountCodeId: string;
  userId: string;
  orderId?: string;
  discountAmount: number;
  usedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  order?: {
    id: string;
    totalAmount: number;
  };
}

export interface DiscountFormData {
  publicName: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  discountValue: number;
  discountCode: string;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  isActive: boolean;
  validFrom: Date;
  validUntil?: Date;
  applicableToAll: boolean;
  applicableCategories: string[];
  applicableProducts: string[];
  excludedProducts: string[];
}

export interface DiscountFilters {
  discountType?: string;
  status?: 'active' | 'expired' | 'inactive' | '';
  dateRange?: {
    from?: Date;
    to?: Date;
  } | null;
}

export interface BulkDiscountData {
  count: number;
  prefix?: string;
  suffix?: string;
  codeLength: number;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  discountValue: number;
  publicName: string;
  description?: string;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  validFrom: Date;
  validUntil?: Date;
  applicableToAll: boolean;
  applicableCategories: string[];
}

export interface DiscountStats {
  totalDiscounts: number;
  activeDiscounts: number;
  expiredDiscounts: number;
  totalUsage: number;
  totalSavings: number;
  averageDiscount: number;
  topDiscounts: Array<{
    id: string;
    code: string;
    usage: number;
    savings: number;
  }>;
}
