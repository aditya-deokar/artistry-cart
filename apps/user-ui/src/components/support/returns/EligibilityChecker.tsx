'use client';

import { useState } from 'react';
import { Search, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { checkReturnEligibility, EligibilityResult } from '@/actions/support.actions';

interface EligibilityCheckerProps {
    className?: string;
}

export function EligibilityChecker({ className = '' }: EligibilityCheckerProps) {
    const [orderNumber, setOrderNumber] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<EligibilityResult | null>(null);
    const [error, setError] = useState('');

    const handleCheck = async () => {
        if (!orderNumber || !email) {
            setError('Please enter both order number and email');
            return;
        }

        setError('');
        setIsLoading(true);
        setResult(null);

        const eligibility = await checkReturnEligibility({ orderNumber, email });
        setResult(eligibility);
        setIsLoading(false);
    };

    const handleReset = () => {
        setOrderNumber('');
        setEmail('');
        setResult(null);
        setError('');
    };

    return (
        <div className={`${className}`}>
            <div className="flex items-center gap-3 mb-6">
                <Search className="w-6 h-6 text-[var(--ac-gold)]" />
                <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                    Check Return Eligibility
                </h2>
            </div>
            <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mb-6">
                Enter your order details to check if your items qualify for a return.
            </p>

            <div className="p-6 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                {!result ? (
                    <>
                        <div className="grid sm:grid-cols-2 gap-4 mb-6">
                            {/* Order Number */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
                                    Order Number
                                </label>
                                <input
                                    type="text"
                                    value={orderNumber}
                                    onChange={(e) => setOrderNumber(e.target.value)}
                                    placeholder="e.g., AC-12345"
                                    className="w-full px-4 py-3 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] placeholder:text-[var(--ac-stone)] focus:outline-none focus:border-[var(--ac-gold)] transition-colors"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full px-4 py-3 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] placeholder:text-[var(--ac-stone)] focus:outline-none focus:border-[var(--ac-gold)] transition-colors"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-red-500 mb-4">{error}</p>
                        )}

                        <button
                            onClick={handleCheck}
                            disabled={isLoading}
                            className="w-full sm:w-auto px-8 py-3 bg-[var(--ac-gold)] hover:bg-[var(--ac-gold-light)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--ac-obsidian)] text-sm font-medium tracking-wider uppercase transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Checking...
                                </>
                            ) : (
                                'Check Eligibility'
                            )}
                        </button>
                    </>
                ) : (
                    <>
                        {/* Results */}
                        <div className={`flex items-start gap-4 p-4 mb-6 ${result.eligible
                                ? 'bg-green-500/10 border border-green-500/20'
                                : 'bg-amber-500/10 border border-amber-500/20'
                            }`}>
                            {result.eligible ? (
                                <Check className="w-6 h-6 text-green-500 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                            )}
                            <div>
                                <h4 className={`font-medium mb-1 ${result.eligible
                                        ? 'text-green-700 dark:text-green-400'
                                        : 'text-amber-700 dark:text-amber-400'
                                    }`}>
                                    {result.eligible ? 'Eligible for Return' : 'Limited Eligibility'}
                                </h4>
                                <p className={`text-sm ${result.eligible
                                        ? 'text-green-600 dark:text-green-300'
                                        : 'text-amber-600 dark:text-amber-300'
                                    }`}>
                                    {result.message}
                                </p>
                            </div>
                        </div>

                        {/* Order Details */}
                        {result.orderDetails && (
                            <div className="mb-6">
                                <h4 className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-3">
                                    Order #{result.orderDetails.orderNumber}
                                </h4>
                                <p className="text-sm text-[var(--ac-stone)] mb-4">
                                    {result.orderDetails.daysRemaining} days remaining in return window
                                </p>

                                <div className="space-y-2">
                                    {result.orderDetails.items.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)]"
                                        >
                                            <span className="text-sm text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                                {item.name}
                                            </span>
                                            {item.eligible ? (
                                                <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                                    <Check className="w-3 h-3" />
                                                    Eligible
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                                                    <X className="w-3 h-3" />
                                                    {item.reason || 'Not eligible'}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            {result.eligible && (
                                <a
                                    href="/account/orders"
                                    className="px-6 py-3 bg-[var(--ac-gold)] hover:bg-[var(--ac-gold-light)] text-[var(--ac-obsidian)] text-sm font-medium tracking-wider uppercase transition-colors"
                                >
                                    Start Return
                                </a>
                            )}
                            <button
                                onClick={handleReset}
                                className="text-sm text-[var(--ac-gold)] hover:text-[var(--ac-gold-light)] transition-colors"
                            >
                                Check another order
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
