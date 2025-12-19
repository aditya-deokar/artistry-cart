'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface Publication {
    name: string;
    logo?: React.ReactNode;
}

interface PressRecognitionProps {
    eyebrow?: string;
    headline?: string;
    publications?: Publication[];
    quote?: {
        text: string;
        source: string;
    };
}

const defaultPublications: Publication[] = [
    { name: 'Forbes' },
    { name: 'Dezeen' },
    { name: 'Monocle' },
    { name: 'Architectural Digest' },
    { name: 'Elle Decor' },
    { name: 'Fast Company' },
];

export function PressRecognition({
    eyebrow = "As Featured In",
    headline,
    publications = defaultPublications,
    quote = {
        text: "A game-changer for the handmade economy.",
        source: "Forbes",
    },
}: PressRecognitionProps) {
    const containerRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const logosRef = useRef<HTMLDivElement>(null);
    const quoteRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Initial states
            gsap.set(contentRef.current, { opacity: 0, y: 30 });
            gsap.set(quoteRef.current, { opacity: 0, y: 20 });

            const logos = logosRef.current?.querySelectorAll('.press-logo');
            if (logos) {
                gsap.set(logos, { opacity: 0, y: 20 });
            }

            // Content animation
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: 'top 80%',
                onEnter: () => {
                    gsap.to(contentRef.current, {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                    });

                    if (logos) {
                        gsap.to(logos, {
                            opacity: 1,
                            y: 0,
                            duration: 0.6,
                            stagger: 0.1,
                            delay: 0.3,
                            ease: 'power3.out',
                        });
                    }

                    gsap.to(quoteRef.current, {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        delay: 0.8,
                        ease: 'power3.out',
                    });
                },
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative py-20 md:py-24 px-6 md:px-8 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border-y border-[var(--ac-linen)] dark:border-[var(--ac-slate)]"
        >
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div ref={contentRef} className="text-center mb-12">
                    <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-[var(--ac-stone)] font-medium">
                        {eyebrow}
                    </p>
                    {headline && (
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mt-4 tracking-tight">
                            {headline}
                        </h2>
                    )}
                </div>

                {/* Logo Wall */}
                <div
                    ref={logosRef}
                    className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16 mb-12"
                >
                    {publications.map((publication, index) => (
                        <div
                            key={index}
                            className="press-logo group cursor-default"
                        >
                            {publication.logo ? (
                                <div className="grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                                    {publication.logo}
                                </div>
                            ) : (
                                <span className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl text-[var(--ac-stone)] hover:text-[var(--ac-charcoal)] dark:hover:text-[var(--ac-pearl)] transition-colors duration-500 select-none">
                                    {publication.name}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Featured Quote */}
                {quote && (
                    <div ref={quoteRef} className="text-center pt-8 border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                        <blockquote className="font-[family-name:var(--font-cormorant)] text-xl md:text-2xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] italic mb-3">
                            "{quote.text}"
                        </blockquote>
                        <cite className="text-sm text-[var(--ac-stone)] not-italic font-medium">
                            — {quote.source}
                        </cite>
                    </div>
                )}
            </div>
        </section>
    );
}
