'use client';

import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Sparkles, X } from 'lucide-react';
import { PremiumButton } from './PremiumButton';

export function StickyActionBar() {
    const barRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useGSAP(() => {
        if (isDismissed) return;

        // Show bar after scrolling past 100vh
        const showAnim = gsap.fromTo(barRef.current,
            { y: 100, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, paused: true, ease: 'power3.out' }
        );

        const handleScroll = () => {
            if (window.scrollY > window.innerHeight * 1.5) {
                if (!isVisible) {
                    setIsVisible(true);
                    showAnim.play();
                }
            } else {
                if (isVisible) {
                    setIsVisible(false);
                    showAnim.reverse();
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);

    }, { scope: barRef, dependencies: [isVisible, isDismissed] });

    if (isDismissed) return null;

    return (
        <div
            ref={barRef}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-xl opacity-0 translate-y-[100px]"
        >
            <div className="bg-[#111]/90 backdrop-blur-xl border border-[var(--av-gold)]/20 p-3 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4 pl-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--av-gold)]/10 flex items-center justify-center">
                        <Sparkles size={14} className="text-[var(--av-gold)]" />
                    </div>
                    <div>
                        <span className="text-sm font-bold text-[var(--av-pearl)] block leading-tight">Ready to create?</span>
                        <span className="text-[10px] text-[var(--av-silver)] block">Try the AI Generator for free</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <PremiumButton
                        variant="primary"
                        size="sm"
                        className="rounded-full px-6"
                        onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    >
                        Start Now
                    </PremiumButton>
                    <button
                        onClick={() => setIsDismissed(true)}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[var(--av-silver)] transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
