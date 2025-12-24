'use client';

import { useRef, useLayoutEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface Value {
    number: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    size: 'large' | 'medium' | 'small';
    accent?: string;
}

interface CoreValuesProps {
    eyebrow?: string;
    headline?: string;
    values?: Value[];
}

const defaultValues: Value[] = [
    {
        number: '01',
        title: 'Authenticity',
        description: 'Every piece is genuinely handcrafted. No mass production, no shortcuts, no compromises. We verify every artisan and ensure genuine craftsmanship.',
        icon: (
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
            </svg>
        ),
        size: 'large',
        accent: 'var(--ac-gold)',
    },
    {
        number: '02',
        title: 'Craftsmanship',
        description: 'We celebrate the mastery that comes from years of dedication.',
        icon: (
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
            </svg>
        ),
        size: 'medium',
        accent: 'var(--ac-copper)',
    },
    {
        number: '03',
        title: 'Community',
        description: "More than a marketplace—we're a family united by shared passion.",
        icon: (
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
        ),
        size: 'small',
        accent: 'var(--ac-terracotta)',
    },
    {
        number: '04',
        title: 'Sustainability',
        description: 'Thoughtful creation over disposable consumption. We honor materials, methods, and our planet with every decision we make.',
        icon: (
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
        ),
        size: 'medium',
        accent: 'var(--ac-success)',
    },
    {
        number: '05',
        title: 'Innovation',
        description: 'Blending traditional craft with modern technology. Our AI Vision Studio brings imagination to life in ways never before possible.',
        icon: (
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
        ),
        size: 'large',
        accent: 'var(--ac-gold)',
    },
];

// Individual value card component with content-only mouse tracking
function ValueCard({ value, index }: { value: Value; index: number }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLDivElement>(null);
    const iconGlowRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const descriptionRef = useRef<HTMLParagraphElement>(null);
    const shimmerRef = useRef<HTMLDivElement>(null);
    const accentLineRef = useRef<HTMLDivElement>(null);
    const numberRef = useRef<HTMLSpanElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Mouse tracking for content elements (title, description, icon)
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate offset from center (normalized from -1 to 1)
        const offsetX = ((e.clientX - centerX) / (rect.width / 2)) * 0.5;
        const offsetY = ((e.clientY - centerY) / (rect.height / 2)) * 0.5;

        // Different movement strengths for parallax depth effect
        const iconStrength = 12;
        const titleStrength = 8;
        const descStrength = 5;

        // Animate icon - follows mouse with more movement
        if (iconRef.current) {
            gsap.to(iconRef.current, {
                x: offsetX * iconStrength,
                y: offsetY * iconStrength,
                duration: 0.4,
                ease: 'power2.out',
            });
        }

        // Animate title - follows with medium movement
        if (titleRef.current) {
            gsap.to(titleRef.current, {
                x: offsetX * titleStrength,
                y: offsetY * titleStrength,
                duration: 0.5,
                ease: 'power2.out',
            });
        }

        // Animate description - follows with subtle movement
        if (descriptionRef.current) {
            gsap.to(descriptionRef.current, {
                x: offsetX * descStrength,
                y: offsetY * descStrength,
                duration: 0.6,
                ease: 'power2.out',
            });
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);

        // Reset all content positions with elastic ease
        if (iconRef.current) {
            gsap.to(iconRef.current, {
                x: 0,
                y: 0,
                scale: 1,
                rotate: 0,
                duration: 0.6,
                ease: 'elastic.out(1, 0.5)',
            });
        }

        if (titleRef.current) {
            gsap.to(titleRef.current, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: 'elastic.out(1, 0.5)',
            });
            // Reset character animations
            const chars = titleRef.current.querySelectorAll('.char');
            gsap.to(chars, {
                y: 0,
                duration: 0.3,
                stagger: 0.015,
                ease: 'power2.out',
            });
        }

        if (descriptionRef.current) {
            gsap.to(descriptionRef.current, {
                x: 0,
                y: 0,
                opacity: 0.85,
                duration: 0.6,
                ease: 'elastic.out(1, 0.5)',
            });
        }

        // Reset other hover effects
        if (iconGlowRef.current) {
            gsap.to(iconGlowRef.current, {
                opacity: 0,
                scale: 1,
                duration: 0.3,
                ease: 'power2.out',
            });
        }


        // Accent line retract
        gsap.to(accentLineRef.current, {
            scaleX: 0,
            duration: 0.4,
            ease: 'power2.in',
        });

        // Number reset
        gsap.to(numberRef.current, {
            scale: 1,
            opacity: 0.08,
            duration: 0.4,
            ease: 'power2.out',
        });
    }, []);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);

        // Icon glow pulse
        gsap.to(iconGlowRef.current, {
            opacity: 0.6,
            scale: 1.5,
            duration: 0.4,
            ease: 'power2.out',
        });

        // Title character wave animation
        if (titleRef.current) {
            const chars = titleRef.current.querySelectorAll('.char');
            gsap.to(chars, {
                y: -6,
                duration: 0.4,
                stagger: {
                    each: 0.025,
                    ease: 'power2.out',
                },
                ease: 'back.out(2)',
            });
        }

        // Description fade up slightly
        gsap.to(descriptionRef.current, {
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out',
        });

        // Shimmer sweep effect
        gsap.fromTo(shimmerRef.current, {
            x: '-100%',
            opacity: 0,
        }, {
            x: '200%',
            opacity: 0.5,
            duration: 0.8,
            ease: 'power2.inOut',
        });

        // Accent line expansion
        gsap.to(accentLineRef.current, {
            scaleX: 1,
            duration: 0.6,
            ease: 'power3.out',
        });

        // Background number animation
        gsap.to(numberRef.current, {
            scale: 1.1,
            opacity: 0.15,
            duration: 0.5,
            ease: 'power2.out',
        });
    }, []);

    // Get grid classes based on size
    const getGridClasses = () => {
        switch (value.size) {
            case 'large':
                return 'col-span-2 row-span-2';
            case 'medium':
                return 'col-span-1 row-span-2';
            case 'small':
                return 'col-span-1 row-span-1';
            default:
                return 'col-span-1 row-span-1';
        }
    };

    return (
        <div
            ref={cardRef}
            className={`value-card group relative cursor-pointer ${getGridClasses()}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                className="relative h-full p-6 md:p-8 lg:p-10 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] rounded-lg overflow-hidden"
                style={{
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                }}
            >

                {/* Shimmer effect overlay */}
                <div
                    ref={shimmerRef}
                    className="absolute inset-0 pointer-events-none opacity-0"
                    style={{
                        background: `linear-gradient(120deg, transparent 30%, ${value.accent}15 50%, transparent 70%)`,
                        transform: 'translateX(-100%)',
                    }}
                />

                {/* Background number with fade effect */}
                <span
                    ref={numberRef}
                    className="absolute top-4 right-4 font-[family-name:var(--font-playfair)] text-6xl md:text-8xl lg:text-9xl font-light select-none"
                    style={{
                        color: value.accent,
                        opacity: 0.08,
                        transition: 'color 0.3s ease',
                    }}
                >
                    {value.number}
                </span>

                {/* Content wrapper */}
                <div className="relative z-10 h-full flex flex-col">
                    {/* Icon with glow effect - mouse tracked */}
                    <div className="relative mb-6">
                        {/* Icon glow */}
                        <div
                            ref={iconGlowRef}
                            className="absolute inset-0 rounded-full blur-xl opacity-0"
                            style={{ backgroundColor: value.accent }}
                        />
                        <div
                            ref={iconRef}
                            className={`relative w-12 h-12 md:w-14 md:h-14 ${value.size === 'large' ? 'lg:w-16 lg:h-16' : ''} will-change-transform`}
                            style={{ color: value.accent }}
                        >
                            {value.icon}
                        </div>
                    </div>

                    {/* Title with character animation - mouse tracked */}
                    <h3
                        ref={titleRef}
                        className={`font-[family-name:var(--font-playfair)] ${value.size === 'large' ? 'text-2xl md:text-3xl lg:text-4xl' : 'text-xl md:text-2xl'
                            } text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-4 will-change-transform`}
                    >
                        {value.title.split('').map((char, i) => (
                            <span
                                key={i}
                                className="char inline-block"
                                style={{
                                    color: isHovered ? value.accent : undefined,
                                    transition: `color 0.3s ease ${i * 0.02}s`,
                                }}
                            >
                                {char === ' ' ? '\u00A0' : char}
                            </span>
                        ))}
                    </h3>

                    {/* Description - mouse tracked */}
                    <p
                        ref={descriptionRef}
                        className={`text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] leading-relaxed font-light will-change-transform ${value.size === 'large' ? 'text-base md:text-lg' : 'text-sm md:text-base'
                            } ${value.size === 'small' ? 'line-clamp-3' : ''}`}
                        style={{ opacity: 0.85 }}
                    >
                        {value.description}
                    </p>

                    {/* Bottom accent line with scale animation */}
                    <div className="mt-auto pt-6">
                        <div
                            ref={accentLineRef}
                            className="h-[2px] w-full origin-left"
                            style={{
                                backgroundColor: value.accent,
                                transform: 'scaleX(0)',
                            }}
                        />
                    </div>
                </div>

                {/* Corner gradient accent */}
                <div
                    className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none transition-opacity duration-500"
                    style={{
                        background: `radial-gradient(circle at bottom right, ${value.accent}08 0%, transparent 70%)`,
                        opacity: isHovered ? 1 : 0,
                    }}
                />
            </div>
        </div>
    );
}

export function CoreValues({
    eyebrow = "What We Stand For",
    headline = "Our Core Values",
    values = defaultValues,
}: CoreValuesProps) {
    const containerRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const headlineRef = useRef<HTMLHeadingElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Initial states
            gsap.set(headerRef.current, { opacity: 0, y: 40 });

            const cards = gridRef.current?.querySelectorAll('.value-card');
            if (cards) {
                gsap.set(cards, { opacity: 0, y: 60, scale: 0.95 });
            }

            // Header animation with enhanced reveal
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: 'top 80%',
                onEnter: () => {
                    const tl = gsap.timeline();

                    // Fade in header container
                    tl.to(headerRef.current, {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                    });

                    // Headline character reveal
                    if (headlineRef.current) {
                        const chars = headlineRef.current.querySelectorAll('.headline-char');
                        tl.fromTo(chars, {
                            opacity: 0,
                            y: 30,
                            rotateX: -45,
                        }, {
                            opacity: 1,
                            y: 0,
                            rotateX: 0,
                            duration: 0.6,
                            stagger: 0.03,
                            ease: 'power3.out',
                        }, '-=0.4');
                    }
                },
            });

            // Staggered card animations with enhanced entrance
            if (cards) {
                ScrollTrigger.create({
                    trigger: gridRef.current,
                    start: 'top 80%',
                    onEnter: () => {
                        gsap.to(cards, {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            duration: 0.8,
                            stagger: {
                                each: 0.12,
                                from: 'start',
                            },
                            ease: 'power3.out',
                        });
                    },
                });
            }
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative py-24 md:py-32 lg:py-40 px-6 md:px-8 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] overflow-hidden"
        >
            {/* Premium background decoration */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                {/* Top gradient line */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--ac-gold)]/20 to-transparent" />
                {/* Bottom gradient line */}
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--ac-gold)]/20 to-transparent" />
                {/* Subtle radial gradient background */}
                <div
                    className="absolute inset-0 opacity-30 dark:opacity-20"
                    style={{
                        background: 'radial-gradient(ellipse at 50% 0%, var(--ac-gold) 0%, transparent 50%)',
                        opacity: 0.03,
                    }}
                />
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div ref={headerRef} className="text-center mb-16 md:mb-20">
                    <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] mb-4 font-medium">
                        {eyebrow}
                    </p>
                    <h2
                        ref={headlineRef}
                        className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] tracking-tight"
                        style={{ perspective: '1000px' }}
                    >
                        {headline.split('').map((char, i) => (
                            <span
                                key={i}
                                className="headline-char inline-block"
                                style={{ display: 'inline-block' }}
                            >
                                {char === ' ' ? '\u00A0' : char}
                            </span>
                        ))}
                    </h2>
                </div>

                {/* Bento Grid */}
                <div
                    ref={gridRef}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[180px] md:auto-rows-[200px] lg:auto-rows-[220px] gap-4 md:gap-6"
                >
                    {values.map((value, index) => (
                        <ValueCard key={index} value={value} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
