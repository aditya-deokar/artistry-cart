'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Clock, TrendingUp } from 'lucide-react';
import { formatPrice } from '@/lib/formatters';
import { Button } from '../ui/button';

import { cn } from '@/lib/utils';
import { ArtProduct } from '@/types/products';
import { useStore } from '@/store';
import useAnalytics from '@/hooks/useAnalytics';
import WishlistButton from '../products/WishlistButton';

// Define framer-motion card variants with correct typing
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const useCountdown = (endDate?: string | null) => {
    if (!endDate) return null;
    return "Ends in 2d 5h";
}

export const ProductCard = ({ product }: { product: ArtProduct }) => {
  const { trackEvent } = useAnalytics();

  const primaryImage = product.images.find(img => img !== null);
  const isLimited = product.stock <= 5 && product.stock > 0;
  
  // Use event's ending_date if available, otherwise check for product's ending_date
  const eventEndDate = product.event?.ending_date || null;
  const timeleft = useCountdown(eventEndDate);

  // Select state slices from store
  const cartItems = useStore((state) => state.cart);

  // Select actions from the nested 'actions' object
  const { addToCart } = useStore((state) => state.actions);
  const handleAddToCart = () => {
    if (isInCart) {
      return;
    }

    addToCart({ ...product, quantity: 1 } as any);
    void trackEvent({
      action: 'add_to_cart',
      productId: product.id,
      shopId: product.Shop?.id,
      quantity: 1,
      source: 'user-ui.shop-product-card',
    });
  };

  // Check if product is in cart to control button behavior
  const isInCart = cartItems.some((item) => item.id === product.id);

  return (
   

    <motion.div variants={cardVariants} className="group relative flex flex-col cursor-pointer">
      {/* The background is solid light gray/dark for a studio shot look, sharp corners */}
      <div className={cn(
        "relative w-full aspect-square overflow-hidden bg-[#F5F5F5] dark:bg-[#1A1A1A]" 
      )}>
        {/* --- BADGES (Sharp white labels) --- */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
            <div className="bg-white dark:bg-black text-[var(--ac-charcoal)] dark:text-white text-[9px] font-bold px-2 py-1 tracking-widest uppercase shadow-sm">
                NEW
            </div>
            {timeleft && (
                <div className="bg-white dark:bg-black text-[var(--ac-charcoal)] dark:text-white text-[9px] font-bold px-2 py-1 tracking-widest uppercase shadow-sm flex items-center gap-1 mt-1">
                    <Clock size={10} />
                    60 DAYS
                </div>
            )}
        </div>
        
        {/* --- IMAGE --- */}
        <Link href={`/product/${product.slug}`}>
          {primaryImage && (
            <Image
              src={primaryImage.url}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
            />
          )}
        </Link>

        {/* --- HOVER BUTTONS (Updated background to be theme-aware) --- */}
        <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            
            <WishlistButton product={product} productId={product.id}/>
            <Button
            onClick={handleAddToCart}
            variant="outline" 
            size="icon" 
            className="bg-background rounded-full shadow-md hover:bg-background"
            disabled={product.stock <= 0 || isInCart}
            title={isInCart ? "Already in cart" : "Add to cart"}
            >
                <ShoppingCart size={18} />
            </Button>
        </div>
      </div>

      <div className="mt-4 text-left flex-grow flex flex-col">
        {/* --- SKU & TITLE (Minimal typography) --- */}
        <p className="text-[10px] text-[var(--ac-stone)] uppercase tracking-wider mb-1">
            {product.slug?.substring(0, 5) || 'ART12'}
        </p>
        
        <div className="flex justify-between items-start gap-2">
            <h3 className="font-sans text-[13px] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] tracking-wide group-hover:text-[var(--ac-gold)] transition-colors">
                <Link href={`/product/${product.slug}`}>
                    {product.title}
                </Link>
            </h3>
            
            {/* PRICE (Minimal) */}
            <div className="text-[13px] text-[var(--ac-stone)] font-medium">
                {formatPrice(product.pricing?.finalPrice || product.sale_price || product.regular_price)}
            </div>
        </div>
      </div>
    </motion.div>
     
  );
};
