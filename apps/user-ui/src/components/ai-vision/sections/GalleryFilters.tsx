'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Filter, Grid, List, SortAsc } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FilterCategory = 'all' | 'art' | 'jewelry' | 'home-decor' | 'furniture' | 'ceramics';
export type FilterStatus = 'all' | 'realized' | 'in-progress' | 'awaiting';

interface GalleryFiltersProps {
    selectedCategory: FilterCategory;
    selectedStatus: FilterStatus;

    onCategoryChange: (category: FilterCategory) => void;
    onStatusChange: (status: FilterStatus) => void;
}

const categories: { value: FilterCategory; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'art', label: 'Art' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'home-decor', label: 'Home Decor' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'ceramics', label: 'Ceramics' },
];

const statuses: { value: FilterStatus; label: string; color: string }[] = [
    { value: 'all', label: 'All', color: 'bg-white/10 text-white' },
    { value: 'realized', label: 'Realized', color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
    { value: 'awaiting', label: 'Awaiting', color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
];

export function GalleryFilters({
    selectedCategory,
    selectedStatus,
    onCategoryChange,
    onStatusChange,
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

    return (
        <div
            ref={filtersRef}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
        >
            {/* Categories */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-[var(--av-silver)] mr-2">
                    <Filter size={16} />
                    <span className="font-medium hidden sm:inline">Category:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
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
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-[var(--av-silver)] font-medium mr-2 hidden sm:inline">
                    Status:
                </span>
                <div className="flex gap-2">
                    {statuses.map((status) => (
                        <button
                            key={status.value}
                            onClick={() => onStatusChange(status.value)}
                            className={cn(
                                'px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border border-transparent',
                                selectedStatus === status.value
                                    ? `${status.color} ring-2 ring-offset-2 ring-offset-[#1a1a1a] ring-white/10`
                                    : 'bg-white/5 text-[var(--av-silver)] hover:bg-white/10 hover:text-white border-white/5'
                            )}
                        >
                            {status.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
