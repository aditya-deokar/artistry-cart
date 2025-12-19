'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface FinalCTAProps {
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

export function FinalCTA({
    headline = "Begin Your Journey",
    subheadline = "Join a community that celebrates creativity, craftsmanship, and connection.",
    primaryCTA = { text: "Explore Collection", href: "/product" },
    secondaryCTA = { text: "Create with AI Vision", href: "/ai-vision" },
}: FinalCTAProps) {
    const containerRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const lineLeftRef = useRef<HTMLDivElement>(null);
    const lineRightRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Initial states
            gsap.set(contentRef.current, { opacity: 0, y: 50 });
            gsap.set(lineLeftRef.current, { scaleX: 0, transformOrigin: 'right' });
            gsap.set(lineRightRef.current, { scaleX: 0, transformOrigin: 'left' });

            // Entry animation
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: 'top 75%',
                onEnter: () => {
                    const tl = gsap.timeline();

                    tl.to([lineLeftRef.current, lineRightRef.current], {
                        scaleX: 1,
                        duration: 0.8,
                        ease: 'power4.inOut',
                    })
                        .to(contentRef.current, {
                            opacity: 1,
                            y: 0,
                            duration: 0.8,
                            ease: 'power3.out',
                        }, '-=0.4');
                },
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative py-32 md:py-40 lg:py-52 px-6 md:px-8 bg-[var(--ac-charcoal)] dark:bg-[var(--ac-obsidian)] overflow-hidden"
        >
            {/* Background texture */}
            <div className="absolute inset-0 opacity-5" aria-hidden="true">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                        backgroundSize: '40px 40px',
                    }}
                />
            </div>

            {/* Decorative lines */}
            <div className="absolute top-1/2 left-0 w-1/4 -translate-y-1/2 hidden lg:block">
                <div
                    ref={lineLeftRef}
                    className="h-px bg-gradient-to-r from-transparent to-[var(--ac-gold)]/50"
                />
            </div>
            <div className="absolute top-1/2 right-0 w-1/4 -translate-y-1/2 hidden lg:block">
                <div
                    ref={lineRightRef}
                    className="h-px bg-gradient-to-l from-transparent to-[var(--ac-gold)]/50"
                />
            </div>

            <div ref={contentRef} className="relative z-10 max-w-3xl mx-auto text-center">
                {/* Decorative element */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-8 h-px bg-[var(--ac-gold)]" />
                    <div className="w-2 h-2 rotate-45 border border-[var(--ac-gold)]" />
                    <div className="w-8 h-px bg-[var(--ac-gold)]" />
                </div>

                {/* Headline */}
                <h2 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[var(--ac-pearl)] leading-[1.1] mb-6 tracking-tight">
                    {headline}
                </h2>

                {/* Subheadline */}
                <p className="text-lg md:text-xl text-[var(--ac-silver)] mb-12 leading-relaxed font-light max-w-xl mx-auto">
                    {subheadline}
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                        href={primaryCTA.href}
                        className="group relative px-10 py-4 bg-[var(--ac-gold)] text-[var(--ac-charcoal)] text-sm tracking-[0.15em] uppercase font-semibold overflow-hidden transition-all duration-500 hover:shadow-lg hover:shadow-[var(--ac-gold)]/30"
                    >
                        <span className="relative z-10">{primaryCTA.text}</span>
                        <div className="absolute inset-0 bg-[var(--ac-gold-dark)] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                        <span className="absolute inset-0 flex items-center justify-center text-[var(--ac-charcoal)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 z-20">
                            {primaryCTA.text}
                        </span>
                    </Link>

                    <Link
                        href={secondaryCTA.href}
                        className="group relative px-10 py-4 border border-[var(--ac-pearl)]/30 text-[var(--ac-pearl)] text-sm tracking-[0.15em] uppercase font-medium overflow-hidden transition-all duration-500 hover:border-[var(--ac-pearl)]"
                    >
                        <span className="relative z-10 group-hover:text-[var(--ac-charcoal)] transition-colors duration-500">
                            {secondaryCTA.text}
                        </span>
                        <div className="absolute inset-0 bg-[var(--ac-pearl)] transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                    </Link>
                </div>

                {/* Trust indicators */}
                <div className="mt-16 pt-12 border-t border-[var(--ac-pearl)]/10">
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 text-[var(--ac-stone)] text-sm">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                            </svg>
                            <span>Secure Payments</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                            </svg>
                            <span>Global Shipping</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                            </svg>
                            <span>5,000+ Artisans</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
