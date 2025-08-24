'use client';

import React from 'react';

// UI Components from your library (e.g., ShadCN/UI)
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Utils
import { formatPrice } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Filter } from 'lucide-react';

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
    
    // Handler functions now update the parent's state, resetting the page to 1
    const handleCategoryChange = (category: string) => {
        setFilters(prev => ({ ...prev, category, page: 1 }));
    };

    const handlePriceChange = (value: number[]) => {
        setFilters(prev => ({ ...prev, priceRange: [value[0], value[1]], page: 1 }));
    };
    
    const handleSortChange = (value: SearchFilterState['sortBy']) => {
        setFilters(prev => ({ ...prev, sortBy: value, page: 1 }));
    };

    const categoryButtonBase = "block w-full text-left p-2 rounded-md transition-colors text-sm";
    const categoryButtonSelected = "bg-primary/10 text-primary font-semibold dark:bg-primary/20";

    return (
        <div className="space-y-6 sticky top-24">
            <div className="flex items-center gap-2">
                <Filter size={22} />
                <h3 className="font-display text-2xl text-foreground">Filter & Sort</h3>
            </div>
            
            <div>
                 <h4 className="font-semibold text-lg mb-2 text-foreground">Sort By</h4>
                 <Select onValueChange={handleSortChange} defaultValue={filters.sortBy}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sort artworks" />
                    </SelectTrigger>
                    <SelectContent>
                        {/* 'Relevance' is a new, important sort option for search */}
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <Accordion type="multiple" defaultValue={['category', 'price']} className="w-full">
                <AccordionItem value="category">
                    <AccordionTrigger className="font-display text-xl hover:no-underline">Category</AccordionTrigger>
                    <AccordionContent className="pt-2 space-y-1">
                        <button 
                            onClick={() => handleCategoryChange('all')} 
                            className={cn(categoryButtonBase, filters.category === 'all' ? categoryButtonSelected : 'hover:bg-accent/80')}
                        >
                            All Categories
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat} 
                                onClick={() => handleCategoryChange(cat)} 
                                className={cn(categoryButtonBase, filters.category === cat ? categoryButtonSelected : 'hover:bg-accent/80')}
                            >
                                {cat}
                            </button>
                        ))}
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="price">
                    <AccordionTrigger className="font-display text-xl hover:no-underline">Price Range</AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                        <Slider
                            defaultValue={filters.priceRange}
                            max={50000}
                            step={100}
                            onValueChange={handlePriceChange} // Note: ShadCN slider uses onValueChange for debounced-like behavior
                        />
                         <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{formatPrice(filters.priceRange[0])}</span>
                            <span>{formatPrice(filters.priceRange[1])}</span>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};