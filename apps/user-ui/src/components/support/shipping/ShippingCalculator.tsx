'use client';

import { useState } from 'react';
import { Calculator, Loader2, MapPin, Check } from 'lucide-react';
import { calculateShipping, ShippingEstimate } from '@/actions/support.actions';

const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'AU', name: 'Australia' },
    { code: 'JP', name: 'Japan' },
    { code: 'OTHER', name: 'Other Country' },
];

interface ShippingCalculatorProps {
    className?: string;
}

export function ShippingCalculator({ className = '' }: ShippingCalculatorProps) {
    const [country, setCountry] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [estimate, setEstimate] = useState<ShippingEstimate | null>(null);

    const handleCalculate = async () => {
        if (!country) return;

        setIsLoading(true);
        setEstimate(null);

        const result = await calculateShipping({ country, postalCode });
        setEstimate(result);
        setIsLoading(false);
    };

    const handleReset = () => {
        setCountry('');
        setPostalCode('');
        setEstimate(null);
    };

    return (
        <div className={`${className}`}>
            <div className="flex items-center gap-3 mb-6">
                <Calculator className="w-6 h-6 text-[var(--ac-gold)]" />
                <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                    Shipping Calculator
                </h2>
            </div>
            <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mb-6">
                Get an estimate for shipping costs to your location.
            </p>

            <div className="p-6 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                {!estimate ? (
                    <>
                        <div className="grid sm:grid-cols-2 gap-4 mb-6">
                            {/* Country Select */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
                                    Country
                                </label>
                                <select
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    className="w-full px-4 py-3 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] focus:outline-none focus:border-[var(--ac-gold)] transition-colors"
                                >
                                    <option value="">Select a country</option>
                                    {countries.map((c) => (
                                        <option key={c.code} value={c.name}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Postal Code */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
                                    Postal/ZIP Code (optional)
                                </label>
                                <input
                                    type="text"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    placeholder="e.g., 10001"
                                    className="w-full px-4 py-3 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] placeholder:text-[var(--ac-stone)] focus:outline-none focus:border-[var(--ac-gold)] transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleCalculate}
                            disabled={!country || isLoading}
                            className="w-full sm:w-auto px-8 py-3 bg-[var(--ac-gold)] hover:bg-[var(--ac-gold-light)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--ac-obsidian)] text-sm font-medium tracking-wider uppercase transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Calculating...
                                </>
                            ) : (
                                'Calculate Shipping'
                            )}
                        </button>
                    </>
                ) : (
                    <>
                        {/* Results */}
                        <div className="flex items-center gap-2 mb-6">
                            <MapPin className="w-5 h-5 text-[var(--ac-gold)]" />
                            <span className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                Shipping to {country}
                            </span>
                        </div>

                        {estimate.success && estimate.options ? (
                            <div className="space-y-3 mb-6">
                                {estimate.options.map((option, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)]"
                                    >
                                        <div>
                                            <h4 className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                                {option.method}
                                            </h4>
                                            <p className="text-sm text-[var(--ac-stone)]">
                                                {option.timeframe}
                                            </p>
                                            {option.features && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {option.features.map((feature, i) => (
                                                        <span
                                                            key={i}
                                                            className="inline-flex items-center gap-1 text-xs text-[var(--ac-stone)]"
                                                        >
                                                            <Check className="w-3 h-3 text-green-500" />
                                                            {feature}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-lg font-medium text-[var(--ac-gold)]">
                                            {option.cost}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[var(--ac-stone)] mb-6">{estimate.message}</p>
                        )}

                        <button
                            onClick={handleReset}
                            className="text-sm text-[var(--ac-gold)] hover:text-[var(--ac-gold-light)] transition-colors"
                        >
                            ← Calculate for another location
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
