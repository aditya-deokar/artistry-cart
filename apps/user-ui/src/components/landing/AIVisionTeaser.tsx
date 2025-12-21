'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Link from 'next/link';
import { AIVisionVisual } from './AIVisionVisual';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, useGSAP);

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
    badge = "AI Powered",
    headline = "Can't Find What You're Imagining?",
    subheadline = "Describe your vision and watch AI bring it to life. Share your concept with skilled artisans who can craft it into reality.",
    features = [
        "Generate product concepts with AI",
        "Refine designs until perfect",
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

    useGSAP(() => {
        // Initial states
        gsap.set(contentRef.current, { opacity: 0, x: -60 });
        gsap.set(visualRef.current, { opacity: 0, x: 60, scale: 0.95 });
        featuresRef.current.forEach((feature) => {
            if (feature) gsap.set(feature, { opacity: 0, x: -30 });
        });

        // Content animation on scroll
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
                x: 30,
                y: -30,
                duration: 5,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
            });
        }
    }, { scope: containerRef });

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
                    className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full opacity-20"
                    style={{
                        background: 'radial-gradient(circle, rgba(212,168,75,0.4) 0%, rgba(212,168,75,0.1) 40%, transparent 70%)',
                    }}
                />

                {/* Secondary glow */}
                <div
                    className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full opacity-10"
                    style={{
                        background: 'radial-gradient(circle, rgba(184,134,11,0.3) 0%, transparent 60%)',
                    }}
                />

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Content */}
                    <div ref={contentRef}>
                        {/* Badge */}
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[var(--ac-gold)]/10 border border-[var(--ac-gold)]/30 mb-8">
                            <div className="relative">
                                <div className="w-2 h-2 rounded-full bg-[var(--ac-gold)]" />
                                <div className="absolute inset-0 w-2 h-2 rounded-full bg-[var(--ac-gold)] animate-ping" />
                            </div>
                            <span className="text-xs tracking-[0.2em] uppercase text-[var(--ac-gold)] font-semibold">
                                {badge}
                            </span>
                        </div>

                        {/* Headline */}
                        <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--ac-pearl)] leading-[1.1] mb-6 tracking-tight">
                            {headline}
                        </h2>

                        {/* Subheadline */}
                        <p className="text-lg md:text-xl text-[var(--ac-silver)] mb-10 leading-relaxed font-light max-w-xl">
                            {subheadline}
                        </p>

                        {/* Features */}
                        <div className="space-y-4 mb-12">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    ref={(el) => {
                                        if (el) featuresRef.current[index] = el;
                                    }}
                                    className="flex items-center gap-4 group"
                                >
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full border border-[var(--ac-gold)]/40 flex items-center justify-center bg-[var(--ac-gold)]/5 group-hover:bg-[var(--ac-gold)]/10 transition-colors duration-300">
                                        <svg
                                            className="w-4 h-4 text-[var(--ac-gold)]"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-[var(--ac-pearl)] font-light text-lg">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <Link
                            href={cta.href}
                            className="group inline-flex items-center gap-4 px-8 py-4 bg-[var(--ac-gold)] text-[var(--ac-obsidian)] text-sm tracking-[0.15em] uppercase font-bold transition-all duration-300 hover:bg-[var(--ac-gold-dark)] hover:shadow-2xl hover:shadow-[var(--ac-gold)]/30 hover:-translate-y-0.5"
                        >
                            <span>{cta.text}</span>
                            <svg
                                className="w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                />
                            </svg>
                        </Link>
                    </div>

                    {/* Visual - New Interactive Component */}
                    <div ref={visualRef}>
                        <AIVisionVisual />
                    </div>
                </div>
            </div>
        </section>
    );
}
