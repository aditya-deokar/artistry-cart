'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { SectionContainer } from '../ui/SectionContainer';
import { GalleryFilters, type FilterCategory, type FilterStatus } from './GalleryFilters';
import { GalleryItem, type Concept } from './GalleryItem';
import { ConceptLightbox } from './ConceptLightbox';
import { Sparkles, ImageIcon, CheckCircle, RefreshCcw } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Generate mock concepts with variety
const generateMockConcepts = (count: number, startId: number = 1): Concept[] => {
    const categories = ['Art', 'Jewelry', 'Home Decor', 'Furniture', 'Ceramics'];
    const statuses: Array<'realized' | 'in-progress' | 'awaiting'> = ['realized', 'in-progress', 'awaiting'];
    const aspectRatios: Array<'portrait' | 'landscape' | 'square'> = ['portrait', 'landscape', 'square'];

    const titles = [
        'Minimalist Terrarium Vase',
        'Hammered Gold Ring Set',
        'Live Edge Coffee Table',
        'Abstract Canvas Collection',
        'Hand-Thrown Ceramic Bowl',
        'Sterling Silver Pendant',
        'Mid-Century Bookshelf',
        'Woven Wall Hanging',
        'Copper Wire Sculpture',
        'Stoneware Dinner Set',
        'Botanical Art Print',
        'Artisan Leather Bag',
        'Mosaic Mirror Frame',
        'Hand-Painted Tiles',
        'Geometric Planter Set',
    ];

    const authors = [
        '@green_thumb',
        '@silver_moon',
        '@woodland_crafts',
        '@color_theory',
        '@earth_and_fire',
        '@metal_arts',
        '@modern_makers',
        '@rustic_revival',
        '@forge_and_flame',
        '@bold_strokes',
    ];

    return Array.from({ length: count }, (_, i) => ({
        id: `concept-${startId + i}`,
        imageUrl: `/concepts/placeholder-${(i % 10) + 1}.jpg`,
        category: categories[i % categories.length],
        title: titles[i % titles.length],
        author: authors[i % authors.length],
        likes: Math.floor(Math.random() * 500) + 50,
        views: Math.floor(Math.random() * 5000) + 500,
        status: statuses[i % statuses.length],
        prompt: 'Create a stunning handcrafted piece with organic forms and natural materials. Combine modern minimalist aesthetics with traditional artisan techniques.',
        aspectRatio: aspectRatios[i % aspectRatios.length],
    }));
};

export function ConceptGallery() {
    const [concepts, setConcepts] = useState<Concept[]>(() => generateMockConcepts(12));
    const [filteredConcepts, setFilteredConcepts] = useState<Concept[]>(concepts);
    const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
    const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('all');
    const [lightboxConcept, setLightboxConcept] = useState<Concept | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const galleryRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    // Filter concepts
    useEffect(() => {
        let filtered = [...concepts];

        if (selectedCategory !== 'all') {
            const categoryMap: Record<FilterCategory, string> = {
                all: '',
                art: 'Art',
                jewelry: 'Jewelry',
                'home-decor': 'Home Decor',
                furniture: 'Furniture',
                ceramics: 'Ceramics',
            };
            filtered = filtered.filter(
                (c) => c.category === categoryMap[selectedCategory]
            );
        }

        if (selectedStatus !== 'all') {
            filtered = filtered.filter((c) => c.status === selectedStatus);
        }

        setFilteredConcepts(filtered);
    }, [selectedCategory, selectedStatus, concepts]);

    // Infinite scroll
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
    }, [hasMore, isLoading]);

    const loadMore = () => {
        if (isLoading) return;

        setIsLoading(true);

        // Simulate loading more concepts
        setTimeout(() => {
            const newConcepts = generateMockConcepts(8, concepts.length + 1);

            setConcepts((prev) => [...prev, ...newConcepts]);
            setPage((p) => p + 1);

            if (page >= 4) {
                setHasMore(false);
            }

            setIsLoading(false);
        }, 800);
    };

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

    // Animate new items on filter or load
    useGSAP(
        () => {
            if (!gridRef.current) return;

            const items = gridRef.current.querySelectorAll('[data-new="true"]');

            if (items.length > 0) {
                // Macro Interaction: Wave-like entry effect
                gsap.fromTo(
                    items,
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
                            items.forEach((item) => item.removeAttribute('data-new'));
                        },
                    }
                );
            }
        },
        { dependencies: [filteredConcepts], scope: gridRef }
    );

    return (
        <SectionContainer
            ref={galleryRef}
            variant="gradient"
            maxWidth="xl"
            className="bg-gradient-to-b from-[#111] via-[#1A1A1A] to-[#0D0D0D] relative overflow-hidden"
        >
            {/* Background Texture - Macro Detail */}
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
                            <span className="font-bold text-white">128</span> Projects Realized Today
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-xs text-[var(--av-silver)]">
                            <RefreshCcw size={14} className="text-blue-500" />
                            <span className="font-bold text-white">1.2k</span> Concepts Generated
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative z-10">
                {/* Filters */}
                <div className="mb-10 sticky top-20 z-40 bg-[#111]/80 backdrop-blur-xl py-4 rounded-2xl border border-white/5 shadow-2xl mx-4 lg:mx-0">
                    <GalleryFilters
                        selectedCategory={selectedCategory}
                        selectedStatus={selectedStatus}
                        onCategoryChange={setSelectedCategory}
                        onStatusChange={setSelectedStatus}
                    />
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between mb-6 px-4">
                    <p className="text-sm text-[var(--av-silver)] flex items-center gap-2">
                        Showing <span className="font-bold text-[var(--av-pearl)] bg-white/10 px-2 py-0.5 rounded-full">{filteredConcepts.length}</span> items
                    </p>
                </div>

                {/* Masonry Grid with Macro Interactions */}
                <div
                    ref={gridRef}
                    className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 px-4"
                >
                    {filteredConcepts.map((concept, index) => (
                        <GalleryItem
                            key={concept.id}
                            concept={concept}
                            onClick={() => setLightboxConcept(concept)}
                            isNew={index >= filteredConcepts.length - 8}
                        />
                    ))}
                </div>

                {/* Empty State */}
                {filteredConcepts.length === 0 && (
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
                            <div className="w-10 h-10 rounded-full border-2 border-[var(--av-gold)] border-t-transparent animate-spin" />
                            <span className="font-medium text-xs tracking-widest uppercase opacity-70">Fetching Inspiration...</span>
                        </div>
                    )}
                    {!hasMore && filteredConcepts.length > 0 && (
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
            {lightboxConcept && (
                <ConceptLightbox
                    concept={lightboxConcept}
                    onClose={() => setLightboxConcept(null)}
                    onTrySimilar={() => {
                        setLightboxConcept(null);
                        // Could scroll to generator or trigger navigation
                    }}
                />
            )}
        </SectionContainer>
    );
}
