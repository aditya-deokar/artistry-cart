'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface AboutHeroProps {
    eyebrow?: string;
    headline?: string;
    subheadline?: string;
}

export function AboutHero({
    eyebrow = "Our Story",
    headline = "We Believe in the Power of Human Hands",
    subheadline = "For over five years, we've connected dreamers with makers, turning imagination into tangible art.",
}: AboutHeroProps) {
    const containerRef = useRef<HTMLElement>(null);
    const eyebrowRef = useRef<HTMLParagraphElement>(null);
    const headlineRef = useRef<HTMLHeadingElement>(null);
    const subheadlineRef = useRef<HTMLParagraphElement>(null);
    const decorRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Initial states
            gsap.set([eyebrowRef.current, headlineRef.current, subheadlineRef.current], {
                opacity: 0,
                y: 60,
            });
            gsap.set(decorRef.current, { scaleX: 0 });
            gsap.set(scrollRef.current, { opacity: 0, y: 20 });

            // Create entrance timeline
            const tl = gsap.timeline({
                defaults: { ease: 'power4.out' },
            });

            tl.to(decorRef.current, {
                scaleX: 1,
                duration: 0.8,
                transformOrigin: 'center',
            })
                .to(eyebrowRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                }, '-=0.4')
                .to(headlineRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                }, '-=0.5')
                .to(subheadlineRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                }, '-=0.6')
                .to(scrollRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                }, '-=0.3');

            // Parallax on scroll
            gsap.to('.about-hero-content', {
                yPercent: 25,
                ease: 'none',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1,
                },
            });

            // Fade scroll indicator
            gsap.to(scrollRef.current, {
                opacity: 0,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: '10% top',
                    end: '20% top',
                    scrub: true,
                },
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Split headline into words for styling
    const words = headline.split(' ');

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]"
        >
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                {/* Subtle gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--ac-cream)]/30 dark:to-[var(--ac-onyx)]/30" />

                {/* Decorative circles */}
                <div className="absolute top-1/3 -left-32 w-64 h-64 rounded-full bg-[var(--ac-gold)]/5 blur-3xl" />
                <div className="absolute bottom-1/3 -right-32 w-80 h-80 rounded-full bg-[var(--ac-terracotta)]/5 blur-3xl" />

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(var(--ac-charcoal) 1px, transparent 1px),
                              linear-gradient(90deg, var(--ac-charcoal) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            {/* Content */}
            <div className="about-hero-content relative z-10 text-center max-w-5xl px-6 md:px-8 py-32">
                {/* Decorative gold line */}
                <div
                    ref={decorRef}
                    className="w-16 h-px bg-[var(--ac-gold)] mx-auto mb-8"
                    aria-hidden="true"
                />

                {/* Eyebrow */}
                <p
                    ref={eyebrowRef}
                    className="text-xs md:text-sm tracking-[0.3em] uppercase text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] mb-6 font-medium"
                >
                    {eyebrow}
                </p>

                {/* Headline */}
                <h1
                    ref={headlineRef}
                    className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] leading-[1.1] mb-8 tracking-tight"
                >
                    {words.map((word, index) => (
                        <span key={index} className="inline-block mr-[0.25em]">
                            {word === 'Human' || word === 'Hands' ? (
                                <span className="text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)]">{word}</span>
                            ) : (
                                word
                            )}
                        </span>
                    ))}
                </h1>

                {/* Subheadline */}
                <p
                    ref={subheadlineRef}
                    className="font-[family-name:var(--font-inter)] text-lg md:text-xl lg:text-2xl text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] max-w-2xl mx-auto leading-relaxed font-light"
                >
                    {subheadline}
                </p>
            </div>

            {/* Scroll indicator */}
            <div
                ref={scrollRef}
                className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-[var(--ac-stone)]"
            >
                <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase font-medium">
                    Discover More
                </span>
                <div className="w-px h-12 bg-gradient-to-b from-[var(--ac-gold)] to-transparent" />
            </div>
        </section>
    );
}
