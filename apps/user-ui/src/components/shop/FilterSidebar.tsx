'use client';

import React from 'react';

// UI Components
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';

// Utils & Icons
import { formatPrice } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Filter, RotateCw } from 'lucide-react';

// --- Define strong types for the component's state and props ---
export interface FilterState {
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'relevance';
  category: string;
  priceRange: [number, number];
}

type ParentFilterState = FilterState & { page: number };

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
};

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, setFilters, categories }) => {
    
    // Handlers are now strongly typed and reset the page
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
        <div className="p-6 border border-border rounded-lg bg-background sticky top-24">
            {/* --- Main Header --- */}
            <div className="flex justify-between items-center pb-4 border-b border-border/80">
                <div className="flex items-center gap-2">
                    <Filter size={20} />
                    <h2 className="font-display text-2xl">Filters</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={handleClearFilters} className="flex items-center gap-1.5 text-sm">
                    <RotateCw size={14} />
                    Reset
                </Button>
            </div>

            <div className="space-y-6 pt-6">
                {/* --- Sort By Section --- */}
                <div>
                    <h3 className="font-semibold text-lg mb-3">Sort By</h3>
                    <Select onValueChange={handleSortChange} defaultValue={filters.sortBy}>
                        <SelectTrigger className="w-full bg-background/80 border-border/80 rounded-none">
                            <SelectValue placeholder="Sort artworks" />
                        </SelectTrigger>
                        <SelectContent>
                            {/* Adding 'relevance' is good practice for search pages */}
                            <SelectItem value="relevance">Relevance</SelectItem> 
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="price-asc">Price: Low to High</SelectItem>
                            <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                {/* --- Accordion for Filters --- */}
                <Accordion type="multiple" defaultValue={['category', 'price']} className="w-full">
                    <AccordionItem value="category">
                        <AccordionTrigger className="font-semibold text-lg hover:no-underline">Category</AccordionTrigger>
                        <AccordionContent className="pt-3 space-y-2">
                            <button 
                                onClick={() => handleCategoryChange('all')} 
                                className={cn(
                                    "block w-full text-left p-2  transition-colors text-sm font-medium",
                                    filters.category === 'all' ? 'bg-secondary/60 text-primary' : 'text-primary/70 hover:bg-secondary/40'
                                )}
                            >
                                All Categories
                            </button>
                            {categories.map(cat => (
                                <button 
                                    key={cat} 
                                    onClick={() => handleCategoryChange(cat)} 
                                    className={cn(
                                        "block w-full text-left p-2 transition-colors text-sm font-medium capitalize",
                                        filters.category === cat ? 'bg-secondary/60 text-primary' : 'text-primary/70 hover:bg-secondary/40'
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="price">
                        <AccordionTrigger className="font-semibold text-lg hover:no-underline">Price Range</AccordionTrigger>
                        <AccordionContent className="pt-6 space-y-4">
                            <Slider
                                defaultValue={filters.priceRange}
                                max={50000}
                                step={100}
                                onValueChange={handlePriceChange}
                            />
                            <div className="flex justify-between items-center text-sm">
                                <div className="px-3 py-1 bg-accent border border-border rounded-md">
                                    {formatPrice(filters.priceRange[0])}
                                </div>
                                <div className="px-3 py-1 bg-accent border border-border rounded-md">
                                    {formatPrice(filters.priceRange[1])}
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
};