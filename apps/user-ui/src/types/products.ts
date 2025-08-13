// src/types/product.ts

// Type for the nested Shop/Artist information
export type ShopInfo = {
  id: string;
  name: string;
  // You can add more artist details here later, like an avatar
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
  description: string;
  detailed_description: string;
  slug: string;
  tags: string[];
  category: string;
  subCategory: string;
  stock: number;
  sale_price: number;
  regular_price: number;
  
  // Optional & Relational Fields
  warranty?: string | null;
  brand?: string | null; // This is the artist/brand name
  ratings?: number;
  totalSales?: number | null;

  // Event-specific fields
  isEvent?: boolean | null;
  starting_date?: string | null; // Dates from JSON are strings
  ending_date?: string | null;

  // Nested JSON and relations
  images: ImageInfo[];
  custom_specifications: CustomSpecification[];
  Shop: ShopInfo; // The related artist/shop

  quantity?: number
};

// Type for the API response which includes pagination
export type ProductAPIResponse = {
  products: ArtProduct[];
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
};