'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// UI Components
import { Slider } from "@/components/ui/slider";


// Utils & Icons
import { formatPrice } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { RotateCcw, Plus, Minus, Check } from 'lucide-react';

// --- Define strong types for the component's state and props ---
export interface FilterState {
    sortBy: 'newest' | 'price-asc' | 'price-desc' | 'relevance';
    category: string;
    priceRange: [number, number];
}

type ParentFilterState = FilterState & { page: number; search: string; };

type FilterSidebarProps = {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<ParentFilterState>>;
    categories: string[];
};

// Define the default state for the reset functionality
const defaultFilters: ParentFilterState = {
    page: 1,
    sortBy: 'newest',
    category: 'all',
    priceRange: [0, 50000],
    search: '',
};

// Custom Accordion Component to match the vibe
const CreativeAccordion = ({
    title,
    children,
    isOpen,
    onToggle
}: {
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void
}) => (
    <div className="border-b border-neutral-200 dark:border-neutral-800 py-4">
        <button
            onClick={onToggle}
            className="flex items-center justify-between w-full group"
        >
            <span className="font-display text-xl uppercase tracking-wider">{title}</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {isOpen ? <Minus size={16} /> : <Plus size={16} />}
            </span>
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                >
                    <div className="pt-4 pb-2">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, setFilters, categories }) => {
    // State for accordion sections
    const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
        sort: true,
        category: true,
        price: true
    });

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Handlers
    const handleCategoryChange = (category: string) => {
        setFilters(prev => ({ ...prev, category, page: 1 }));
    };

    const handlePriceChange = (value: number[]) => {
        setFilters(prev => ({ ...prev, priceRange: [value[0], value[1]], page: 1 }));
    };

    const handleSortChange = (value: FilterState['sortBy']) => {
        setFilters(prev => ({ ...prev, sortBy: value, page: 1 }));
    };

    const handleClearFilters = () => {
        setFilters(defaultFilters);
    };

    return (
        <div className="sticky top-32 pr-8 hidden lg:block">
            <div className="flex justify-between items-end mb-8">
                <h2 className="font-display text-4xl font-bold leading-none ">Filter</h2>
                <button
                    onClick={handleClearFilters}
                    className="text-xs uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 pb-1"
                >
                    <RotateCcw size={12} />
                    Reset
                </button>
            </div>

            <div className="flex flex-col gap-2">
                {/* --- Sort By --- */}
                <CreativeAccordion
                    title="Sort By"
                    isOpen={openSections.sort}
                    onToggle={() => toggleSection('sort')}
                >
                    <div className="flex flex-col gap-2">
                        {[
                            { label: 'Just In', value: 'newest' },
                            { label: 'Relevance', value: 'relevance' },
                            { label: 'Price: Low - High', value: 'price-asc' },
                            { label: 'Price: High - Low', value: 'price-desc' },
                        ].map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSortChange(option.value as any)}
                                className={cn(
                                    "text-left text-sm py-1 transition-all duration-300 flex items-center gap-3 group relative pl-6",
                                    filters.sortBy === option.value
                                        ? "text-primary font-medium"
                                        : "text-neutral-500 hover:text-primary"
                                )}
                            >
                                <span className={cn(
                                    "absolute left-0 w-2 h-2 rounded-full border border-current transition-all duration-300",
                                    filters.sortBy === option.value ? "bg-primary border-primary" : "bg-transparent border-neutral-300 group-hover:border-primary"
                                )}></span>
                                {option.label}
                            </button>
                        ))}
                    </div>
                </CreativeAccordion>

                {/* --- Categories --- */}
                <CreativeAccordion
                    title="Collection"
                    isOpen={openSections.category}
                    onToggle={() => toggleSection('category')}
                >
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => handleCategoryChange('all')}
                            className={cn(
                                "text-left text-lg font-light transition-all duration-300 hover:translate-x-2 w-full flex justify-between items-center group",
                                filters.category === 'all' ? "text-primary translate-x-2" : "text-neutral-500 hover:text-primary"
                            )}
                        >
                            All
                            {filters.category === 'all' && <Check size={14} className="opacity-50" />}
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={cn(
                                    "text-left text-lg font-light capitalize transition-all duration-300 hover:translate-x-2 w-full flex justify-between items-center",
                                    filters.category === cat ? "text-primary translate-x-2" : "text-neutral-500 hover:text-primary"
                                )}
                            >
                                {cat}
                                {filters.category === cat && <Check size={14} className="opacity-50" />}
                            </button>
                        ))}
                    </div>
                </CreativeAccordion>

                {/* --- Price Range --- */}
                <CreativeAccordion
                    title="Price"
                    isOpen={openSections.price}
                    onToggle={() => toggleSection('price')}
                >
                    <div className="pt-4 px-1">
                        <div className="flex justify-between mb-4 font-mono text-xs text-neutral-500">
                            <span>{formatPrice(filters.priceRange[0])}</span>
                            <span>{formatPrice(filters.priceRange[1])}+</span>
                        </div>
                        <Slider
                            defaultValue={filters.priceRange}
                            max={50000}
                            step={100}
                            onValueChange={handlePriceChange}
                            className="py-4"
                        />
                    </div>
                </CreativeAccordion>
            </div>
        </div>
    );
};
