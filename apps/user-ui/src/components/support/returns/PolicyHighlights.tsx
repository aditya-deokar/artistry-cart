'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, Truck, DollarSign, Smile } from 'lucide-react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const highlights = [
    {
        icon: Calendar,
        title: '30 Days',
        subtitle: 'Return Window',
        description: 'Plenty of time to decide',
    },
    {
        icon: Truck,
        title: 'Free',
        subtitle: 'Return Shipping',
        description: 'On defective items',
    },
    {
        icon: DollarSign,
        title: 'Full',
        subtitle: 'Refund',
        description: 'Original payment method',
    },
    {
        icon: Smile,
        title: 'Easy',
        subtitle: 'Process',
        description: 'Online in minutes',
    },
];

interface PolicyHighlightsProps {
    className?: string;
}

export function PolicyHighlights({ className = '' }: PolicyHighlightsProps) {
    const sectionRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.highlight-card', {
                y: 30,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={sectionRef} className={`${className}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {highlights.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={item.title}
                            className="highlight-card text-center p-6 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)]"
                        >
                            <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-[var(--ac-gold)]/10 rounded-full">
                                <Icon className="w-6 h-6 text-[var(--ac-gold)]" />
                            </div>
                            <h3 className="text-2xl font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                {item.title}
                            </h3>
                            <p className="text-sm font-medium text-[var(--ac-gold)] mb-1">
                                {item.subtitle}
                            </p>
                            <p className="text-xs text-[var(--ac-stone)]">
                                {item.description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
