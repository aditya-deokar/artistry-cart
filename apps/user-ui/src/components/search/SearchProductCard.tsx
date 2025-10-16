'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, Tag, TrendingUp, Clock, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/formatters';
import { useStore } from '@/store';
import useUser from '@/hooks/useUser';
import useLocationTracking from '@/hooks/useLocationTracking';
import useDeviceTracking from '@/hooks/useDeviceTracking';
import WishlistButton from '../products/WishlistButton';

interface SearchProductCardProps {
  product: {
    id: string;
    slug: string;
    title: string;
    images: { url: string }[];
    current_price: number;
    regular_price?: number;
    is_on_discount?: boolean;
    category?: string;
    ratings?: number;
    totalSales?: number;
    stock?: number;
    Shop?: {
      id?: string;
      name: string;
      slug: string;
      avatar?: { url: string } | null;
      ratings?: number;
    };
    event?: {
      title: string;
      event_type: string;
      ending_date: Date | string;
      discount_percent?: number;
    } | null;
  };
  layout?: 'grid' | 'list';
}

export const SearchProductCard: React.FC<SearchProductCardProps> = ({ 
  product, 
  layout = 'grid' 
}) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);

  // Store hooks
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const cartItems = useStore((state) => state.cart);
  const { addToCart } = useStore((state) => state.actions);

  // Check if product is in cart
  const isInCart = cartItems.some((item) => item.id === product.id);

  const discountPercent = product.is_on_discount && product.regular_price
    ? Math.round(((product.regular_price - product.current_price) / product.regular_price) * 100)
    : 0;

  const imageUrl = product.images?.[0]?.url || '/placeholder-product.jpg';
  const shopAvatar = product.Shop?.avatar?.url;

  // Handle add to cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInCart && product.stock && product.stock > 0) {
      addToCart(
        { 
          ...product, 
          quantity: 1,
          sale_price: product.current_price,
        } as any, 
        user, 
        location, 
        deviceInfo
      );
    }
  };

  // Calculate event time remaining
  const getTimeRemaining = () => {
    if (!product.event?.ending_date) return null;
    const end = new Date(product.event.ending_date);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff < 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d left`;
    if (hours > 0) return `${hours}h left`;
    return 'Ending soon';
  };

  const timeRemaining = getTimeRemaining();

  if (layout === 'list') {
    return (
      <div className="group bg-card border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-[240px]">
        <div className="flex flex-col sm:flex-row h-full">
          {/* Image Section */}
          <Link 
            href={`/product/${product.slug}`}
            className="relative w-full sm:w-64 h-48 sm:h-full flex-shrink-0 overflow-hidden bg-muted"
          >
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              className={cn(
                "object-cover transition-all duration-500 group-hover:scale-110",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 640px) 100vw, 256px"
            />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.is_on_discount && discountPercent > 0 && (
                <Badge className="bg-destructive text-destructive-foreground shadow-lg">
                  -{discountPercent}%
                </Badge>
              )}
              {product.event && (
                <Badge className="bg-primary text-primary-foreground shadow-lg">
                  {product.event.event_type}
                </Badge>
              )}
              {product.stock && product.stock < 10 && (
                <Badge variant="secondary" className="shadow-lg">
                  Only {product.stock} left
                </Badge>
              )}
            </div>

            {/* Wishlist */}
            <div className="absolute top-3 right-3">
              <WishlistButton 
                product={product as any} 
                productId={product.id}
              />
            </div>
          </Link>

          {/* Content Section */}
          <div className="flex-1 p-4 flex flex-col justify-between min-h-0">
            <div className="flex-1 min-h-0 overflow-hidden">
              {/* Category & Shop */}
              <div className="flex items-center justify-between mb-2">
                {product.category && (
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                )}
                {product.Shop && (
                  <Link
                    href={`/shops/${product.Shop.slug}`}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {shopAvatar ? (
                      <div className="relative h-6 w-6 rounded-full overflow-hidden border">
                        <Image src={shopAvatar} alt={product.Shop.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <Store className="h-4 w-4" />
                    )}
                    <span className="font-medium">{product.Shop.name}</span>
                  </Link>
                )}
              </div>

              {/* Title */}
              <Link href={`/product/${product.slug}`}>
                <h3 className="text-base font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
              </Link>

              {/* Rating & Sales */}
              <div className="flex items-center gap-3 mb-2 text-sm">
                {product.ratings !== undefined && product.ratings > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{product.ratings.toFixed(1)}</span>
                  </div>
                )}
                {product.totalSales !== undefined && product.totalSales > 0 && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>{product.totalSales} sold</span>
                  </div>
                )}
              </div>

              {/* Event Info */}
              {product.event && timeRemaining && (
                <div className="flex items-center gap-2 text-xs text-primary mb-2 bg-primary/10 rounded-lg px-2 py-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="font-medium truncate">{timeRemaining}</span>
                </div>
              )}
            </div>

            {/* Price & Actions */}
            <div className="flex items-center justify-between mt-auto pt-3 border-t">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(product.current_price)}
                  </span>
                  {product.is_on_discount && product.regular_price && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(product.regular_price)}
                    </span>
                  )}
                </div>
              </div>
              
              <Button 
                size="sm" 
                className="gap-2 h-8"
                onClick={handleAddToCart}
                disabled={!product.stock || product.stock <= 0 || isInCart}
                title={isInCart ? "Already in cart" : "Add to cart"}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{isInCart ? "In Cart" : "Add"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid Layout (Default)
  return (
    <div className="group bg-card border rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-[520px]">
      {/* Image Container */}
      <Link href={`/product/${product.slug}`} className="relative block h-[280px] overflow-hidden bg-muted flex-shrink-0">
        <Image
          src={imageUrl}
          alt={product.title}
          fill
          className={cn(
            "object-cover transition-all duration-500 group-hover:scale-110",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.is_on_discount && discountPercent > 0 && (
            <Badge className="bg-destructive text-destructive-foreground shadow-lg backdrop-blur-sm">
              <Tag className="h-3 w-3 mr-1" />
              -{discountPercent}%
            </Badge>
          )}
          {product.event && (
            <Badge className="bg-primary text-primary-foreground shadow-lg backdrop-blur-sm">
              {product.event.event_type}
            </Badge>
          )}
        </div>

        {/* Stock Badge */}
        {product.stock && product.stock < 10 && (
          <Badge variant="secondary" className="absolute top-3 right-3 shadow-lg backdrop-blur-sm">
            {product.stock} left
          </Badge>
        )}

        {/* Wishlist Button */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <WishlistButton 
            product={product as any} 
            productId={product.id}
          />
        </div>

        {/* Quick Add to Cart Button */}
        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <Button 
            size="sm" 
            variant="secondary" 
            className="backdrop-blur-sm shadow-lg gap-2"
            onClick={handleAddToCart}
            disabled={!product.stock || product.stock <= 0 || isInCart}
          >
            <ShoppingCart className="h-4 w-4" />
            {isInCart ? "In Cart" : "Add"}
          </Button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 min-h-0">
        {/* Shop Info */}
        {product.Shop && (
          <Link
            href={`/shops/${product.Shop.slug}`}
            className="flex items-center gap-2 mb-2 text-xs text-muted-foreground hover:text-primary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {shopAvatar ? (
              <div className="relative h-5 w-5 rounded-full overflow-hidden border">
                <Image src={shopAvatar} alt={product.Shop.name} fill className="object-cover" />
              </div>
            ) : (
              <Store className="h-4 w-4" />
            )}
            <span className="font-medium truncate">{product.Shop.name}</span>
            {product.Shop.ratings && product.Shop.ratings > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{product.Shop.ratings.toFixed(1)}</span>
              </div>
            )}
          </Link>
        )}

        {/* Category */}
        {product.category && (
          <Badge variant="outline" className="text-xs mb-2">
            {product.category}
          </Badge>
        )}

        {/* Title */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-tight h-10">
            {product.title}
          </h3>
        </Link>

        {/* Rating & Sales */}
        <div className="flex items-center gap-3 mb-2 text-sm">
          {product.ratings !== undefined && product.ratings > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{product.ratings.toFixed(1)}</span>
            </div>
          )}
          {product.totalSales !== undefined && product.totalSales > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-xs">{product.totalSales}</span>
            </div>
          )}
        </div>

        {/* Event Timer */}
        {product.event && timeRemaining && (
          <div className="flex items-center gap-2 text-xs text-primary mb-2 bg-primary/10 rounded-lg px-2 py-1">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-medium truncate">{timeRemaining}</span>
          </div>
        )}

        {/* Spacer to push price and button to bottom */}
        <div className="flex-1"></div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold text-primary">
            {formatPrice(product.current_price)}
          </span>
          {product.is_on_discount && product.regular_price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.regular_price)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button 
          size="sm" 
          className="w-full gap-2 group-hover:shadow-lg transition-shadow h-9"
          onClick={handleAddToCart}
          disabled={!product.stock || product.stock <= 0 || isInCart}
          title={isInCart ? "Already in cart" : "Add to cart"}
        >
          <ShoppingCart className="h-4 w-4" />
          {isInCart ? "In Cart" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
};
