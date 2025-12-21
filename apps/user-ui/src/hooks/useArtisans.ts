'use client';

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { useQueryStates, parseAsString, parseAsInteger } from 'nuqs';
import {
    getArtisans,
    getFeaturedArtisans,
    getArtisanCategories,
    getArtisanById,
    searchArtisanSuggestions,
    type ArtisanFilters,
    type ArtisansResponse,
} from '@/actions/artisan.actions';
import type { Artisan } from '@/components/artisans/ArtisanCard';
import { useDebounce } from './useDebounce';

const ARTISANS_PER_PAGE = 12;

/**
 * Hook for managing artisan filter state with URL synchronization
 */
export function useArtisanFilters() {
    const [filters, setFilters] = useQueryStates({
        search: parseAsString.withDefault(''),
        category: parseAsString.withDefault('all'),
        location: parseAsString.withDefault('all'),
        rating: parseAsString.withDefault('all'),
        sort: parseAsString.withDefault('featured'),
    });

    const debouncedSearch = useDebounce(filters.search, 300);

    const updateFilter = useCallback(
        (key: keyof typeof filters, value: string) => {
            setFilters({ [key]: value });
        },
        [setFilters]
    );

    const clearFilters = useCallback(() => {
        setFilters({
            search: '',
            category: 'all',
            location: 'all',
            rating: 'all',
            sort: 'featured',
        });
    }, [setFilters]);

    const activeFiltersCount = useMemo(() => {
        return [
            filters.category !== 'all',
            filters.location !== 'all',
            filters.rating !== 'all',
        ].filter(Boolean).length;
    }, [filters.category, filters.location, filters.rating]);

    return {
        filters: {
            ...filters,
            search: debouncedSearch, // Use debounced search for API calls
        },
        rawSearch: filters.search, // Use raw search for input display
        setFilters,
        updateFilter,
        clearFilters,
        activeFiltersCount,
    };
}

/**
 * Hook for fetching paginated artisans with infinite scroll
 */
export function useInfiniteArtisans(filters: ArtisanFilters) {
    return useInfiniteQuery({
        queryKey: ['artisans', 'infinite', filters],
        queryFn: async ({ pageParam = 1 }) => {
            return getArtisans({
                ...filters,
                page: pageParam,
                limit: ARTISANS_PER_PAGE,
            });
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.hasMore) {
                return lastPage.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook for fetching artisans with standard pagination
 */
export function useArtisans(filters: ArtisanFilters & { page?: number }) {
    const { page = 1, ...restFilters } = filters;

    return useQuery({
        queryKey: ['artisans', 'paginated', filters],
        queryFn: () =>
            getArtisans({
                ...restFilters,
                page,
                limit: ARTISANS_PER_PAGE,
            }),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook for fetching featured artisans
 */
export function useFeaturedArtisans(limit = 6) {
    return useQuery({
        queryKey: ['artisans', 'featured', limit],
        queryFn: () => getFeaturedArtisans(limit),
        staleTime: 1000 * 60 * 15, // 15 minutes
    });
}

/**
 * Hook for fetching artisan categories with counts
 */
export function useArtisanCategories() {
    return useQuery({
        queryKey: ['artisans', 'categories'],
        queryFn: getArtisanCategories,
        staleTime: 1000 * 60 * 30, // 30 minutes
    });
}

/**
 * Hook for fetching a single artisan by ID
 */
export function useArtisan(id: string | null) {
    return useQuery({
        queryKey: ['artisan', id],
        queryFn: () => (id ? getArtisanById(id) : null),
        enabled: !!id,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}

/**
 * Hook for search suggestions (autocomplete)
 */
export function useArtisanSearchSuggestions(query: string) {
    const debouncedQuery = useDebounce(query, 200);

    return useQuery({
        queryKey: ['artisans', 'suggestions', debouncedQuery],
        queryFn: () => searchArtisanSuggestions(debouncedQuery),
        enabled: debouncedQuery.length >= 2,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Helper hook to flatten infinite query pages into a single array
 */
export function useFlattenedArtisans(
    data: { pages: ArtisansResponse[] } | undefined
): { artisans: Artisan[]; total: number } {
    return useMemo(() => {
        if (!data?.pages) {
            return { artisans: [], total: 0 };
        }

        const artisans = data.pages.flatMap((page) => page.artisans);
        const total = data.pages[0]?.total || 0;

        return { artisans, total };
    }, [data]);
}
