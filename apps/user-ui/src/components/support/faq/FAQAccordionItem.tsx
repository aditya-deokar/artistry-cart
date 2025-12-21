'use client';

import { useState, useCallback } from 'react';
import { ChevronDown, ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react';
import { FAQItem } from '@/data/faq-data';
import { submitFAQFeedback } from '@/actions/support.actions';
import Link from 'next/link';

interface FAQAccordionItemProps {
    item: FAQItem;
    isOpen: boolean;
    onToggle: () => void;
    highlightQuery?: string;
}

export function FAQAccordionItem({
    item,
    isOpen,
    onToggle,
    highlightQuery,
}: FAQAccordionItemProps) {
    const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Highlight search query in text
    const highlightText = useCallback((text: string, query: string) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <mark key={i} className="bg-[var(--ac-gold)]/30 text-inherit px-0.5">
                    {part}
                </mark>
            ) : (
                part
            )
        );
    }, []);

    const handleFeedback = async (helpful: boolean) => {
        if (feedbackGiven || isSubmitting) return;
        setIsSubmitting(true);
        await submitFAQFeedback({ faqId: item.id, helpful });
        setFeedbackGiven(helpful ? 'yes' : 'no');
        setIsSubmitting(false);
    };

    // Parse answer for markdown-like formatting
    const formatAnswer = (answer: string) => {
        // Split by newlines and process each line
        return answer.split('\n').map((line, index) => {
            // Check for bullet points
            if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                return (
                    <li key={index} className="ml-4 list-disc">
                        {line.replace(/^[•-]\s*/, '')}
                    </li>
                );
            }
            // Check for numbered list
            if (/^\d+\./.test(line.trim())) {
                return (
                    <li key={index} className="ml-4 list-decimal">
                        {line.replace(/^\d+\.\s*/, '')}
                    </li>
                );
            }
            // Check for bold text (markdown style)
            const boldProcessed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // Empty lines become breaks
            if (!line.trim()) {
                return <br key={index} />;
            }
            return (
                <p key={index} dangerouslySetInnerHTML={{ __html: boldProcessed }} />
            );
        });
    };

    return (
        <div
            id={item.id}
            className={`border transition-colors duration-300 ${isOpen
                    ? 'border-[var(--ac-gold)]/30 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]'
                    : 'border-[var(--ac-linen)] dark:border-[var(--ac-slate)] bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]'
                }`}
        >
            {/* Question header */}
            <button
                onClick={onToggle}
                className="w-full flex items-start justify-between gap-4 p-5 text-left"
            >
                <span className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                    {highlightQuery ? highlightText(item.question, highlightQuery) : item.question}
                </span>
                <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 text-[var(--ac-stone)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </button>

            {/* Answer content */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="px-5 pb-5 border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                    <div className="pt-4 text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] space-y-2 leading-relaxed">
                        {formatAnswer(item.answer)}
                    </div>

                    {/* Action links */}
                    {item.category === 'orders' && (
                        <Link
                            href="/account/orders"
                            className="inline-flex items-center gap-1.5 mt-4 text-sm text-[var(--ac-gold)] hover:text-[var(--ac-gold-light)] transition-colors"
                        >
                            Track My Order
                            <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                    )}

                    {/* Feedback section */}
                    <div className="flex items-center gap-4 mt-5 pt-4 border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                        <span className="text-sm text-[var(--ac-stone)]">Was this helpful?</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleFeedback(true)}
                                disabled={feedbackGiven !== null}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-all ${feedbackGiven === 'yes'
                                        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                        : feedbackGiven
                                            ? 'opacity-50 cursor-not-allowed text-[var(--ac-stone)]'
                                            : 'text-[var(--ac-stone)] hover:bg-[var(--ac-gold)]/10 hover:text-[var(--ac-gold)]'
                                    }`}
                            >
                                <ThumbsUp className="w-4 h-4" />
                                Yes
                            </button>
                            <button
                                onClick={() => handleFeedback(false)}
                                disabled={feedbackGiven !== null}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-all ${feedbackGiven === 'no'
                                        ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                        : feedbackGiven
                                            ? 'opacity-50 cursor-not-allowed text-[var(--ac-stone)]'
                                            : 'text-[var(--ac-stone)] hover:bg-[var(--ac-gold)]/10 hover:text-[var(--ac-gold)]'
                                    }`}
                            >
                                <ThumbsDown className="w-4 h-4" />
                                No
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
