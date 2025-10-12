// components/dashboard/products/ProductSearch.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, X, Filter, SortAsc, SortDesc } from 'lucide-react';
import { useProductStore } from '@/store/products/productStore';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { getSellerProducts } from '@/lib/api/products';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  type: 'product' | 'category' | 'brand' | 'tag';
  value: string;
  count?: number;
  id?: string;
}

export default function ProductSearch() {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    searchQuery, 
    setSearchQuery, 
    filters, 
    clearFilters,
    selectedCount 
  } = useProductStore();

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Fetch search suggestions
  const { data: searchResults } = useQuery({
    queryKey: ['product-search', debouncedQuery],
    queryFn: () => getSellerProducts({ 
      search: debouncedQuery, 
      limit: 5 
    }),
    enabled: debouncedQuery.length > 2,
  });

  // Generate suggestions from search results
  useEffect(() => {
    if (searchResults?.products) {
      const newSuggestions: SearchSuggestion[] = [];
      
      // Add product suggestions
      searchResults.products.forEach(product => {
        newSuggestions.push({
          type: 'product',
          value: product.title,
          id: product.id
        });
      });

      // Add unique categories
      const categories = [...new Set(searchResults.products.map(p => p.category))];
      categories.forEach(category => {
        newSuggestions.push({
          type: 'category',
          value: category,
          count: searchResults.products.filter(p => p.category === category).length
        });
      });

      // Add unique brands
      const brands = [...new Set(searchResults.products.map(p => p.brand).filter(Boolean))];
      brands.forEach(brand => {
        newSuggestions.push({
          type: 'brand',
          value: brand!,
          count: searchResults.products.filter(p => p.brand === brand).length
        });
      });

      setSuggestions(newSuggestions.slice(0, 8));
    }
  }, [searchResults]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setOpen(false);
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'product') {
      setSearchQuery(suggestion.value);
    } else if (suggestion.type === 'category') {
      setSearchQuery('');
      useProductStore.getState().setFilters({ category: suggestion.value });
    } else if (suggestion.type === 'brand') {
      setSearchQuery('');
      useProductStore.getState().setFilters({ brand: suggestion.value });
    }
    setOpen(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== false && (Array.isArray(value) ? value.some(v => v !== 0) : true)
  );

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'product': return '📦';
      case 'category': return '📁';
      case 'brand': return '🏷️';
      case 'tag': return '🏷️';
      default: return '🔍';
    }
  };

  return (
    <div className="flex items-center gap-2 w-full max-w-md">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search products, categories, brands..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOpen(e.target.value.length > 0);
              }}
              onFocus={() => setOpen(searchQuery.length > 0)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-6 w-6 p-0"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search..." value={searchQuery} />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              
              {suggestions.length > 0 && (
                <CommandGroup heading="Suggestions">
                  {suggestions.map((suggestion, index) => (
                    <CommandItem
                      key={`${suggestion.type}-${suggestion.value}-${index}`}
                      onSelect={() => handleSuggestionSelect(suggestion)}
                      className="flex items-center gap-2"
                    >
                      <span className="text-lg">
                        {getSuggestionIcon(suggestion.type)}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium">{suggestion.value}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {suggestion.type}
                          {suggestion.count && ` • ${suggestion.count} items`}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {searchQuery && (
                <CommandGroup heading="Actions">
                  <CommandItem onSelect={() => handleSearch(searchQuery)}>
                    <Search className="h-4 w-4 mr-2" />
                    Search for "{searchQuery}"
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Filter indicator */}
      {(hasActiveFilters || selectedCount > 0) && (
        <div className="flex items-center gap-1">
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          )}
          
          {selectedCount > 0 && (
            <Badge variant="secondary">
              {selectedCount} selected
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
