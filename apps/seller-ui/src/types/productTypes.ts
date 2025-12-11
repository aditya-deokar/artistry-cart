// store/products/productTypes.ts
export interface Product {
  id: string;
  title: string;
  description: string;
  detailed_description: string;
  warranty?: string;
  custom_specifications?: Record<string, any>;
  slug: string;
  tags: string[];
  cash_on_delivery?: boolean;
  brand?: string;
  video_url?: string;
  category: string;
  subCategory: string;
  colors: string[];
  sizes: string[];
  discountCodes?: string;
  stock: number;
  sale_price?: number;
  regular_price: number;
  current_price: number;
  is_on_discount: boolean;
  ratings: number;
  isDeleted?: boolean;
  customProperties: Record<string, any>;
  images: ProductImage[];
  status: ProductStatus;
  totalSales?: number;
  isEvent?: boolean;
  starting_date?: string;
  ending_date?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  shopId: string;
  Shop: Shop | null;
  eventId?: string;
  event?: Event;
}

export interface ProductImage {
  url: string;
  file_id: string;
}

export type ProductStatus = 'Active' | 'Pending' | 'Draft';

export interface ProductFilters {
  category?: string;
  subCategory?: string;
  status?: ProductStatus | '';
  priceRange?: [number, number];
  inStock?: boolean;
  onSale?: boolean;
  brand?: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

export interface ProductFormData {
  title: string;
  description: string;
  detailed_description: string;
  warranty?: string;
  custom_specifications?: Record<string, any>;
  tags: string[];
  cash_on_delivery?: boolean;
  brand?: string;
  video_url?: string;
  category: string;
  subCategory: string;
  colors: string[];
  sizes: string[];
  stock: number;
  sale_price?: number;
  regular_price: number;
  images: ProductImage[];
  status: ProductStatus;
  customProperties?: Record<string, any>;

  // SEO fields
  seoTitle?: string;
  seoDescription?: string;
  slug: string;
  focusKeywords?: string;

  // Inventory fields
  trackQuantity?: boolean;
  allowBackorders?: boolean;
  lowStockThreshold?: number;
  sku?: string;
  barcode?: string;
  stockStatus?: string;
  backorderMessage?: string;

  // Tax fields
  taxable?: boolean;
}

export interface ProductAnalytics {
  id: string;
  productId: string;
  shopId: string;
  views: number;
  cartAdds: number;
  wishlistAdds: number;
  purchases: number;
  lastViewedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPricing {
  id: string;
  productId: string;
  basePrice: number;
  discountedPrice?: number;
  discountAmount?: number;
  discountPercent?: number;
  discountSource?: string;
  sourceId?: string;
  sourceName?: string;
  validFrom: string;
  validUntil?: string;
  isActive: boolean;
  createdBy?: string;
  reason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  category: string;
  avatar?: ProductImage;
  coverBanner?: string;
  address: string;
  opening_hours?: string;
  website?: string;
  socialLinks: any[];
  ratings: number;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  banner_image?: ProductImage;
  event_type: string;
  discount_percent?: number;
  discount_type?: string;
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
}

export interface BulkUpdateData {
  ids: string[];
  updates: Partial<Product>;
}

export interface ProductSearchParams {
  search?: string;
  category?: string;
  subCategory?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  brand?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  aggregations?: {
    categories: Array<{ name: string; count: number }>;
    brands: Array<{ name: string; count: number }>;
    priceRange: { min: number; max: number };
  };
}
