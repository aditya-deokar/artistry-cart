'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArtisanCard, type Artisan } from './ArtisanCard';
import { Loader2 } from 'lucide-react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface ArtisanGridProps {
    artisans: Artisan[];
    view?: 'grid' | 'list';
    isLoading?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
}

// Skeleton loader for artisan cards
function ArtisanCardSkeleton({ variant = 'grid' }: { variant?: 'grid' | 'list' }) {
    if (variant === 'list') {
        return (
            <div className="flex gap-6 p-4 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] animate-pulse">
                <div className="w-24 h-24 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                <div className="flex-1 space-y-3">
                    <div className="h-5 w-1/3 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                    <div className="h-4 w-1/4 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                    <div className="flex gap-2">
                        <div className="h-3 w-20 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                        <div className="h-3 w-16 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] overflow-hidden animate-pulse">
            <div className="aspect-[3/4] bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
            <div className="p-4 space-y-3">
                <div className="h-3 w-24 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                <div className="h-5 w-3/4 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                <div className="h-4 w-1/2 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                <div className="flex gap-2">
                    <div className="h-3 w-20 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                    <div className="h-5 w-16 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                </div>
                <div className="flex justify-between pt-3 border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                    <div className="h-4 w-24 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                    <div className="h-4 w-20 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                </div>
            </div>
        </div>
    );
}

export function ArtisanGrid({
    artisans,
    view = 'grid',
    isLoading = false,
    hasMore = false,
    onLoadMore,
}: ArtisanGridProps) {
    const gridRef = useRef<HTMLDivElement>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Entrance animation for cards
    useLayoutEffect(() => {
        if (artisans.length === 0) return;

        const ctx = gsap.context(() => {
            gsap.from('.artisan-card', {
                y: 60,
                opacity: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: gridRef.current,
                    start: 'top 85%',
                },
            });
        }, gridRef);

        return () => ctx.revert();
    }, [artisans.length]);

    // Infinite scroll trigger
    useLayoutEffect(() => {
        if (!hasMore || !onLoadMore || !loadMoreRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoading) {
                    onLoadMore();
                }
            },
            { rootMargin: '200px' }
        );

        observer.observe(loadMoreRef.current);

        return () => observer.disconnect();
    }, [hasMore, onLoadMore, isLoading]);

    // Empty state
    if (!isLoading && artisans.length === 0) {
        return (
            <div className="py-20 text-center">
                <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] flex items-center justify-center">
                        <span className="text-3xl">🎨</span>
                    </div>
                    <h3 className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-3">
                        No artisans found
                    </h3>
                    <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
                        Try adjusting your filters or search terms to discover more talented makers.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div ref={gridRef} className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
            {/* Grid */}
            <div
                className={
                    view === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                        : 'flex flex-col gap-4'
                }
            >
                {artisans.map((artisan) => (
                    <div key={artisan.id} className="artisan-card">
                        <ArtisanCard artisan={artisan} variant={view} />
                    </div>
                ))}

                {/* Loading skeletons */}
                {isLoading &&
                    Array.from({ length: view === 'grid' ? 8 : 4 }).map((_, i) => (
                        <ArtisanCardSkeleton key={`skeleton-${i}`} variant={view} />
                    ))}
            </div>

            {/* Load More Trigger */}
            {hasMore && (
                <div ref={loadMoreRef} className="flex justify-center py-12">
                    {isLoading ? (
                        <div className="flex items-center gap-3 text-[var(--ac-stone)]">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm">Loading more artisans...</span>
                        </div>
                    ) : (
                        <button
                            onClick={onLoadMore}
                            className="px-8 py-3 border border-[var(--ac-charcoal)] dark:border-[var(--ac-pearl)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] text-sm tracking-wider uppercase font-medium hover:bg-[var(--ac-charcoal)] hover:text-[var(--ac-ivory)] dark:hover:bg-[var(--ac-pearl)] dark:hover:text-[var(--ac-obsidian)] transition-colors"
                        >
                            Load More Artisans
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
