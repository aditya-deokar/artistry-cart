'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Truck, Zap, Clock } from 'lucide-react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface ShippingOption {
    method: string;
    timeframe: string;
    cost: string;
    freeThreshold?: string;
    features: string[];
    icon: React.ReactNode;
    highlight?: boolean;
}

const domesticOptions: ShippingOption[] = [
    {
        method: 'Standard Shipping',
        timeframe: '5-7 business days',
        cost: '$7.99',
        freeThreshold: 'Free over $99',
        features: ['Full tracking', 'Signature on request', 'Eco-friendly packaging'],
        icon: <Truck className="w-6 h-6" />,
    },
    {
        method: 'Express Shipping',
        timeframe: '2-3 business days',
        cost: '$14.99',
        features: ['Priority handling', 'Full tracking', 'Insurance included'],
        icon: <Zap className="w-6 h-6" />,
        highlight: true,
    },
    {
        method: 'Priority Shipping',
        timeframe: '1-2 business days',
        cost: '$24.99',
        features: ['SMS updates', 'Signature required', 'Full insurance', 'Priority support'],
        icon: <Clock className="w-6 h-6" />,
    },
];

interface ShippingTableProps {
    className?: string;
}

export function ShippingTable({ className = '' }: ShippingTableProps) {
    const tableRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.shipping-card', {
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: tableRef.current,
                    start: 'top 80%',
                },
            });
        }, tableRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={tableRef} className={`${className}`}>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-6">
                Domestic Shipping Options
            </h2>
            <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mb-8">
                All orders are shipped within 1-3 business days. Handcrafted items may require additional preparation time.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
                {domesticOptions.map((option, index) => (
                    <div
                        key={option.method}
                        className={`shipping-card relative p-6 border transition-all duration-300 hover:shadow-lg ${option.highlight
                                ? 'bg-[var(--ac-gold)]/5 border-[var(--ac-gold)]/30 dark:bg-[var(--ac-gold)]/10'
                                : 'bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border-[var(--ac-linen)] dark:border-[var(--ac-slate)]'
                            }`}
                    >
                        {option.highlight && (
                            <div className="absolute -top-3 left-4 px-3 py-1 bg-[var(--ac-gold)] text-[var(--ac-obsidian)] text-xs font-medium tracking-wide uppercase">
                                Most Popular
                            </div>
                        )}

                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${option.highlight
                                ? 'bg-[var(--ac-gold)]/20 text-[var(--ac-gold)]'
                                : 'bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]'
                            }`}>
                            {option.icon}
                        </div>

                        <h3 className="text-lg font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-1">
                            {option.method}
                        </h3>
                        <p className="text-sm text-[var(--ac-stone)] mb-3">
                            {option.timeframe}
                        </p>

                        <div className="mb-4">
                            <span className="text-2xl font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                {option.cost}
                            </span>
                            {option.freeThreshold && (
                                <span className="ml-2 text-sm text-[var(--ac-gold)]">
                                    {option.freeThreshold}
                                </span>
                            )}
                        </div>

                        <ul className="space-y-2">
                            {option.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
                                    <Check className="w-4 h-4 text-green-500" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
