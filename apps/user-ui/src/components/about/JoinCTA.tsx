'use client';

import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface JoinCTAProps {
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
    newsletterTitle?: string;
    newsletterDescription?: string;
}

export function JoinCTA({
    headline = "Become Part of the Story",
    subheadline = "Whether you're a maker, collector, or dreamer—there's a place for you here.",
    primaryCTA = { text: "Explore the Collection", href: "/product" },
    secondaryCTA = { text: "Become an Artisan", href: "/become-seller" },
    newsletterTitle = "Stay Inspired",
    newsletterDescription = "Join 50,000+ creatives who receive our weekly curation of art, stories, and discoveries.",
}: JoinCTAProps) {
    const containerRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const newsletterRef = useRef<HTMLDivElement>(null);
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Initial states
            gsap.set(contentRef.current, { opacity: 0, y: 40 });
            gsap.set(newsletterRef.current, { opacity: 0, y: 30 });

            // Animations
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

                    gsap.to(newsletterRef.current, {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        delay: 0.3,
                        ease: 'power3.out',
                    });
                },
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle newsletter signup
        setIsSubmitted(true);
        setEmail('');
    };

    return (
        <section
            ref={containerRef}
            className="relative py-24 md:py-32 lg:py-40 px-6 md:px-8 bg-[var(--ac-charcoal)] dark:bg-[var(--ac-obsidian)] overflow-hidden"
        >
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                {/* Radial gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,168,75,0.08)_0%,transparent_60%)]" />

                {/* Decorative lines */}
                <div className="absolute top-0 left-1/4 w-px h-32 bg-gradient-to-b from-[var(--ac-gold)]/30 to-transparent" />
                <div className="absolute top-0 right-1/4 w-px h-48 bg-gradient-to-b from-[var(--ac-gold)]/20 to-transparent" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
                {/* Main Content */}
                <div ref={contentRef} className="text-center mb-16">
                    <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--ac-pearl)] mb-6 tracking-tight">
                        {headline}
                    </h2>
                    <p className="text-lg md:text-xl text-[var(--ac-silver)] max-w-2xl mx-auto mb-10 font-light">
                        {subheadline}
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href={primaryCTA.href}
                            className="group relative px-8 py-4 bg-[var(--ac-gold)] text-[var(--ac-charcoal)] text-sm tracking-[0.15em] uppercase font-semibold overflow-hidden transition-all duration-500 hover:shadow-lg hover:shadow-[var(--ac-gold)]/20"
                        >
                            <span className="relative z-10">{primaryCTA.text}</span>
                            <div className="absolute inset-0 bg-[var(--ac-gold-dark)] transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                            <span className="absolute inset-0 flex items-center justify-center text-[var(--ac-charcoal)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 z-20">
                                {primaryCTA.text}
                            </span>
                        </Link>

                        <Link
                            href={secondaryCTA.href}
                            className="group relative px-8 py-4 border border-[var(--ac-pearl)] text-[var(--ac-pearl)] text-sm tracking-[0.15em] uppercase font-medium overflow-hidden transition-all duration-500"
                        >
                            <span className="relative z-10 group-hover:text-[var(--ac-charcoal)] transition-colors duration-500">
                                {secondaryCTA.text}
                            </span>
                            <div className="absolute inset-0 bg-[var(--ac-pearl)] transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                        </Link>
                    </div>
                </div>

                {/* Newsletter */}
                <div ref={newsletterRef} className="pt-12 border-t border-white/10">
                    <div className="text-center max-w-xl mx-auto">
                        <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-[var(--ac-pearl)] mb-3">
                            {newsletterTitle}
                        </h3>
                        <p className="text-[var(--ac-silver)] mb-6 font-light">
                            {newsletterDescription}
                        </p>

                        {isSubmitted ? (
                            <div className="flex items-center justify-center gap-2 text-[var(--ac-gold-dark)]">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Thank you for subscribing!</span>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    className="flex-1 px-5 py-4 bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--ac-gold)] transition-colors duration-300 text-sm"
                                />
                                <button
                                    type="submit"
                                    className="px-8 py-4 bg-[var(--ac-pearl)] text-[var(--ac-charcoal)] text-sm tracking-[0.15em] uppercase font-semibold hover:bg-[var(--ac-gold)] transition-colors duration-300"
                                >
                                    Subscribe
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
