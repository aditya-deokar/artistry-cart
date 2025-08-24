'use client'

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';
import { useSearchParams } from 'next/navigation';

// Import Components
import { Bounded } from '@/components/common/Bounded';
import { Pagination } from '@/components/shop/Pagination';
import { ProductCard } from '@/components/products/ProductCard'; 
import { SearchFilters, SearchFilterState } from './SearchFilters';
import { useDebounce } from '@/hooks/useDebounce';

export const SearchResultsView: React.FC = () => {
    
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    
    // 1. Create a single state object to hold all filters and pagination
    const [filters, setFilters] = useState({
        page: 1,
        sortBy: 'relevance' as SearchFilterState['sortBy'],
        category: 'all',
        priceRange: [0, 50000] as [number, number],
    });
    
    // 2. Debounce the price range to avoid excessive API calls while sliding
    const debouncedPriceRange = useDebounce(filters.priceRange, 500);

    // 3. The query key MUST include all filters to ensure data is refetched when they change
    const queryKey = ['fullSearch', query, filters.page, filters.sortBy, filters.category, debouncedPriceRange];

    const { data, isLoading, isError } = useQuery({
        queryKey,
        queryFn: async () => {
            const params = new URLSearchParams({ 
                q: query, 
                page: filters.page.toString(),
                sortBy: filters.sortBy,
                category: filters.category,
                minPrice: debouncedPriceRange[0].toString(),
                maxPrice: debouncedPriceRange[1].toString(),
            });
            const res = await axiosInstance.get(`/product/api/search/full?${params.toString()}`);
            return res.data;
        },
        enabled: !!query, // Only run query if a search term exists
    });
    
    const [page, setPage] = useState(1);
    const [category, setCategory] = useState('all');

   // This would come from an API call, e.g., to your site_config
    const availableCategories = ["prints", "sculptures", "paintings", "crafts"];

    // if (isLoading) return <p>Loading search results...</p>; // Replace with loading.tsx content
    if (isError) return <p>Failed to load search results.</p>;
    
    const products = data?.products || [];
    const pagination = data?.pagination;

    return (
        <Bounded>
            <div className="py-4 text-center">
                <h1 className="font-display text-5xl">Search Results</h1>
                {query && <p className="mt-4 text-lg text-primary/70">Showing results for: <span className="text-accent font-semibold">"{query}"</span></p>}
            </div>

            <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <aside className="lg:col-span-1">
                    <SearchFilters  filters={filters} setFilters={setFilters} categories={availableCategories}  />
                </aside>
                <section className="lg:col-span-3">
                    {products.length > 0 ? (
                        <>
                            <div className="grid gap-8">
                                {products.map((p:any) => <ProductCard key={p.id} product={p} />)}
                              
                            </div>
                            {pagination && pagination.totalPages > 1 && (
                                <div className="mt-16">
                                    <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20">
                            <h3 className="text-2xl font-semibold">No Products Found</h3>
                            <p className="text-neutral-500 mt-2">Try a different search term or adjust your filters.</p>
                        </div>
                    )}
                </section>
            </main>
        </Bounded>
    );
};