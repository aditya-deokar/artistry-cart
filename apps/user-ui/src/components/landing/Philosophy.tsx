'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface Value {
    icon: React.ReactNode;
    title: string;
    description: string;
}

interface PhilosophyProps {
    eyebrow?: string;
    headline?: string;
    values?: Value[];
}

const defaultValues: Value[] = [
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
            </svg>
        ),
        title: "Authentic Craft",
        description: "Every piece is made by human hands with intention, carrying the maker's passion and expertise.",
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
        ),
        title: "Sustainable Beauty",
        description: "We celebrate materials and methods that honor the earth, supporting eco-conscious creation.",
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
        ),
        title: "Fair Partnership",
        description: "Artisans receive the compensation they deserve, fostering a community built on mutual respect.",
    },
];

export function Philosophy({
    eyebrow = "Our Values",
    headline = "What We Stand For",
    values = defaultValues,
}: PhilosophyProps) {
    const containerRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement[]>([]);
    const iconRefs = useRef<HTMLDivElement[]>([]);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Initial states
            gsap.set(headerRef.current, { opacity: 0, y: 40 });
            cardsRef.current.forEach((card) => {
                gsap.set(card, { opacity: 0, y: 50 });
            });
            iconRefs.current.forEach((icon) => {
                gsap.set(icon, { scale: 0, rotation: -45 });
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

            // Cards animation
            cardsRef.current.forEach((card, index) => {
                if (card) {
                    ScrollTrigger.create({
                        trigger: card,
                        start: 'top 85%',
                        onEnter: () => {
                            gsap.to(card, {
                                opacity: 1,
                                y: 0,
                                duration: 0.8,
                                delay: index * 0.15,
                                ease: 'power3.out',
                            });

                            // Animate icon
                            if (iconRefs.current[index]) {
                                gsap.to(iconRefs.current[index], {
                                    scale: 1,
                                    rotation: 0,
                                    duration: 0.6,
                                    delay: index * 0.15 + 0.2,
                                    ease: 'back.out(1.7)',
                                });
                            }
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
            className="relative py-24 md:py-32 lg:py-40 px-6 md:px-8 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]"
        >
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div ref={headerRef} className="text-center mb-16 md:mb-20">
                    <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] mb-4 font-medium">
                        {eyebrow}
                    </p>
                    <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] tracking-tight">
                        {headline}
                    </h2>
                </div>

                {/* Values Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {values.map((value, index) => (
                        <div
                            key={index}
                            ref={(el) => {
                                if (el) cardsRef.current[index] = el;
                            }}
                            className="group text-center"
                        >
                            {/* Icon */}
                            <div
                                ref={(el) => {
                                    if (el) iconRefs.current[index] = el;
                                }}
                                className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full border border-[var(--ac-gold)]/30 text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] mb-6 md:mb-8 transition-all duration-500 group-hover:border-[var(--ac-gold)] group-hover:bg-[var(--ac-gold)]/10"
                            >
                                {value.icon}
                            </div>

                            {/* Title */}
                            <h3 className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-4">
                                {value.title}
                            </h3>

                            {/* Description */}
                            <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] leading-relaxed font-light">
                                {value.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
