import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Package } from 'lucide-react';
import { formatPrice } from '@/lib/formatters';

interface ProductResult {
  slug: string;
  title: string;
  images: { url: string }[];
  sale_price: number | null;
  regular_price: number;
}

interface ShopResult {
  slug: string;
  name: string;
  avatar: { url: string } | null;
}

type LiveSearchResultsProps = {
  results: { products: ProductResult[]; shops: ShopResult[] } | undefined;
  isLoading: boolean;
  query: string;
};

const ResultItem: React.FC<{
    href: string;
    imageUrl: string | null;
    title: string;
    subtitle?: string;
    type: 'product' | 'shop';
}> = ({ href, imageUrl, title, subtitle, type }) => (
    <Link href={href} className="flex items-center gap-4 p-3 hover:bg-secondary/60 backdrop:blur-lg rounded-lg transition-colors">
        <div className="relative w-12 h-12 rounded-md  hover:bg-background flex-shrink-0">
            {imageUrl ? (
                <Image src={imageUrl} alt={title} fill className="object-cover rounded-md" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-primary">
                    {type === 'shop' ? <User size={24} /> : <Package size={24} />}
                </div>
            )}
        </div>
        <div>
            <p className="font-semibold text-primary">{title}</p>
            {subtitle && <p className="text-sm text-primary/70">{subtitle}</p>}
        </div>
    </Link>
);

export const LiveSearchResults: React.FC<LiveSearchResultsProps> = ({ results, isLoading, query }) => {
  const hasResults = results && (results.products.length > 0 || results.shops.length > 0);

  return (
    <div className="bg-background/95 backdrop:blur-xl border border-border rounded-lg shadow-2xl p-4 max-h-[70vh] overflow-y-auto z-50">
      {isLoading && <p className="text-center text-primary/70 py-4">Searching...</p>}
      
      {!isLoading && !hasResults && <p className="text-center text-primary/70 py-4">No results found for "{query}"</p>}

      {!isLoading && hasResults && (
        <div className="space-y-4">
          {results.products.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-primary/60 px-3 mb-2">Products</h3>
              <div className="space-y-1">
                {results.products.map(p => (
                  <ResultItem 
                    key={p.slug}
                    href={`/product/${p.slug}`}
                    imageUrl={p.images?.[0]?.url || null}
                    title={p.title}
                    subtitle={formatPrice(p.sale_price ?? p.regular_price)}
                    type="product"
                  />
                ))}
              </div>
            </div>
          )}

          {results.shops.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-primary/60 px-3 mb-2">Artists / Shops</h3>
              <div className="space-y-1">
                {results.shops.map(s => (
                  <ResultItem
                    key={s.slug}
                    href={`/shops/${s.slug}`}
                    imageUrl={s.avatar?.url || null}
                    title={s.name}
                    type="shop"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border pt-3">
            <Link href={`/search?q=${query}`} className="block w-full text-center p-2 text-accent font-semibold hover:underline rounded-lg">
                View all results
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};