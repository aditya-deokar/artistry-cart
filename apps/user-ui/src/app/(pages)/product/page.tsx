'use client';

import axiosInstance from '@/utils/axiosinstance';
import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';

import { FilterSidebar } from '@/components/shop/FilterSidebar';
import { ProductGrid } from '@/components/shop/ProductGrid';

import Loading from './loading';
import { ArtProduct } from '@/types/products';
import { Pagination } from '@/components/shop/Pagination';
import { ShopHero } from '@/components/shop/ShopHero';

// A custom hook for debouncing input to prevent excessive API calls
const useDebounce = (value: any, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

// ... imports
import { useQueryStates, parseAsInteger, parseAsString, parseAsArrayOf } from 'nuqs';

const ProductPage = () => {
    // nuqs: Type-safe URL state management
    const [filters, setFilters] = useQueryStates({
        page: parseAsInteger.withDefault(1),
        category: parseAsString.withDefault('all'),
        // Store price as [min, max] URL params? Or a single param?
        // The previous FilterSidebar expected priceRange: [number, number].
        // Let's stick to the previous pattern of parsing distinct params if possible, 
        // OR use a serializer. For simplicity and consistency with search filters, 
        // let's use the array parser.
        // NOTE: URL will look like ?priceRange=0,50000
        priceRange: parseAsArrayOf(parseAsInteger).withDefault([0, 50000]),
        sortBy: parseAsString.withDefault('newest'),
        search: parseAsString.withDefault(''),
    }, {
        history: 'push', // Create history entries so back button works
        shallow: true    // Client-side filtering, no need to run server components
    });

    // Use the debounced search term and price for the API query
    const debouncedSearch = useDebounce(filters.search, 500);
    // priceRange from nuqs is number[] | null. We default it above, but debouncing might need care.
    const debouncedPriceRange = useDebounce(filters.priceRange, 500);

    const apiFilters = {
        ...filters,
        search: debouncedSearch,
        priceRange: debouncedPriceRange,
    };

    const { data, isLoading, isError } = useQuery({
        // The query key MUST include all filters to ensure data is refetched when they change
        queryKey: ['products', apiFilters],
        queryFn: async () => {
            // Build a clean query string
            const params = new URLSearchParams({
                page: apiFilters.page.toString(),
                limit: '12',
                sortBy: apiFilters.sortBy,
                category: apiFilters.category,
                // Default to 0/50000 if null/undefined (though .withDefault handles most)
                minPrice: (apiFilters.priceRange?.[0] ?? 0).toString(),
                maxPrice: (apiFilters.priceRange?.[1] ?? 50000).toString(),
            });

            if (apiFilters.search) {
                params.set('search', apiFilters.search);
            }

            // Updated endpoint based on the new API structure
            const res = await axiosInstance.get(`/product/api/products?${params.toString()}`);
            return res.data.data; // The API returns { success: true, data: { products, pagination } }
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
    });

    // Simplified category query to avoid unused variables
    const { data: CategoryData } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            try {
                // Updated endpoint for categories
                const res = await axiosInstance.get("/product/api/categories");
                return res.data.data; // Access the data property
            } catch (error) {
                console.error("Failed to fetch categories:", error);
                return { categories: [] }; // Return default data on error
            }
        },
        staleTime: 1000 * 60 * 5,
        retry: 2,
    });

    // Handle the updated API response structure
    const categories = CategoryData?.categories || [];


    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
        window.scrollTo(0, 0); // Scroll to top on page change
    };

    // Use the fetched data
    const products: ArtProduct[] = data?.products || [];
    const pagination = data?.pagination;

    if (isLoading && !data) { // Show full skeleton only on initial load
        return <Loading />;
    }

    if (isError) {
        return <div className="text-center py-40">Failed to load artworks. Please try again later.</div>;
    }

    console.log(data)

    return (
        <div >
            {/* <ShopHero /> */}
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className="lg:col-span-1">
                        <FilterSidebar
                            categories={categories}
                            filters={{
                                category: filters.category,
                                priceRange: filters.priceRange,
                                sortBy: filters.sortBy as any
                            }}
                            setFilters={setFilters}
                        />
                    </aside>
                    <section className="lg:col-span-3">
                        {isLoading && <div className="absolute inset-0 bg-white/50 z-20"></div>} {/* Subtle loading overlay */}

                        {products.length > 0 ? (
                            <>
                                <ProductGrid products={products} />
                                {pagination && pagination.totalPages > 1 && (
                                    <Pagination
                                        currentPage={pagination.currentPage}
                                        totalPages={pagination.totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20">
                                <h3 className="text-2xl font-semibold">No Art Found</h3>
                                <p className="text-neutral-600 mt-2">Try adjusting your filters to discover new creations.</p>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default ProductPage;