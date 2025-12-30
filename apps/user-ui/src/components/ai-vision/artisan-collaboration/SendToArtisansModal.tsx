'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Calendar, DollarSign, Clock, CheckCircle, Loader2, Star, Users } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { PremiumButton } from '../ui/PremiumButton';
import { useArtisanMatching } from '@/hooks/useAIVision';
import { cn } from '@/lib/utils';
import type { ArtisanMatch } from '@/types/aivision';

interface SendToArtisansModalProps {
    isOpen: boolean;
    onClose: () => void;
    conceptId: string | null;
    conceptTitle?: string;
}

export function SendToArtisansModal({ isOpen, onClose, conceptId, conceptTitle = 'Your Concept' }: SendToArtisansModalProps) {
    const [budgetMin, setBudgetMin] = useState<string>('');
    const [budgetMax, setBudgetMax] = useState<string>('');
    const [deadline, setDeadline] = useState<string>('');
    const [message, setMessage] = useState('');
    const [isSent, setIsSent] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);

    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Use artisan matching hook
    const {
        matches,
        selectedIds,
        isLoading,
        isSending,
        error,
        toggleSelection,
        selectAll,
        clearSelection,
        send,
        selectedCount,
        hasSelection,
    } = useArtisanMatching(conceptId);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setIsSent(false);
            setSendError(null);
            setMessage('');
            setBudgetMin('');
            setBudgetMax('');
            setDeadline('');
        }
    }, [isOpen]);

    useGSAP(
        () => {
            if (isOpen) {
                gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
                gsap.fromTo(
                    contentRef.current,
                    { y: 50, opacity: 0, scale: 0.95 },
                    { y: 0, opacity: 1, scale: 1, duration: 0.4, delay: 0.1, ease: 'back.out(1.2)' }
                );
            }
        },
        { dependencies: [isOpen], scope: modalRef }
    );

    const handleSend = async () => {
        setSendError(null);

        const budget = (budgetMin || budgetMax) ? {
            min: budgetMin ? parseInt(budgetMin) : undefined,
            max: budgetMax ? parseInt(budgetMax) : undefined,
        } : undefined;

        const success = await send({
            message: message || undefined,
            budget,
            deadline: deadline || undefined,
        });

        if (success) {
            setIsSent(true);
            // Close after delay
            setTimeout(() => {
                onClose();
            }, 2500);
        } else {
            setSendError(error || 'Failed to send request. Please try again.');
        }
    };

    if (!isOpen) return null;

    return (
        <div ref={modalRef} className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div
                ref={contentRef}
                className="w-full max-w-2xl bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div>
                        <h3 className="text-xl font-bold text-[var(--av-pearl)] font-serif">
                            {isSent ? 'Request Sent!' : 'Connect with Artisans'}
                        </h3>
                        <p className="text-sm text-[var(--av-silver)] mt-1">
                            For: {conceptTitle}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-[var(--av-silver)] hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {isSent ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                                <CheckCircle size={32} />
                            </div>
                            <h4 className="text-2xl font-bold text-[var(--av-pearl)] mb-2">Success!</h4>
                            <p className="text-[var(--av-silver)] max-w-xs">
                                Your request has been sent to {selectedCount} artisan{selectedCount !== 1 ? 's' : ''}.
                                They typically respond within 24-48 hours.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Artisan Selection */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-xs uppercase tracking-wider text-[var(--av-silver)] font-semibold">
                                        <Users size={14} className="inline mr-2" />
                                        Select Artisans ({selectedCount} selected)
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={selectAll}
                                            className="text-xs text-[var(--av-gold)] hover:underline"
                                        >
                                            Select All
                                        </button>
                                        {hasSelection && (
                                            <button
                                                onClick={clearSelection}
                                                className="text-xs text-[var(--av-silver)] hover:text-white"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-[var(--av-gold)]" />
                                        <span className="ml-2 text-[var(--av-silver)]">Finding matched artisans...</span>
                                    </div>
                                ) : matches.length === 0 ? (
                                    <div className="text-center py-8 text-[var(--av-silver)]">
                                        <p>No matched artisans found for this concept.</p>
                                        <p className="text-xs mt-1 text-[var(--av-ash)]">Try refining your concept or try again later.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
                                        {matches.map((match) => (
                                            <ArtisanSelectCard
                                                key={match.id}
                                                match={match}
                                                isSelected={selectedIds.includes(match.sellerId)}
                                                onToggle={() => toggleSelection(match.sellerId)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Budget */}
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-[var(--av-silver)] mb-2 font-semibold">
                                    Budget Range (Optional)
                                </label>
                                <div className="flex gap-3 items-center">
                                    <div className="relative flex-1">
                                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--av-silver)]" />
                                        <input
                                            type="number"
                                            value={budgetMin}
                                            onChange={(e) => setBudgetMin(e.target.value)}
                                            placeholder="Min"
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-[var(--av-pearl)] placeholder:text-white/20 focus:outline-none focus:border-[var(--av-gold)]/50 transition-colors"
                                        />
                                    </div>
                                    <span className="text-[var(--av-silver)]">to</span>
                                    <div className="relative flex-1">
                                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--av-silver)]" />
                                        <input
                                            type="number"
                                            value={budgetMax}
                                            onChange={(e) => setBudgetMax(e.target.value)}
                                            placeholder="Max"
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-[var(--av-pearl)] placeholder:text-white/20 focus:outline-none focus:border-[var(--av-gold)]/50 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Deadline */}
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-[var(--av-silver)] mb-2 font-semibold">
                                    Desired Timeline (Optional)
                                </label>
                                <div className="relative">
                                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--av-silver)]" />
                                    <input
                                        type="text"
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                        placeholder="e.g. 3-4 weeks, ASAP, by March 15"
                                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-[var(--av-pearl)] placeholder:text-white/20 focus:outline-none focus:border-[var(--av-gold)]/50 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-[var(--av-silver)] mb-2 font-semibold">
                                    Message (Optional)
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Describe your project, specific requirements, or ask questions..."
                                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl p-4 text-[var(--av-pearl)] placeholder:text-white/20 focus:outline-none focus:border-[var(--av-gold)]/50 transition-colors min-h-[100px] resize-none"
                                />
                            </div>

                            {/* Error */}
                            {sendError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                    {sendError}
                                </div>
                            )}

                            {/* Info Box */}
                            <div className="bg-[var(--av-gold)]/5 border border-[var(--av-gold)]/10 p-4 rounded-xl flex gap-3">
                                <Clock size={18} className="text-[var(--av-gold)] shrink-0" />
                                <p className="text-xs text-[var(--av-silver)] leading-relaxed">
                                    Most artisans on our platform reply within 24-48 hours. You'll be notified via email and in your dashboard when they respond.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isSent && (
                    <div className="p-6 border-t border-white/5 bg-[#0D0D0D] flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-lg text-[var(--av-silver)] hover:text-white hover:bg-white/5 transition-colors font-medium text-sm"
                        >
                            Cancel
                        </button>
                        <PremiumButton
                            onClick={handleSend}
                            disabled={!hasSelection || isSending}
                            variant="primary"
                            glow={!isSending && hasSelection}
                        >
                            {isSending ? (
                                <>
                                    <Loader2 size={16} className="mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send size={16} className="mr-2" />
                                    Send to {selectedCount} Artisan{selectedCount !== 1 ? 's' : ''}
                                </>
                            )}
                        </PremiumButton>
                    </div>
                )}
            </div>
        </div>
    );
}

// =====================================================
// Artisan Selection Card Component
// =====================================================

interface ArtisanSelectCardProps {
    match: ArtisanMatch;
    isSelected: boolean;
    onToggle: () => void;
}

function ArtisanSelectCard({ match, isSelected, onToggle }: ArtisanSelectCardProps) {
    return (
        <div
            onClick={onToggle}
            className={cn(
                'p-3 rounded-lg border-2 cursor-pointer transition-all',
                isSelected
                    ? 'border-[var(--av-gold)] bg-[var(--av-gold)]/5'
                    : 'border-white/10 bg-white/5 hover:border-[var(--av-gold)]/30'
            )}
        >
            <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[var(--av-gold)]/20 flex items-center justify-center text-lg">
                    {match.shop?.avatar || '🗿'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-[var(--av-pearl)] text-sm truncate">
                            {match.shop?.name || 'Artisan Studio'}
                        </h4>
                        {match.shop?.rating && (
                            <span className="flex items-center gap-0.5 text-xs text-[var(--av-gold)]">
                                <Star size={10} fill="currentColor" />
                                {match.shop.rating.toFixed(1)}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-[var(--av-silver)] truncate">
                        {match.shop?.category || 'General'}
                    </p>
                </div>

                {/* Match Score */}
                <div className={cn(
                    'text-xs font-mono px-2 py-1 rounded',
                    match.overallScore >= 0.8
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : match.overallScore >= 0.6
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-[var(--av-silver)]/20 text-[var(--av-silver)]'
                )}>
                    {Math.round(match.overallScore * 100)}% match
                </div>
            </div>

            {/* Match Reasons */}
            {match.matchReasons && match.matchReasons.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {match.matchReasons.slice(0, 2).map((reason, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-[var(--av-silver)]">
                            {reason}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
