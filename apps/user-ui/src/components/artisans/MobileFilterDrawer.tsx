'use client';

import { useState, useEffect } from 'react';
import { X, SlidersHorizontal, Check } from 'lucide-react';
import {
    categoryOptions,
    locationOptions,
    ratingOptions,
    sortOptions,
} from './ArtisanFilters';

interface MobileFilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    filters: {
        category: string;
        location: string;
        rating: string;
        sortBy: string;
    };
    onFilterChange: (key: string, value: string) => void;
    onApply: () => void;
    onClear: () => void;
    totalResults: number;
}

export function MobileFilterDrawer({
    isOpen,
    onClose,
    filters,
    onFilterChange,
    onApply,
    onClear,
    totalResults,
}: MobileFilterDrawerProps) {
    const [localFilters, setLocalFilters] = useState(filters);
    const [activeSection, setActiveSection] = useState<string | null>('category');

    // Sync local filters when drawer opens
    useEffect(() => {
        if (isOpen) {
            setLocalFilters(filters);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, filters]);

    const handleLocalChange = (key: string, value: string) => {
        setLocalFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleApply = () => {
        Object.entries(localFilters).forEach(([key, value]) => {
            onFilterChange(key, value);
        });
        onApply();
        onClose();
    };

    const handleClear = () => {
        const clearedFilters = {
            category: 'all',
            location: 'all',
            rating: 'all',
            sortBy: 'featured',
        };
        setLocalFilters(clearedFilters);
        Object.entries(clearedFilters).forEach(([key, value]) => {
            onFilterChange(key, value);
        });
        onClear();
    };

    // Count active filters
    const activeCount = Object.entries(localFilters).filter(
        ([key, value]) => value !== 'all' && value !== 'featured'
    ).length;

    if (!isOpen) return null;

    const filterSections = [
        { key: 'category', label: 'Category', options: categoryOptions },
        { key: 'location', label: 'Location', options: locationOptions },
        { key: 'rating', label: 'Rating', options: ratingOptions },
        { key: 'sortBy', label: 'Sort By', options: sortOptions },
    ];

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[var(--ac-charcoal)]/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] rounded-t-2xl overflow-hidden flex flex-col animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5 text-[var(--ac-gold)]" />
                        <h2 className="font-[family-name:var(--font-cormorant)] text-xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                            Filters
                        </h2>
                        {activeCount > 0 && (
                            <span className="px-2 py-0.5 bg-[var(--ac-gold)] text-[var(--ac-obsidian)] text-xs font-medium">
                                {activeCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-[var(--ac-stone)] hover:text-[var(--ac-charcoal)] dark:hover:text-[var(--ac-pearl)] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Filter Sections */}
                    {filterSections.map((section) => (
                        <div
                            key={section.key}
                            className="border-b border-[var(--ac-linen)] dark:border-[var(--ac-slate)]"
                        >
                            {/* Section Header */}
                            <button
                                onClick={() =>
                                    setActiveSection(
                                        activeSection === section.key ? null : section.key
                                    )
                                }
                                className="w-full flex items-center justify-between p-4"
                            >
                                <span className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                    {section.label}
                                </span>
                                <span className="text-sm text-[var(--ac-gold)]">
                                    {section.options.find(
                                        (o) =>
                                            o.value ===
                                            localFilters[section.key as keyof typeof localFilters]
                                    )?.label || 'All'}
                                </span>
                            </button>

                            {/* Options */}
                            {activeSection === section.key && (
                                <div className="px-4 pb-4 space-y-1">
                                    {section.options.map((option) => {
                                        const isSelected =
                                            localFilters[section.key as keyof typeof localFilters] ===
                                            option.value;

                                        return (
                                            <button
                                                key={option.value}
                                                onClick={() =>
                                                    handleLocalChange(section.key, option.value)
                                                }
                                                className={`w-full flex items-center justify-between p-3 transition-colors ${isSelected
                                                        ? 'bg-[var(--ac-gold)]/10 border border-[var(--ac-gold)]/20'
                                                        : 'bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-transparent'
                                                    }`}
                                            >
                                                <span
                                                    className={`text-sm ${isSelected
                                                            ? 'text-[var(--ac-gold)]'
                                                            : 'text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]'
                                                        }`}
                                                >
                                                    {option.label}
                                                </span>
                                                {isSelected && (
                                                    <Check className="w-4 h-4 text-[var(--ac-gold)]" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)] safe-area-bottom">
                    <div className="flex gap-3">
                        <button
                            onClick={handleClear}
                            className="flex-1 py-3 border border-[var(--ac-charcoal)] dark:border-[var(--ac-pearl)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] text-sm tracking-wider uppercase font-medium hover:bg-[var(--ac-charcoal)]/5 dark:hover:bg-[var(--ac-pearl)]/5 transition-colors"
                        >
                            Clear Filters
                        </button>
                        <button
                            onClick={handleApply}
                            className="flex-1 py-3 bg-[var(--ac-gold)] hover:bg-[var(--ac-gold-light)] text-[var(--ac-obsidian)] text-sm tracking-wider uppercase font-medium transition-colors"
                        >
                            Show {totalResults} Results
                        </button>
                    </div>
                </div>
            </div>

            {/* Animation Styles */}
            <style jsx>{`
                @keyframes slide-up {
                    from {
                        transform: translateY(100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
                .safe-area-bottom {
                    padding-bottom: max(1rem, env(safe-area-inset-bottom));
                }
            `}</style>
        </div>
    );
}
