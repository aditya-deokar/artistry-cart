'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface Commitment {
    icon: React.ReactNode;
    text: string;
}

interface SustainabilityProps {
    eyebrow?: string;
    headline?: string;
    subheadline?: string;
    commitments?: Commitment[];
}

const defaultCommitments: Commitment[] = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
        ),
        text: 'Carbon-Neutral Shipping by 2025',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
            </svg>
        ),
        text: '100% Recyclable Packaging',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
        ),
        text: 'Fair Trade Certified Partnerships',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
            </svg>
        ),
        text: 'Traditional Techniques Over Machinery',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
            </svg>
        ),
        text: '1% of Revenue to Artisan Education',
    },
];

export function Sustainability({
    eyebrow = "Our Commitment",
    headline = "Creating Responsibly",
    subheadline = "Sustainability isn't an afterthought—it's woven into everything we do.",
    commitments = defaultCommitments,
}: SustainabilityProps) {
    const containerRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const itemsRef = useRef<HTMLDivElement[]>([]);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Initial states
            gsap.set(contentRef.current, { opacity: 0, y: 40 });
            itemsRef.current.forEach((item) => {
                if (item) gsap.set(item, { opacity: 0, x: -30 });
            });

            // Content animation
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: 'top 75%',
                onEnter: () => {
                    gsap.to(contentRef.current, {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                    });

                    itemsRef.current.forEach((item, index) => {
                        if (item) {
                            gsap.to(item, {
                                opacity: 1,
                                x: 0,
                                duration: 0.6,
                                delay: 0.3 + index * 0.1,
                                ease: 'power3.out',
                            });
                        }
                    });
                },
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative py-24 md:py-32 lg:py-40 px-6 md:px-8 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] overflow-hidden"
        >
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                {/* Leaf pattern overlay */}
                <div className="absolute top-0 right-0 w-1/3 h-full opacity-5">
                    <svg viewBox="0 0 200 200" className="w-full h-full" fill="currentColor">
                        <path d="M100,10 Q150,50 140,100 T100,190 Q50,150 60,100 T100,10" className="text-[var(--ac-success)]" />
                    </svg>
                </div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Content */}
                    <div ref={contentRef}>
                        <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-[var(--ac-success)] mb-4 font-medium">
                            {eyebrow}
                        </p>
                        <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-6 tracking-tight">
                            {headline}
                        </h2>
                        <p className="text-lg text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mb-10 leading-relaxed font-light">
                            {subheadline}
                        </p>

                        {/* Commitments List */}
                        <div className="space-y-4">
                            {commitments.map((commitment, index) => (
                                <div
                                    key={index}
                                    ref={(el) => {
                                        if (el) itemsRef.current[index] = el;
                                    }}
                                    className="flex items-center gap-4 p-4 bg-white/50 dark:bg-black/20 border border-[var(--ac-sand)] dark:border-[var(--ac-graphite-dark)] rounded-sm"
                                >
                                    <div className="text-[var(--ac-success)]">
                                        {commitment.icon}
                                    </div>
                                    <span className="text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] font-medium">
                                        {commitment.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Certifications / Visual */}
                    <div className="relative">
                        <div className="aspect-square relative bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] rounded-full flex items-center justify-center">
                            {/* Decorative rings */}
                            <div className="absolute inset-8 border border-[var(--ac-success)]/20 rounded-full" />
                            <div className="absolute inset-16 border border-[var(--ac-success)]/30 rounded-full" />

                            {/* Center content */}
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--ac-success)]/10 flex items-center justify-center">
                                    <svg className="w-10 h-10 text-[var(--ac-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                                    </svg>
                                </div>
                                <p className="text-2xl font-[family-name:var(--font-playfair)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                    Planet First
                                </p>
                                <p className="text-sm text-[var(--ac-stone)] mt-2">
                                    Certified Sustainable
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
