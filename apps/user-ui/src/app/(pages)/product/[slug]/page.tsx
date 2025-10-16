
import { notFound } from 'next/navigation';

// Data fetching and utilities
import axiosInstance from '@/utils/axiosinstance';
import { ArtProduct } from '@/types/products';
import { ProductPageClient } from '@/components/products/ProductPageClient';

// Client Component





type ProductPageProps = {
  params: {
    slug: string;
  };
};


async function fetchProductDetails(slug: string): Promise<ArtProduct | null> {
  try {
    // Updated API endpoint based on the new route structure
    const response = await axiosInstance.get(`/product/api/product/${slug}`);
    // Updated data structure based on the new API response format
    return response.data.data.product;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

// Uncomment and update metadata function to work with new API response structure
// import type { Metadata } from 'next';
// 
// export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
//   const product = await fetchProductDetails(params?.slug);
//
//   if (!product) {
//     return { title: 'Product Not Found' };
//   }
//
//   const primaryImage = product.images?.find(img => img !== null);
//
//   return {
//     title: `${product.title} by ${product.Shop.name} | Artistry Cart`,
//     description: product.description,
//     openGraph: {
//       title: `${product.title} - Artistry Cart`,
//       description: product.description,
//       images: primaryImage ? [{ url: primaryImage.url, width: 1200, height: 630 }] : [],
//     },
//   };
// }

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProductDetails(slug);

  
  
  // const otherProducts = await getOtherProducts(params.slug);

  if (!product) {
    notFound();
  }

  const validImages = product.images.filter((img: any) => img !== null);

  return (
    <ProductPageClient product={product} validImages={validImages} />

  );
}

