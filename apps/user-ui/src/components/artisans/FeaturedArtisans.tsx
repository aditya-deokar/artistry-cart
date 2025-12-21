'use client';

import { useRef, useLayoutEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, MapPin, Play } from 'lucide-react';
import { useFeaturedArtisans } from '@/hooks/useArtisans';
import type { Artisan } from './ArtisanCard';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface FeaturedArtisansProps {
    title?: string;
    subtitle?: string;
}

export function FeaturedArtisans({
    title = 'Artisans of the Month',
    subtitle = 'Featured Makers',
}: FeaturedArtisansProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const { data: artisans = [], isLoading } = useFeaturedArtisans(8);

    // Entrance animation
    useLayoutEffect(() => {
        if (isLoading || !artisans.length) return;

        const ctx = gsap.context(() => {
            // Section entrance
            gsap.from('.featured-header', {
                y: 40,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                },
            });

            // Cards stagger
            gsap.from('.featured-card', {
                x: 60,
                opacity: 0,
                duration: 0.8,
                stagger: 0.12,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: carouselRef.current,
                    start: 'top 75%',
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, [isLoading, artisans.length]);

    const scrollToIndex = useCallback((index: number) => {
        if (!carouselRef.current) return;

        const cards = carouselRef.current.querySelectorAll('.featured-card');
        if (cards[index]) {
            cards[index].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
            });
            setActiveIndex(index);
        }
    }, []);

    const handlePrev = useCallback(() => {
        const newIndex = Math.max(0, activeIndex - 1);
        scrollToIndex(newIndex);
    }, [activeIndex, scrollToIndex]);

    const handleNext = useCallback(() => {
        const newIndex = Math.min(artisans.length - 1, activeIndex + 1);
        scrollToIndex(newIndex);
    }, [activeIndex, artisans.length, scrollToIndex]);

    // Loading skeleton
    if (isLoading) {
        return (
            <section className="py-20 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="mb-10 animate-pulse">
                        <div className="h-4 w-32 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] mb-3" />
                        <div className="h-8 w-64 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                    </div>
                    <div className="flex gap-6 overflow-hidden">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-80 aspect-[3/4] bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!artisans.length) return null;

    return (
        <section
            ref={sectionRef}
            className="py-20 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] overflow-hidden"
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="featured-header flex items-end justify-between mb-10">
                    <div>
                        <p className="text-xs tracking-[0.3em] uppercase text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] mb-3 font-medium">
                            {subtitle}
                        </p>
                        <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                            {title}
                        </h2>
                    </div>

                    {/* Navigation Arrows */}
                    <div className="hidden md:flex items-center gap-2">
                        <button
                            onClick={handlePrev}
                            disabled={activeIndex === 0}
                            className="p-3 border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] hover:bg-[var(--ac-charcoal)] hover:text-[var(--ac-ivory)] dark:hover:bg-[var(--ac-pearl)] dark:hover:text-[var(--ac-obsidian)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            aria-label="Previous"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={activeIndex >= artisans.length - 3}
                            className="p-3 border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] hover:bg-[var(--ac-charcoal)] hover:text-[var(--ac-ivory)] dark:hover:bg-[var(--ac-pearl)] dark:hover:text-[var(--ac-obsidian)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            aria-label="Next"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Carousel */}
                <div
                    ref={carouselRef}
                    className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-6 px-6"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {artisans.map((artisan, index) => (
                        <FeaturedArtisanCard
                            key={artisan.id}
                            artisan={artisan}
                            isHovered={hoveredIndex === index}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        />
                    ))}
                </div>

                {/* Dots Navigation */}
                <div className="flex justify-center gap-2 mt-8">
                    {artisans.slice(0, Math.min(artisans.length, 6)).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => scrollToIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${activeIndex === index
                                    ? 'w-8 bg-[var(--ac-gold)]'
                                    : 'bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] hover:bg-[var(--ac-stone)]'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

function FeaturedArtisanCard({
    artisan,
    isHovered,
    onMouseEnter,
    onMouseLeave,
}: {
    artisan: Artisan;
    isHovered: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}) {
    const cardRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!cardRef.current) return;

        if (isHovered) {
            gsap.to(cardRef.current, {
                scale: 1.02,
                duration: 0.3,
                ease: 'power2.out',
            });
            gsap.to(cardRef.current.querySelector('.card-image'), {
                scale: 1.05,
                duration: 0.6,
                ease: 'power2.out',
            });
        } else {
            gsap.to(cardRef.current, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out',
            });
            gsap.to(cardRef.current.querySelector('.card-image'), {
                scale: 1,
                duration: 0.6,
                ease: 'power2.out',
            });
        }
    }, [isHovered]);

    return (
        <Link href={`/artisans/${artisan.id}`}>
            <div
                ref={cardRef}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                className="featured-card flex-shrink-0 w-72 md:w-80 snap-center cursor-pointer group"
            >
                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]">
                    <Image
                        src={artisan.image}
                        alt={artisan.name}
                        fill
                        className="card-image object-cover transition-transform"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--ac-charcoal)]/80 via-transparent to-transparent" />

                    {/* Play button indicator (for video) */}
                    <div className="absolute top-4 right-4 p-2 bg-[var(--ac-charcoal)]/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 text-[var(--ac-pearl)] fill-current" />
                    </div>

                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                        {/* Craft badge */}
                        <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--ac-gold-dark)] mb-2 font-medium">
                            {artisan.craft}
                        </p>

                        {/* Name */}
                        <h3 className="font-[family-name:var(--font-cormorant)] text-xl md:text-2xl text-[var(--ac-pearl)] mb-1">
                            {artisan.name}
                        </h3>

                        {/* Quote / Title */}
                        <p className="text-sm text-[var(--ac-silver)] italic line-clamp-1 mb-3">
                            "{artisan.title}"
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-3 text-xs text-[var(--ac-silver)]">
                            <span className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-[var(--ac-gold-dark)] text-[var(--ac-gold-dark)]" />
                                {artisan.rating.toFixed(1)}
                            </span>
                            <span>•</span>
                            <span>{artisan.productCount} creations</span>
                        </div>

                        {/* View Button (hidden until hover) */}
                        <div className={`mt-4 overflow-hidden transition-all duration-300 ${isHovered ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <span className="inline-flex items-center gap-2 text-xs tracking-wider uppercase text-[var(--ac-gold-dark)] group-hover:text-[var(--ac-pearl)] transition-colors">
                                Visit Studio
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
