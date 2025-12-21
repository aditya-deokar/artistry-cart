'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface HeroProps {
    eyebrow?: string;
    headline?: string;
    subheadline?: string;
    primaryCTA?: {
        text: string;
        href: string;
    };
    secondaryCTA?: {
        text: string;
        href: string;
    };
}

export function Hero({
    eyebrow = "Handcrafted Excellence",
    headline = "Where Imagination Meets Craftsmanship",
    subheadline = "Discover unique creations by master artisans, or bring your vision to life with AI-powered custom orders.",
    primaryCTA = { text: "Explore Collection", href: "/product" },
    secondaryCTA = { text: "Create Your Vision", href: "/ai-vision" },
}: HeroProps) {
    const containerRef = useRef<HTMLElement>(null);
    const eyebrowRef = useRef<HTMLParagraphElement>(null);
    const headlineRef = useRef<HTMLHeadingElement>(null);
    const subheadlineRef = useRef<HTMLParagraphElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);
    const scrollIndicatorRef = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Create timeline for entrance animations
            const tl = gsap.timeline({
                defaults: {
                    ease: 'power4.out',
                    duration: 1.2,
                },
            });

            // Initial states
            gsap.set([eyebrowRef.current, headlineRef.current, subheadlineRef.current, ctaRef.current], {
                opacity: 0,
                y: 60,
            });
            gsap.set(scrollIndicatorRef.current, { opacity: 0, y: 20 });

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
                    ctaRef.current,
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                    },
                    '-=0.6'
                )
                .to(
                    scrollIndicatorRef.current,
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                    },
                    '-=0.4'
                );

            // Parallax effect on scroll - subtle movement for all content
            gsap.to(containerRef.current?.querySelector('.hero-content'), {
                yPercent: 20,
                ease: 'none',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1,
                },
            });

            // Hide scroll indicator on scroll
            gsap.to(scrollIndicatorRef.current, {
                opacity: 0,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: '5% top',
                    end: '15% top',
                    scrub: true,
                },
            });

            // Subtle background movement
            if (bgRef.current) {
                gsap.to(bgRef.current, {
                    scale: 1.05,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: 1,
                    },
                });
            }
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Split headline for word-by-word animation
    const words = headline.split(' ');

    return (
        <section
            ref={containerRef}
            className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden"
        >
            {/* Background Layer */}
            <div
                ref={bgRef}
                className="absolute inset-0 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]"
                aria-hidden="true"
            >
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--ac-cream)]/50 dark:to-[var(--ac-onyx)]/50" />

                {/* Decorative elements */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--ac-gold)]/5 blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[var(--ac-terracotta)]/5 blur-3xl" />
            </div>

            {/* Content */}
            <div className="hero-content relative z-10 text-center max-w-5xl px-6 md:px-8">
                {/* Eyebrow */}
                <p
                    ref={eyebrowRef}
                    className="text-xs md:text-sm tracking-[0.3em] uppercase text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] mb-6 md:mb-8 font-medium"
                >
                    {eyebrow}
                </p>

                {/* Headline */}
                <h1
                    ref={headlineRef}
                    className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] leading-[1.1] mb-6 md:mb-8 tracking-tight"
                >
                    {words.map((word, index) => (
                        <span key={index} className="inline-block mr-[0.25em]">
                            {word}
                        </span>
                    ))}
                </h1>

                {/* Subheadline */}
                <p
                    ref={subheadlineRef}
                    className="font-[family-name:var(--font-inter)] text-base md:text-lg lg:text-xl text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mb-10 md:mb-14 max-w-2xl mx-auto leading-relaxed font-light"
                >
                    {subheadline}
                </p>

                {/* CTAs */}
                <div
                    ref={ctaRef}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <Link
                        href={primaryCTA.href}
                        className="group relative px-8 py-4 bg-[var(--ac-charcoal)] dark:bg-[var(--ac-pearl)] text-[var(--ac-ivory)] dark:text-[var(--ac-obsidian)] text-sm tracking-[0.15em] uppercase font-medium overflow-hidden transition-all duration-500 hover:shadow-lg hover:shadow-[var(--ac-charcoal)]/20 dark:hover:shadow-[var(--ac-pearl)]/20"
                    >
                        <span className="relative z-10">{primaryCTA.text}</span>
                        <div className="absolute inset-0 bg-[var(--ac-gold)] transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                        <span className="absolute inset-0 flex items-center justify-center text-[var(--ac-ivory)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 z-20">
                            {primaryCTA.text}
                        </span>
                    </Link>

                    <Link
                        href={secondaryCTA.href}
                        className="group relative px-8 py-4 border border-[var(--ac-charcoal)] dark:border-[var(--ac-pearl)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] text-sm tracking-[0.15em] uppercase font-medium overflow-hidden transition-all duration-500"
                    >
                        <span className="relative z-10 group-hover:text-[var(--ac-ivory)] dark:group-hover:text-[var(--ac-obsidian)] transition-colors duration-500">
                            {secondaryCTA.text}
                        </span>
                        <div className="absolute inset-0 bg-[var(--ac-charcoal)] dark:bg-[var(--ac-pearl)] transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                    </Link>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div
                ref={scrollIndicatorRef}
                className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--ac-stone)]"
            >
                <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase font-medium">
                    Scroll
                </span>
                <div className="relative w-px h-12 md:h-16 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--ac-stone)] to-transparent" />
                    <div className="absolute top-0 w-full h-1/3 bg-[var(--ac-gold)] animate-pulse" />
                </div>
            </div>
        </section>
    );
}
