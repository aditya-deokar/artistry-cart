'use client';

import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, MapPin, Users, Globe, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface FeaturedArtisan {
    id: string;
    name: string;
    craft: string;
    location: string;
    image: string;
    quote: string;
}

interface ArtisansHeroProps {
    onSearch?: (query: string) => void;
    featuredArtisan?: FeaturedArtisan;
}

const defaultFeaturedArtisan: FeaturedArtisan = {
    id: '1',
    name: 'Maria Santos',
    craft: 'Master Ceramicist',
    location: 'Lisbon, Portugal',
    image: 'https://images.unsplash.com/photo-1556103255-4443dbae8e5a?w=800&h=1000&fit=crop',
    quote: 'Each piece carries the soul of the earth and the rhythm of the wheel.',
};

const stats = [
    { icon: Users, value: '5,000+', label: 'Verified Artisans' },
    { icon: Globe, value: '120+', label: 'Countries' },
    { icon: Sparkles, value: '50+', label: 'Craft Categories' },
];

export function ArtisansHero({
    onSearch,
    featuredArtisan = defaultFeaturedArtisan,
}: ArtisansHeroProps) {
    const containerRef = useRef<HTMLElement>(null);
    const eyebrowRef = useRef<HTMLParagraphElement>(null);
    const headlineRef = useRef<HTMLHeadingElement>(null);
    const subheadlineRef = useRef<HTMLParagraphElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);
    const featuredRef = useRef<HTMLDivElement>(null);
    const decorRef = useRef<HTMLDivElement>(null);

    const [searchQuery, setSearchQuery] = useState('');

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Create timeline for entrance animations
            const tl = gsap.timeline({
                defaults: {
                    ease: 'power4.out',
                    duration: 1,
                },
            });

            // Initial states
            gsap.set([eyebrowRef.current, headlineRef.current, subheadlineRef.current], {
                opacity: 0,
                y: 60,
            });
            gsap.set(searchRef.current, { opacity: 0, y: 40 });
            gsap.set(statsRef.current?.children || [], { opacity: 0, y: 30 });
            gsap.set(featuredRef.current, { opacity: 0, x: 60, scale: 0.95 });
            gsap.set(decorRef.current, { opacity: 0, scale: 0.8 });

            // Staggered entrance animation
            tl.to(eyebrowRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.8,
            })
                .to(
                    headlineRef.current,
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                    },
                    '-=0.6'
                )
                .to(
                    subheadlineRef.current,
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                    },
                    '-=0.7'
                )
                .to(
                    searchRef.current,
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                    },
                    '-=0.5'
                )
                .to(
                    statsRef.current?.children || [],
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        stagger: 0.1,
                    },
                    '-=0.4'
                )
                .to(
                    featuredRef.current,
                    {
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        duration: 1,
                    },
                    '-=0.8'
                )
                .to(
                    decorRef.current,
                    {
                        opacity: 0.5,
                        scale: 1,
                        duration: 1.5,
                    },
                    '-=1'
                );

            // Parallax effect on featured image
            gsap.to(featuredRef.current?.querySelector('.featured-image'), {
                yPercent: -10,
                ease: 'none',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1,
                },
            });

            // Decorative element rotation
            gsap.to(decorRef.current, {
                rotation: 360,
                duration: 60,
                repeat: -1,
                ease: 'none',
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch?.(searchQuery);
    };

    return (
        <section
            ref={containerRef}
            className="relative min-h-[90vh] flex items-center overflow-hidden pt-24 pb-16"
        >
            {/* Background Layer */}
            <div className="absolute inset-0 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[var(--ac-cream)]/30 to-[var(--ac-gold)]/5 dark:from-transparent dark:via-[var(--ac-onyx)]/30 dark:to-[var(--ac-gold-dark)]/5" />

                {/* Decorative circles */}
                <div
                    ref={decorRef}
                    className="absolute -top-40 -right-40 w-[600px] h-[600px] opacity-0"
                >
                    <div className="relative w-full h-full">
                        <div className="absolute inset-0 border border-[var(--ac-gold)]/10 rounded-full" />
                        <div className="absolute inset-[40px] border border-[var(--ac-gold)]/15 rounded-full" />
                        <div className="absolute inset-[80px] border border-[var(--ac-gold)]/20 rounded-full" />
                    </div>
                </div>

                {/* Floating brush strokes */}
                <div className="absolute top-1/3 left-10 w-32 h-32 rounded-full bg-[var(--ac-terracotta)]/5 blur-3xl" />
                <div className="absolute bottom-1/4 left-1/3 w-48 h-48 rounded-full bg-[var(--ac-gold)]/5 blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left Column - Text Content */}
                    <div className="space-y-8">
                        {/* Eyebrow */}
                        <p
                            ref={eyebrowRef}
                            className="text-xs md:text-sm tracking-[0.3em] uppercase text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] font-medium"
                        >
                            The Makers
                        </p>

                        {/* Headline */}
                        <h1
                            ref={headlineRef}
                            className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] leading-[1.1] tracking-tight"
                        >
                            Meet the Hands<br />
                            <span className="text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)]">
                                Behind the Art
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p
                            ref={subheadlineRef}
                            className="font-[family-name:var(--font-inter)] text-base md:text-lg text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] max-w-lg leading-relaxed font-light"
                        >
                            Discover extraordinary artisans from around the globe. Each maker brings
                            generations of skill, passion, and unique vision to every creation.
                        </p>

                        {/* Search Box */}
                        <div ref={searchRef}>
                            <form onSubmit={handleSearch} className="relative">
                                <div className="relative flex items-center">
                                    <Search className="absolute left-4 w-5 h-5 text-[var(--ac-stone)]" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search artisans by name, craft, or location..."
                                        className="w-full pl-12 pr-32 py-4 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] rounded-none text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] placeholder:text-[var(--ac-stone)] focus:outline-none focus:border-[var(--ac-gold)] dark:focus:border-[var(--ac-gold-dark)] transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 px-6 py-2 bg-[var(--ac-charcoal)] dark:bg-[var(--ac-pearl)] text-[var(--ac-ivory)] dark:text-[var(--ac-obsidian)] text-sm tracking-wider uppercase font-medium hover:bg-[var(--ac-gold)] dark:hover:bg-[var(--ac-gold-dark)] transition-colors"
                                    >
                                        Search
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Stats */}
                        <div ref={statsRef} className="flex flex-wrap gap-6 pt-4">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 px-4 py-2 bg-[var(--ac-cream)]/50 dark:bg-[var(--ac-onyx)]/50 border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] rounded-full"
                                >
                                    <stat.icon className="w-4 h-4 text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)]" />
                                    <span className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                        {stat.value}
                                    </span>
                                    <span className="text-xs text-[var(--ac-stone)] dark:text-[var(--ac-silver)]">
                                        {stat.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Featured Artisan */}
                    <div ref={featuredRef} className="relative lg:pl-8">
                        <div className="relative">
                            {/* Featured Artisan Card */}
                            <div className="relative overflow-hidden bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                                {/* Image */}
                                <div className="relative aspect-[4/5] overflow-hidden featured-image">
                                    <Image
                                        src={featuredArtisan.image}
                                        alt={featuredArtisan.name}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--ac-charcoal)]/80 via-transparent to-transparent" />
                                </div>

                                {/* Content overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                                    <p className="text-xs tracking-[0.2em] uppercase text-[var(--ac-gold-dark)] mb-2">
                                        Featured Artisan
                                    </p>
                                    <h3 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl text-[var(--ac-pearl)] mb-1">
                                        {featuredArtisan.name}
                                    </h3>
                                    <p className="text-sm text-[var(--ac-silver)] mb-4">
                                        {featuredArtisan.craft} • {featuredArtisan.location}
                                    </p>
                                    <blockquote className="text-sm md:text-base text-[var(--ac-pearl)]/90 italic font-light mb-6 line-clamp-2">
                                        "{featuredArtisan.quote}"
                                    </blockquote>
                                    <Link
                                        href={`/artisans/${featuredArtisan.id}`}
                                        className="inline-flex items-center gap-2 text-sm tracking-wider uppercase text-[var(--ac-gold-dark)] hover:text-[var(--ac-pearl)] transition-colors group"
                                    >
                                        View Profile
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Decorative accent */}
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 border border-[var(--ac-gold)]/30 -z-10" />
                            <div className="absolute -top-4 -left-4 w-16 h-16 border border-[var(--ac-gold)]/20 -z-10" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
