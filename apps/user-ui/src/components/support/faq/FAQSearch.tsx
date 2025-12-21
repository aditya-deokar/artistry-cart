'use client';

import { useState, useCallback, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { FAQItem, searchFAQs, faqData } from '@/data/faq-data';

interface FAQSearchProps {
    onResults: (results: FAQItem[], query: string) => void;
    className?: string;
}

export function FAQSearch({ onResults, className = '' }: FAQSearchProps) {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleSearch = useCallback(
        (value: string) => {
            setQuery(value);
            if (value.trim().length > 0) {
                const results = searchFAQs(value);
                onResults(results, value);
            } else {
                onResults(faqData, '');
            }
        },
        [onResults]
    );

    const clearSearch = useCallback(() => {
        setQuery('');
        onResults(faqData, '');
    }, [onResults]);

    return (
        <div className={`relative ${className}`}>
            <div
                className={`relative flex items-center bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] border transition-all duration-300 ${isFocused
                        ? 'border-[var(--ac-gold)] ring-1 ring-[var(--ac-gold)]'
                        : 'border-[var(--ac-linen)] dark:border-[var(--ac-slate)]'
                    }`}
            >
                <Search className="absolute left-4 w-5 h-5 text-[var(--ac-stone)]" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Search for answers..."
                    className="w-full pl-12 pr-12 py-4 bg-transparent text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] placeholder:text-[var(--ac-stone)] focus:outline-none"
                />
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-4 p-1 text-[var(--ac-stone)] hover:text-[var(--ac-charcoal)] dark:hover:text-[var(--ac-pearl)] transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Search hint */}
            {query && (
                <p className="mt-2 text-sm text-[var(--ac-stone)]">
                    {searchFAQs(query).length} results for &quot;{query}&quot;
                </p>
            )}
        </div>
    );
}
