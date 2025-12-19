'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import Image from 'next/image';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface Category {
    id: string;
    title: string;
    description: string;
    image: string;
    href: string;
}

interface FeaturedCategoriesProps {
    eyebrow?: string;
    headline?: string;
    categories?: Category[];
}

const defaultCategories: Category[] = [
    {
        id: 'art-prints',
        title: 'Art & Prints',
        description: 'Originals that speak to the soul',
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=1200&fit=crop&q=80',
        href: '/category/art-prints',
    },
    {
        id: 'jewelry',
        title: 'Jewelry',
        description: 'Adornments made with intention',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=1200&fit=crop&q=80',
        href: '/category/jewelry',
    },
    {
        id: 'home-living',
        title: 'Home & Living',
        description: 'Pieces that transform spaces',
        image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=1200&fit=crop&q=80',
        href: '/category/home-living',
    },
];

export function FeaturedCategories({
    eyebrow = "Discover",
    headline = "Curated Collections",
    categories = defaultCategories,
}: FeaturedCategoriesProps) {
    const containerRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement[]>([]);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Initial states
            gsap.set(headerRef.current, { opacity: 0, y: 40 });
            cardsRef.current.forEach((card) => {
                gsap.set(card, { opacity: 0, y: 60, scale: 0.95 });
            });

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

            // Staggered card animations
            cardsRef.current.forEach((card, index) => {
                if (card) {
                    ScrollTrigger.create({
                        trigger: card,
                        start: 'top 85%',
                        onEnter: () => {
                            gsap.to(card, {
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                duration: 0.8,
                                delay: index * 0.15,
                                ease: 'power3.out',
                            });
                        },
                    });
                }
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
                <div ref={headerRef} className="text-center mb-12 md:mb-16 lg:mb-20">
                    <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] mb-4 font-medium">
                        {eyebrow}
                    </p>
                    <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] tracking-tight">
                        {headline}
                    </h2>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                    {categories.map((category, index) => (
                        <Link
                            key={category.id}
                            href={category.href}
                            ref={(el) => {
                                if (el) cardsRef.current[index] = el as unknown as HTMLDivElement;
                            }}
                            className="group relative aspect-[3/4] md:aspect-[2/3] overflow-hidden cursor-pointer"
                        >
                            {/* Image */}
                            <div className="absolute inset-0 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]">
                                <Image
                                    src={category.image}
                                    alt={category.title}
                                    fill
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                            </div>

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                                <div className="transform transition-transform duration-500 ease-out group-hover:-translate-y-2">
                                    <h3 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl lg:text-4xl text-white mb-2 tracking-tight">
                                        {category.title}
                                    </h3>
                                    <p className="text-sm md:text-base text-white/80 font-light mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                        {category.description}
                                    </p>

                                    {/* Explore link */}
                                    <div className="flex items-center gap-2 text-white/90">
                                        <span className="text-xs tracking-[0.2em] uppercase font-medium">
                                            Explore
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
                                    </div>
                                </div>
                            </div>

                            {/* Border overlay on hover */}
                            <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 transition-colors duration-500 pointer-events-none" />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
