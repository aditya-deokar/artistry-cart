'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import Link from 'next/link';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface Artisan {
    name: string;
    craft: string;
    location: string;
    image: string;
    size?: 'small' | 'medium' | 'large';
}

interface ArtisanCommunityProps {
    eyebrow?: string;
    headline?: string;
    subheadline?: string;
    artisans?: Artisan[];
    ctaText?: string;
    ctaHref?: string;
}

const defaultArtisans: Artisan[] = [
    {
        name: 'Maria Santos',
        craft: 'Ceramic Artist',
        location: 'Lisbon, Portugal',
        image: 'https://images.unsplash.com/photo-1556103255-4443dbae8e5a?w=600&h=800&fit=crop&q=80',
        size: 'large',
    },
    {
        name: 'Kenji Tanaka',
        craft: 'Woodworker',
        location: 'Kyoto, Japan',
        image: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&h=600&fit=crop&q=80',
        size: 'medium',
    },
    {
        name: 'Amara Okafor',
        craft: 'Textile Weaver',
        location: 'Accra, Ghana',
        image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=600&h=600&fit=crop&q=80',
        size: 'small',
    },
    {
        name: 'Elena Petrova',
        craft: 'Jewelry Maker',
        location: 'Sofia, Bulgaria',
        image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&h=600&fit=crop&q=80',
        size: 'medium',
    },
    {
        name: 'Omar Hassan',
        craft: 'Leather Craftsman',
        location: 'Marrakech, Morocco',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop&q=80',
        size: 'large',
    },
    {
        name: 'Sophie Dubois',
        craft: 'Glass Artist',
        location: 'Lyon, France',
        image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=600&fit=crop&q=80',
        size: 'small',
    },
];

export function ArtisanCommunity({
    eyebrow = "Our Makers",
    headline = "The Hands Behind the Art",
    subheadline = "Meet some of the 5,000+ artisans who bring imagination to life every day.",
    artisans = defaultArtisans,
    ctaText = "Meet More Artisans",
    ctaHref = "/artisans",
}: ArtisanCommunityProps) {
    const containerRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Initial states
            gsap.set(headerRef.current, { opacity: 0, y: 40 });
            gsap.set(ctaRef.current, { opacity: 0, y: 30 });

            const items = gridRef.current?.querySelectorAll('.artisan-card');
            if (items) {
                gsap.set(items, { opacity: 0, y: 60, scale: 0.95 });
            }

            // Header animation
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: 'top 80%',
                onEnter: () => {
                    gsap.to(headerRef.current, {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                    });
                },
            });

            // Grid items animation
            if (items) {
                ScrollTrigger.create({
                    trigger: gridRef.current,
                    start: 'top 80%',
                    onEnter: () => {
                        gsap.to(items, {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            duration: 0.8,
                            stagger: 0.1,
                            ease: 'power3.out',
                        });
                    },
                });
            }

            // CTA animation
            ScrollTrigger.create({
                trigger: ctaRef.current,
                start: 'top 90%',
                onEnter: () => {
                    gsap.to(ctaRef.current, {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: 'power3.out',
                    });
                },
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative py-24 md:py-32 lg:py-40 px-6 md:px-8 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]"
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div ref={headerRef} className="text-center mb-16 md:mb-20">
                    <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] mb-4 font-medium">
                        {eyebrow}
                    </p>
                    <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-6 tracking-tight">
                        {headline}
                    </h2>
                    <p className="text-lg text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] max-w-2xl mx-auto font-light">
                        {subheadline}
                    </p>
                </div>

                {/* Bento Grid */}
                <div
                    ref={gridRef}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[200px] md:auto-rows-[250px]"
                >
                    {artisans.map((artisan, index) => (
                        <div
                            key={index}
                            className={`artisan-card group relative overflow-hidden cursor-pointer ${artisan.size === 'large' ? 'row-span-2' :
                                    artisan.size === 'medium' ? 'col-span-1 row-span-1' : 'col-span-1 row-span-1'
                                }`}
                        >
                            {/* Image */}
                            <Image
                                src={artisan.image}
                                alt={artisan.name}
                                fill
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                sizes="(max-width: 768px) 50vw, 25vw"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

                            {/* Content */}
                            <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                <h3 className="font-[family-name:var(--font-playfair)] text-lg md:text-xl text-white mb-1">
                                    {artisan.name}
                                </h3>
                                <p className="text-xs md:text-sm text-[var(--ac-gold-dark)] font-medium mb-1">
                                    {artisan.craft}
                                </p>
                                <p className="text-xs text-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                    📍 {artisan.location}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div ref={ctaRef} className="text-center mt-12 md:mt-16">
                    <Link
                        href={ctaHref}
                        className="group inline-flex items-center gap-3 px-8 py-4 border border-[var(--ac-charcoal)] dark:border-[var(--ac-pearl)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] hover:bg-[var(--ac-charcoal)] dark:hover:bg-[var(--ac-pearl)] hover:text-[var(--ac-pearl)] dark:hover:text-[var(--ac-charcoal)] transition-all duration-500"
                    >
                        <span className="text-sm tracking-[0.15em] uppercase font-medium">
                            {ctaText}
                        </span>
                        <svg
                            className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
