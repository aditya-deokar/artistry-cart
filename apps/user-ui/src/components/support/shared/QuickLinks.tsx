'use client';

import Link from 'next/link';
import { HelpCircle, Truck, RotateCcw, Mail, ArrowRight } from 'lucide-react';

interface QuickLinksProps {
    currentPage?: 'faq' | 'shipping' | 'returns' | 'contact';
    className?: string;
}

const supportLinks = [
    {
        id: 'faq',
        label: 'FAQ',
        description: 'Common questions',
        icon: HelpCircle,
        href: '/support/faq',
    },
    {
        id: 'shipping',
        label: 'Shipping',
        description: 'Delivery info',
        icon: Truck,
        href: '/support/shipping',
    },
    {
        id: 'returns',
        label: 'Returns',
        description: 'Return policy',
        icon: RotateCcw,
        href: '/support/returns',
    },
    {
        id: 'contact',
        label: 'Contact',
        description: 'Get in touch',
        icon: Mail,
        href: '/support/contact',
    },
];

export function QuickLinks({ currentPage, className = '' }: QuickLinksProps) {
    const filteredLinks = currentPage
        ? supportLinks.filter((link) => link.id !== currentPage)
        : supportLinks;

    return (
        <div className={`py-12 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] ${className}`}>
            <div className="max-w-5xl mx-auto px-6 lg:px-8">
                <h3 className="text-center text-sm tracking-[0.2em] uppercase text-[var(--ac-stone)] mb-6">
                    Quick Links
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {filteredLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.id}
                                href={link.href}
                                className="group flex flex-col items-center p-4 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] hover:border-[var(--ac-gold)]/30 hover:bg-[var(--ac-gold)]/5 transition-all duration-300"
                            >
                                <Icon className="w-6 h-6 text-[var(--ac-gold)] mb-2" />
                                <span className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] group-hover:text-[var(--ac-gold)] transition-colors">
                                    {link.label}
                                </span>
                                <span className="text-xs text-[var(--ac-stone)]">
                                    {link.description}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
