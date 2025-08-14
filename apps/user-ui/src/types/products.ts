// Type for the nested Shop/Artist information
export type ShopInfo = {
  id: string;
  name: string;
  bio?: string;
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
  
  // New & Optional Fields from your JSON
  warranty?: string | null;
  brand?: string | null;
  ratings?: number;
  totalSales?: number;
  video_url?: string | null;
  cash_on_delivery?: boolean;
  colors?: string[];
  sizes?: string[];

  // Event-specific fields
  isEvent?: boolean;
  starting_date?: string | null;
  ending_date?: string | null;

  // Nested JSON and relations
  images: ImageInfo[];
  custom_specifications: CustomSpecification[];
  Shop: ShopInfo; 
}