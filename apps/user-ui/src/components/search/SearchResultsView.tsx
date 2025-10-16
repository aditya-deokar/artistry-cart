'use client'

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';
import { useSearchParams } from 'next/navigation';
import { Loader2, Package, Grid3x3, List, ArrowUpDown } from 'lucide-react';

// Import Components
import { SearchProductCard } from './SearchProductCard';
import { SearchFilters, SearchFilterState } from './SearchFilters';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const SearchResultsView: React.FC = () => {
    
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    
    // Single state object to hold all filters and pagination
    const [filters, setFilters] = useState({
        page: 1,
        sortBy: 'relevance' as SearchFilterState['sortBy'],
        category: 'all',
        priceRange: [0, 50000] as [number, number],
    });
    
    // Layout state
    const [layout, setLayout] = useState<'grid' | 'list'>('grid');
    
    // Debounce the price range to avoid excessive API calls while sliding
    const debouncedPriceRange = useDebounce(filters.priceRange, 500);

    // Query key includes all filters to ensure data is refetched when they change
    const queryKey = ['fullSearch', query, filters.page, filters.sortBy, filters.category, debouncedPriceRange];

    const { data, isLoading, isError } = useQuery({
        queryKey,
        queryFn: async () => {
            const params = new URLSearchParams({ 
                q: encodeURIComponent(query), 
                page: filters.page.toString(),
                sortBy: filters.sortBy,
                category: filters.category,
                minPrice: debouncedPriceRange[0].toString(),
                maxPrice: debouncedPriceRange[1].toString(),
            });
            const res = await axiosInstance.get(`/product/api/search?${params.toString()}`);
            
            // Handle nested response structure
            if (res.data?.data) {
                return res.data.data;
            }
            return res.data;
        },
        enabled: !!query, // Only run query if a search term exists
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Available categories - could come from API
    const availableCategories = ["prints", "sculptures", "paintings", "crafts"];

    if (isError) {
        return (
            <div className="container mx-auto px-4 py-20">
                <div className="text-center bg-destructive/10 rounded-xl border border-destructive/20 p-12">
                    <Package className="h-16 w-16 mx-auto text-destructive/50 mb-4" />
                    <h2 className="text-2xl font-semibold text-destructive mb-2">Failed to load search results</h2>
                    <p className="text-muted-foreground">Please try again or refine your search</p>
                </div>
            </div>
        );
    }
    
    const products = data?.products || [];
    const pagination = data?.pagination;

    return (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <h1 className="text-4xl lg:text-5xl font-bold mb-2">Search Results</h1>
                {query && (
                    <p className="text-lg text-muted-foreground">
                        Showing results for: <span className="text-foreground font-semibold">"{query}"</span>
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <aside className="lg:col-span-1">
                    <div className="sticky top-4">
                        <SearchFilters 
                            filters={filters} 
                            setFilters={setFilters} 
                            categories={availableCategories} 
                        />
                    </div>
                </aside>

                {/* Results Section */}
                <section className="lg:col-span-3">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                            <p className="text-muted-foreground">Searching products...</p>
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            {/* Results Header with Layout Toggle */}
                            <div className="flex items-center justify-between mb-6 pb-4 border-b">
                                <div className="flex items-center gap-4">
                                    <p className="text-sm text-muted-foreground">
                                        Found <span className="font-bold text-foreground text-lg">{pagination?.total || products.length}</span> products
                                    </p>
                                    {pagination?.total && (
                                        <p className="text-xs text-muted-foreground">
                                            Page {filters.page} of {pagination.totalPages}
                                        </p>
                                    )}
                                </div>
                                
                                {/* View Toggle & Sort */}
                                <div className="flex items-center gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <ArrowUpDown className="h-4 w-4" />
                                                <span className="hidden sm:inline">Sort</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, sortBy: 'relevance', page: 1 }))}>
                                                Relevance
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, sortBy: 'newest', page: 1 }))}>
                                                Newest First
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, sortBy: 'price-asc', page: 1 }))}>
                                                Price: Low to High
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, sortBy: 'price-desc', page: 1 }))}>
                                                Price: High to Low
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <div className="flex items-center gap-1 border rounded-lg p-1">
                                        <Button
                                            variant={layout === 'grid' ? 'secondary' : 'ghost'}
                                            size="sm"
                                            onClick={() => setLayout('grid')}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Grid3x3 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant={layout === 'list' ? 'secondary' : 'ghost'}
                                            size="sm"
                                            onClick={() => setLayout('list')}
                                            className="h-8 w-8 p-0"
                                        >
                                            <List className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Products Grid/List */}
                            <div className={layout === 'grid' 
                                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                                : "flex flex-col gap-4"
                            }>
                                {products.map((p: any) => (
                                    <SearchProductCard 
                                        key={p.id || p.slug} 
                                        product={p}
                                        layout={layout}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-12">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                        disabled={filters.page === 1}
                                    >
                                        Previous
                                    </Button>
                                    
                                    <div className="flex gap-1">
                                        {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                                            let pageNum: number;
                                            if (pagination.totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (filters.page <= 3) {
                                                pageNum = i + 1;
                                            } else if (filters.page >= pagination.totalPages - 2) {
                                                pageNum = pagination.totalPages - 4 + i;
                                            } else {
                                                pageNum = filters.page - 2 + i;
                                            }
                                            
                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={pageNum === filters.page ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => {
                                                        setFilters(prev => ({ ...prev, page: pageNum }));
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}
                                                    className="min-w-10"
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                                        disabled={filters.page === pagination.totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20 bg-muted/30 rounded-xl">
                            <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-2xl font-semibold mb-2">No Products Found</h3>
                            <p className="text-muted-foreground">Try a different search term or adjust your filters.</p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
};