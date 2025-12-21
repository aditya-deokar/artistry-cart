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

// Magnetic hover effect hook
function useMagneticHover(strength: number = 0.3) {
    const elementRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!elementRef.current) return;

        const rect = elementRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * strength;
        const deltaY = (e.clientY - centerY) * strength;

        gsap.to(elementRef.current, {
            x: deltaX,
            y: deltaY,
            duration: 0.3,
            ease: 'power2.out',
        });
    }, [strength]);

    const handleMouseLeave = useCallback(() => {
        if (!elementRef.current) return;

        gsap.to(elementRef.current, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.5)',
        });
        setIsHovering(false);
    }, []);

    const handleMouseEnter = useCallback(() => {
        setIsHovering(true);
    }, []);

    return { elementRef, isHovering, handleMouseMove, handleMouseLeave, handleMouseEnter };
}

// Individual value card component
function ValueCard({ value, index }: { value: Value; index: number }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLDivElement>(null);
    const borderRef = useRef<SVGRectElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const { elementRef: magnetRef, handleMouseMove, handleMouseLeave, handleMouseEnter, isHovering } = useMagneticHover(0.15);

    useLayoutEffect(() => {
        if (!cardRef.current) return;

        const card = cardRef.current;

        const handleEnter = () => {
            // Animate icon
            if (iconRef.current) {
                gsap.to(iconRef.current, {
                    scale: 1.1,
                    rotate: 5,
                    duration: 0.4,
                    ease: 'back.out(2)',
                });
            }

            // Animate border stroke
            if (borderRef.current) {
                gsap.to(borderRef.current, {
                    strokeDashoffset: 0,
                    duration: 0.8,
                    ease: 'power2.out',
                });
            }

            // Animate glow
            if (glowRef.current) {
                gsap.to(glowRef.current, {
                    opacity: 1,
                    scale: 1.2,
                    duration: 0.5,
                    ease: 'power2.out',
                });
            }

            // Animate title letters
            if (titleRef.current) {
                const chars = titleRef.current.querySelectorAll('.char');
                gsap.to(chars, {
                    y: -4,
                    color: value.accent,
                    duration: 0.3,
                    stagger: 0.02,
                    ease: 'power2.out',
                });
            }
        };

        const handleLeave = () => {
            // Reset icon
            if (iconRef.current) {
                gsap.to(iconRef.current, {
                    scale: 1,
                    rotate: 0,
                    duration: 0.4,
                    ease: 'power2.out',
                });
            }

            // Reset border
            if (borderRef.current) {
                gsap.to(borderRef.current, {
                    strokeDashoffset: 1000,
                    duration: 0.5,
                    ease: 'power2.in',
                });
            }

            // Reset glow
            if (glowRef.current) {
                gsap.to(glowRef.current, {
                    opacity: 0,
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out',
                });
            }

            // Reset title letters
            if (titleRef.current) {
                const chars = titleRef.current.querySelectorAll('.char');
                gsap.to(chars, {
                    y: 0,
                    color: '',
                    duration: 0.3,
                    stagger: 0.01,
                    ease: 'power2.out',
                });
            }
        };

        card.addEventListener('mouseenter', handleEnter);
        card.addEventListener('mouseleave', handleLeave);

        return () => {
            card.removeEventListener('mouseenter', handleEnter);
            card.removeEventListener('mouseleave', handleLeave);
        };
    }, [value.accent]);

    // Mouse move handler for glow effect
    const handleMouseMoveGlow = (e: React.MouseEvent) => {
        if (!cardRef.current || !glowRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        gsap.to(glowRef.current, {
            left: x,
            top: y,
            duration: 0.2,
            ease: 'power2.out',
        });

        // Also call magnetic effect
        handleMouseMove(e.nativeEvent);
    };

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
            className={`value-card group relative overflow-hidden cursor-pointer ${getGridClasses()}`}
            onMouseMove={handleMouseMoveGlow}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                ref={magnetRef}
                className="relative h-full p-6 md:p-8 lg:p-10 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] transition-shadow duration-500 hover:shadow-2xl hover:shadow-black/5"
            >
                {/* Animated border SVG */}
                <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    preserveAspectRatio="none"
                >
                    <rect
                        ref={borderRef}
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill="none"
                        stroke={value.accent}
                        strokeWidth="2"
                        strokeDasharray="1000"
                        strokeDashoffset="1000"
                        className="transition-all"
                    />
                </svg>

                {/* Cursor-following glow */}
                <div
                    ref={glowRef}
                    className="absolute w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none opacity-0"
                    style={{
                        background: `radial-gradient(circle, ${value.accent}20 0%, transparent 70%)`,
                    }}
                />

                {/* Background number */}
                <span
                    className="absolute top-4 right-4 font-[family-name:var(--font-playfair)] text-6xl md:text-8xl lg:text-9xl text-[var(--ac-linen)] dark:text-[var(--ac-slate)] font-light select-none transition-all duration-500 group-hover:opacity-30"
                    style={{
                        WebkitTextStroke: `1px ${value.accent}20`,
                    }}
                >
                    {value.number}
                </span>

                {/* Content wrapper */}
                <div className="relative z-10 h-full flex flex-col">
                    {/* Icon */}
                    <div
                        ref={iconRef}
                        className={`w-12 h-12 md:w-14 md:h-14 ${value.size === 'large' ? 'lg:w-16 lg:h-16' : ''} mb-6 transition-colors duration-300`}
                        style={{ color: value.accent }}
                    >
                        {value.icon}
                    </div>

                    {/* Title with character animation */}
                    <h3
                        ref={titleRef}
                        className={`font-[family-name:var(--font-playfair)] ${value.size === 'large' ? 'text-2xl md:text-3xl lg:text-4xl' : 'text-xl md:text-2xl'
                            } text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-4 transition-colors duration-300`}
                    >
                        {value.title.split('').map((char, i) => (
                            <span key={i} className="char inline-block" style={{ transitionDelay: `${i * 20}ms` }}>
                                {char === ' ' ? '\u00A0' : char}
                            </span>
                        ))}
                    </h3>

                    {/* Description */}
                    <p className={`text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] leading-relaxed font-light ${value.size === 'large' ? 'text-base md:text-lg' : 'text-sm md:text-base'
                        } ${value.size === 'small' ? 'line-clamp-3' : ''}`}>
                        {value.description}
                    </p>

                    {/* Bottom accent line */}
                    <div className="mt-auto pt-6">
                        <div
                            className="h-0.5 w-0 group-hover:w-full transition-all duration-700 ease-out"
                            style={{ backgroundColor: value.accent }}
                        />
                    </div>
                </div>

                {/* Decorative corner */}
                <div
                    className="absolute bottom-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                        background: `linear-gradient(135deg, transparent 50%, ${value.accent}10 50%)`,
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

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Initial states
            gsap.set(headerRef.current, { opacity: 0, y: 40 });

            const cards = gridRef.current?.querySelectorAll('.value-card');
            if (cards) {
                gsap.set(cards, { opacity: 0, y: 60, scale: 0.95 });
            }

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

            // Staggered card animations
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
                                each: 0.1,
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
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--ac-gold)]/20 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--ac-gold)]/20 to-transparent" />
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div ref={headerRef} className="text-center mb-16 md:mb-20">
                    <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] mb-4 font-medium">
                        {eyebrow}
                    </p>
                    <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] tracking-tight">
                        {headline}
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
