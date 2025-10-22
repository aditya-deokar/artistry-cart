'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearch, SearchResult, SearchCategory } from '@/contexts/SearchContext';
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandEmpty,
} from '@/components/ui/command';
import {
  Package,
  ShoppingCart,
  Calendar,
  Tag,
  FileText,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import axiosInstance from '@/utils/axiosinstance';
import { useDebounce } from '@/hooks/useDebounce';

const categoryIcons = {
  products: Package,
  orders: ShoppingCart,
  events: Calendar,
  discounts: Tag,
  all: FileText,
};

const categoryLabels = {
  products: 'Products',
  orders: 'Orders',
  events: 'Events',
  discounts: 'Discounts',
  all: 'All Results',
};

export function GlobalSearchDialog() {
  const router = useRouter();
  const {
    isOpen,
    closeSearch,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearching,
    setIsSearching,
    selectedCategory,
  } = useSearch();

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearch.trim().length > 0) {
      performSearch(debouncedSearch);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearch, selectedCategory]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await axiosInstance.get('/product/api/search/seller', {
        params: {
          q: query,
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          limit: 20,
        },
      });

      console.log('Search API Response:', response.data);
      
      let results: SearchResult[] = [];
      
      if (response.data?.data?.results) {
        results = response.data.data.results;
      } else if (response.data?.data) {
        const data = response.data.data;
        results = [
          ...(data.products || []),
          ...(data.events || []),
          ...(data.discounts || []),
          ...(data.orders || [])
        ];
      }
      
      console.log('Parsed Results:', results);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    closeSearch();
    router.push(result.url);
  };

  const groupedResults = searchResults.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <CommandDialog 
      open={isOpen} 
      onOpenChange={closeSearch}
      shouldFilter={false}  // ✅ KEY FIX: Disable internal filtering
    >
      <CommandInput
        placeholder="Search products, orders, events, discounts..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        {isSearching && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
          </div>
        )}
        
        {!isSearching && searchQuery.length === 0 && (
          <div className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">
              Start typing to search across your dashboard
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Badge variant="secondary" className="text-xs">Products</Badge>
              <Badge variant="secondary" className="text-xs">Orders</Badge>
              <Badge variant="secondary" className="text-xs">Events</Badge>
              <Badge variant="secondary" className="text-xs">Discounts</Badge>
            </div>
          </div>
        )}
        
        {!isSearching && searchQuery.length > 0 && searchResults.length === 0 && (
          <CommandEmpty>
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm font-medium">No results found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try searching with different keywords
              </p>
            </div>
          </CommandEmpty>
        )}
        
        {!isSearching && searchResults.length > 0 && 
          Object.entries(groupedResults).map(([category, results], index) => {
            const Icon = categoryIcons[category as SearchCategory];
            const label = categoryLabels[category as SearchCategory];

            return (
              <div key={category}>
                {index > 0 && <CommandSeparator />}
                <CommandGroup heading={label}>
                  {results.map((result) => {
                    const imageUrl = typeof result.imageUrl === 'object' && result.imageUrl !== null
                      ? (result.imageUrl as any).url
                      : result.imageUrl;
                    
                    return (
                      <CommandItem
                        key={result.id}
                        value={`${result.id}-${result.title}`}  // ✅ Add unique value prop
                        onSelect={() => handleSelect(result)}
                        className="flex items-center gap-3 py-3 cursor-pointer"
                      >
                        {imageUrl ? (
                          <div className="relative h-10 w-10 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                            <Image
                              src={imageUrl}
                              alt={result.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-muted">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              {result.title}
                            </p>
                            {result.metadata?.status && (
                              <Badge variant="outline" className="text-xs">
                                {result.metadata.status}
                              </Badge>
                            )}
                          </div>
                          {result.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {result.description}
                            </p>
                          )}
                          {result.metadata?.price && (
                            <p className="text-xs text-muted-foreground mt-1">
                              ₹{result.metadata.price}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </div>
            );
          })
        }
      </CommandList>
    </CommandDialog>
  );
}
