'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { SectionContainer } from '../ui/SectionContainer';
import { GalleryFilters } from './GalleryFilters';
import { GalleryItem } from './GalleryItem';
import { ConceptLightbox } from './ConceptLightbox';
import { Sparkles, ImageIcon, CheckCircle, RefreshCcw, Loader2 } from 'lucide-react';
import { useConceptGallery, useSchemaData } from '@/hooks/useAIVision';
import type { GalleryItem as GalleryItemType } from '@/types/aivision';

gsap.registerPlugin(ScrollTrigger);

export function ConceptGallery() {
    const {
        items,
        pagination,
        filters,
        isLoading,
        error,
        loadGallery,
        loadMore,
        setFilters,
        toggleFavorite,
        hasMore,
    } = useConceptGallery();

    // Schema auto-loads on hook mount
    const { categories, isLoaded: schemaLoaded } = useSchemaData();

    const [lightboxItem, setLightboxItem] = useState<GalleryItemType | null>(null);

    const galleryRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    // Load gallery on mount
    useEffect(() => {
        loadGallery();
    }, [loadGallery]);

    // Infinite scroll observer
    useEffect(() => {
        if (!sentinelRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(sentinelRef.current);

        return () => observer.disconnect();
    }, [hasMore, isLoading, loadMore]);

    // Header animation
    useGSAP(
        () => {
            if (!headerRef.current) return;

            gsap.fromTo(
                headerRef.current,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: headerRef.current,
                        start: 'top 85%',
                    },
                }
            );
        },
        { scope: galleryRef }
    );

    // Animate new items on load
    useGSAP(
        () => {
            if (!gridRef.current) return;

            const itemElements = gridRef.current.querySelectorAll('[data-new="true"]');

            if (itemElements.length > 0) {
                gsap.fromTo(
                    itemElements,
                    { opacity: 0, scale: 0.8, y: 50, rotation: 2 },
                    {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        rotation: 0,
                        duration: 0.6,
                        stagger: {
                            grid: 'auto',
                            from: 'start',
                            amount: 0.5
                        },
                        ease: 'back.out(1.2)',
                        overwrite: 'auto',
                        onComplete: () => {
                            itemElements.forEach((item) => item.removeAttribute('data-new'));
                        },
                    }
                );
            }
        },
        { dependencies: [items], scope: gridRef }
    );

    const handleCategoryChange = (category: string) => {
        setFilters({ category });
    };

    const handleSortChange = (sortBy: 'recent' | 'popular' | 'favorites') => {
        setFilters({ sortBy });
    };

    const handleItemClick = (item: GalleryItemType) => {
        setLightboxItem(item);
    };

    const handleFavoriteToggle = async (id: string) => {
        await toggleFavorite(id);
    };

    return (
        <SectionContainer
            ref={galleryRef}
            variant="gradient"
            maxWidth="xl"
            className="bg-gradient-to-b from-[#111] via-[#1A1A1A] to-[#0D0D0D] relative overflow-hidden"
        >
            {/* Background Texture */}
            <div className="absolute top-0 left-0 w-full h-[300px] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none fade-out-bottom"></div>

            {/* Header */}
            <div ref={headerRef} className="text-center mb-16 relative z-10 px-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--av-gold)]/10 rounded-full mb-6 border border-[var(--av-gold)]/20 shadow-[0_0_25px_rgba(212,168,75,0.1)] backdrop-blur-md animate-pulse-subtle">
                    <ImageIcon className="text-[var(--av-gold)]" size={18} />
                    <span className="text-sm font-semibold text-[var(--av-gold)] uppercase tracking-wide">
                        Community Gallery
                    </span>
                </div>

                <h2 className="text-4xl md:text-6xl font-bold text-[var(--av-pearl)] mb-6 font-serif leading-tight">
                    Explore AI-Generated <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--av-gold)] to-[#FBF5D4]">Visions</span>
                </h2>
                <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
                    <p className="text-lg text-[var(--av-silver)] font-light leading-relaxed">
                        Join a thriving community of creators. Browse thousands of realized artisan projects and get inspired for your own masterpiece.
                    </p>

                    {/* Live Stats Pills */}
                    <div className="flex gap-4 flex-wrap justify-center">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-xs text-[var(--av-silver)]">
                            <CheckCircle size={14} className="text-emerald-500" />
                            <span className="font-bold text-white">{pagination?.total || 0}</span> Total Concepts
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-xs text-[var(--av-silver)]">
                            <RefreshCcw size={14} className="text-blue-500" />
                            <span className="font-bold text-white">Page {pagination?.page || 1}</span> of {pagination?.pages || 1}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative z-10">
                {/* Filters */}
                <div className="mb-10 sticky top-20 z-40 bg-[#111]/80 backdrop-blur-xl py-4 rounded-2xl border border-white/5 shadow-2xl mx-4 lg:mx-0">
                    <GalleryFilters
                        selectedCategory={filters.category}
                        selectedSort={filters.sortBy}
                        categories={categories}
                        onCategoryChange={handleCategoryChange}
                        onSortChange={handleSortChange}
                        isLoading={!schemaLoaded}
                    />
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between mb-6 px-4">
                    <p className="text-sm text-[var(--av-silver)] flex items-center gap-2" aria-live="polite">
                        Showing <span className="font-bold text-[var(--av-pearl)] bg-white/10 px-2 py-0.5 rounded-full">{items.length}</span> of {pagination?.total || 0} items
                    </p>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mx-4 mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-sm">{error}</p>
                        <button
                            onClick={() => loadGallery()}
                            className="text-sm text-[var(--av-gold)] hover:underline mt-2"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Masonry Grid */}
                <div
                    ref={gridRef}
                    className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 px-4"
                >
                    {items.map((item, index) => (
                        <GalleryItem
                            key={item.id}
                            item={item}
                            onClick={() => handleItemClick(item)}
                            onFavoriteToggle={() => handleFavoriteToggle(item.id)}
                            isNew={index >= items.length - 8 && pagination && pagination.page > 1}
                        />
                    ))}
                </div>

                {/* Empty State */}
                {items.length === 0 && !isLoading && (
                    <div className="text-center py-32 flex flex-col items-center">
                        <div className="w-24 h-24 mb-6 rounded-full bg-[var(--av-gold)]/5 flex items-center justify-center border border-[var(--av-gold)]/10 shadow-[0_0_50px_rgba(212,168,75,0.1)]">
                            <Sparkles size={40} className="text-[var(--av-gold)] opacity-50" />
                        </div>
                        <h3 className="text-2xl font-bold text-[var(--av-pearl)] mb-2 font-serif">
                            No concepts found
                        </h3>
                        <p className="text-[var(--av-silver)] font-light max-w-sm">
                            Try broadening your search filters to discover more hidden gems.
                        </p>
                    </div>
                )}

                {/* Loading Sentinel for Infinite Scroll */}
                <div ref={sentinelRef} className="h-32 flex items-center justify-center mt-12 mb-20">
                    {isLoading && (
                        <div className="flex flex-col items-center gap-3 text-[var(--av-silver)]">
                            <Loader2 className="w-10 h-10 animate-spin text-[var(--av-gold)]" />
                            <span className="font-medium text-xs tracking-widest uppercase opacity-70">Fetching Inspiration...</span>
                        </div>
                    )}
                    {!hasMore && items.length > 0 && (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-1 bg-white/10 rounded-full mb-2" />
                            <p className="text-[var(--av-ash)] text-sm italic">
                                You've reached the end of the collection
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox */}
            {lightboxItem && (
                <ConceptLightbox
                    itemId={lightboxItem.id}
                    onClose={() => setLightboxItem(null)}
                    onTrySimilar={() => {
                        setLightboxItem(null);
                        // Could scroll to generator or trigger navigation
                    }}
                />
            )}
        </SectionContainer>
    );
}
