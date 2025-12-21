'use client';

import { X } from 'lucide-react';

interface FilterChip {
    key: string;
    label: string;
    value: string;
}

interface ActiveFilterChipsProps {
    filters: FilterChip[];
    onRemove: (key: string) => void;
    onClearAll: () => void;
}

export function ActiveFilterChips({
    filters,
    onRemove,
    onClearAll,
}: ActiveFilterChipsProps) {
    if (filters.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 py-3">
            <span className="text-xs text-[var(--ac-stone)] mr-1">
                Active filters:
            </span>
            {filters.map((filter) => (
                <button
                    key={filter.key}
                    onClick={() => onRemove(filter.key)}
                    className="group flex items-center gap-1.5 px-3 py-1.5 bg-[var(--ac-gold)]/10 border border-[var(--ac-gold)]/20 text-[var(--ac-gold)] hover:bg-[var(--ac-gold)]/20 transition-colors"
                >
                    <span className="text-xs">
                        {filter.label}: {filter.value}
                    </span>
                    <X className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                </button>
            ))}
            {filters.length > 1 && (
                <button
                    onClick={onClearAll}
                    className="text-xs text-[var(--ac-stone)] hover:text-[var(--ac-charcoal)] dark:hover:text-[var(--ac-pearl)] underline underline-offset-2 transition-colors"
                >
                    Clear all
                </button>
            )}
        </div>
    );
}
