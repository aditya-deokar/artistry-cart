'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';

import { formatPrice } from '@/lib/formatters';
import { Button } from '../ui/button';

import { cn } from '@/lib/utils';
import { type ArtProduct } from '@/types/products';

type WishlistItemProps = {
  product: ArtProduct;
  onRemove: (productId: string) => void;
  onMoveToCart: (product: ArtProduct) => void; 
};


export const WishlistItem = ({ product, onRemove, onMoveToCart }: WishlistItemProps) => {
  const primaryImage = product.images.find(img => img !== null);
  const isInStock = product.stock > 0;
  const isLimited = product.stock <= 5 && isInStock;

  
  const getStockInfo = () => {
    if (isLimited) return { text: "Limited Stock", className: "text-amber-600" };
    if (isInStock) return { text: "In Stock", className: "text-green-600" };
    return { text: "Out of Stock", className: "text-red-500" };
  };
  const stockInfo = getStockInfo();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="grid grid-cols-12 items-center gap-4 sm:gap-6 p-4 border border-border bg-card"
    >
      {/* --- Column 1: Image (Spans 3 columns) --- */}
      <Link href={`/product/${product.slug}`} className="col-span-3 md:col-span-2">
        <div className="aspect-square relative rounded-md overflow-hidden bg-muted group">
          {primaryImage ? (
            <Image 
              src={primaryImage.url} 
              alt={product.title} 
              fill 
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted"></div>
          )}
        </div>
      </Link>

      {/* --- Column 2: Product Details (Spans 5 columns) --- */}
      <div className="col-span-9 md:col-span-5 flex flex-col h-full">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-wide text-foreground hover:text-primary transition-colors">
            <Link href={`/product/${product.slug}`}>{product.title}</Link>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            by <Link href={`/shop/${product.Shop.id}`} className="hover:text-primary transition-colors">{product.Shop.name}</Link>
          </p>
        </div>

        <div className="flex-grow" /> {/* Spacer */}

        <div>
          <p className="text-lg font-medium text-foreground mt-2">{formatPrice(product.sale_price)}</p>
          <div className={cn("text-xs font-semibold mt-1", stockInfo.className)}>
            {stockInfo.text}
          </div>
        </div>
      </div>

      {/* --- Column 3: Actions (Spans 4 columns) --- */}
      <div className="col-span-12 md:col-span-5 flex flex-col md:items-end gap-2 w-full">
        <Button 
            onClick={() => onMoveToCart(product)} 
            disabled={!isInStock}
            className="w-full md:w-48"
        >
            Move to Cart
        </Button>
       
        <Link href={`/products/${product.slug}`} className="w-full md:w-48">
          <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
              View Product <ArrowRight size={14} />
          </Button>
        </Link>
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onRemove(product.id)} 
            className="flex items-center gap-1 text-muted-foreground hover:text-red-500 w-fit self-end mt-2"
            aria-label="Remove item"
        >
            <X size={14} />
            <span>Remove</span>
        </Button>
      </div>
    </motion.div>
  );
};