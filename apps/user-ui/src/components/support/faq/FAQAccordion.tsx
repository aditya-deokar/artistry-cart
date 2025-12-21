'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FAQItem } from '@/data/faq-data';
import { FAQAccordionItem } from './FAQAccordionItem';
import { FileQuestion } from 'lucide-react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface FAQAccordionProps {
    items: FAQItem[];
    searchQuery?: string;
    className?: string;
}

export function FAQAccordion({ items, searchQuery, className = '' }: FAQAccordionProps) {
    const [openId, setOpenId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Handle hash navigation
    useEffect(() => {
        const hash = window.location.hash.slice(1);
        if (hash && items.find((item) => item.id === hash)) {
            setOpenId(hash);
            // Scroll to the item
            setTimeout(() => {
                const element = document.getElementById(hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    }, [items]);

    // Entrance animation
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.faq-item', {
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.05,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 85%',
                },
            });
        }, containerRef);

        return () => ctx.revert();
    }, [items]);

    const handleToggle = (id: string) => {
        setOpenId((prev) => (prev === id ? null : id));
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileQuestion className="w-16 h-16 text-[var(--ac-stone)]/50 mb-4" />
                <h3 className="text-xl font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
                    No Results Found
                </h3>
                <p className="text-[var(--ac-stone)] max-w-md">
                    We couldn&apos;t find any questions matching your search. Try different keywords or{' '}
                    <a href="/support/contact" className="text-[var(--ac-gold)] hover:underline">
                        contact support
                    </a>
                    .
                </p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className={`space-y-3 ${className}`}>
            {items.map((item) => (
                <div key={item.id} className="faq-item">
                    <FAQAccordionItem
                        item={item}
                        isOpen={openId === item.id}
                        onToggle={() => handleToggle(item.id)}
                        highlightQuery={searchQuery}
                    />
                </div>
            ))}
        </div>
    );
}
