'use client';

import { getPopularFAQs } from '@/data/faq-data';
import { Sparkles } from 'lucide-react';

interface PopularTopicsProps {
    onTopicClick: (faqId: string) => void;
    className?: string;
}

export function PopularTopics({ onTopicClick, className = '' }: PopularTopicsProps) {
    const popularFaqs = getPopularFAQs();

    return (
        <div className={`${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-[var(--ac-gold)]" />
                <span className="text-sm font-medium text-[var(--ac-stone)] tracking-wide uppercase">
                    Popular Topics
                </span>
            </div>

            <div className="flex flex-wrap gap-2">
                {popularFaqs.map((faq) => (
                    <button
                        key={faq.id}
                        onClick={() => onTopicClick(faq.id)}
                        className="px-4 py-2 text-sm bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] hover:border-[var(--ac-gold)]/50 hover:text-[var(--ac-gold)] transition-colors"
                    >
                        {faq.question.length > 40 ? faq.question.slice(0, 40) + '...' : faq.question}
                    </button>
                ))}
            </div>
        </div>
    );
}
