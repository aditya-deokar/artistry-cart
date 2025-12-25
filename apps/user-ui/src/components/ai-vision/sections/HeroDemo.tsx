'use client';

import { useState, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { PremiumButton } from '../ui/PremiumButton';
import { Sparkles } from 'lucide-react';

const examplePrompts = [
    'A handcrafted ceramic vase with organic curves...',
    'A minimalist wooden coffee table with live edge...',
    'Custom silver pendant with moonstone centerpiece...',
];

export function HeroDemo() {
    const [currentPrompt, setCurrentPrompt] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const demoRef = useRef<HTMLDivElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            // Rotate example prompts
            const interval = setInterval(() => {
                setCurrentPrompt((prev) => (prev + 1) % examplePrompts.length);
            }, 3000);

            return () => clearInterval(interval);
        },
        { scope: demoRef }
    );

    const handleGenerate = () => {
        setIsGenerating(true);

        // Simulate generation
        setTimeout(() => {
            setIsGenerating(false);
            setShowResults(true);

            // Animate results
            if (resultsRef.current) {
                gsap.fromTo(
                    resultsRef.current.children,
                    { opacity: 0, scale: 0.8, y: 20 },
                    {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        duration: 0.5,
                        stagger: 0.1,
                        ease: 'back.out(1.4)',
                    }
                );
            }
        }, 2000);
    };

    return (
        <div
            ref={demoRef}
            className="bg-[var(--av-slate)] rounded-lg p-8 border border-[var(--av-gold)]/20"
        >
            <div className="flex items-center gap-3 mb-6">
                <Sparkles className="text-[var(--av-gold)]" size={24} />
                <h3 className="text-xl font-semibold text-[var(--av-pearl)]">
                    Try a Quick Example
                </h3>
            </div>

            <div className="mb-6">
                <textarea
                    className="w-full bg-[var(--av-onyx)] text-[var(--av-pearl)] rounded-md p-4 border border-[var(--av-silver)]/20 focus:border-[var(--av-gold)] focus:ring-2 focus:ring-[var(--av-gold)]/20 outline-none transition-all resize-none"
                    rows={4}
                    placeholder="Describe what you imagine..."
                    value={examplePrompts[currentPrompt]}
                    readOnly
                />
                <div className="text-xs text-[var(--av-silver)] mt-2">
                    💡 Example auto-updates every 3 seconds
                </div>
            </div>

            <PremiumButton
                variant="primary"
                size="md"
                className="w-full"
                glow
                onClick={handleGenerate}
                disabled={isGenerating}
            >
                {isGenerating ? (
                    <>
                        <span className="animate-spin">⚡</span>
                        Generating...
                    </>
                ) : (
                    'Generate Preview'
                )}
            </PremiumButton>

            {/* Results Preview */}
            {showResults && (
                <div ref={resultsRef} className="grid grid-cols-3 gap-4 mt-6">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="aspect-square bg-[var(--av-onyx)] rounded-md border border-[var(--av-gold)]/30 flex items-center justify-center"
                        >
                            <div className="text-4xl">🎨</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
