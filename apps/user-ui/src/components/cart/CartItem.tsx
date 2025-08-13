'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

import { formatPrice } from '@/lib/formatters';
import { Button } from '../ui/button';
import { type CartItem as CartItemType } from '@/store';
import { QuantitySelector } from './QuantitySelector';

type CartItemProps = {
  item: CartItemType;
  onRemove: (productId: string, user:any, deviceInfo:string, location:any) => void;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
};

export const CartItem = ({ item, onRemove, onUpdateQuantity }: CartItemProps) => {
  const primaryImage = item.images.find(img => img !== null);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex items-start gap-4 p-4 border-b border-border"
    >
      <Link href={`/products/${item.slug}`} className="w-24 h-24 flex-shrink-0">
        <div className="aspect-square relative rounded-md overflow-hidden bg-muted">
          {primaryImage && <Image src={primaryImage.url} alt={item.title} fill className="object-cover" />}
        </div>
      </Link>

      <div className="flex-grow flex flex-col justify-between h-24">
        <div>
          <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
            <Link href={`/products/${item.slug}`}>
              {item.title}
            </Link>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            by {item.Shop.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onRemove(item.id)} className="text-muted-foreground hover:text-red-500 p-1 h-auto">
                <X size={14} />
                <span className="ml-1">Remove</span>
            </Button>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between h-24 text-sm">
        <span className="font-medium text-lg">{formatPrice(item.sale_price * item.quantity)}</span>
        <QuantitySelector 
            quantity={item.quantity}
            maxStock={item.stock}
            onIncrease={() => onUpdateQuantity(item.id, item.quantity + 1)}
            onDecrease={() => onUpdateQuantity(item.id, item.quantity - 1)}
        />
      </div>
    </motion.div>
  );
};