'use client';

import { useState, useRef } from 'react';
import { X, Send, Calendar, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { type Artisan } from './ArtisanProfileCard';
import { PremiumButton } from '../ui/PremiumButton';

interface SendToArtisansModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedArtisans: Artisan[];
}

export function SendToArtisansModal({ isOpen, onClose, selectedArtisans }: SendToArtisansModalProps) {
    const [budget, setBudget] = useState<string>('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

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

    const handleSend = () => {
        setIsSending(true);
        // Simulate API call
        setTimeout(() => {
            setIsSending(false);
            setIsSent(true);

            // Close after delay
            setTimeout(() => {
                onClose();
                // Reset state after close animation (simulated)
                setTimeout(() => {
                    setIsSent(false);
                    setMessage('');
                    setBudget('');
                }, 500);
            }, 2000);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div ref={modalRef} className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div
                ref={contentRef}
                className="w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h3 className="text-xl font-bold text-[var(--av-pearl)] font-serif">
                        {isSent ? 'Request Sent!' : 'Send Partnership Request'}
                    </h3>
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
                                Your request has been sent to {selectedArtisans.length} artisans. They typically respond within 24 hours.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Selected Artisans */}
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-[var(--av-silver)] mb-3 font-semibold">
                                    Recipients ({selectedArtisans.length})
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedArtisans.map((artisan) => (
                                        <div key={artisan.id} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                                            <div className="w-5 h-5 rounded-full bg-[var(--av-gold)]/20 flex items-center justify-center text-[10px]">🗿</div>
                                            <span className="text-sm text-[var(--av-pearl)]">{artisan.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Budget */}
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-[var(--av-silver)] mb-2 font-semibold">
                                    Estimated Budget
                                </label>
                                <div className="relative">
                                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--av-silver)]" />
                                    <input
                                        type="text"
                                        value={budget}
                                        onChange={(e) => setBudget(e.target.value)}
                                        placeholder="e.g. 500 - 1000"
                                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-[var(--av-pearl)] placeholder:text-white/20 focus:outline-none focus:border-[var(--av-gold)]/50 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Deadline (Optional) */}
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-[var(--av-silver)] mb-2 font-semibold">
                                    Desired Timeline (Optional)
                                </label>
                                <div className="relative">
                                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--av-silver)]" />
                                    <input
                                        type="text"
                                        placeholder="e.g. 3-4 weeks"
                                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-[var(--av-pearl)] placeholder:text-white/20 focus:outline-none focus:border-[var(--av-gold)]/50 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-[var(--av-silver)] mb-2 font-semibold">
                                    Message
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Describe your project, specific requirements, or ask questions..."
                                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl p-4 text-[var(--av-pearl)] placeholder:text-white/20 focus:outline-none focus:border-[var(--av-gold)]/50 transition-colors min-h-[120px] resize-none"
                                />
                            </div>

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
                            disabled={!message || !budget || isSending}
                            variant="primary"
                            glow={!isSending}
                        >
                            {isSending ? (
                                <>Sending...</>
                            ) : (
                                <>
                                    <Send size={16} className="mr-2" />
                                    Send Request
                                </>
                            )}
                        </PremiumButton>
                    </div>
                )}
            </div>
        </div>
    );
}
