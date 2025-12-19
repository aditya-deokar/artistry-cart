'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface AIVisionTeaserProps {
    badge?: string;
    headline?: string;
    subheadline?: string;
    features?: string[];
    cta?: {
        text: string;
        href: string;
    };
}

export function AIVisionTeaser({
    badge = "New Feature",
    headline = "Can't Find What You're Imagining?",
    subheadline = "Describe your vision and watch AI bring it to life. Share your concept with skilled artisans who can craft it into reality.",
    features = [
        "Generate product concepts with AI",
        "Refine until you're satisfied",
        "Connect with matching artisans",
        "Collaborate on custom creations",
    ],
    cta = { text: "Try AI Vision Studio", href: "/ai-vision" },
}: AIVisionTeaserProps) {
    const containerRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const visualRef = useRef<HTMLDivElement>(null);
    const featuresRef = useRef<HTMLDivElement[]>([]);
    const glowRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Initial states
            gsap.set(contentRef.current, { opacity: 0, x: -60 });
            gsap.set(visualRef.current, { opacity: 0, x: 60, scale: 0.9 });
            featuresRef.current.forEach((feature) => {
                gsap.set(feature, { opacity: 0, x: -30 });
            });

            // Content animation
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: 'top 70%',
                onEnter: () => {
                    gsap.to(contentRef.current, {
                        opacity: 1,
                        x: 0,
                        duration: 1,
                        ease: 'power3.out',
                    });

                    gsap.to(visualRef.current, {
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        duration: 1,
                        delay: 0.2,
                        ease: 'power3.out',
                    });

                    // Staggered features
                    featuresRef.current.forEach((feature, index) => {
                        if (feature) {
                            gsap.to(feature, {
                                opacity: 1,
                                x: 0,
                                duration: 0.6,
                                delay: 0.4 + index * 0.1,
                                ease: 'power3.out',
                            });
                        }
                    });
                },
            });

            // Floating glow animation
            if (glowRef.current) {
                gsap.to(glowRef.current, {
                    x: 20,
                    y: -20,
                    duration: 4,
                    ease: 'sine.inOut',
                    repeat: -1,
                    yoyo: true,
                });
            }
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative py-24 md:py-32 lg:py-40 px-6 md:px-8 bg-[var(--ac-obsidian)] dark:bg-[var(--ac-charcoal)] overflow-hidden"
        >
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--ac-obsidian)] via-[var(--ac-onyx)] to-[var(--ac-obsidian)]" />

                {/* Animated glow */}
                <div
                    ref={glowRef}
                    className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-30"
                    style={{
                        background: 'radial-gradient(circle, rgba(212,168,75,0.3) 0%, transparent 70%)',
                    }}
                />

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
                        backgroundSize: '50px 50px',
                    }}
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Content */}
                    <div ref={contentRef}>
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--ac-gold)]/10 border border-[var(--ac-gold)]/30 mb-6">
                            <div className="w-2 h-2 rounded-full bg-[var(--ac-gold)] animate-pulse" />
                            <span className="text-xs tracking-[0.2em] uppercase text-[var(--ac-gold-dark)] font-medium">
                                {badge}
                            </span>
                        </div>

                        {/* Headline */}
                        <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--ac-pearl)] leading-[1.1] mb-6 tracking-tight">
                            {headline}
                        </h2>

                        {/* Subheadline */}
                        <p className="text-lg md:text-xl text-[var(--ac-silver)] mb-8 leading-relaxed font-light">
                            {subheadline}
                        </p>

                        {/* Features */}
                        <div className="space-y-4 mb-10">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    ref={(el) => {
                                        if (el) featuresRef.current[index] = el;
                                    }}
                                    className="flex items-center gap-4"
                                >
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full border border-[var(--ac-gold)] flex items-center justify-center">
                                        <svg
                                            className="w-3 h-3 text-[var(--ac-gold)]"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-[var(--ac-pearl)] font-light">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <Link
                            href={cta.href}
                            className="group inline-flex items-center gap-3 px-8 py-4 bg-[var(--ac-gold)] text-[var(--ac-obsidian)] text-sm tracking-[0.15em] uppercase font-semibold transition-all duration-300 hover:bg-[var(--ac-gold-dark)] hover:shadow-lg hover:shadow-[var(--ac-gold)]/30"
                        >
                            <span>{cta.text}</span>
                            <svg
                                className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                />
                            </svg>
                        </Link>
                    </div>

                    {/* Visual */}
                    <div ref={visualRef} className="relative">
                        {/* Main visual container */}
                        <div className="relative aspect-square max-w-lg mx-auto">
                            {/* Outer ring */}
                            <div className="absolute inset-0 rounded-full border border-[var(--ac-gold)]/20 animate-spin-slow" style={{ animationDuration: '30s' }} />

                            {/* Inner content */}
                            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[var(--ac-slate)] to-[var(--ac-onyx)] border border-[var(--ac-slate)] flex items-center justify-center overflow-hidden">
                                {/* AI visualization placeholder */}
                                <div className="text-center p-8">
                                    {/* Animated circles */}
                                    <div className="relative w-32 h-32 mx-auto mb-6">
                                        <div className="absolute inset-0 rounded-full border-2 border-[var(--ac-gold)]/30 animate-ping" />
                                        <div className="absolute inset-4 rounded-full border-2 border-[var(--ac-gold)]/50 animate-pulse" />
                                        <div className="absolute inset-8 rounded-full bg-[var(--ac-gold)]/20 flex items-center justify-center">
                                            <svg
                                                className="w-8 h-8 text-[var(--ac-gold)]"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className="text-[var(--ac-pearl)] text-sm font-light">
                                        AI Vision Studio
                                    </p>
                                </div>
                            </div>

                            {/* Floating particles */}
                            <div className="absolute top-4 right-8 w-2 h-2 rounded-full bg-[var(--ac-gold)] animate-bounce" style={{ animationDelay: '0s' }} />
                            <div className="absolute bottom-12 left-4 w-1 h-1 rounded-full bg-[var(--ac-gold-dark)] animate-bounce" style={{ animationDelay: '0.5s' }} />
                            <div className="absolute top-1/2 right-4 w-1.5 h-1.5 rounded-full bg-[var(--ac-copper)] animate-bounce" style={{ animationDelay: '1s' }} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
