'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HelpCircle, Truck, RotateCcw, Mail, LucideIcon } from 'lucide-react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Icon map to resolve string to component
const iconMap: Record<string, LucideIcon> = {
    'help-circle': HelpCircle,
    'truck': Truck,
    'rotate-ccw': RotateCcw,
    'mail': Mail,
};

interface SupportHeroProps {
    iconName: 'help-circle' | 'truck' | 'rotate-ccw' | 'mail';
    title: string;
    subtitle: string;
    children?: React.ReactNode; // For search input or other elements
}

export function SupportHero({ iconName, title, subtitle, children }: SupportHeroProps) {
    const heroRef = useRef<HTMLElement>(null);
    const Icon = iconMap[iconName] || HelpCircle;

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Staggered entrance animation
            gsap.from('.hero-element', {
                y: 40,
                opacity: 0,
                duration: 0.7,
                stagger: 0.12,
                ease: 'power3.out',
            });
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={heroRef}
            className="relative py-20 md:py-28 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]"
        >
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-1/4 w-64 h-64 bg-[var(--ac-gold)]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-[var(--ac-gold)]/3 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
                {/* Icon */}
                <div className="hero-element inline-flex items-center justify-center w-16 h-16 mb-6 bg-[var(--ac-gold)]/10 dark:bg-[var(--ac-gold)]/15 rounded-full">
                    <Icon className="w-8 h-8 text-[var(--ac-gold)]" />
                </div>

                {/* Title */}
                <h1 className="hero-element font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-4">
                    {title}
                </h1>

                {/* Subtitle */}
                <p className="hero-element text-lg md:text-xl text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] max-w-2xl mx-auto mb-8">
                    {subtitle}
                </p>

                {/* Optional children (search input, etc.) */}
                {children && (
                    <div className="hero-element max-w-xl mx-auto">
                        {children}
                    </div>
                )}
            </div>
        </section>
    );
}

