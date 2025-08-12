'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

import { formatPrice } from '@/lib/formatters';
import { Button } from '../ui/button';
import { ArtProduct } from '@/types/products';


type WishlistItemProps = {
  product: ArtProduct;
  onRemove: (productId: string) => void;
  onMoveToCart: (product: ArtProduct) => void; 
};

export const WishlistItem = ({ product, onRemove, onMoveToCart }: WishlistItemProps) => {
  const primaryImage = product.images.find(img => img !== null);
  const isInStock = product.stock > 0;
  const isLimited = product.stock <= 5 && isInStock;
  const stockStatus = isLimited ? 'Limited Stock' : isInStock ? 'In Stock' : 'Out of Stock';

  return (
    <motion.div
      layout
      
      className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 p-4 bg-secondary"
    >
    
      <Link href={`/products/${product.slug}`} className="w-full sm:w-32 md:w-40 flex-shrink-0">
        <div className="aspect-square relative rounded-md overflow-hidden bg-muted">
          {primaryImage && (
            <Image src={primaryImage.url} alt={product.title} fill className="object-cover" />
          )}
        </div>
      </Link>

    
      <div className="flex-grow">
        <p className="text-sm text-muted-foreground">{product.category}</p>
        <h3 className="font-display text-lg tracking-wider  text-foreground hover:text-primary transition-colors">
          <Link href={`/products/${product.slug}`}>{product.title}</Link>
        </h3>
        <p className="text-sm text-muted-foreground mt-1 hover:text-primary transition-colors">
          <Link href={`/artist/${product.Shop.id}`}>by {product.Shop.name}</Link>
        </p>
        <p className="text-lg font-medium text-foreground mt-2">{formatPrice(product.sale_price)}</p>
        <div className={`mt-2 text-sm font-semibold ${isLimited ? 'text-amber-600' : isInStock ? 'text-green-600' : 'text-red-600'}`}>
            {stockStatus}
        </div>
      </div>

      
      <div className="flex flex-col items-stretch sm:items-end gap-2 w-full sm:w-auto">
        <Button 
            onClick={() => onMoveToCart(product)} 
            disabled={!isInStock}
            className="w-full sm:w-auto"
        >
            Move to Cart
        </Button>
        <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onRemove(product.id)} 
            className="flex items-center gap-1 w-full"
            aria-label="Remove item"
        >
            <X size={14} />
            <span>Remove</span>
        </Button>
      </div>
    </motion.div>
  );
};