'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArtisansHero,
    ArtisanFilters,
    ArtisanGrid,
    FeaturedArtisans,
    CraftCategories,
    ArtisanStories,
    BecomeArtisanCTA,
} from '@/components/artisans';
import {
    useArtisanFilters,
    useInfiniteArtisans,
    useFlattenedArtisans,
} from '@/hooks/useArtisans';

export function ArtisansPageClient() {
    const router = useRouter();
    const [view, setView] = useState<'grid' | 'list'>('grid');

    // URL-synced filters
    const {
        filters,
        rawSearch,
        updateFilter,
        clearFilters,
        activeFiltersCount,
    } = useArtisanFilters();

    // Infinite scroll data fetching
    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteArtisans(filters);

    // Flatten paginated data
    const { artisans, total } = useFlattenedArtisans(data);

    // Check if any filters are active (to decide which view to show)
    const hasActiveFilters =
        filters.search ||
        filters.category !== 'all' ||
        filters.location !== 'all' ||
        filters.rating !== 'all';

    // Handle hero search
    const handleSearch = useCallback(
        (query: string) => {
            updateFilter('search', query);
            // Scroll to results
            window.scrollTo({
                top: window.innerHeight * 0.8,
                behavior: 'smooth',
            });
        },
        [updateFilter]
    );

    // Handle view change
    const handleViewChange = useCallback((newView: 'grid' | 'list') => {
        setView(newView);
    }, []);

    // Handle load more
    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <>
            {/* Hero Section */}
            <ArtisansHero onSearch={handleSearch} />

            {/* Featured Artisans Carousel - Only show when no filters */}
            {!hasActiveFilters && <FeaturedArtisans />}

            {/* Filters - Always visible */}
            <ArtisanFilters
                totalResults={total}
                currentView={view}
                onViewChange={handleViewChange}
            />

            {/* Artisan Grid */}
            <ArtisanGrid
                artisans={artisans}
                view={view}
                isLoading={isLoading || isFetchingNextPage}
                hasMore={!!hasNextPage}
                onLoadMore={handleLoadMore}
            />

            {/* Additional Sections - Only show on initial load (no filters) */}
            {!hasActiveFilters && (
                <>
                    {/* Craft Categories */}
                    <CraftCategories />

                    {/* Artisan Stories */}
                    <ArtisanStories />

                    {/* Become an Artisan CTA */}
                    <BecomeArtisanCTA />
                </>
            )}
        </>
    );
}
