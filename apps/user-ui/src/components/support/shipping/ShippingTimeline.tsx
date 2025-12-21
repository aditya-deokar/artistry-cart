'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Package, Settings, Truck, MapPin, CheckCircle } from 'lucide-react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const timelineSteps = [
    {
        icon: Package,
        title: 'Order Placed',
        description: 'Your order is confirmed and payment processed',
        time: 'Instant',
    },
    {
        icon: Settings,
        title: 'Processing',
        description: 'Artisan prepares your handcrafted items with care',
        time: '1-3 days',
    },
    {
        icon: Truck,
        title: 'Shipped',
        description: 'Your package is on its way with tracking',
        time: 'Day of ship',
    },
    {
        icon: MapPin,
        title: 'In Transit',
        description: 'Track your package as it travels to you',
        time: 'Varies',
    },
    {
        icon: CheckCircle,
        title: 'Delivered',
        description: 'Your handcrafted treasure arrives',
        time: 'Arrival',
    },
];

interface ShippingTimelineProps {
    className?: string;
}

export function ShippingTimeline({ className = '' }: ShippingTimelineProps) {
    const timelineRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Animate the connecting line
            gsap.from('.timeline-line', {
                scaleX: 0,
                transformOrigin: 'left center',
                duration: 1.5,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: timelineRef.current,
                    start: 'top 75%',
                },
            });

            // Animate each step
            gsap.from('.timeline-step', {
                y: 30,
                opacity: 0,
                duration: 0.5,
                stagger: 0.15,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: timelineRef.current,
                    start: 'top 75%',
                },
            });
        }, timelineRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={timelineRef} className={`${className}`}>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-6">
                Shipping Timeline
            </h2>
            <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mb-10">
                From order to doorstep, here&apos;s how your package travels to you.
            </p>

            {/* Desktop Timeline */}
            <div className="hidden md:block relative">
                {/* Connecting line */}
                <div className="timeline-line absolute top-10 left-10 right-10 h-0.5 bg-gradient-to-r from-[var(--ac-gold)]/20 via-[var(--ac-gold)] to-[var(--ac-gold)]/20" />

                <div className="grid grid-cols-5 gap-4">
                    {timelineSteps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div key={step.title} className="timeline-step relative flex flex-col items-center text-center">
                                {/* Icon circle */}
                                <div className="relative z-10 w-20 h-20 flex items-center justify-center bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border-2 border-[var(--ac-gold)] rounded-full mb-4">
                                    <Icon className="w-8 h-8 text-[var(--ac-gold)]" />
                                </div>

                                {/* Step number */}
                                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-2 w-6 h-6 flex items-center justify-center bg-[var(--ac-gold)] text-[var(--ac-obsidian)] text-xs font-bold rounded-full">
                                    {index + 1}
                                </div>

                                {/* Content */}
                                <h3 className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-1">
                                    {step.title}
                                </h3>
                                <p className="text-xs text-[var(--ac-stone)] mb-2 line-clamp-2">
                                    {step.description}
                                </p>
                                <span className="text-xs font-medium text-[var(--ac-gold)]">
                                    {step.time}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobile Timeline */}
            <div className="md:hidden space-y-6">
                {timelineSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                        <div key={step.title} className="timeline-step flex gap-4">
                            {/* Icon and line */}
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 flex items-center justify-center bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border-2 border-[var(--ac-gold)] rounded-full">
                                    <Icon className="w-5 h-5 text-[var(--ac-gold)]" />
                                </div>
                                {index < timelineSteps.length - 1 && (
                                    <div className="flex-1 w-0.5 bg-[var(--ac-gold)]/30 my-2" />
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 pb-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                        {step.title}
                                    </h3>
                                    <span className="text-xs font-medium text-[var(--ac-gold)]">
                                        {step.time}
                                    </span>
                                </div>
                                <p className="text-sm text-[var(--ac-stone)]">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
