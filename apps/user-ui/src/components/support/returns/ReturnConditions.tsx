'use client';

import { Check, X } from 'lucide-react';

const eligibleItems = [
    'Unused, unworn items in original condition',
    'Items with all original tags attached',
    'Items returned within 30 days of delivery',
    'Defective or damaged items (extended 60-day window)',
    'Incorrect items received',
    'Items significantly different from description',
];

const ineligibleItems = [
    'Custom or personalized orders',
    'Items marked "Final Sale"',
    'Intimate jewelry (earrings, body jewelry)',
    'Items without original packaging',
    'Items showing signs of wear or use',
    'Items returned after 30 days',
];

interface ReturnConditionsProps {
    className?: string;
}

export function ReturnConditions({ className = '' }: ReturnConditionsProps) {
    return (
        <div className={`${className}`}>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-6">
                Return Eligibility
            </h2>
            <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mb-8">
                Please review these conditions to ensure your item qualifies for a return.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Eligible */}
                <div className="p-6 bg-green-500/5 dark:bg-green-500/10 border border-green-500/20">
                    <h3 className="flex items-center gap-2 font-medium text-lg text-green-700 dark:text-green-400 mb-4">
                        <Check className="w-5 h-5" />
                        Eligible for Return
                    </h3>
                    <ul className="space-y-3">
                        {eligibleItems.map((item, index) => (
                            <li key={index} className="flex items-start gap-3 text-sm text-green-800 dark:text-green-300">
                                <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Ineligible */}
                <div className="p-6 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20">
                    <h3 className="flex items-center gap-2 font-medium text-lg text-red-700 dark:text-red-400 mb-4">
                        <X className="w-5 h-5" />
                        NOT Eligible for Return
                    </h3>
                    <ul className="space-y-3">
                        {ineligibleItems.map((item, index) => (
                            <li key={index} className="flex items-start gap-3 text-sm text-red-800 dark:text-red-300">
                                <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
