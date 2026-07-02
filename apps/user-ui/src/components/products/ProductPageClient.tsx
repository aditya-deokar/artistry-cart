'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArtProduct, ImageInfo } from '@/types/products';
import { formatPrice } from '@/lib/formatters';
import { useStore } from '@/store';
import useAnalytics from '@/hooks/useAnalytics';

// Components
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
import { Badge } from '@/components/ui/badge';
import { Calendar, Tag, TrendingUp } from 'lucide-react';
import { RecommendedProducts } from './RecommendedProducts';


type ProductPageClientProps = {
  product: ArtProduct;
  validImages: ImageInfo[];
};

export function ProductPageClient({ product, validImages }: ProductPageClientProps) {
  // Get cart and wishlist state
  const cartItems = useStore((state) => state.cart);
  const wishlistItems = useStore((state) => state.wishlist);
  const { trackEventOnce } = useAnalytics();

  const isInCart = cartItems.some((item) => item.id === product.id);
  const isWishlisted = wishlistItems.some((item) => item.id === product.id);

  // Check if product is part of an active event
  const hasActiveEvent = product.event && product.event.is_active && product.event.ending_date;
  const eventEndDate = hasActiveEvent && product.event ? new Date(product.event.ending_date) : null;
  const isEventActive = eventEndDate ? eventEndDate > new Date() : false;

  useEffect(() => {
    if (!product.id) {
      return;
    }

    void trackEventOnce({
      dedupeKey: `product_view:${product.id}`,
      action: 'product_view',
      productId: product.id,
      shopId: product.Shop?.id,
      source: 'user-ui.product-page',
    });
  }, [product.id, product.Shop?.id, trackEventOnce]);

  return (
    <main className="w-full min-h-screen bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] pb-24 pt-[128px]">
      {/* Event Information Banner */}
      {hasActiveEvent && isEventActive && product.event && (
        <div className="w-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-purple-500/20 py-2">
            <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between text-sm">
                <div className="flex gap-4">
                  <span className="font-bold text-purple-700 dark:text-purple-300">{product.event.title}</span>
                  {product.event.discount_percent && <span className="bg-green-600 text-white px-2 py-0.5 text-xs uppercase tracking-widest">{product.event.discount_percent}% OFF</span>}
                </div>
                <EventCountdown endingDate={product.event.ending_date} />
            </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row w-full relative">
        
        {/* Left Column - Image (60%) */}
        <div className="lg:w-[55%] xl:w-[60%] bg-[#F9F9F9] dark:bg-[#1A1A1A] relative border-r border-[var(--ac-linen)] dark:border-white/5">
           <div className="sticky top-[128px] h-[calc(100vh-128px)] flex items-center justify-center p-8 lg:p-20">
           <div className="absolute top-8 left-8 z-10 flex flex-col gap-2">
              <div className="bg-white dark:bg-black text-[var(--ac-charcoal)] dark:text-white text-[10px] font-bold px-3 py-1.5 tracking-widest uppercase shadow-sm border border-gray-100 dark:border-white/10">NEW</div>
              {product.is_on_discount && !hasActiveEvent && (
                <div className="bg-orange-600 text-white text-[10px] font-bold px-3 py-1.5 tracking-widest uppercase shadow-sm">SALE</div>
              )}
           </div>
           
           <div className="relative w-full max-w-[800px] aspect-square flex items-center justify-center">
              {validImages.length > 0 ? (
                  <Image 
                    src={validImages[0].url} 
                    alt={product.title} 
                    fill 
                    className="object-contain" 
                    priority
                  />
              ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400">No Image Available</div>
              )}
           </div>
           </div>
        </div>

        {/* Right Column - Details (40%) */}
        <div className="lg:w-[45%] xl:w-[40%] px-6 py-12 lg:px-16 lg:py-24 flex flex-col justify-start">
           
           {/* Breadcrumbs */}
           <div className="flex items-center text-xs text-[var(--ac-stone)] tracking-wider mb-8 uppercase gap-2">
              <Link href="/" className="hover:text-[var(--ac-charcoal)] dark:hover:text-white transition-colors">Home</Link> <span>/</span> 
              <Link href="/product" className="hover:text-[var(--ac-charcoal)] dark:hover:text-white transition-colors">Shop</Link> <span>/</span> 
              <span className="text-[var(--ac-charcoal)] dark:text-white">{product.category || 'Art'}</span>
           </div>

           {/* Title & Wishlist */}
           <div className="flex justify-between items-start mb-6">
              <h1 className="font-sans text-4xl lg:text-[42px] leading-tight text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] tracking-wide pr-8">
                 {product.title}
              </h1>
              <div className="mt-2 text-[var(--ac-stone)] hover:text-red-500 transition-colors">
                  <WishlistButton product={product} productId={product.id} />
              </div>
           </div>

           {/* Metadata Row */}
           <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-[var(--ac-stone)] uppercase tracking-widest mb-8 border-b border-[var(--ac-linen)] dark:border-white/10 pb-6">
               <span>Availability: <span className="text-[var(--ac-charcoal)] dark:text-white">{product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}</span></span>
               <span className="text-gray-300 dark:text-gray-700">|</span>
               <span>SKU: <span className="text-[var(--ac-charcoal)] dark:text-white">{product.slug?.substring(0,6).toUpperCase() || 'ART123'}</span></span>
           </div>

           {/* Description */}
           <p className="text-[13px] leading-relaxed text-[var(--ac-stone)] mb-8">
               {product.description}
           </p>

           {/* Selectors */}
           <div className="mb-8 space-y-4">
              {product.sizes && product.sizes.length > 0 && (
                <SizeSelector sizes={product.sizes} />
              )}
              {product.colors && product.colors.length > 0 && (
                <ColorSelector colors={product.colors} />
              )}
           </div>

           {/* Price */}
           <div className="mb-10 flex items-center gap-4">
               <span className="text-lg text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                   {formatPrice(product.pricing?.finalPrice ?? product.sale_price ?? product.regular_price)}
               </span>
               {(product.pricing?.discountInfo || product.sale_price) && (
                 <span className="text-sm text-gray-400 line-through">
                   {formatPrice(product.regular_price)}
                 </span>
               )}
           </div>

           {/* Notify / Cart Box */}
           {product.stock <= 0 ? (
               <div className="bg-[#F9F9F9] dark:bg-[#1A1A1A] p-6 mb-6 text-[13px] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                   <p className="mb-2 uppercase tracking-widest font-semibold">Currently Out of Stock</p>
                   <p className="text-[var(--ac-stone)]">You can still add it to your cart to reserve it now, or sign up to receive alerts when it is back in stock.</p>
               </div>
           ) : null}

           {/* Add to Cart Form */}
           <AddToCartForm product={product} isInCart={isInCart} />

           {/* Extra Details */}
           <div className="mt-12 space-y-6 pt-12 border-t border-[var(--ac-linen)] dark:border-white/10">
               <DeliveryInfo product={product} />
               <ProductMeta product={product} />
           </div>
        </div>
      </div>

      {/* Product Details Tabs & Recommended */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-16 mt-20">
          <ProductDetailsTabs product={product} />
      </div>
      
      <div className="max-w-[1600px] mx-auto px-6 lg:px-16 mt-16 pt-16 border-t border-[var(--ac-linen)] dark:border-white/10">
          <RecommendedProducts variant="grid" title="You Might Also Like" />
      </div>
    </main>
  );
}
