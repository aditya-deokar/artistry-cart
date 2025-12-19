'use client';

import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface Metric {
    value: number;
    suffix?: string;
    prefix?: string;
    label: string;
    description: string;
}

interface ImpactMetricsProps {
    eyebrow?: string;
    headline?: string;
    metrics?: Metric[];
}

const defaultMetrics: Metric[] = [
    {
        value: 5000,
        suffix: '+',
        label: 'Artisans',
        description: 'Skilled makers from around the world',
    },
    {
        value: 50000,
        suffix: '+',
        label: 'Products',
        description: 'Unique handcrafted creations',
    },
    {
        value: 120,
        suffix: '+',
        label: 'Countries',
        description: 'Global reach and delivery',
    },
    {
        value: 98,
        suffix: '%',
        label: 'Satisfaction',
        description: 'Happy collectors worldwide',
    },
];

function AnimatedCounter({
    value,
    prefix = '',
    suffix = '',
    isVisible
}: {
    value: number;
    prefix?: string;
    suffix?: string;
    isVisible: boolean;
}) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isVisible) return;

        let startTime: number;
        const duration = 2000; // 2 seconds

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * value));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [isVisible, value]);

    return (
        <span>
            {prefix}
            {count.toLocaleString()}
            {suffix}
        </span>
    );
}

export function ImpactMetrics({
    eyebrow = "Our Impact",
    headline = "By the Numbers",
    metrics = defaultMetrics,
}: ImpactMetricsProps) {
    const containerRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const metricsRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Initial states
            gsap.set(headerRef.current, { opacity: 0, y: 40 });
            gsap.set(metricsRef.current, { opacity: 0, y: 60 });

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

            // Metrics animation
            ScrollTrigger.create({
                trigger: metricsRef.current,
                start: 'top 80%',
                onEnter: () => {
                    gsap.to(metricsRef.current, {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                    });
                    setIsVisible(true);
                },
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative py-24 md:py-32 lg:py-40 px-6 md:px-8 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]"
        >
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] opacity-50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] opacity-30" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto">
                {/* Header */}
                <div ref={headerRef} className="text-center mb-16 md:mb-20">
                    <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] mb-4 font-medium">
                        {eyebrow}
                    </p>
                    <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] tracking-tight">
                        {headline}
                    </h2>
                </div>

                {/* Metrics Grid */}
                <div
                    ref={metricsRef}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12"
                >
                    {metrics.map((metric, index) => (
                        <div key={index} className="text-center group">
                            {/* Value */}
                            <div className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2 tracking-tight">
                                <AnimatedCounter
                                    value={metric.value}
                                    prefix={metric.prefix}
                                    suffix={metric.suffix}
                                    isVisible={isVisible}
                                />
                            </div>

                            {/* Underline */}
                            <div className="w-12 h-px bg-[var(--ac-gold)] mx-auto mb-4 transition-all duration-500 group-hover:w-20" />

                            {/* Label */}
                            <h3 className="text-sm md:text-base tracking-[0.15em] uppercase text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] font-medium mb-2">
                                {metric.label}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-[var(--ac-stone)] font-light">
                                {metric.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
