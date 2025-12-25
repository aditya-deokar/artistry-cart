'use client';

import { Check, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingTransparencyProps {
    variant?: 'full' | 'widget';
    className?: string;
}

export function PricingTransparency({ variant = 'full', className }: PricingTransparencyProps) {
    if (variant === 'widget') {
        return (
            <div className={cn("bg-[#0E0E0E] rounded-2xl p-6 border border-white/5 relative overflow-hidden h-full flex flex-col", className)}>
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <span className="text-6xl">🛡️</span>
                </div>

                <h4 className="text-[var(--av-pearl)] font-bold mb-6 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-[var(--av-gold)]" />
                    Transparent Costs
                </h4>

                <div className="space-y-5 flex-1">
                    {/* Visual Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-[var(--av-silver)] mb-1">
                            <span>Artisan</span>
                            <span>Platform</span>
                        </div>
                        <div className="h-4 bg-white/5 rounded-full overflow-hidden flex">
                            <div className="w-[85%] bg-[var(--av-gold)] h-full" title="85% to Artisan" />
                            <div className="w-[10%] bg-emerald-500 h-full" title="10% Materials" />
                            <div className="w-[5%] bg-purple-500 h-full" title="5% Platform" />
                        </div>
                        <div className="flex justify-between text-[10px] text-[var(--av-silver)] mt-2">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[var(--av-gold)]" /> 85% Earnings</div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500" /> 5% Fee</div>
                        </div>
                    </div>

                    <div className="p-4 bg-[var(--av-gold)]/5 border border-[var(--av-gold)]/10 rounded-xl mt-auto">
                        <p className="text-xs text-[var(--av-pearl)] leading-relaxed">
                            Funds are held securely in escrow until you approve the final masterpiece.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto mt-20">
            <div className="text-center mb-10">
                <h3 className="text-2xl font-bold text-[var(--av-pearl)] mb-4 font-serif">Transparent Pricing</h3>
                <p className="text-[var(--av-silver)] max-w-2xl mx-auto">
                    We believe in fair compensation for artisans and clear costs for you. No hidden fees.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cost Breakdown Card */}
                <div className="md:col-span-2 bg-[#151515] rounded-2xl p-8 border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <span className="text-8xl">📊</span>
                    </div>

                    <h4 className="text-lg font-bold text-[var(--av-pearl)] mb-6">Where Your Money Goes</h4>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 text-right text-sm font-bold text-[var(--av-gold)]">85%</div>
                            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-[var(--av-gold)] w-[85%] rounded-full" />
                            </div>
                            <div className="w-24 text-sm text-[var(--av-pearl)]">Artisan Earnings</div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-16 text-right text-sm font-bold text-emerald-400">10%</div>
                            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[10%] rounded-full" />
                            </div>
                            <div className="w-24 text-sm text-[var(--av-pearl)]">Materials</div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-16 text-right text-sm font-bold text-purple-400">5%</div>
                            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 w-[5%] rounded-full" />
                            </div>
                            <div className="w-24 text-sm text-[var(--av-pearl)]">Platform Fee</div>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/5 flex gap-4">
                        <div className="shrink-0 text-2xl">🛡️</div>
                        <div>
                            <h5 className="font-bold text-[var(--av-pearl)] text-sm mb-1">Secure Payments</h5>
                            <p className="text-xs text-[var(--av-silver)]">Funds are held in escrow and only released when you approve the final product.</p>
                        </div>
                    </div>
                </div>

                {/* Pricing Tiers / Features */}
                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] rounded-2xl p-8 border border-[var(--av-gold)]/20 shadow-lg shadow-[var(--av-gold)]/5 flex flex-col justify-center">
                    <h4 className="text-lg font-bold text-[var(--av-gold)] mb-6">Premium Service</h4>

                    <ul className="space-y-4">
                        {[
                            'Verified Professional Artisans',
                            'Milestone-based Payments',
                            'Global Shipping & Insurance',
                            'Dispute Resolution Support',
                            'Concept AI Generation Unlimited'
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-[var(--av-pearl)]">
                                <Check size={16} className="text-[var(--av-gold)] shrink-0 mt-0.5" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
