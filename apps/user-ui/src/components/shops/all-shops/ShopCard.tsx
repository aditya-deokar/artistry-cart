import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User } from 'lucide-react';
import { StarRating } from '@/components/products/StarRating';


// Define the type for the shop data this card expects
export interface ShopCardData {
  slug: string;
  name: string;
  avatar: { url: string } | null;
  category: string;
  ratings: number;
  _count: { reviews: number };
}

export const ShopCard: React.FC<{ shop: ShopCardData }> = ({ shop }) => {
  return (
    <Link href={`/shops/${shop.slug}`} className="group block text-primary">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border-2 border-border group-hover:border-accent transition-colors duration-300">
        {shop.avatar ? (
          <Image
            src={shop.avatar.url}
            alt={`${shop.name} avatar`}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-background/50 flex items-center justify-center">
            <User className="w-16 h-16 text-neutral-600" />
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="font-display text-xl truncate" title={shop.name}>
          {shop.name}
        </h3>
        <p className="text-sm text-primary/70 capitalize">{shop.category}</p>
        <div className="flex items-center gap-2 mt-1">
          <StarRating rating={shop.ratings} />
          <span className="text-xs text-primary/60">({shop._count.reviews} reviews)</span>
        </div>
      </div>
    </Link>
  );
};