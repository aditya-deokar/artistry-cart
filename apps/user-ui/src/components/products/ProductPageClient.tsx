'use client';

import Link from 'next/link';
import { ArtProduct, ImageInfo } from '@/types/products';
import { formatPrice } from '@/lib/formatters';
import { useStore } from '@/store';

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

type ProductPageClientProps = {
  product: ArtProduct;
  validImages: ImageInfo[];
};

export function ProductPageClient({ product, validImages }: ProductPageClientProps) {
  // Get cart and wishlist state
  const cartItems = useStore((state) => state.cart);
  const wishlistItems = useStore((state) => state.wishlist);

  const isInCart = cartItems.some((item) => item.id === product.id);
  const isWishlisted = wishlistItems.some((item) => item.id === product.id);

  // Check if product is part of an active event
  const hasActiveEvent = product.event && product.event.is_active && product.event.ending_date;
  const eventEndDate = hasActiveEvent && product.event ? new Date(product.event.ending_date) : null;
  const isEventActive = eventEndDate ? eventEndDate > new Date() : false;

  return (
    <Bounded className="py-12 md:py-20 mt-4">
      {/* Event Information Banner */}
      {hasActiveEvent && isEventActive && product.event && (
        <div className="mb-8">
          <EventCountdown endingDate={product.event.ending_date} />

          <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
            <div className="flex flex-wrap items-center gap-4">
              <Badge variant="secondary" className="gap-2">
                <Tag className="h-4 w-4" />
                {product.event.event_type}
              </Badge>

              {product.event.discount_percent && (
                <Badge variant="default" className="gap-2 bg-green-600">
                  <TrendingUp className="h-4 w-4" />
                  {product.event.discount_percent}% OFF
                </Badge>
              )}

              <div className="flex items-center gap-2 text-sm text-primary/80">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">{product.event.title}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Badges */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {isInCart && (
          <Badge variant="default" className="bg-amber-300/30 hover:bg-amber-400/80">
            In Your Cart
          </Badge>
        )}

        {isWishlisted && (
          <Badge variant="default" className="bg-amber-300/30 hover:bg-amber-400/80">
            In Your Wishlist
          </Badge>
        )}

        {product.is_on_discount && !hasActiveEvent && (
          <Badge variant="default" className="bg-orange-600 hover:bg-orange-700">
            On Sale
          </Badge>
        )}

        {product.stock && product.stock > 0 && product.stock < 10 && (
          <Badge variant="default" className="bg-yellow-600 hover:bg-yellow-700">
            ⚠️ Only {product.stock} Left!
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
        <ProductGalleryV2
          productTitle={product.title}
          images={validImages}
          videoUrl={product.video_url}
        />

        <div className="flex flex-col gap-6 text-primary">
          <div className="relative">
            <div className="absolute top-0 right-0">
              <WishlistButton product={product} productId={product.id} />
            </div>

            <p className="text-sm font-medium text-primary/70">{product.category}</p>
            <h1 className="font-display text-4xl leading-tight md:text-5xl">
              {product.title}
            </h1>

            {product.Shop ? (
              <Link
                href={`/artist/${product.Shop.id}`}
                className="text-lg text-primary/80 hover:text-accent transition-colors"
              >
                by {product.Shop.name}
              </Link>
            ) : (
              <span className="text-lg text-primary/80">
                by Unknown Artist
              </span>
            )}

            {product.ratings && (
              <div className="mt-3 flex items-center gap-2">
                <StarRating rating={product.ratings} />
                <span className="text-sm text-primary/70">
                  ({product.totalSales} {product.totalSales === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}
          </div>

          {/* Pricing Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-light text-amber-400">
                {formatPrice(product.pricing?.finalPrice ?? product.sale_price ?? product.regular_price)}
              </span>

              {(product.pricing?.discountInfo || product.sale_price) && (
                <span className="text-2xl text-primary/50 line-through">
                  {formatPrice(product.regular_price)}
                </span>
              )}
            </div>

            {/* {product.pricing?.savings && product.pricing.savings > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
                  💰 Save {formatPrice(product.pricing.savings)}
                </span>
                
                {product.pricing.discountInfo && (
                  <span className="text-xs text-primary/60">
                    ({Math.round((product.pricing.savings / product.pricing.originalPrice) * 100)}% off)
                  </span>
                )}
              </div>
            )} */}

            {/* Event Discount Info */}
            {hasActiveEvent && product.event && product.event.discount_percent && (
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                🎉 Special Event Price - Limited Time Only!
              </p>
            )}
          </div>

          <p className="text-primary/90 text-base leading-relaxed">
            {product.description}
          </p>

          {/* Selectors */}
          {product.sizes && product.sizes.length > 0 && (
            <SizeSelector sizes={product.sizes} />
          )}

          {product.colors && product.colors.length > 0 && (
            <ColorSelector colors={product.colors} />
          )}

          {/* Add to Cart Form */}
          <AddToCartForm
            product={product}
            isInCart={isInCart}
          />

          <DeliveryInfo product={product} />
          <ProductMeta product={product} />
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-20">
        <ProductDetailsTabs product={product} />
      </div>

      {/* Placeholder for Related Products */}
      <div className="pt-24">
        {/* <Suspense fallback={<div>Loading similar art...</div>}>
          <OtherProductsV2 promise={...} />
        </Suspense> */}
      </div>
    </Bounded>
  );
}
