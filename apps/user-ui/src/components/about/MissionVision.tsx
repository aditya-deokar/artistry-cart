'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface MissionVisionProps {
    mission?: string;
    vision?: string;
}

export function MissionVision({
    mission = "To champion authentic craftsmanship by connecting creative visionaries with skilled artisans, fostering a global marketplace where every creation tells a story.",
    vision = "A world where handmade is celebrated, artisans thrive, and every home holds a piece of human artistry.",
}: MissionVisionProps) {
    const containerRef = useRef<HTMLElement>(null);
    const missionRef = useRef<HTMLDivElement>(null);
    const visionRef = useRef<HTMLDivElement>(null);
    const dividerRef = useRef<HTMLDivElement>(null);
    const missionWordsRef = useRef<HTMLSpanElement[]>([]);
    const visionWordsRef = useRef<HTMLSpanElement[]>([]);

    const missionWords = mission.split(' ');
    const visionWords = vision.split(' ');

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Initial states
            gsap.set(dividerRef.current, { scaleX: 0, transformOrigin: 'center' });

            missionWordsRef.current.forEach((word) => {
                if (word) gsap.set(word, { opacity: 0.15, y: 10 });
            });

            visionWordsRef.current.forEach((word) => {
                if (word) gsap.set(word, { opacity: 0.15, y: 10 });
            });

            // Animate mission words
            missionWordsRef.current.forEach((word, index) => {
                if (word) {
                    gsap.to(word, {
                        opacity: 1,
                        y: 0,
                        duration: 0.4,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: missionRef.current,
                            start: `top+=${index * 8} 75%`,
                            end: `top+=${index * 8 + 50} 60%`,
                            scrub: 1,
                        },
                    });
                }
            });

            // Animate divider
            ScrollTrigger.create({
                trigger: dividerRef.current,
                start: 'top 80%',
                onEnter: () => {
                    gsap.to(dividerRef.current, {
                        scaleX: 1,
                        duration: 1,
                        ease: 'power4.inOut',
                    });
                },
            });

            // Animate vision words
            visionWordsRef.current.forEach((word, index) => {
                if (word) {
                    gsap.to(word, {
                        opacity: 1,
                        y: 0,
                        duration: 0.4,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: visionRef.current,
                            start: `top+=${index * 8} 75%`,
                            end: `top+=${index * 8 + 50} 60%`,
                            scrub: 1,
                        },
                    });
                }
            });
        }, containerRef);

        return () => ctx.revert();
    }, [missionWords.length, visionWords.length]);

    return (
        <section
            ref={containerRef}
            className="relative py-32 md:py-40 lg:py-52 px-6 md:px-8 bg-[var(--ac-charcoal)] dark:bg-[var(--ac-obsidian)] overflow-hidden"
        >
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                {/* Subtle radial gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,168,75,0.05)_0%,transparent_70%)]" />

                {/* Large decorative quotation mark */}
                <div className="absolute top-16 left-8 md:left-16 text-[200px] md:text-[300px] font-serif text-white/[0.02] leading-none select-none">
                    "
                </div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto">
                {/* Mission */}
                <div ref={missionRef} className="mb-16 md:mb-24">
                    <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-[var(--ac-gold-dark)] mb-8 font-medium text-center">
                        Our Mission
                    </p>
                    <blockquote className="text-center">
                        <p className="font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[var(--ac-pearl)] leading-[1.4] font-light">
                            {missionWords.map((word, index) => (
                                <span
                                    key={index}
                                    ref={(el) => {
                                        if (el) missionWordsRef.current[index] = el;
                                    }}
                                    className="inline-block mr-[0.3em]"
                                >
                                    {word}
                                </span>
                            ))}
                        </p>
                    </blockquote>
                </div>

                {/* Divider */}
                <div className="flex items-center justify-center gap-4 mb-16 md:mb-24">
                    <div className="w-2 h-2 rotate-45 border border-[var(--ac-gold)]" />
                    <div
                        ref={dividerRef}
                        className="w-24 md:w-32 h-px bg-[var(--ac-gold)]"
                    />
                    <div className="w-2 h-2 rotate-45 border border-[var(--ac-gold)]" />
                </div>

                {/* Vision */}
                <div ref={visionRef}>
                    <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-[var(--ac-gold-dark)] mb-8 font-medium text-center">
                        Our Vision
                    </p>
                    <blockquote className="text-center">
                        <p className="font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[var(--ac-pearl)] leading-[1.4] font-light italic">
                            {visionWords.map((word, index) => (
                                <span
                                    key={index}
                                    ref={(el) => {
                                        if (el) visionWordsRef.current[index] = el;
                                    }}
                                    className="inline-block mr-[0.3em]"
                                >
                                    {word}
                                </span>
                            ))}
                        </p>
                    </blockquote>
                </div>
            </div>
        </section>
    );
}
