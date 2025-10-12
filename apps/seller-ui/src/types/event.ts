// types/event.ts
export interface Event {
  id: string;
  title: string;
  description: string;
  banner_image?: {
    url: string;
    file_id: string;
  };
  event_type: 'FLASH_SALE' | 'SEASONAL' | 'CLEARANCE' | 'NEW_ARRIVAL';
  discount_percent?: number;
  discount_type?: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'TIERED';
  discount_value?: number;
  max_discount?: number;
  min_order_value?: number;
  starting_date: string;
  ending_date: string;
  is_active: boolean;
  sellerId: string;
  shopId: string;
  views: number;
  clicks: number;
  conversions: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
  products?: Product[];
  productDiscounts?: EventProductDiscount[];
  shop?: {
    name: string;
    slug: string;
  };
  _count?: {
    products: number;
    productDiscounts: number;
  };
}

export interface EventProductDiscount {
  id: string;
  eventId: string;
  productId: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'SPECIAL_PRICE' | 'BUY_X_GET_Y';
  discountValue: number;
  maxDiscount?: number;
  specialPrice?: number;
  minQuantity?: number;
  maxQuantity?: number;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventFormData {
  title: string;
  description: string;
  banner_image?: {
    url: string;
    file_id: string;
  } | null;
  event_type: 'FLASH_SALE' | 'SEASONAL' | 'CLEARANCE' | 'NEW_ARRIVAL';
  discount_percent?: number;
  discount_type?: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'TIERED';
  discount_value?: number;
  max_discount?: number;
  min_order_value?: number;
  starting_date: Date;
  ending_date: Date;
  is_active: boolean;
}

export interface EventFilters {
  event_type?: string;
  status?: 'active' | 'upcoming' | 'ended' | '';
  dateRange?: {
    from?: Date;
    to?: Date;
  } | null;
}

export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  event_type: string;
  discount_type: string;
  discount_value: number;
  duration_days: number;
  banner_template?: string;
  isPublic: boolean;
  createdBy: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}
