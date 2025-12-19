'use client';

import { useRef, useLayoutEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface Testimonial {
    quote: string;
    author: string;
    location: string;
    avatar?: string;
}

interface TestimonialsProps {
    eyebrow?: string;
    testimonials?: Testimonial[];
}

const defaultTestimonials: Testimonial[] = [
    {
        quote: "The custom piece they created captures exactly what I envisioned. True artistry that exceeded all expectations.",
        author: "Michael Torres",
        location: "New York, USA",
    },
    {
        quote: "Every item feels like it has a story. The quality and attention to detail is something you simply can't find elsewhere.",
        author: "Emma Lindqvist",
        location: "Stockholm, Sweden",
    },
    {
        quote: "The AI Vision feature is magical—I described a dream piece and found an artisan who made it real within weeks.",
        author: "Akiko Tanaka",
        location: "Tokyo, Japan",
    },
];

export function Testimonials({
    eyebrow = "What Our Collectors Say",
    testimonials = defaultTestimonials,
}: TestimonialsProps) {
    const containerRef = useRef<HTMLElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const quoteRef = useRef<HTMLDivElement>(null);
    const authorRef = useRef<HTMLDivElement>(null);

    const animateTestimonial = useCallback((newIndex: number) => {
        const tl = gsap.timeline();

        tl.to([quoteRef.current, authorRef.current], {
            opacity: 0,
            y: -20,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                setActiveIndex(newIndex);
            },
        })
            .to([quoteRef.current, authorRef.current], {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: 'power3.out',
                stagger: 0.1,
            });
    }, []);

    const handleNext = () => {
        const newIndex = (activeIndex + 1) % testimonials.length;
        animateTestimonial(newIndex);
    };

    const handlePrev = () => {
        const newIndex = activeIndex === 0 ? testimonials.length - 1 : activeIndex - 1;
        animateTestimonial(newIndex);
    };

    const handleDotClick = (index: number) => {
        if (index !== activeIndex) {
            animateTestimonial(index);
        }
    };

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Initial animation
            gsap.set(containerRef.current, { opacity: 0, y: 40 });

            ScrollTrigger.create({
                trigger: containerRef.current,
                start: 'top 80%',
                onEnter: () => {
                    gsap.to(containerRef.current, {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                    });
                },
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Auto-advance testimonials
    useLayoutEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % testimonials.length);
        }, 6000);

        return () => clearInterval(interval);
    }, [testimonials.length]);

    const currentTestimonial = testimonials[activeIndex];

    return (
        <section
            ref={containerRef}
            className="relative py-24 md:py-32 lg:py-40 px-6 md:px-8 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]"
        >
            {/* Decorative elements */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--ac-linen)] dark:via-[var(--ac-slate)] to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--ac-linen)] dark:via-[var(--ac-slate)] to-transparent" />

                {/* Large quote marks */}
                <div className="absolute top-1/4 left-8 md:left-16 text-[var(--ac-linen)] dark:text-[var(--ac-slate)] text-[200px] md:text-[300px] font-serif leading-none select-none opacity-50">
                    "
                </div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto text-center">
                {/* Eyebrow */}
                <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] mb-12 md:mb-16 font-medium">
                    {eyebrow}
                </p>

                {/* Quote */}
                <div ref={quoteRef} className="mb-10 md:mb-12">
                    <blockquote className="font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] leading-[1.3] italic font-light">
                        "{currentTestimonial.quote}"
                    </blockquote>
                </div>

                {/* Author */}
                <div ref={authorRef} className="mb-12 md:mb-16">
                    <p className="text-base md:text-lg text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] font-medium mb-1">
                        {currentTestimonial.author}
                    </p>
                    <p className="text-sm text-[var(--ac-stone)] tracking-wide">
                        {currentTestimonial.location}
                    </p>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-center gap-8">
                    {/* Previous */}
                    <button
                        onClick={handlePrev}
                        className="group p-2 text-[var(--ac-stone)] hover:text-[var(--ac-charcoal)] dark:hover:text-[var(--ac-pearl)] transition-colors duration-300"
                        aria-label="Previous testimonial"
                    >
                        <svg
                            className="w-6 h-6 transform transition-transform duration-300 group-hover:-translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M7 16l-4-4m0 0l4-4m-4 4h18"
                            />
                        </svg>
                    </button>

                    {/* Dots */}
                    <div className="flex items-center gap-3">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handleDotClick(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === activeIndex
                                        ? 'bg-[var(--ac-gold)] w-8'
                                        : 'bg-[var(--ac-stone)]/50 hover:bg-[var(--ac-stone)]'
                                    }`}
                                aria-label={`Go to testimonial ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Next */}
                    <button
                        onClick={handleNext}
                        className="group p-2 text-[var(--ac-stone)] hover:text-[var(--ac-charcoal)] dark:hover:text-[var(--ac-pearl)] transition-colors duration-300"
                        aria-label="Next testimonial"
                    >
                        <svg
                            className="w-6 h-6 transform transition-transform duration-300 group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
}
