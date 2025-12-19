'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface ManifestoProps {
    quote?: string;
    signature?: string;
}

export function Manifesto({
    quote = "We believe every creation deserves to be unique. In a world of mass production, we celebrate the human touch—the imperfections that make art perfect, the stories woven into every piece.",
    signature = "— The Artistry Cart Philosophy",
}: ManifestoProps) {
    const containerRef = useRef<HTMLElement>(null);
    const quoteRef = useRef<HTMLQuoteElement>(null);
    const wordsRef = useRef<HTMLSpanElement[]>([]);
    const signatureRef = useRef<HTMLParagraphElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);

    // Split quote into words
    const words = quote.split(' ');

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Reset refs array
            wordsRef.current = wordsRef.current.slice(0, words.length);

            // Initial state for words
            gsap.set(wordsRef.current, {
                opacity: 0.15,
                y: 20,
            });

            gsap.set(signatureRef.current, {
                opacity: 0,
                y: 30,
            });

            gsap.set(lineRef.current, {
                scaleX: 0,
                transformOrigin: 'center',
            });

            // Reveal words one by one on scroll
            wordsRef.current.forEach((word, index) => {
                if (word) {
                    gsap.to(word, {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: containerRef.current,
                            start: `top+=${index * 15} 80%`,
                            end: `top+=${index * 15 + 100} 60%`,
                            scrub: 1,
                        },
                    });
                }
            });

            // Animate decorative line
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: 'top 70%',
                onEnter: () => {
                    gsap.to(lineRef.current, {
                        scaleX: 1,
                        duration: 1.2,
                        ease: 'power4.inOut',
                    });
                },
            });

            // Animate signature
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: 'center 60%',
                onEnter: () => {
                    gsap.to(signatureRef.current, {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                    });
                },
            });
        }, containerRef);

        return () => ctx.revert();
    }, [words.length]);

    return (
        <section
            ref={containerRef}
            className="relative py-32 md:py-48 lg:py-56 px-6 md:px-8 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] overflow-hidden"
        >
            {/* Decorative background elements */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--ac-linen)] dark:via-[var(--ac-slate)] to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--ac-linen)] dark:via-[var(--ac-slate)] to-transparent" />
            </div>

            <div className="max-w-5xl mx-auto text-center">
                {/* Decorative line above */}
                <div
                    ref={lineRef}
                    className="w-24 h-px bg-[var(--ac-gold)] mx-auto mb-12 md:mb-16"
                    aria-hidden="true"
                />

                {/* Quote */}
                <blockquote
                    ref={quoteRef}
                    className="font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] leading-[1.4] md:leading-[1.3] italic font-light"
                >
                    <span className="text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] text-4xl md:text-5xl lg:text-6xl leading-none">
                        "
                    </span>
                    {words.map((word, index) => (
                        <span
                            key={index}
                            ref={(el) => {
                                if (el) wordsRef.current[index] = el;
                            }}
                            className="inline-block mr-[0.25em] transition-colors duration-300"
                        >
                            {word}
                        </span>
                    ))}
                    <span className="text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] text-4xl md:text-5xl lg:text-6xl leading-none">
                        "
                    </span>
                </blockquote>

                {/* Signature */}
                <p
                    ref={signatureRef}
                    className="mt-10 md:mt-14 text-sm md:text-base tracking-[0.2em] text-[var(--ac-stone)] uppercase font-medium"
                >
                    {signature}
                </p>
            </div>
        </section>
    );
}
