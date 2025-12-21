'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FileText, Package, Truck, CheckCircle } from 'lucide-react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const steps = [
    {
        number: 1,
        icon: FileText,
        title: 'Initiate Return',
        description: 'Log into your account, go to Order History, and select the item you want to return.',
        time: '2 minutes',
    },
    {
        number: 2,
        icon: Package,
        title: 'Package Item',
        description: 'Securely pack the item in its original packaging or similar protective materials.',
        time: '5 minutes',
    },
    {
        number: 3,
        icon: Truck,
        title: 'Ship Back',
        description: 'Print your prepaid label and drop off at any carrier location or schedule a pickup.',
        time: 'Same day',
    },
    {
        number: 4,
        icon: CheckCircle,
        title: 'Refund Processed',
        description: 'Once we receive and inspect your return, your refund will be processed within 5-7 business days.',
        time: '5-7 days',
    },
];

interface ReturnProcessProps {
    className?: string;
}

export function ReturnProcess({ className = '' }: ReturnProcessProps) {
    const sectionRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Animate connecting line
            gsap.from('.process-line', {
                scaleY: 0,
                transformOrigin: 'top center',
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 75%',
                },
            });

            // Animate steps
            gsap.from('.process-step', {
                x: -30,
                opacity: 0,
                duration: 0.5,
                stagger: 0.15,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 75%',
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={sectionRef} className={`${className}`}>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-6">
                How to Return an Item
            </h2>
            <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mb-10">
                Follow these simple steps to return your item and receive your refund.
            </p>

            <div className="relative">
                {/* Connecting line */}
                <div className="process-line absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-[var(--ac-gold)] to-[var(--ac-gold)]/20 hidden md:block" />

                <div className="space-y-6">
                    {steps.map((step) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={step.number}
                                className="process-step relative flex gap-6 p-6 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)]"
                            >
                                {/* Step number */}
                                <div className="relative z-10 flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[var(--ac-gold)] text-[var(--ac-obsidian)] font-bold text-lg rounded-full">
                                    {step.number}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-medium text-lg text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                            {step.title}
                                        </h3>
                                        <span className="text-xs font-medium text-[var(--ac-gold)] px-2 py-1 bg-[var(--ac-gold)]/10 rounded-full">
                                            {step.time}
                                        </span>
                                    </div>
                                    <p className="text-[var(--ac-stone)]">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Icon */}
                                <div className="hidden sm:flex items-center">
                                    <Icon className="w-8 h-8 text-[var(--ac-linen)] dark:text-[var(--ac-slate)]" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
