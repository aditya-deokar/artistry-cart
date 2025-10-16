'use client';

import React from 'react';

// UI Components
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Utils
import { formatPrice } from "@/lib/formatters";
import { Filter, X } from 'lucide-react';

// --- Define strong types for the component's props ---
export interface SearchFilterState {
  sortBy: 'relevance' | 'newest' | 'price-asc' | 'price-desc';
  category: string;
  priceRange: [number, number];
}

// The parent's state will also include the page number
type ParentFilterState = SearchFilterState & { page: number };

type SearchFiltersProps = {
  filters: SearchFilterState;
  setFilters: React.Dispatch<React.SetStateAction<ParentFilterState>>;
  categories: string[]; // List of available categories to filter by
};

export const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, setFilters, categories }) => {
    
    // Handler functions update the parent's state, resetting the page to 1
    const handleCategoryChange = (category: string) => {
        setFilters(prev => ({ ...prev, category, page: 1 }));
    };

    const handlePriceChange = (value: number[]) => {
        setFilters(prev => ({ ...prev, priceRange: [value[0], value[1]], page: 1 }));
    };
    
    const handleSortChange = (value: SearchFilterState['sortBy']) => {
        setFilters(prev => ({ ...prev, sortBy: value, page: 1 }));
    };

    const handleClearFilters = () => {
        setFilters({
            page: 1,
            sortBy: 'relevance',
            category: 'all',
            priceRange: [0, 50000],
        });
    };

    const hasActiveFilters = filters.category !== 'all' || 
        filters.priceRange[0] !== 0 || 
        filters.priceRange[1] !== 50000 ||
        filters.sortBy !== 'relevance';

    return (
        <div className="space-y-6 bg-card border rounded-xl p-6 sticky top-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold">Filters</h3>
                </div>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className="h-8 px-2 text-xs"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                    </Button>
                )}
            </div>

            <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                    Sort By
                </h4>
                <Select onValueChange={handleSortChange} value={filters.sortBy}>
                    <SelectTrigger className="w-full border-input">
                        <SelectValue placeholder="Sort products" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <Accordion type="multiple" defaultValue={['category', 'price']} className="w-full">
                <AccordionItem value="category" className="border-none">
                    <AccordionTrigger className="text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline py-3">
                        Category
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 space-y-1">
                        <Button
                            variant={filters.category === 'all' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => handleCategoryChange('all')}
                            className="w-full justify-start font-normal"
                        >
                            All Categories
                        </Button>
                        {categories.map(cat => (
                            <Button
                                key={cat}
                                variant={filters.category === cat ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => handleCategoryChange(cat)}
                                className="w-full justify-start font-normal capitalize"
                            >
                                {cat}
                            </Button>
                        ))}
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="price" className="border-none">
                    <AccordionTrigger className="text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline py-3">
                        Price Range
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-2 space-y-4">
                        <Slider
                            value={filters.priceRange}
                            max={50000}
                            step={100}
                            onValueChange={handlePriceChange}
                            className="w-full"
                        />
                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <span className="text-muted-foreground">Min: </span>
                                <span className="font-semibold">{formatPrice(filters.priceRange[0])}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-muted-foreground">Max: </span>
                                <span className="font-semibold">{formatPrice(filters.priceRange[1])}</span>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};