
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Data fetching and utilities
import axiosInstance from '@/utils/axiosinstance';
import { ArtProduct } from '@/types/products'; 
import { formatPrice } from '@/lib/formatters';

// Reusable Components
import { Bounded } from '@/components/common/Bounded';
import { EventCountdown } from '@/components/products/EventCountdown';
import { ProductGalleryV2 } from '@/components/products/ProductGallaryV2';
import { StarRating } from '@/components/products/StarRating';
import { AddToCartForm } from '@/components/products/AddToCartForm';
import { ProductMeta } from '@/components/products/ProductMeta';
import { ProductDetailsTabs } from '@/components/products/ProductDetailsTabs';
import { ColorSelector, SizeSelector } from '@/components/products/Selector';
import WishlistButton from '@/components/products/WishlistButton';
import { DeliveryInfo } from '@/components/products/DeliveryInfo';




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
    <Bounded className="py-12 md:py-20 mt-4">
      {/* Conditionally render the countdown timer if it's part of an event */}
      {product.event && product.event.ending_date && (
        <EventCountdown endingDate={product.event.ending_date} />
      )}

      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16 mt-8">
        
        <ProductGalleryV2 
          productTitle={product.title} 
          images={validImages} 
          videoUrl={product.video_url} 
        />

        <div className="flex flex-col gap-6 text-primary">
          <div className='relative'>
            
            <div className='absolute top-0 right-0'>
              <WishlistButton product={product} productId={product.id}/>
            </div>
             <p className="text-sm font-medium text-primary/70">{product.category}</p>
             <h1 className="font-display text-4xl leading-tight md:text-5xl">
               {product.title}
             </h1>
             <Link href={`/artist/${product.Shop.id}`} className="text-lg text-primary/80 hover:text-accent transition-colors">
                by {product.Shop.name}
             </Link>
             {product.ratings && (
                <div className="mt-3 flex items-center gap-2">
                    <StarRating rating={product.ratings} />
                    <span className="text-sm text-primary/70">({product.totalSales} reviews)</span>
                </div>
             )}
          </div>

          <div className="flex items-baseline gap-4">
               <span className="text-4xl font-light text-amber-400">
                    {/* Use calculated pricing if available, otherwise fall back to the original logic */}
                    {formatPrice(product.pricing?.finalPrice ?? product.sale_price ?? product.regular_price)}
               </span>
               {(product.pricing?.discountInfo || product.sale_price) && (
                   <span className="text-2xl text-primary/50 line-through">
                       {formatPrice(product.pricing?.originalPrice ?? product.regular_price)}
                   </span>
               )}
               {product.pricing?.savings && product.pricing.savings > 0 && (
                   <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                       Save {formatPrice(product.pricing?.savings)}
                   </span>
               )}
          </div>
          
          <p className="text-primary/90 text-base leading-relaxed">
            {product.description}
          </p>

          {/* Add selectors for Size and Color */}
          {product.sizes && product.sizes.length > 0 && <SizeSelector sizes={product.sizes} />}
          {product.colors && product.colors.length > 0 && <ColorSelector colors={product.colors} />}

          <AddToCartForm stock={product.stock} />

          <DeliveryInfo product={product} />

          <ProductMeta product={product} />

        </div>
      </div>

      <div className="mt-20">
        <ProductDetailsTabs product={product} />
      </div>

      <div className="pt-24">
        {/* Placeholder for "Other Products" */}
        {/* <Suspense fallback={<div>Loading similar art...</div>}>
            <OtherProductsV2 promise={...} />
        </Suspense> */}
      </div>
    </Bounded>
  );
}

