'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface OriginStoryProps {
    yearBadge?: string;
    headline?: string;
    paragraphs?: string[];
    pullQuote?: string;
    founderName?: string;
    founderTitle?: string;
    image?: string;
}

export function OriginStory({
    yearBadge = "Founded 2019",
    headline = "From a Small Workshop to a Global Community",
    paragraphs = [
        "It began with a simple observation: in a world of mass production, the human touch was being lost. Every product looked the same, felt the same, told no story.",
        "We set out to change that. What started as a platform for local artisans has grown into a global community of over 5,000 makers, each bringing their unique craft to the world.",
        "Today, Artistry Cart isn't just a marketplace—it's a movement. A celebration of the imperfect, the handmade, and the truly original.",
    ],
    pullQuote = "We don't just sell products. We preserve traditions, support livelihoods, and bring human stories into homes.",
    founderName = "Alexandra Chen",
    founderTitle = "Co-Founder",
    image = "https://images.unsplash.com/photo-1556103255-4443dbae8e5a?w=800&h=1000&fit=crop&q=80",
}: OriginStoryProps) {
    const containerRef = useRef<HTMLElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const quoteRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Initial states
            gsap.set(imageRef.current, { opacity: 0, x: -60, scale: 1.05 });
            gsap.set(contentRef.current, { opacity: 0, y: 40 });
            gsap.set(timelineRef.current, { scaleY: 0, transformOrigin: 'top' });
            gsap.set(quoteRef.current, { opacity: 0, x: 30 });

            // Content animations
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: 'top 70%',
                onEnter: () => {
                    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

                    tl.to(imageRef.current, {
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        duration: 1.2,
                    })
                        .to(timelineRef.current, {
                            scaleY: 1,
                            duration: 1,
                        }, '-=0.8')
                        .to(contentRef.current, {
                            opacity: 1,
                            y: 0,
                            duration: 0.8,
                        }, '-=0.6')
                        .to(quoteRef.current, {
                            opacity: 1,
                            x: 0,
                            duration: 0.8,
                        }, '-=0.4');
                },
            });

            // Image parallax
            gsap.to(imageRef.current?.querySelector('.parallax-img'), {
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
                    {/* Image Column */}
                    <div ref={imageRef} className="relative">
                        {/* Main image */}
                        <div className="relative aspect-[4/5] overflow-hidden">
                            <Image
                                src={image}
                                alt="Artisan at work"
                                fill
                                className="parallax-img object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />

                            {/* Overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>

                        {/* Year badge */}
                        <div className="absolute -bottom-4 -right-4 md:bottom-8 md:right-8 px-6 py-3 bg-[var(--ac-charcoal)] dark:bg-[var(--ac-pearl)]">
                            <span className="text-sm tracking-[0.2em] uppercase text-[var(--ac-pearl)] dark:text-[var(--ac-charcoal)] font-medium">
                                {yearBadge}
                            </span>
                        </div>

                        {/* Decorative frame */}
                        <div className="absolute -bottom-6 -right-6 w-full h-full border border-[var(--ac-gold)]/20 -z-10" />
                    </div>

                    {/* Content Column */}
                    <div className="relative lg:pl-8">
                        {/* Timeline accent */}
                        <div
                            ref={timelineRef}
                            className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-[var(--ac-gold)] via-[var(--ac-gold)]/50 to-transparent hidden lg:block"
                            aria-hidden="true"
                        />

                        <div ref={contentRef} className="lg:pl-8">
                            {/* Headline */}
                            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-8 tracking-tight leading-[1.2]">
                                {headline}
                            </h2>

                            {/* Paragraphs */}
                            <div className="space-y-6 mb-10">
                                {paragraphs.map((paragraph, index) => (
                                    <p
                                        key={index}
                                        className="text-lg text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] leading-relaxed font-light"
                                    >
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </div>

                        {/* Pull Quote */}
                        <div
                            ref={quoteRef}
                            className="relative pl-6 border-l-2 border-[var(--ac-gold)] lg:ml-8"
                        >
                            <blockquote className="font-[family-name:var(--font-cormorant)] text-xl md:text-2xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] italic leading-relaxed mb-4">
                                "{pullQuote}"
                            </blockquote>
                            <footer className="text-sm text-[var(--ac-stone)]">
                                <span className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                    {founderName}
                                </span>
                                <span className="mx-2">·</span>
                                <span>{founderTitle}</span>
                            </footer>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
