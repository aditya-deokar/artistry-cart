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
import { SlidersHorizontal, ChevronDown, LayoutGrid, Square } from 'lucide-react';

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
        <div className="bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] min-h-screen pt-[128px]">
            {/* <ShopHero /> */}
            <main className="w-full">
                {/* Top Filter Bar */}
                <div className="border-b border-[var(--ac-linen)] dark:border-white/10 bg-transparent relative z-20">
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                        {/* Left Side: Filters */}
                        <div className="flex items-center space-x-6 text-sm text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                            <button className="flex items-center gap-2 hover:text-[var(--ac-gold)] transition-colors">
                                <SlidersHorizontal size={16} />
                                <span>All Filters</span>
                            </button>
                            <div className="hidden md:flex items-center space-x-6">
                                <button className="flex items-center gap-1 hover:text-[var(--ac-gold)] transition-colors">
                                    Availability <ChevronDown size={14} />
                                </button>
                                <button className="flex items-center gap-1 hover:text-[var(--ac-gold)] transition-colors">
                                    Material <ChevronDown size={14} />
                                </button>
                                <button className="flex items-center gap-1 hover:text-[var(--ac-gold)] transition-colors">
                                    Design Style <ChevronDown size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Right Side: Count and View */}
                        <div className="flex items-center space-x-6 text-sm text-[var(--ac-stone)]">
                            <span>{pagination?.totalItems || products.length} products</span>
                            <div className="flex items-center space-x-3">
                                <button className="hover:text-[var(--ac-charcoal)] dark:hover:text-white transition-colors">
                                    <LayoutGrid size={18} />
                                </button>
                                <button className="text-gray-300 dark:text-gray-600 hover:text-[var(--ac-charcoal)] dark:hover:text-white transition-colors">
                                    <Square size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <section className="w-full relative">
                        {isLoading && <div className="absolute inset-0 bg-white/50 z-20"></div>} {/* Subtle loading overlay */}

                        {products.length > 0 ? (
                            <>
                                <ProductGrid products={products} />
                                {pagination && pagination.totalPages > 1 && (
                                    <div className="mt-16">
                                        <Pagination
                                            currentPage={pagination.currentPage}
                                            totalPages={pagination.totalPages}
                                            onPageChange={handlePageChange}
                                        />
                                    </div>
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