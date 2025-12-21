'use client';

import { FAQCategory, faqCategories } from '@/data/faq-data';

interface FAQCategoryTabsProps {
    activeCategory: FAQCategory | 'all';
    onCategoryChange: (category: FAQCategory | 'all') => void;
    className?: string;
}

export function FAQCategoryTabs({
    activeCategory,
    onCategoryChange,
    className = '',
}: FAQCategoryTabsProps) {
    return (
        <div className={`overflow-x-auto ${className}`}>
            <div className="flex gap-2 min-w-max pb-2">
                {/* All tab */}
                <button
                    onClick={() => onCategoryChange('all')}
                    className={`px-4 py-2 text-sm font-medium transition-all duration-300 whitespace-nowrap ${activeCategory === 'all'
                            ? 'bg-[var(--ac-gold)] text-[var(--ac-obsidian)]'
                            : 'bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] hover:bg-[var(--ac-gold)]/10 border border-[var(--ac-linen)] dark:border-[var(--ac-slate)]'
                        }`}
                >
                    All Questions
                </button>

                {/* Category tabs */}
                {faqCategories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => onCategoryChange(category.id)}
                        className={`px-4 py-2 text-sm font-medium transition-all duration-300 whitespace-nowrap ${activeCategory === category.id
                                ? 'bg-[var(--ac-gold)] text-[var(--ac-obsidian)]'
                                : 'bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] hover:bg-[var(--ac-gold)]/10 border border-[var(--ac-linen)] dark:border-[var(--ac-slate)]'
                            }`}
                    >
                        {category.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
