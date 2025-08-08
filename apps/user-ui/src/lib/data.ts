// src/lib/data.ts

export type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  price: number;
  scentProfile: 'spicy' | 'woody' | 'fresh';
  mood: 'bold' | 'grounded' | 'refreshing';
  featureImage: {
    url: string;
    alt: string;
  };
  bottleImage: {
    url: string;
    alt: string;
  };
};

export const products: Product[] = [
  {
    id: '1',
    slug: 'terra-canvas',
    title: 'Terra Canvas',
    description: 'An earthy and robust scent that captures the essence of a forest floor.',
    longDescription:
      'Discover Terra Canvas, an eau de parfum that grounds you in the rich, complex aromas of the natural world. With top notes of bergamot and heart notes of cedarwood, it settles into a warm, amber finish.',
    price: 120,
    scentProfile: 'woody',
    mood: 'grounded',
    featureImage: {
      url: '/images/placeholder-product-feature-1.jpg',
      alt: 'Artistic depiction of earthy tones and textures.',
    },
    bottleImage: {
      url: '/images/placeholder-bottle-1.png',
      alt: 'A bottle of Terra Canvas fragrance.',
    },
  },
  {
    id: '2',
    slug: 'aqua-hue',
    title: 'Aqua Hue',
    description: 'A fresh and invigorating aroma reminiscent of a cool ocean breeze.',
    longDescription:
      'Aqua Hue is a vibrant eau de parfum that evokes the crispness of sea salt and the zest of citrus. It’s a refreshing journey for the senses, perfect for the modern creator.',
    price: 110,
    scentProfile: 'fresh',
    mood: 'refreshing',
    featureImage: {
      url: '/images/placeholder-product-feature-2.jpg',
      alt: 'Abstract art with cool blue and white waves.',
    },
    bottleImage: {
      url: '/images/placeholder-bottle-2.png',
      alt: 'A bottle of Aqua Hue fragrance.',
    },
  },
  // Add more products as needed
];

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find((p) => p.slug === slug);
};

export const getOtherProducts = (slug: string): Product[] => {
    return products.filter((p) => p.slug !== slug);
}