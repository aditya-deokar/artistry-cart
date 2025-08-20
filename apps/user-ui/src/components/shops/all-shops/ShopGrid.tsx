import React from 'react';
import { ShopCard } from './ShopCard'; 
import { List } from 'lucide-react';


interface ShopCardData {
  id: string; 
  slug: string;
  name: string;
  avatar: { url: string } | null;
  category: string;
  ratings: number;
  _count: { reviews: number };
}

type ShopGridProps = {
  shops: ShopCardData[] | undefined;
  isLoading: boolean;
};

const ShopGridSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="animate-pulse">
                <div className="aspect-square w-full rounded-lg bg-accent"></div>
                <div className="h-5 w-3/4 mt-4 rounded bg-accent"></div>
                <div className="h-4 w-1/2 mt-2 rounded bg-accent"></div>
            </div>
        ))}
    </div>
);

export const ShopGrid: React.FC<ShopGridProps> = ({ shops, isLoading }) => {
  if (isLoading) {
    return <ShopGridSkeleton />;
  }

  if (!shops || shops.length === 0) {
    return (
      <div className="text-center py-20 col-span-full border border-dashed border-neutral-700 rounded-lg">
          <List className="mx-auto w-12 h-12 text-neutral-600" />
          <h3 className="mt-4 text-2xl font-semibold">No Shops Found</h3>
          <p className="text-neutral-500 mt-2">Try adjusting your filters to discover new creators.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {shops.map((shop) => (
        <ShopCard key={shop.id} shop={shop} />
      ))}
    </div>
  );
};