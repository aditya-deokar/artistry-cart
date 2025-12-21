'use client';

import { Clock, CreditCard, AlertCircle } from 'lucide-react';

interface RefundInfoProps {
    className?: string;
}

export function RefundInfo({ className = '' }: RefundInfoProps) {
    return (
        <div className={`${className}`}>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-6">
                Refund Information
            </h2>
            <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mb-8">
                Here&apos;s what to expect once your return is received.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Processing Time */}
                <div className="p-6 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                    <Clock className="w-8 h-8 text-[var(--ac-gold)] mb-4" />
                    <h3 className="font-medium text-lg text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-3">
                        Processing Timeline
                    </h3>
                    <ul className="space-y-3 text-sm text-[var(--ac-stone)]">
                        <li className="flex justify-between">
                            <span>Return transit time</span>
                            <span className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">3-5 days</span>
                        </li>
                        <li className="flex justify-between">
                            <span>Inspection period</span>
                            <span className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">1-2 days</span>
                        </li>
                        <li className="flex justify-between">
                            <span>Refund processing</span>
                            <span className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">Same day</span>
                        </li>
                        <li className="flex justify-between">
                            <span>Bank processing</span>
                            <span className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">5-10 days</span>
                        </li>
                        <li className="flex justify-between pt-3 border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                            <span className="font-medium">Total estimated</span>
                            <span className="font-medium text-[var(--ac-gold)]">10-18 days</span>
                        </li>
                    </ul>
                </div>

                {/* Refund Methods */}
                <div className="p-6 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                    <CreditCard className="w-8 h-8 text-[var(--ac-gold)] mb-4" />
                    <h3 className="font-medium text-lg text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-3">
                        Refund Methods
                    </h3>
                    <ul className="space-y-3 text-sm text-[var(--ac-stone)]">
                        <li>
                            <strong className="text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">Credit/Debit Card:</strong> Refunded to original card
                        </li>
                        <li>
                            <strong className="text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">PayPal:</strong> Refunded to PayPal account
                        </li>
                        <li>
                            <strong className="text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">Shop Pay:</strong> Refunded to original payment
                        </li>
                        <li>
                            <strong className="text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">Store Credit:</strong> Available immediately (optional)
                        </li>
                    </ul>
                </div>
            </div>

            {/* Important Note */}
            <div className="flex gap-4 p-5 mt-6 bg-blue-500/10 dark:bg-blue-500/5 border border-blue-500/20">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                        About Shipping Costs
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400/80">
                        Original shipping costs are non-refundable unless the return is due to an error on our part
                        (wrong item shipped, defective product, etc.). For defective items, return shipping is free.
                    </p>
                </div>
            </div>
        </div>
    );
}
