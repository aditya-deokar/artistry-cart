// src/lib/data.ts

import { ArtProduct } from "@/types/products";

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





export const products = [
  {
    id: "68971f1417662b51011f7952",
    title: "Terracotta Dancing Diva",
    description:
      "An elegant terracotta figurine depicting a classical dancer in a graceful pose. Hand-molded and baked by artisans from Panchmura village, known for its terracotta craft.",
    detailed_description: `Experience the earthy elegance of Bankura's terracotta craft with this Dancing Diva figurine. Every curve and expression is shaped by hand, reflecting a rich cultural heritage. After shaping, the idol is sun-dried and baked in a traditional kiln, giving it its iconic reddish-brown hue and durable finish.`,
    warranty: "6 months",
    custom_specifications: [
      { name: "label", value: "techniquic" },
      { name: "size", value: "30cm" },
    ],
    slug: "terracotta-dancing-diva",
    tags: ["terracotta", "clay", "handmade", "figurine", "dancer"],
    cash_on_delivery: true,
    brand: "Panchmura Potteries",
    video_url: "https://youtu.be/_1P0Uqk50Ps",
    category: "Paintings",
    subCategory: "Acrylic Painting",
    colors: ["#FF6F61", "#F5F5F5"],
    sizes: ["XS", "S", "M"],
    discountCodes: "688a49a1adab1b4e7b8dc7d6",
    stock: 20,
    sale_price: 5000,
    regular_price: 6000,
    ratings: 5,
    images: [
      {
        file_id: "68971e065c7cd75eb8cd37e8",
        url: "https://ik.imagekit.io/adityadeokar/products/product-1754734084736_V37H8H7E6.jpg",
      },
      {
        file_id: "68971e0f5c7cd75eb8cd8ad1",
        url: "https://ik.imagekit.io/adityadeokar/products/product-1754734093736_qlZ2Y-zbB.jpg",
      },
    ],
    status: "Active",
    Shop: {
      id: "6881cc1c089195fea5a29fe9",
      name: "Saivijay Art",
      slug: "saivijay-art",
      bio: "art related products",
      address: "rui, shirdi",
      website: "https://aditya.com",
    },
  },
  {
    id: "68971d2017662b51011f7950",
    title: "Classic Teak Bullock Cart",
    description:
      "A beautifully handcrafted miniature bullock cart, carved from a single block of aged teak wood. A perfect centerpiece representing traditional Indian village life.",
    detailed_description: `This exquisite Teak Wood Bullock Cart is a testament to the timeless skill of rural artisans. Each detail, from the spoked wheels to the yoke, is meticulously carved by hand. The model is polished with natural oils to protect the wood and bring out its rich, warm grain.`,
    warranty: "2 years",
    custom_specifications: [
      { name: "Length", value: "45cm" },
      { name: "Height", value: "20cm" },
      { name: "Weight", value: "2.5kg" },
    ],
    slug: "classic-teak-bullock-cart",
    tags: ["wood", "handmade", "traditional", "decor", "miniature"],
    cash_on_delivery: true,
    brand: "Rural Artisans Collective",
    video_url: "https://youtu.be/example_video_1",
    category: "Handmade Crafts",
    subCategory: "Hand-cut Paper Crafts",
    colors: ["#8B4513"],
    sizes: ["S", "M"],
    discountCodes: "688a49a1adab1b4e7b8dc7d7",
    stock: 15,
    sale_price: 6800,
    regular_price: 7500,
    ratings: 5,
    images: [
      {
        file_id: "688f27015c7cd75eb83d5dfc",
        url: "https://images.unsplash.com/photo-1579541513287-3f17a5d8d62c?q=80&w=752&auto=format&fit=crop",
      },
      {
        file_id: "688f27015c7cd75eb83dsdfx",
        url: "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=735&auto=format&fit=crop",
      },
    ],
    status: "Active",
    Shop: {
      id: "6881cc1c089195fea5a29fe9",
      name: "Saivijay Art",
      slug: "saivijay-art",
      bio: "art related products",
      address: "rui, shirdi",
      website: "https://aditya.com",
    },
  },
];


export const getProductBySlug = (slug: string): ArtProduct | undefined => {
  return products.find((p) => p.slug === slug);
};

export const getOtherProducts = (slug: string): ArtProduct[] => {
    return products.filter((p) => p.slug !== slug);
}



