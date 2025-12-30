'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ConceptCard, Concept } from './ConceptCard';
import { PremiumButton } from '../../ui/PremiumButton';
import { Send, Download, RefreshCw, Loader2 } from 'lucide-react';
import type { ConceptCardData } from '@/types/aivision';

interface ConceptResultsProps {
    concepts: ConceptCardData[];
    onAction: (action: string, id: string) => void;
    onSendToArtisans: (ids: string[]) => void;
    isActionLoading?: boolean;
    onLoadMore?: () => void;
    canLoadMore?: boolean;
}

export function ConceptResults({
    concepts,
    onAction,
    onSendToArtisans,
    isActionLoading = false,
    onLoadMore,
    canLoadMore = false,
}: ConceptResultsProps) {
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

    const handleExportAll = () => {
        // Export all concept images
        concepts.forEach((concept) => {
            if (concept.imageUrl) {
                const link = document.createElement('a');
                link.href = concept.imageUrl;
                link.download = `${concept.title.replace(/\s+/g, '-').toLowerCase()}.jpg`;
                link.target = '_blank';
                link.click();
            }
        });
    };

    return (
        <div className="py-12 animate-in border-t border-[var(--av-silver)]/10 mt-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h3 className="text-2xl font-semibold text-[var(--av-pearl)] mb-2">
                        ✨ Your Generated Concepts
                    </h3>
                    <p className="text-[var(--av-silver)]">
                        {concepts.length} unique design{concepts.length !== 1 ? 's' : ''} created.
                        Refine them or share with artisans.
                    </p>
                </div>

                <PremiumButton
                    variant="premium"
                    size="md"
                    glow
                    icon={isActionLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    onClick={() => onSendToArtisans(concepts.map(c => c.id))}
                    disabled={isActionLoading}
                >
                    Send All to Artisans
                </PremiumButton>
            </div>

            {/* Concept Grid */}
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
                        isActionLoading={isActionLoading}
                    />
                ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row justify-center mt-12 gap-4">
                {/* Load More / Regenerate */}
                {canLoadMore && onLoadMore ? (
                    <PremiumButton
                        variant="secondary"
                        size="md"
                        icon={<RefreshCw size={18} />}
                        onClick={onLoadMore}
                    >
                        Load More Variations
                    </PremiumButton>
                ) : (
                    <PremiumButton
                        variant="secondary"
                        size="md"
                        icon={<RefreshCw size={18} />}
                        onClick={() => onAction('regenerate', concepts[0]?.id || '')}
                    >
                        Generate More Variations
                    </PremiumButton>
                )}

                {/* Export */}
                <PremiumButton
                    variant="ghost"
                    size="md"
                    icon={<Download size={18} />}
                    onClick={handleExportAll}
                >
                    Export All
                </PremiumButton>
            </div>

            {/* Tips */}
            <div className="mt-12 p-4 bg-[var(--av-slate)] rounded-lg border border-[var(--av-silver)]/10">
                <h4 className="text-sm font-semibold text-[var(--av-pearl)] mb-2">💡 Tips</h4>
                <ul className="text-xs text-[var(--av-silver)] space-y-1">
                    <li>• <strong>Refine</strong> a concept to adjust details like color, size, or style</li>
                    <li>• <strong>Find Similar</strong> to discover existing products that match your vision</li>
                    <li>• <strong>Save</strong> concepts to your collection for later</li>
                    <li>• <strong>Send to Artisans</strong> to get quotes from skilled craftspeople</li>
                </ul>
            </div>
        </div>
    );
}
