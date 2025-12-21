'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Mock stories data
const stories = [
    {
        id: '1',
        type: 'feature',
        category: 'MASTER ARTISAN SERIES',
        title: 'Three Generations of Fire and Clay: The Santos Family Legacy',
        excerpt:
            'In a small village outside Lisbon, a family has shaped clay for over 100 years. We spent a week learning their secrets...',
        image: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=1200&h=800&fit=crop',
        readTime: '12 min read',
        href: '/journal/santos-family-legacy',
    },
    {
        id: '2',
        type: 'spotlight',
        category: 'CRAFT SPOTLIGHT',
        title: 'The Art of Japanese Kintsugi',
        excerpt:
            'Discover the ancient art of repairing broken pottery with gold, and the philosophy behind embracing imperfection.',
        image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=400&fit=crop',
        readTime: '8 min read',
        href: '/journal/kintsugi-art',
    },
    {
        id: '3',
        type: 'behind',
        category: 'BEHIND THE SCENES',
        title: 'From Engineer to Glassblower',
        excerpt:
            "Henrik's journey from tech to traditional craft is an inspiration for career changers everywhere.",
        image: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=600&h=400&fit=crop',
        readTime: '6 min read',
        href: '/journal/engineer-to-glassblower',
    },
];

interface ArtisanStoriesProps {
    title?: string;
    subtitle?: string;
}

export function ArtisanStories({
    title = 'The Journey Behind the Craft',
    subtitle = 'Artisan Stories',
}: ArtisanStoriesProps) {
    const sectionRef = useRef<HTMLElement>(null);

    // Entrance animation
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Header entrance
            gsap.from('.stories-header', {
                y: 40,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                },
            });

            // Featured story
            gsap.from('.featured-story', {
                y: 60,
                opacity: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.featured-story',
                    start: 'top 85%',
                },
            });

            // Side stories stagger
            gsap.from('.side-story', {
                x: 40,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.side-stories',
                    start: 'top 80%',
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const featuredStory = stories[0];
    const sideStories = stories.slice(1);

    return (
        <section
            ref={sectionRef}
            className="py-20 bg-[var(--ac-linen)] dark:bg-[var(--ac-onyx)]"
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="stories-header flex items-end justify-between mb-12">
                    <div>
                        <p className="text-xs tracking-[0.3em] uppercase text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] mb-3 font-medium">
                            {subtitle}
                        </p>
                        <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                            {title}
                        </h2>
                    </div>

                    <Link
                        href="/journal"
                        className="hidden md:flex items-center gap-2 text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] hover:text-[var(--ac-gold)] transition-colors group"
                    >
                        View all stories
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Stories Grid */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Featured Story */}
                    <Link
                        href={featuredStory.href}
                        className="featured-story group lg:row-span-2"
                    >
                        <article className="relative h-full min-h-[400px] lg:min-h-[600px] overflow-hidden">
                            {/* Image */}
                            <div className="absolute inset-0">
                                <Image
                                    src={featuredStory.image}
                                    alt={featuredStory.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[var(--ac-charcoal)] via-[var(--ac-charcoal)]/40 to-transparent" />
                            </div>

                            {/* Content */}
                            <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10">
                                {/* Category */}
                                <p className="text-xs tracking-[0.2em] uppercase text-[var(--ac-gold-dark)] mb-3 font-medium">
                                    {featuredStory.category}
                                </p>

                                {/* Title */}
                                <h3 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl lg:text-4xl text-[var(--ac-pearl)] mb-4 leading-tight">
                                    {featuredStory.title}
                                </h3>

                                {/* Excerpt */}
                                <p className="text-[var(--ac-silver)] mb-6 max-w-lg line-clamp-2">
                                    {featuredStory.excerpt}
                                </p>

                                {/* Meta */}
                                <div className="flex items-center gap-4">
                                    <span className="inline-flex items-center gap-2 text-xs tracking-wider uppercase text-[var(--ac-gold-dark)] group-hover:text-[var(--ac-pearl)] transition-colors">
                                        Read Full Story
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-[var(--ac-silver)]">
                                        <Clock className="w-3 h-3" />
                                        {featuredStory.readTime}
                                    </span>
                                </div>
                            </div>
                        </article>
                    </Link>

                    {/* Side Stories */}
                    <div className="side-stories flex flex-col gap-8">
                        {sideStories.map((story) => (
                            <Link
                                key={story.id}
                                href={story.href}
                                className="side-story group"
                            >
                                <article className="flex gap-6">
                                    {/* Image */}
                                    <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 overflow-hidden">
                                        <Image
                                            src={story.image}
                                            alt={story.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col justify-center">
                                        {/* Category */}
                                        <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] mb-2 font-medium">
                                            {story.category}
                                        </p>

                                        {/* Title */}
                                        <h3 className="font-[family-name:var(--font-cormorant)] text-lg md:text-xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2 group-hover:text-[var(--ac-gold)] dark:group-hover:text-[var(--ac-gold-dark)] transition-colors line-clamp-2">
                                            {story.title}
                                        </h3>

                                        {/* Meta */}
                                        <span className="flex items-center gap-1 text-xs text-[var(--ac-stone)]">
                                            <Clock className="w-3 h-3" />
                                            {story.readTime}
                                        </span>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Mobile View All Link */}
                <Link
                    href="/journal"
                    className="md:hidden flex items-center justify-center gap-2 mt-10 py-3 border border-[var(--ac-charcoal)] dark:border-[var(--ac-pearl)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] text-sm tracking-wider uppercase hover:bg-[var(--ac-charcoal)] hover:text-[var(--ac-ivory)] dark:hover:bg-[var(--ac-pearl)] dark:hover:text-[var(--ac-obsidian)] transition-colors"
                >
                    View all stories
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </section>
    );
}
