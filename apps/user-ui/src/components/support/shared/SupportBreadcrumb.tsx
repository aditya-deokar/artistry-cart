'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface SupportBreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function SupportBreadcrumb({ items, className = '' }: SupportBreadcrumbProps) {
    return (
        <nav
            aria-label="Breadcrumb"
            className={`py-4 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] border-b border-[var(--ac-linen)] dark:border-[var(--ac-slate)] ${className}`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <ol className="flex items-center gap-2 text-sm">
                    {/* Home link */}
                    <li>
                        <Link
                            href="/"
                            className="flex items-center text-[var(--ac-stone)] hover:text-[var(--ac-charcoal)] dark:hover:text-[var(--ac-pearl)] transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            <span className="sr-only">Home</span>
                        </Link>
                    </li>

                    <ChevronRight className="w-4 h-4 text-[var(--ac-stone)]/50" />

                    {/* Support root */}
                    <li>
                        <Link
                            href="/support"
                            className="text-[var(--ac-stone)] hover:text-[var(--ac-charcoal)] dark:hover:text-[var(--ac-pearl)] transition-colors"
                        >
                            Support
                        </Link>
                    </li>

                    {/* Dynamic items */}
                    {items.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-[var(--ac-stone)]/50" />
                            {item.href ? (
                                <Link
                                    href={item.href}
                                    className="text-[var(--ac-stone)] hover:text-[var(--ac-charcoal)] dark:hover:text-[var(--ac-pearl)] transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] font-medium">
                                    {item.label}
                                </span>
                            )}
                        </li>
                    ))}
                </ol>
            </div>
        </nav>
    );
}
