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
import useUser from '@/hooks/useUser';
import useLocationTracking from '@/hooks/useLocationTracking';
import useDeviceTracking from '@/hooks/useDeviceTracking';
import WishlistButton from '../products/WishlistButton';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const useCountdown = (endDate?: string | null) => {
    if (!endDate) return null;
    return "Ends in 2d 5h";
}

export const ProductCard = ({ product }: { product: ArtProduct }) => {

  const { user }=useUser();
  const  location= useLocationTracking();
  const deviceInfo = useDeviceTracking();


  const primaryImage = product.images.find(img => img !== null);
  const isLimited = product.stock <= 5 && product.stock > 0;
  const timeleft = useCountdown(product.ending_date);

  // Select state slices
  const wishlistItems = useStore((state) => state.wishlist);
  const cartItems = useStore((state) => state.cart);

  // Select actions from the nested 'actions' object
  const { addToCart } = useStore((state) => state.actions);

  
  const isWishlisted = wishlistItems.some((item:any)=> item.id == product.id );
  const isInCart = cartItems.some((item:any)=> item.id == product.id );

  return (
   

    <motion.div variants={cardVariants} className="group relative flex flex-col">
      {/* The background is now semantically colored */}
      <div className={cn(
        "relative w-full aspect-[4/5] overflow-hidden rounded-lg",
        "bg-muted" // Use `bg-muted` for a neutral placeholder color in both themes
      )}>
        {/* --- BADGES (No changes needed, these are brand/status colors) --- */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {product.isEvent && <div className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">OFFER</div>}
            {isLimited && <div className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">Limited</div>}
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
            onClick={()=> !isInCart && addToCart({...product, quantity:1 }, user, location, deviceInfo)}
            variant="outline" size="icon" className="bg-background rounded-full shadow-md hover:bg-background">
                <ShoppingCart size={18} />
            </Button>
        </div>
      </div>

      <div className="mt-4 text-left flex-grow flex flex-col">
        {/* --- TITLE & ARTIST (Updated text colors to be semantic) --- */}
        <h3 className="font-display text-lg text-foreground relative w-fit">
          <Link href={`/product/${product.slug}`}>
            {product.title}
            <span className="absolute bottom-[-2px] left-0 h-[2px] w-0 bg-amber-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground mt-1 hover:text-amber-800 transition-colors">
            by <Link href={`/artist/${product?.Shop?.id}`}>{product?.Shop?.name}</Link>
        </p>
        
        <div className="flex-grow" />

        {/* --- DYNAMIC INFO (Updated text colors) --- */}
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            {product.totalSales && product.totalSales > 0 && (
                <div className="flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-green-600"/>
                    <span>{product.totalSales > 1 ? `${product.totalSales} sold` : 'Best Seller'}</span>
                </div>
            )}
            {product.isEvent && timeleft && (
                <div className="flex items-center gap-1.5">
                    <Clock size={14}/>
                    <span>{timeleft}</span>
                </div>
            )}
        </div>

        {/* --- PRICE (Updated old price color) --- */}
        <div className="flex items-baseline gap-2 mt-2">
            <p className="font-semibold text-base text-amber-600">{formatPrice(product.sale_price)}</p>
            {product?.sale_price! < product.regular_price && 
                <p className="text-sm text-muted-foreground line-through">{formatPrice(product.regular_price)}</p>
            }
        </div>
      </div>
    </motion.div>
     
  );
};