import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Package, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/formatters';
import { motion } from 'framer-motion';

// ... (Interface definitions remain the same) ...
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
  variant?: 'dropdown' | 'minimal';
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const ResultItem: React.FC<{
  href: string;
  imageUrl: string | null;
  title: string;
  subtitle?: string;
  type: 'product' | 'shop';
  onClick?: () => void;
  variant?: 'dropdown' | 'minimal';
  index: number;
}> = ({ href, imageUrl, title, subtitle, type, onClick, variant = 'dropdown', index }) => (
  <motion.div
    variants={itemVariants}
    custom={index}
    initial="hidden"
    animate="visible"
    transition={{ delay: index * 0.05 }}
  >
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-xl transition-all group relative overflow-hidden ${variant === 'minimal'
        ? 'hover:bg-white/5 border border-transparent'
        : 'hover:bg-muted'
        }`}
    >
      {/* Background Hover Effect for Minimal */}
      {variant === 'minimal' && (
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}

      <div className={`relative ${variant === 'minimal' ? 'w-20 h-20' : 'w-14 h-14'} rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-white/10 group-hover:border-primary/50 transition-all duration-300 shadow-md group-hover:shadow-primary/20 group-hover:scale-105`}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
            {type === 'shop' ? <User size={24} /> : <Package size={24} />}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 z-10">
        <p className={`font-semibold truncate transition-colors duration-300 ${variant === 'minimal'
          ? 'text-xl text-foreground/90 group-hover:text-primary group-hover:translate-x-1'
          : 'text-foreground group-hover:text-primary'
          }`}>
          {title}
        </p>
        {subtitle && (
          <p className="text-sm text-muted-foreground truncate group-hover:text-muted-foreground/80 transition-colors">
            {subtitle}
          </p>
        )}
      </div>

      {/* Arrow Icon for Minimal Variant */}
      {variant === 'minimal' && (
        <div className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </Link>
  </motion.div>
);

export const LiveSearchResults: React.FC<LiveSearchResultsProps> = ({
  results,
  isLoading,
  query,
  onResultClick,
  variant = 'dropdown'
}) => {
  const hasResults = results && (results.products?.length > 0 || results.shops?.length > 0);

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  const containerClasses = variant === 'minimal'
    ? 'w-full max-h-[60vh] overflow-hidden'
    : 'bg-card border border-border rounded-xl shadow-2xl max-h-[70vh] overflow-hidden';

  return (
    <div
      className={containerClasses}
      onWheel={handleWheel}
    >
      <div className="max-h-[70vh] overflow-y-auto p-4 custom-scrollbar">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Searching...</span>
          </div>
        )}

        {!isLoading && !hasResults && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="bg-muted/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Package className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <p className="text-lg text-muted-foreground font-light">No results found for <span className="text-foreground">"{query}"</span></p>
            <p className="text-sm text-muted-foreground/60 mt-2">Try checking for typos or using different keywords</p>
          </motion.div>
        )}

        {!isLoading && hasResults && (
          <div className="space-y-8">
            {results.products && results.products.length > 0 && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              >
                <h3 className="font-semibold text-xs uppercase tracking-[0.2em] text-muted-foreground/70 px-4 mb-4">
                  Products ({results.products.length})
                </h3>
                <div className="space-y-1">
                  {results.products.map((p, index) => (
                    <ResultItem
                      key={p.id || p.slug || index}
                      index={index}
                      href={`/product/${p.slug}`}
                      imageUrl={p.images?.[0]?.url || null}
                      title={p.title}
                      subtitle={formatPrice(p.sale_price ?? p.current_price ?? p.regular_price)}
                      type="product"
                      onClick={onResultClick}
                      variant={variant}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {results.shops && results.shops.length > 0 && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              >
                <h3 className="font-semibold text-xs uppercase tracking-[0.2em] text-muted-foreground/70 px-4 mb-4">
                  Shops ({results.shops.length})
                </h3>
                <div className="space-y-1">
                  {results.shops.map((s, index) => (
                    <ResultItem
                      key={s.id || s.slug || index}
                      index={index}
                      href={`/shops/${s.slug}`}
                      imageUrl={s.avatar?.url || s.logo?.url || null}
                      title={s.name}
                      type="shop"
                      onClick={onResultClick}
                      variant={variant}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="border-t border-white/5 pt-6 pb-2"
            >
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={onResultClick}
                className="group flex items-center justify-center gap-2 w-full py-3 text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                <span>View all results</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};