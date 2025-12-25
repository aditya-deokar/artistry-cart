'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { SectionContainer } from '../ui/SectionContainer';
import { GalleryFilters, type FilterCategory, type FilterStatus } from './GalleryFilters';
import { GalleryItem, type Concept } from './GalleryItem';
import { ConceptLightbox } from './ConceptLightbox';
import { Sparkles, ImageIcon } from 'lucide-react';

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
                gsap.fromTo(
                    items,
                    { opacity: 0, scale: 0.9, y: 30 },
                    {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        duration: 0.5,
                        stagger: 0.05,
                        ease: 'back.out(1.2)',
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
            className="bg-gradient-to-b from-[#111] via-[#1A1A1A] to-[#0D0D0D]"
        >
            {/* Header */}
            <div ref={headerRef} className="text-center mb-12 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--av-gold)]/10 rounded-full mb-6 border border-[var(--av-gold)]/20 shadow-[0_0_15px_rgba(212,168,75,0.05)]">
                    <ImageIcon className="text-[var(--av-gold)]" size={18} />
                    <span className="text-sm font-semibold text-[var(--av-gold)] uppercase tracking-wide">
                        Community Gallery
                    </span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-[var(--av-pearl)] mb-5 font-serif">
                    Explore AI-Generated <span className="text-[var(--av-gold)] italic">Concepts</span>
                </h2>
                <p className="text-lg text-[var(--av-silver)] max-w-2xl mx-auto font-light">
                    Browse thousands of creative concepts from our community. Get inspired, find your
                    next project, or see what's possible with AI + artisan craftsmanship.
                </p>
            </div>

            {/* Filters */}
            <GalleryFilters
                selectedCategory={selectedCategory}
                selectedStatus={selectedStatus}
                onCategoryChange={setSelectedCategory}
                onStatusChange={setSelectedStatus}
            />

            {/* Results Count */}
            <div className="flex items-center justify-between mb-6 px-2">
                <p className="text-sm text-[var(--av-silver)]">
                    Showing <span className="font-bold text-[var(--av-pearl)]">{filteredConcepts.length}</span> concepts
                </p>
            </div>

            {/* Masonry Grid */}
            <div
                ref={gridRef}
                className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6"
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
                <div className="text-center py-20">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--av-gold)]/10 flex items-center justify-center border border-[var(--av-gold)]/20">
                        <Sparkles size={32} className="text-[var(--av-gold)]" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--av-pearl)] mb-2 font-serif">
                        No concepts found
                    </h3>
                    <p className="text-[var(--av-silver)] font-light">
                        Try adjusting your filters to see more results
                    </p>
                </div>
            )}

            {/* Loading Sentinel for Infinite Scroll */}
            <div ref={sentinelRef} className="h-20 flex items-center justify-center mt-12">
                {isLoading && (
                    <div className="flex items-center gap-3 text-[var(--av-silver)]">
                        <div className="w-8 h-8 rounded-full border-2 border-[var(--av-gold)] border-t-transparent animate-spin" />
                        <span className="font-medium">Loading more concepts...</span>
                    </div>
                )}
                {!hasMore && filteredConcepts.length > 0 && (
                    <p className="text-[var(--av-ash)] text-sm">
                        You've reached the end! ✨
                    </p>
                )}
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
