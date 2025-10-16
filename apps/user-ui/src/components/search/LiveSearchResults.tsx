import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Package, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/formatters';

interface ProductResult {
  id?: string;
  slug: string;
  title: string;
  images: { url: string }[];
  sale_price?: number | null;
  current_price?: number;
  regular_price: number;
}

interface ShopResult {
  id?: string;
  slug: string;
  name: string;
  avatar?: { url: string } | null;
  logo?: { url: string } | null;
}

type LiveSearchResultsProps = {
  results: { products: ProductResult[]; shops: ShopResult[] } | undefined;
  isLoading: boolean;
  query: string;
  onResultClick?: () => void;
};

const ResultItem: React.FC<{
  href: string;
  imageUrl: string | null;
  title: string;
  subtitle?: string;
  type: 'product' | 'shop';
  onClick?: () => void;
}> = ({ href, imageUrl, title, subtitle, type, onClick }) => (
  <Link 
    href={href} 
    onClick={onClick}
    className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-all group"
  >
    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0 border group-hover:border-primary transition-colors">
      {imageUrl ? (
        <Image 
          src={imageUrl} 
          alt={title} 
          fill 
          className="object-cover"
          sizes="56px"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
          {type === 'shop' ? <User size={24} /> : <Package size={24} />}
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
        {title}
      </p>
      {subtitle && (
        <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
      )}
    </div>
  </Link>
);

export const LiveSearchResults: React.FC<LiveSearchResultsProps> = ({ 
  results, 
  isLoading, 
  query,
  onResultClick 
}) => {
  const hasResults = results && (results.products?.length > 0 || results.shops?.length > 0);

  return (
    <div className="bg-card border border-border rounded-xl shadow-2xl max-h-[70vh] overflow-hidden">
      <div className="max-h-[70vh] overflow-y-auto p-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Searching...</span>
          </div>
        )}
        
        {!isLoading && !hasResults && (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">No results found for "{query}"</p>
            <p className="text-sm text-muted-foreground mt-1">Try different keywords</p>
          </div>
        )}

        {!isLoading && hasResults && (
          <div className="space-y-6">
            {results.products && results.products.length > 0 && (
              <div>
                <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground px-3 mb-2">
                  Products ({results.products.length})
                </h3>
                <div className="space-y-1">
                  {results.products.map((p, index) => (
                    <ResultItem 
                      key={p.id || p.slug || index}
                      href={`/product/${p.slug}`}
                      imageUrl={p.images?.[0]?.url || null}
                      title={p.title}
                      subtitle={formatPrice(p.sale_price ?? p.current_price ?? p.regular_price)}
                      type="product"
                      onClick={onResultClick}
                    />
                  ))}
                </div>
              </div>
            )}

            {results.shops && results.shops.length > 0 && (
              <div>
                <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground px-3 mb-2">
                  Shops ({results.shops.length})
                </h3>
                <div className="space-y-1">
                  {results.shops.map((s, index) => (
                    <ResultItem
                      key={s.id || s.slug || index}
                      href={`/shops/${s.slug}`}
                      imageUrl={s.avatar?.url || s.logo?.url || null}
                      title={s.name}
                      type="shop"
                      onClick={onResultClick}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-3">
              <Link 
                href={`/search?q=${encodeURIComponent(query)}`} 
                onClick={onResultClick}
                className="block w-full text-center p-3 text-primary font-semibold hover:bg-muted rounded-lg transition-colors"
              >
                View all results →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};