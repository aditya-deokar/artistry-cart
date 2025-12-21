'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import Link from 'next/link';
import { useArtisanCategories } from '@/hooks/useArtisans';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Category images mapping
const categoryImages: Record<string, string> = {
    ceramics: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop',
    jewelry: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop',
    textiles: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=600&fit=crop',
    woodwork: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=600&h=600&fit=crop',
    painting: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=600&fit=crop',
    sculpture: 'https://images.unsplash.com/photo-1544413660-299165566b1d?w=600&h=600&fit=crop',
    glass: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=600&h=600&fit=crop',
    leather: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop',
    paper: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&h=600&fit=crop',
};

// Category icons (emoji for simplicity, can be replaced with custom icons)
const categoryIcons: Record<string, string> = {
    ceramics: '🏺',
    jewelry: '💎',
    textiles: '🧵',
    woodwork: '🪵',
    painting: '🎨',
    sculpture: '🗿',
    glass: '🔮',
    leather: '👜',
    paper: '📜',
};

interface CraftCategoriesProps {
    title?: string;
    subtitle?: string;
}

export function CraftCategories({
    title = 'Explore by Craft',
    subtitle = 'Browse Categories',
}: CraftCategoriesProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    const { data: categories = [], isLoading } = useArtisanCategories();

    // Entrance animation
    useLayoutEffect(() => {
        if (isLoading || !categories.length) return;

        const ctx = gsap.context(() => {
            // Header entrance
            gsap.from('.categories-header', {
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
            gsap.from('.category-card', {
                y: 60,
                opacity: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: gridRef.current,
                    start: 'top 80%',
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, [isLoading, categories.length]);

    // Loading skeleton
    if (isLoading) {
        return (
            <section className="py-20 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-12 animate-pulse">
                        <div className="h-4 w-32 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] mx-auto mb-3" />
                        <div className="h-8 w-48 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] mx-auto" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="aspect-square bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!categories.length) return null;

    return (
        <section
            ref={sectionRef}
            className="py-20 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]"
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="categories-header text-center mb-12">
                    <p className="text-xs tracking-[0.3em] uppercase text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] mb-3 font-medium">
                        {subtitle}
                    </p>
                    <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                        {title}
                    </h2>
                </div>

                {/* Grid */}
                <div
                    ref={gridRef}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                >
                    {categories
                        .filter((cat) => cat.count > 0)
                        .map((category) => (
                            <CategoryCard
                                key={category.value}
                                value={category.value}
                                label={category.label}
                                count={category.count}
                                image={categoryImages[category.value]}
                                icon={categoryIcons[category.value]}
                            />
                        ))}
                </div>
            </div>
        </section>
    );
}

function CategoryCard({
    value,
    label,
    count,
    image,
    icon,
}: {
    value: string;
    label: string;
    count: number;
    image?: string;
    icon?: string;
}) {
    const cardRef = useRef<HTMLAnchorElement>(null);

    const handleMouseEnter = () => {
        if (!cardRef.current) return;

        gsap.to(cardRef.current, {
            scale: 1.02,
            duration: 0.3,
            ease: 'power2.out',
        });

        gsap.to(cardRef.current.querySelector('.card-image'), {
            scale: 1.1,
            duration: 0.6,
            ease: 'power2.out',
        });

        gsap.to(cardRef.current.querySelector('.card-overlay'), {
            opacity: 0.7,
            duration: 0.3,
        });
    };

    const handleMouseLeave = () => {
        if (!cardRef.current) return;

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

        gsap.to(cardRef.current.querySelector('.card-overlay'), {
            opacity: 0.5,
            duration: 0.3,
        });
    };

    return (
        <Link
            ref={cardRef}
            href={`/artisans?category=${value}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="category-card group relative aspect-square overflow-hidden cursor-pointer"
        >
            {/* Image */}
            {image ? (
                <Image
                    src={image}
                    alt={label}
                    fill
                    className="card-image object-cover transition-transform"
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--ac-gold)]/20 to-[var(--ac-copper)]/20" />
            )}

            {/* Overlay */}
            <div className="card-overlay absolute inset-0 bg-[var(--ac-charcoal)] opacity-50 transition-opacity" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 text-center">
                {/* Icon */}
                {icon && (
                    <span className="text-3xl md:text-4xl mb-3 filter drop-shadow-lg">
                        {icon}
                    </span>
                )}

                {/* Label */}
                <h3 className="font-[family-name:var(--font-cormorant)] text-lg md:text-xl text-[var(--ac-pearl)] font-medium mb-1">
                    {label.split(' & ')[0]}
                </h3>

                {/* Count */}
                <p className="text-xs text-[var(--ac-silver)]">
                    {count} Artisan{count !== 1 ? 's' : ''}
                </p>

                {/* Explore link (on hover) */}
                <span className="mt-3 text-xs tracking-wider uppercase text-[var(--ac-gold-dark)] opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    Explore →
                </span>
            </div>

            {/* Border accent */}
            <div className="absolute inset-0 border border-[var(--ac-gold)]/0 group-hover:border-[var(--ac-gold)]/30 transition-colors" />
        </Link>
    );
}
