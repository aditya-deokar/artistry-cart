'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check, Loader2, Search as SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProductSearch } from '@/hooks/useAIVision';
import type { QuickSearchResult } from '@/types/aivision';
import Image from 'next/image';

// Re-export Product type that matches API response
export interface Product {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
    category: string;
    material: string;
    artisan: string;
}

// Transform API result to Product
function transformToProduct(result: QuickSearchResult): Product {
    return {
        id: result.id,
        name: result.title,
        imageUrl: result.thumbnail || '',
        price: result.price,
        category: result.category,
        material: '', // Not available in quick search
        artisan: '', // Not available in quick search
    };
}

interface ProductSelectorProps {
    searchQuery: string;
    onSelect: (product: Product) => void;
    selected: Product | null;
}

export function ProductSelector({ searchQuery, onSelect, selected }: ProductSelectorProps) {
    const { results, isSearching, error, search, clear } = useProductSearch();
    const [localProducts, setLocalProducts] = useState<Product[]>([]);

    // Debounced search
    useEffect(() => {
        if (searchQuery.length >= 2) {
            const timer = setTimeout(() => {
                search(searchQuery);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            clear();
            setLocalProducts([]);
        }
    }, [searchQuery, search, clear]);

    // Transform results when they change
    useEffect(() => {
        if (results.length > 0) {
            setLocalProducts(results.map(transformToProduct));
        }
    }, [results]);

    // Show loading state
    if (isSearching) {
        return (
            <div className="flex items-center justify-center py-8 text-[var(--av-silver)]">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Searching products...
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="text-center py-8 text-[var(--av-silver)]">
                <p className="text-red-400 mb-2">{error}</p>
                <p className="text-xs">Try a different search term.</p>
            </div>
        );
    }

    // Show no results
    if (searchQuery.length >= 2 && localProducts.length === 0 && !isSearching) {
        return (
            <div className="text-center py-8 text-[var(--av-silver)]">
                <SearchIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No products found for "{searchQuery}".</p>
                <p className="text-xs mt-1 text-[var(--av-ash)]">Try searching for different keywords.</p>
            </div>
        );
    }

    // Don't show anything if no search query
    if (searchQuery.length < 2) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {localProducts.map((product) => (
                <div
                    key={product.id}
                    onClick={() => onSelect(product)}
                    className={cn(
                        'relative cursor-pointer rounded-lg p-3 border-2 transition-all group',
                        selected?.id === product.id
                            ? 'border-[var(--av-gold)] bg-[var(--av-gold)]/5'
                            : 'border-[var(--av-silver)]/10 hover:border-[var(--av-gold)]/50 bg-[var(--av-onyx)]'
                    )}
                >
                    {/* Selected Badge */}
                    {selected?.id === product.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-[var(--av-gold)] rounded-full flex items-center justify-center z-10">
                            <Check size={14} className="text-[var(--av-obsidian)]" />
                        </div>
                    )}

                    {/* Product Info */}
                    <div className="flex items-center gap-3">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-[var(--av-slate)] rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                            {product.imageUrl ? (
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-xs text-[var(--av-ash)]">IMG</span>
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-[var(--av-pearl)] text-sm truncate">
                                {product.name}
                            </h4>
                            <p className="text-xs text-[var(--av-silver)] truncate">
                                {product.category}
                            </p>
                            <p className="text-xs font-mono text-[var(--av-gold)] mt-1">
                                ${product.price.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
