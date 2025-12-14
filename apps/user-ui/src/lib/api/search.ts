import axiosInstance from '@/utils/axiosinstance';

// =============================================
// SEARCH API ENDPOINTS
// =============================================

/**
 * Live search (autocomplete) - Returns products, shops, and events
 * @param query - Search query string
 */
export const liveSearch = async (query: string) => {
  const res = await axiosInstance.get(`/product/api/search/live?q=${encodeURIComponent(query)}`);
  return res.data?.data || res.data;
};

/**
 * Full search with filters and pagination
 * @param params - Search parameters
 */
export interface FullSearchParams {
  q: string;
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'popularity' | 'discount';
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  inEvent?: boolean;
  shopId?: string;
}

export const fullSearch = async (params: FullSearchParams) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });

  const res = await axiosInstance.get(`/product/api/search?${searchParams.toString()}`);
  return res.data?.data || res.data;
};

/**
 * Search products only
 * @param query - Search query string
 * @param limit - Number of results to return
 */
export const searchProducts = async (query: string, limit: number = 10) => {
  const res = await axiosInstance.get(`/product/api/search/products?q=${encodeURIComponent(query)}&limit=${limit}`);
  return res.data?.data || res.data;
};

/**
 * Search events
 * @param params - Search parameters
 */
export interface SearchEventsParams {
  q: string;
  page?: number;
  limit?: number;
  eventType?: string;
}

export const searchEvents = async (params: SearchEventsParams) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });

  const res = await axiosInstance.get(`/product/api/search/events?${searchParams.toString()}`);
  return res.data?.data || res.data;
};

/**
 * Search shops
 * @param params - Search parameters
 */
export interface SearchShopsParams {
  q: string;
  page?: number;
  limit?: number;
  category?: string;
}

export const searchShops = async (params: SearchShopsParams) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });

  const res = await axiosInstance.get(`/product/api/search/shops?${searchParams.toString()}`);
  return res.data?.data || res.data;
};

/**
 * Get search suggestions/autocomplete
 * @param query - Search query string
 */
export const getSearchSuggestions = async (query: string) => {
  const res = await axiosInstance.get(`/product/api/search/suggestions?q=${encodeURIComponent(query)}`);
  return res.data?.data || res.data;
};

// =============================================
// TYPE DEFINITIONS
// =============================================

export interface SearchProduct {
  id: string;
  title: string;
  slug: string;
  images: { url: string }[];
  current_price: number;
  is_on_discount: boolean;
  category: string;
  ratings: number;
  Shop: {
    name: string;
    slug: string;
    avatar?: { url: string } | null;
  };
  event?: {
    title: string;
    event_type: string;
    ending_date: Date;
  } | null;
}

export interface SearchShop {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  category?: string;
  avatar?: { url: string } | null;
  coverBanner?: { url: string } | null;
  ratings: number;
  _count: {
    products: number;
    reviews: number;
  };
}

export interface SearchEvent {
  id: string;
  title: string;
  event_type: string;
  discount_percent?: number;
  banner_image?: { url: string } | null;
  ending_date: Date;
  shop: {
    name: string;
    slug: string;
  };
  _count: {
    products: number;
  };
}

export interface LiveSearchResults {
  products: SearchProduct[];
  shops: SearchShop[];
  events: SearchEvent[];
}

export interface FullSearchResults {
  products: SearchProduct[];
  facets: {
    categories: Array<{ category: string; _count: { id: number } }>;
    shops: Array<{
      shopId: string;
      _count: { id: number };
      shop?: SearchShop;
    }>;
    priceRange: {
      min: number;
      max: number;
    };
  };
  suggestions: string[];
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  searchQuery: string;
  appliedFilters: {
    category?: string;
    priceRange?: { min?: number; max?: number };
    onSale?: boolean;
    inEvent?: boolean;
    shopId?: string;
  };
}

export interface SearchSuggestion {
  type: 'product' | 'category' | 'shop' | 'popular';
  value: string;
  slug?: string;
  category?: string;
  image?: string | null;
  avatar?: string | null;
  count?: number;
}

export interface SearchSuggestionsResponse {
  suggestions: SearchSuggestion[];
  popular?: SearchSuggestion[];
  query?: string;
}

