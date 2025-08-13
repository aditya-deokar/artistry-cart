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

export const products1: Product[] = [
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



export const products = [
  // Product 1: Handcrafted Wooden Bullock Cart
  {
    "title": "Classic Teak Bullock Cart",
    "description": "A beautifully handcrafted miniature bullock cart, carved from a single block of aged teak wood. A perfect centerpiece representing traditional Indian village life.",
    "tags": "wood, handmade, traditional, decor, miniature",
    "warranty": "2 years",
    "slug": "classic-teak-bullock-cart",
    "brand": "Rural Artisans Collective",
    "video_url": "https://youtu.be/example_video_1",
    "regular_price": 7500,
    "sale_price": 6800,
    "stocks": 15,
    "colors": [
        "#8B4513" // SaddleBrown
    ],
    "customProperties": [
        {
            "label": "Wood Type",
            "values": [
                "Aged Teak"
            ]
        },
        {
            "label": "Finish",
            "values": [
                "Natural Oil Polish"
            ]
        }
    ],
    "cashOnDelivery": true,
    "subcategory": "Wooden Sculptures",
    "detailed_desc": "<p>This exquisite <strong>Teak Wood Bullock Cart</strong> is a testament to the timeless skill of rural artisans. Each detail, from the spoked wheels to the yoke, is meticulously carved by hand. The model is polished with natural oils to protect the wood and bring out its rich, warm grain. It serves as a stunning decorative piece that brings a touch of rustic charm and heritage to any home or office space. The piece is durable and designed to be a cherished collectible for years to come.</p>",
    "selectedSizes": [
        "Medium"
    ],
    "custom_specifications": [
        {
            "name": "Length",
            "value": "45cm"
        },
        {
            "name": "Height",
            "value": "20cm"
        },
        {
            "name": "Weight",
            "value": "2.5kg"
        }
    ],
    "category": "Handmade Crafts",
    "discounts": "688a49a1adab1b4e7b8dc7d7", // Example ID
    "image": [
        {
            "file_id": "688f27015c7cd75eb83d5dfc",
            "url": "https://images.unsplash.com/photo-1579541513287-3f17a5d8d62c?q=80&w=752&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            "file_id": "688f27015c7cd75eb83d5dfc",
            "url": "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        
    ]
  },

  // Product 2: Majestic Wooden Horse
  {
    "title": "Majestic Sheesham Horse",
    "description": "A dynamic, hand-carved wooden horse statue made from premium Sheesham wood (Indian Rosewood). Its polished finish and elegant form capture a sense of motion and strength.",
    "tags": "wood, horse, sculpture, handmade, carving",
    "warranty": "1 year",
    "slug": "majestic-sheesham-horse",
    "brand": "Jaipur Carvers Guild",
    "video_url": "https://youtu.be/example_video_2",
    "regular_price": 9200,
    "sale_price": 8500,
    "stocks": 8,
    "colors": [
        "#654321" // Dark Brown
    ],
    "customProperties": [
        {
            "label": "Art Form",
            "values": [
                "Rajasthani Wood Carving"
            ]
        }
    ],
    "cashOnDelivery": true,
    "subcategory": "Wooden Sculptures",
    "detailed_desc": "<p>Capture the spirit of royalty with this <strong>Majestic Sheesham Horse</strong>. Carved by master artisans from the Jaipur Carvers Guild, this piece embodies grace and power. The natural dual-tone grain of the Sheesham wood is highlighted by a meticulous hand-polishing process. Ideal for display on a mantlepiece or as a significant feature in a study, this sculpture is a symbol of success and forward momentum, making it a perfect gift or a personal treasure.</p>",
    "selectedSizes": [
        "Large"
    ],
    "custom_specifications": [
        {
            "name": "Height",
            "value": "55cm"
        },
        {
            "name": "Material",
            "value": "Sheesham Wood"
        }
    ],
    "category": "Handmade Crafts",
    "discounts": "688a49a1adab1b4e7b8dc7d8", // Example ID
    "image": [
        {
            "file_id": "68w447015c7cd75eb83d5dfd",
            "url": "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            "file_id": "68w447015c7cd75eb83d5dfd",
            "url": "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        
    ]
  },

  // Product 3: Terracotta Dancer Figurine
  {
    "title": "Terracotta Dancing Diva",
    "description": "An elegant terracotta figurine depicting a classical dancer in a graceful pose. Hand-molded and baked by artisans from Panchmura village, known for its terracotta craft.",
    "tags": "terracotta, clay, handmade, figurine, dancer",
    "warranty": "6 months",
    "slug": "terracotta-dancing-diva",
    "brand": "Panchmura Potteries",
    "video_url": "https://youtu.be/example_video_3",
    "regular_price": 3200,
    "sale_price": 2999,
    "stocks": 30,
    "colors": [
        "#E2725B" // Terracotta
    ],
    "customProperties": [
        {
            "label": "Technique",
            "values": [
                "Hand-molded",
                "Kiln-baked"
            ]
        }
    ],
    "cashOnDelivery": true,
    "subcategory": "Clay & Pottery",
    "detailed_desc": "<p>Experience the earthy elegance of Bankura's terracotta craft with this <strong>Dancing Diva figurine</strong>. Every curve and expression is shaped by hand, reflecting a rich cultural heritage. After shaping, the idol is sun-dried and baked in a traditional kiln, giving it its iconic reddish-brown hue and durable finish. This piece brings a touch of rustic sophistication and artistic tradition to your decor. As it is handmade, slight variations in color and form are natural, making each piece unique.</p>",
    "selectedSizes": [
        "Small",
        "Medium"
    ],
    "custom_specifications": [
        {
            "name": "Height",
            "value": "30cm"
        },
        {
            "name": "Base Diameter",
            "value": "12cm"
        }
    ],
    "category": "Handmade Crafts",
    "discounts": null,
    "image": [
        {
            "file_id": "688f27012c7cd75eb83d5dfe",
            "url": "https://plus.unsplash.com/premium_photo-1676668708126-39b12a0e9d96?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            "file_id": "688f27015c7cd45eb83d5dfe",
            "url": "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        
    ]
  },

 
]

export const getProductBySlug = (slug: string): ArtProduct | undefined => {
  return products.find((p) => p.slug === slug);
};

export const getOtherProducts = (slug: string): ArtProduct[] => {
    return products.filter((p) => p.slug !== slug);
}



