'use client';

import { useState, useCallback } from 'react';
import {
    SupportHero,
    SupportBreadcrumb,
    NeedHelpCTA,
    QuickLinks,
    FAQSearch,
    FAQCategoryTabs,
    FAQAccordion,
    PopularTopics,
} from '@/components/support';
import { faqData, FAQItem, FAQCategory, getFAQsByCategory } from '@/data/faq-data';

export function FAQPageClient() {
    const [filteredItems, setFilteredItems] = useState<FAQItem[]>(faqData);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<FAQCategory | 'all'>('all');

    // Handle search results
    const handleSearchResults = useCallback((results: FAQItem[], query: string) => {
        setSearchQuery(query);
        if (query) {
            setFilteredItems(results);
            setActiveCategory('all'); // Reset category when searching
        } else {
            // Restore category filter if no search query
            if (activeCategory === 'all') {
                setFilteredItems(faqData);
            } else {
                setFilteredItems(getFAQsByCategory(activeCategory));
            }
        }
    }, [activeCategory]);

    // Handle category change
    const handleCategoryChange = useCallback((category: FAQCategory | 'all') => {
        setActiveCategory(category);
        setSearchQuery(''); // Clear search when changing category
        if (category === 'all') {
            setFilteredItems(faqData);
        } else {
            setFilteredItems(getFAQsByCategory(category));
        }
    }, []);

    // Handle popular topic click
    const handleTopicClick = useCallback((faqId: string) => {
        // Scroll to the FAQ and open it
        const element = document.getElementById(faqId);
        if (element) {
            // First scroll to the element
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Click on it to expand
            setTimeout(() => {
                const button = element.querySelector('button');
                if (button) {
                    button.click();
                }
            }, 300);
        }
    }, []);

    return (
        <>
            {/* Breadcrumb */}
            <SupportBreadcrumb items={[{ label: 'FAQ' }]} />

            {/* Hero */}
            <SupportHero
                iconName="help-circle"
                title="Frequently Asked Questions"
                subtitle="Find quick answers to common questions about orders, shipping, returns, and more."
            >
                <FAQSearch onResults={handleSearchResults} />
            </SupportHero>

            {/* Popular Topics */}
            <section className="py-8 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] border-b border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">
                    <PopularTopics onTopicClick={handleTopicClick} />
                </div>
            </section>

            {/* Category Tabs & Accordion */}
            <section className="py-12 md:py-16 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">
                    {/* Category Tabs */}
                    {!searchQuery && (
                        <FAQCategoryTabs
                            activeCategory={activeCategory}
                            onCategoryChange={handleCategoryChange}
                            className="mb-8"
                        />
                    )}

                    {/* Results count */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-sm text-[var(--ac-stone)]">
                            {searchQuery ? (
                                <>
                                    Showing {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
                                </>
                            ) : (
                                <>
                                    {filteredItems.length} question{filteredItems.length !== 1 ? 's' : ''} in{' '}
                                    {activeCategory === 'all' ? 'all categories' : activeCategory}
                                </>
                            )}
                        </p>
                    </div>

                    {/* FAQ Accordion */}
                    <FAQAccordion
                        items={filteredItems}
                        searchQuery={searchQuery}
                    />
                </div>
            </section>

            {/* Quick Links to other support pages */}
            <QuickLinks currentPage="faq" />

            {/* Need Help CTA */}
            <NeedHelpCTA showFAQ={false} />
        </>
    );
}
