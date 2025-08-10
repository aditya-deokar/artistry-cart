'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice } from "@/lib/formatters";
import { cn } from "@/lib/utils";

const categories = ['Paintings', 'Sculptures', 'Prints', 'Digital Art', 'Handmade Crafts'];

export const FilterSidebar = ({ filters, setFilters }) => {
    const handleCategoryChange = (category) => {
        setFilters(prev => ({ ...prev, category, page: 1 })); // Reset to page 1 on filter change
    };

    const handlePriceChange = (value) => {
        setFilters(prev => ({ ...prev, priceRange: value, page: 1 }));
    };
    
    const handleSortChange = (value) => {
        setFilters(prev => ({ ...prev, sortBy: value, page: 1 }));
    };

    // --- STYLES for buttons for better maintainability ---
    const categoryButtonBase = "block w-full text-left p-2 rounded-md transition-colors text-sm";
    const categoryButtonSelected = "bg-primary/10 text-primary font-semibold dark:bg-primary/20"; // Semantic "primary" color for selection

    return (
        <div className="space-y-8 sticky top-24">
            <div>
                 <h3 className="font-display text-xl mb-4 text-foreground">Sort By</h3>
                 <Select onValueChange={handleSortChange} defaultValue={filters.sortBy}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sort artworks" />
                    </SelectTrigger>
                    <SelectContent>
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
                            className={cn(categoryButtonBase, filters.category === 'all' ? categoryButtonSelected : 'hover:bg-accent')}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat} 
                                onClick={() => handleCategoryChange(cat)} 
                                className={cn(categoryButtonBase, filters.category === cat ? categoryButtonSelected : 'hover:bg-accent')}
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
                            onValueChange={handlePriceChange}
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