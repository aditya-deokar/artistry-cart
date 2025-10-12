// Type for the nested Shop/Artist information
export type ShopInfo = {
  id: string;
  name: string;
  bio?: string;
  slug?:string;
  // Add any other shop details you might need
};

// Type for a single image object
export type ImageInfo = {
  file_id: string;
  url: string;
};

// Type for a single custom specification entry
export type CustomSpecification = {
  name: string;
  value: string;
};

// The main, comprehensive ArtProduct type
export type ArtProduct = {
  id: string;
  title: string;
  slug: string;
  description: string;
  detailed_description: string;
  tags: string[];
  category: string;
  subCategory: string;
  stock: number;
  sale_price: number | null; // Can be null
  regular_price: number;
  current_price?: number; // Cached current effective price
  is_on_discount?: boolean; // Whether the product is on discount
  
  // Dynamic pricing calculation from API
  pricing?: {
    productId: string;
    originalPrice: number;
    finalPrice: number;
    discountInfo?: any; // Details about the discount
    savings: number;
  };
  
  // New & Optional Fields from your JSON
  warranty?: string | null;
  brand?: string | null;
  ratings?: number;
  totalSales?: number;
  video_url?: string | null;
  cash_on_delivery?: boolean;
  colors?: string[];
  sizes?: string[];

  // Event relation (updated structure)
  eventId?: string | null;
  event?: {
    id: string;
    title: string;
    event_type: string;
    discount_percent?: number;
    starting_date: string;
    ending_date: string;
    is_active: boolean;
  };

  // Nested JSON and relations
  images: ImageInfo[];
  custom_specifications: CustomSpecification[];
  Shop: ShopInfo; 
}