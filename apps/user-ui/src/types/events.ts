import { ArtProduct } from "./products";

export type EventType = "FLASH_SALE" | "SEASONAL" | "CLEARANCE" | "NEW_ARRIVAL";

export interface Shop {
  id: string;
  name: string;
  slug: string;
  avatar?: {
    url: string;
    file_id: string;
  } | null;
  logo?: {
    url: string;
    file_id: string;
  };
  bio?: string;
  ratings?: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  banner_image?: {
    url: string;
    file_id: string;
  };
  event_type: EventType;
  discount_percent?: number;
  discount_type?: "PERCENTAGE" | "FIXED_AMOUNT" | "TIERED";
  discount_value?: number;
  max_discount?: number;
  min_order_value?: number;
  starting_date: string;
  ending_date: string;
  is_active: boolean;
  shopId: string;
  sellerId?: string;
  views?: number;
  clicks?: number;
  conversions?: number;
  totalRevenue?: number;
  productCount?: number;
  products?: ArtProduct[];
  productDiscounts?: any[];
  // Support both uppercase and lowercase shop property
  Shop?: Shop;
  shop?: Shop;
  createdAt: string;
  updatedAt: string;
}

export interface EventsParams {
  page?: number;
  limit?: number;
  search?: string;
  event_type?: EventType | "all";
  shopId?: string;
  is_active?: boolean;
  sortBy?: "newest" | "ending_soon" | "popular";
}

export interface EventsResponse {
  events: Event[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
