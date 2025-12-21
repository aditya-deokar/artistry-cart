'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Globe, AlertCircle } from 'lucide-react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const internationalRegions = [
    {
        region: 'Canada',
        timeframe: '7-10 business days',
        cost: 'From $14.99',
        notes: 'Duties and taxes may apply at delivery',
    },
    {
        region: 'Europe',
        timeframe: '10-15 business days',
        cost: 'From $24.99',
        notes: 'VAT included for EU countries where possible',
    },
    {
        region: 'Asia Pacific',
        timeframe: '14-21 business days',
        cost: 'From $29.99',
        notes: 'Customs fees vary by country',
    },
    {
        region: 'Rest of World',
        timeframe: '15-25 business days',
        cost: 'From $34.99',
        notes: 'Contact us for remote area availability',
    },
];

interface InternationalInfoProps {
    className?: string;
}

export function InternationalInfo({ className = '' }: InternationalInfoProps) {
    const sectionRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.intl-card', {
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.08,
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
            <div className="flex items-center gap-3 mb-6">
                <Globe className="w-6 h-6 text-[var(--ac-gold)]" />
                <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                    International Shipping
                </h2>
            </div>
            <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mb-8">
                We ship handcrafted treasures to over 120 countries worldwide. International orders may be subject to local customs duties and taxes.
            </p>

            {/* Region Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {internationalRegions.map((region) => (
                    <div
                        key={region.region}
                        className="intl-card p-5 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] hover:border-[var(--ac-gold)]/30 transition-colors"
                    >
                        <h3 className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
                            {region.region}
                        </h3>
                        <p className="text-sm text-[var(--ac-stone)] mb-1">
                            {region.timeframe}
                        </p>
                        <p className="text-lg font-medium text-[var(--ac-gold)] mb-3">
                            {region.cost}
                        </p>
                        <p className="text-xs text-[var(--ac-stone)]">
                            {region.notes}
                        </p>
                    </div>
                ))}
            </div>

            {/* Customs Notice */}
            <div className="intl-card flex gap-4 p-5 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-1">
                        Customs & Import Duties
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400/80">
                        International orders may be subject to customs duties, taxes, and fees imposed by the destination country.
                        These charges are the responsibility of the recipient and are not included in our shipping costs.
                        We recommend checking with your local customs office for more information.
                    </p>
                </div>
            </div>
        </div>
    );
}
