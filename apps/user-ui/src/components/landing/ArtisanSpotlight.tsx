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

interface Artisan {
    name: string;
    craft: string;
    bio: string;
    quote: string;
    image?: string;
    href: string;
}

interface ArtisanSpotlightProps {
    eyebrow?: string;
    artisan?: Artisan;
}

const defaultArtisan: Artisan = {
    name: "Sarah Chen",
    craft: "Ceramic Artist",
    bio: "With over 15 years of experience, Sarah creates one-of-a-kind ceramic pieces that blend traditional techniques with contemporary aesthetics. Each piece is hand-thrown and glazed in her studio in Portland.",
    quote: "Every piece I create carries a piece of my soul. The imperfections are what make them perfect.",
    image: "https://images.unsplash.com/photo-1556103255-4443dbae8e5a?w=800&h=1000&fit=crop&q=80",
    href: "/artisans/sarah-chen",
};

export function ArtisanSpotlight({
    eyebrow = "Meet the Maker",
    artisan = defaultArtisan,
}: ArtisanSpotlightProps) {
    const containerRef = useRef<HTMLElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const quoteRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Initial states
            gsap.set(imageRef.current, { opacity: 0, scale: 1.1, x: -60 });
            gsap.set(contentRef.current, { opacity: 0, y: 40 });
            gsap.set(quoteRef.current, { opacity: 0, y: 30 });

            // Image animation
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: 'top 70%',
                onEnter: () => {
                    gsap.to(imageRef.current, {
                        opacity: 1,
                        scale: 1,
                        x: 0,
                        duration: 1.2,
                        ease: 'power3.out',
                    });

                    gsap.to(contentRef.current, {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        delay: 0.3,
                        ease: 'power3.out',
                    });

                    gsap.to(quoteRef.current, {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        delay: 0.5,
                        ease: 'power3.out',
                    });
                },
            });

            // Parallax on image
            gsap.to(imageRef.current?.querySelector('.parallax-image'), {
                yPercent: 15,
                ease: 'none',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                },
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative py-24 md:py-32 lg:py-40 px-6 md:px-8 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] overflow-hidden"
        >
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Image */}
                    <div ref={imageRef} className="relative overflow-hidden">
                        <div className="aspect-[4/5] relative overflow-hidden">
                            {/* Artisan Image */}
                            <Image
                                src={artisan.image || 'https://images.unsplash.com/photo-1556103255-4443dbae8e5a?w=800&h=1000&fit=crop&q=80'}
                                alt={artisan.name}
                                fill
                                className="parallax-image object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />

                            {/* Studio badge */}
                            <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 dark:bg-black/80 backdrop-blur-sm z-10">
                                <span className="text-xs tracking-[0.2em] uppercase text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] font-medium">
                                    Portland Studio
                                </span>
                            </div>
                        </div>

                        {/* Decorative frame */}
                        <div className="absolute -bottom-4 -right-4 w-full h-full border border-[var(--ac-gold)]/30 -z-10" />
                    </div>

                    {/* Content */}
                    <div ref={contentRef} className="lg:pl-8">
                        {/* Eyebrow */}
                        <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] mb-6 font-medium">
                            {eyebrow}
                        </p>

                        {/* Name & Craft */}
                        <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2 tracking-tight">
                            {artisan.name}
                        </h2>
                        <p className="font-[family-name:var(--font-cormorant)] text-xl md:text-2xl text-[var(--ac-copper)] dark:text-[var(--ac-bronze)] mb-8 italic">
                            {artisan.craft}
                        </p>

                        {/* Bio */}
                        <p className="text-lg text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mb-8 leading-relaxed font-light">
                            {artisan.bio}
                        </p>

                        {/* Quote */}
                        <div ref={quoteRef} className="relative pl-6 border-l-2 border-[var(--ac-gold)] mb-10">
                            <blockquote className="font-[family-name:var(--font-cormorant)] text-xl md:text-2xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] italic leading-relaxed">
                                "{artisan.quote}"
                            </blockquote>
                        </div>

                        {/* CTA */}
                        <Link
                            href={artisan.href}
                            className="group inline-flex items-center gap-3 text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] hover:text-[var(--ac-gold)] dark:hover:text-[var(--ac-gold-dark)] transition-colors duration-300"
                        >
                            <span className="text-sm tracking-[0.15em] uppercase font-medium">
                                Visit Studio
                            </span>
                            <div className="w-12 h-px bg-current transition-all duration-300 group-hover:w-20" />
                            <svg
                                className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1"
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
            </div>
        </section>
    );
}
