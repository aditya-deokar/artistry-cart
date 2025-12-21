'use client';

import { useRef, useLayoutEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    Search,
    SlidersHorizontal,
    X,
    ChevronDown,
    LayoutGrid,
    List,
    MapPin,
} from 'lucide-react';
import { useQueryStates, parseAsString, parseAsInteger, parseAsArrayOf } from 'nuqs';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Filter options - exported for use in MobileFilterDrawer
export const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'ceramics', label: 'Ceramics & Pottery' },
    { value: 'jewelry', label: 'Jewelry & Metalwork' },
    { value: 'textiles', label: 'Textiles & Weaving' },
    { value: 'woodwork', label: 'Woodworking' },
    { value: 'painting', label: 'Painting & Fine Art' },
    { value: 'sculpture', label: 'Sculpture' },
    { value: 'glass', label: 'Glass & Crystal' },
    { value: 'leather', label: 'Leather Goods' },
    { value: 'paper', label: 'Paper & Calligraphy' },
];

export const locationOptions = [
    { value: 'all', label: 'All Locations' },
    { value: 'europe', label: 'Europe' },
    { value: 'asia', label: 'Asia' },
    { value: 'north-america', label: 'North America' },
    { value: 'south-america', label: 'South America' },
    { value: 'africa', label: 'Africa' },
    { value: 'oceania', label: 'Oceania' },
];

export const ratingOptions = [
    { value: 'all', label: 'All Ratings' },
    { value: '4.5', label: '4.5+ Stars' },
    { value: '4', label: '4.0+ Stars' },
    { value: 'new', label: 'New Artisans' },
];

export const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'products', label: 'Most Products' },
    { value: 'name', label: 'Alphabetical' },
];

interface ArtisanFiltersProps {
    totalResults?: number;
    onViewChange?: (view: 'grid' | 'list') => void;
    currentView?: 'grid' | 'list';
}

export function ArtisanFilters({
    totalResults = 0,
    onViewChange,
    currentView = 'grid',
}: ArtisanFiltersProps) {
    const filterRef = useRef<HTMLDivElement>(null);
    const [isSticky, setIsSticky] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    // URL state management with nuqs
    const [filters, setFilters] = useQueryStates({
        search: parseAsString.withDefault(''),
        category: parseAsString.withDefault('all'),
        location: parseAsString.withDefault('all'),
        rating: parseAsString.withDefault('all'),
        sort: parseAsString.withDefault('featured'),
    });

    // Sticky behavior
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: filterRef.current,
                start: 'top 80px',
                end: 'max',
                onEnter: () => setIsSticky(true),
                onLeaveBack: () => setIsSticky(false),
            });
        });

        return () => ctx.revert();
    }, []);

    // Close dropdown when clicking outside
    useLayoutEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (openDropdown && !(e.target as Element).closest('.dropdown-container')) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [openDropdown]);

    const handleFilterChange = useCallback(
        (key: string, value: string) => {
            setFilters({ [key]: value });
            setOpenDropdown(null);
        },
        [setFilters]
    );

    const clearFilters = useCallback(() => {
        setFilters({
            search: '',
            category: 'all',
            location: 'all',
            rating: 'all',
            sort: 'featured',
        });
    }, [setFilters]);

    const activeFiltersCount = [
        filters.category !== 'all',
        filters.location !== 'all',
        filters.rating !== 'all',
    ].filter(Boolean).length;

    const DropdownButton = ({
        id,
        label,
        value,
        options,
    }: {
        id: string;
        label: string;
        value: string;
        options: { value: string; label: string }[];
    }) => {
        const currentLabel = options.find((opt) => opt.value === value)?.label || label;
        const isOpen = openDropdown === id;

        return (
            <div className="relative dropdown-container">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(isOpen ? null : id);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm border transition-all ${value !== 'all'
                        ? 'border-[var(--ac-gold)] bg-[var(--ac-gold)]/10 text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]'
                        : 'border-[var(--ac-linen)] dark:border-[var(--ac-slate)] text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] hover:border-[var(--ac-stone)]'
                        }`}
                >
                    <span className="whitespace-nowrap">{currentLabel}</span>
                    <ChevronDown
                        className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute top-full left-0 mt-2 min-w-[200px] py-2 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] shadow-lg z-50">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleFilterChange(id, option.value)}
                                className={`w-full px-4 py-2 text-left text-sm transition-colors ${value === option.value
                                    ? 'bg-[var(--ac-gold)]/10 text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)]'
                                    : 'text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] hover:bg-[var(--ac-linen)] dark:hover:bg-[var(--ac-slate)]'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            ref={filterRef}
            className={`transition-all duration-300 ${isSticky
                ? 'sticky top-20 z-40 bg-[var(--ac-ivory)]/95 dark:bg-[var(--ac-obsidian)]/95 backdrop-blur-md border-b border-[var(--ac-linen)] dark:border-[var(--ac-slate)] shadow-sm'
                : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
                {/* Main Filter Row */}
                <div className="flex flex-wrap items-center gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ac-stone)]" />
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            placeholder="Search artisans..."
                            className="w-full pl-10 pr-4 py-2.5 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] text-sm text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] placeholder:text-[var(--ac-stone)] focus:outline-none focus:border-[var(--ac-gold)] transition-colors"
                        />
                        {filters.search && (
                            <button
                                onClick={() => handleFilterChange('search', '')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ac-stone)] hover:text-[var(--ac-graphite)]"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex flex-wrap items-center gap-2">
                        <DropdownButton
                            id="category"
                            label="Category"
                            value={filters.category}
                            options={categoryOptions}
                        />
                        <DropdownButton
                            id="location"
                            label="Location"
                            value={filters.location}
                            options={locationOptions}
                        />
                        <DropdownButton
                            id="rating"
                            label="Rating"
                            value={filters.rating}
                            options={ratingOptions}
                        />
                    </div>

                    {/* Sort & View Controls */}
                    <div className="flex items-center gap-4 ml-auto">
                        {/* Sort Dropdown */}
                        <DropdownButton
                            id="sort"
                            label="Sort By"
                            value={filters.sort}
                            options={sortOptions}
                        />

                        {/* View Toggle */}
                        <div className="flex items-center border border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                            <button
                                onClick={() => onViewChange?.('grid')}
                                className={`p-2.5 transition-colors ${currentView === 'grid'
                                    ? 'bg-[var(--ac-charcoal)] dark:bg-[var(--ac-pearl)] text-[var(--ac-ivory)] dark:text-[var(--ac-obsidian)]'
                                    : 'text-[var(--ac-stone)] hover:text-[var(--ac-charcoal)] dark:hover:text-[var(--ac-pearl)]'
                                    }`}
                                aria-label="Grid view"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onViewChange?.('list')}
                                className={`p-2.5 transition-colors ${currentView === 'list'
                                    ? 'bg-[var(--ac-charcoal)] dark:bg-[var(--ac-pearl)] text-[var(--ac-ivory)] dark:text-[var(--ac-obsidian)]'
                                    : 'text-[var(--ac-stone)] hover:text-[var(--ac-charcoal)] dark:hover:text-[var(--ac-pearl)]'
                                    }`}
                                aria-label="List view"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Active Filters & Results Count */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                    <div className="flex items-center gap-4">
                        {/* Results Count */}
                        <p className="text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
                            <span className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                {totalResults.toLocaleString()}
                            </span>{' '}
                            artisans found
                        </p>

                        {/* Active Filter Tags */}
                        {activeFiltersCount > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="w-px h-4 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                                {filters.category !== 'all' && (
                                    <FilterTag
                                        label={categoryOptions.find((c) => c.value === filters.category)?.label || ''}
                                        onRemove={() => handleFilterChange('category', 'all')}
                                    />
                                )}
                                {filters.location !== 'all' && (
                                    <FilterTag
                                        label={locationOptions.find((l) => l.value === filters.location)?.label || ''}
                                        onRemove={() => handleFilterChange('location', 'all')}
                                    />
                                )}
                                {filters.rating !== 'all' && (
                                    <FilterTag
                                        label={ratingOptions.find((r) => r.value === filters.rating)?.label || ''}
                                        onRemove={() => handleFilterChange('rating', 'all')}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Clear All */}
                    {activeFiltersCount > 0 && (
                        <button
                            onClick={clearFilters}
                            className="text-sm text-[var(--ac-stone)] hover:text-[var(--ac-gold)] transition-colors"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--ac-gold)]/10 text-xs text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)]">
            {label}
            <button
                onClick={onRemove}
                className="hover:text-[var(--ac-charcoal)] dark:hover:text-[var(--ac-pearl)]"
            >
                <X className="w-3 h-3" />
            </button>
        </span>
    );
}
