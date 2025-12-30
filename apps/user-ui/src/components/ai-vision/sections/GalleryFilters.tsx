'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Filter, Loader2, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GalleryFiltersProps {
    selectedCategory: string;
    selectedSort: 'recent' | 'popular' | 'favorites';
    categories: string[];
    onCategoryChange: (category: string) => void;
    onSortChange: (sort: 'recent' | 'popular' | 'favorites') => void;
    isLoading?: boolean;
}

const sortOptions: { value: 'recent' | 'popular' | 'favorites'; label: string }[] = [
    { value: 'recent', label: 'Recent' },
    { value: 'popular', label: 'Popular' },
    { value: 'favorites', label: 'Favorites' },
];

export function GalleryFilters({
    selectedCategory,
    selectedSort,
    categories,
    onCategoryChange,
    onSortChange,
    isLoading = false,
}: GalleryFiltersProps) {
    const filtersRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!filtersRef.current) return;

            gsap.fromTo(
                filtersRef.current,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: 'power3.out',
                }
            );
        },
        { scope: filtersRef }
    );

    // Build category list with "All" option
    const allCategories = [
        { value: '', label: 'All Categories' },
        ...categories.map(cat => ({ value: cat, label: cat })),
    ];

    return (
        <div
            ref={filtersRef}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5"
        >
            {/* Categories */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-[var(--av-silver)] mr-2">
                    <Filter size={16} />
                    <span className="font-medium hidden sm:inline">Category:</span>
                </div>

                {isLoading ? (
                    <div className="flex items-center gap-2 text-[var(--av-silver)]">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-sm">Loading categories...</span>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {allCategories.map((category) => (
                            <button
                                key={category.value}
                                onClick={() => onCategoryChange(category.value)}
                                className={cn(
                                    'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300',
                                    selectedCategory === category.value
                                        ? 'bg-gradient-to-r from-[var(--av-gold)] to-[var(--av-gold-dark)] text-white shadow-lg shadow-[var(--av-gold)]/20'
                                        : 'bg-white/5 text-[var(--av-silver)] hover:bg-white/10 hover:text-white border border-white/5'
                                )}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-[var(--av-silver)] mr-2">
                    <ArrowUpDown size={16} />
                    <span className="font-medium hidden sm:inline">Sort:</span>
                </div>
                <div className="flex gap-2">
                    {sortOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => onSortChange(option.value)}
                            className={cn(
                                'px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300',
                                selectedSort === option.value
                                    ? 'bg-white/20 text-white ring-1 ring-white/20'
                                    : 'bg-white/5 text-[var(--av-silver)] hover:bg-white/10 hover:text-white border border-white/5'
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Re-export types for backward compatibility
export type FilterCategory = string;
export type FilterStatus = 'all' | 'realized' | 'in-progress' | 'awaiting';
