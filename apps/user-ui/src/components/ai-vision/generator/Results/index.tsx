'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ConceptCard, Concept } from './ConceptCard';
import { PremiumButton } from '../../ui/PremiumButton';
import { Send, Download } from 'lucide-react';

interface ConceptResultsProps {
    concepts: Concept[];
    onAction: (action: string, id: string) => void;
    onSendToArtisans: (ids: string[]) => void;
}

export function ConceptResults({ concepts, onAction, onSendToArtisans }: ConceptResultsProps) {
    const gridRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!gridRef.current) return;

            gsap.fromTo(
                gridRef.current.children,
                { opacity: 0, scale: 0.8, y: 30 },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'back.out(1.2)',
                }
            );
        },
        { scope: gridRef }
    );

    return (
        <div className="py-12 animate-in border-t border-[var(--av-silver)]/10 mt-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h3 className="text-2xl font-semibold text-[var(--av-pearl)] mb-2">
                        ✨ Your Generated Concepts
                    </h3>
                    <p className="text-[var(--av-silver)]">
                        Review your custom designs. Refine them or share with artisans.
                    </p>
                </div>

                <PremiumButton
                    variant="premium"
                    size="md"
                    glow
                    icon={<Send size={18} />}
                    onClick={() => onSendToArtisans(concepts.map(c => c.id))}
                >
                    Send All to Artisans
                </PremiumButton>
            </div>

            <div
                ref={gridRef}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {concepts.map((concept, index) => (
                    <ConceptCard
                        key={concept.id}
                        concept={concept}
                        index={index}
                        onAction={onAction}
                    />
                ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-center mt-12 gap-4">
                <PremiumButton variant="secondary" size="md">
                    Load More Variations
                </PremiumButton>
                <PremiumButton variant="ghost" size="md" icon={<Download size={18} />}>
                    Export All
                </PremiumButton>
            </div>
        </div>
    );
}
