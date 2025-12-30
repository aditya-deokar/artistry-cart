'use client';

import { Image as ImageIcon, Heart, Wand2, Search, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRef, useState } from 'react';
import type { ConceptCardData, PriceRange } from '@/types/aivision';
import Image from 'next/image';

// Re-export for backward compatibility
export type Concept = ConceptCardData;

interface ConceptCardProps {
    concept: ConceptCardData;
    onAction: (action: string, id: string) => void;
    index: number;
    isActionLoading?: boolean;
}

function formatPriceRange(priceRange?: PriceRange): string {
    if (!priceRange) return '';
    return `$${priceRange.min.toLocaleString()} - $${priceRange.max.toLocaleString()}`;
}

export function ConceptCard({ concept, onAction, index, isActionLoading }: ConceptCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isSaved, setIsSaved] = useState(concept.isSaved || false);
    const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved'>('idle');

    // Hover animation
    useGSAP(
        () => {
            const card = cardRef.current;
            if (!card) return;

            const handleMouseEnter = () => {
                gsap.to(card, { y: -8, scale: 1.02, duration: 0.3, ease: 'power2.out' });
            };

            const handleMouseLeave = () => {
                gsap.to(card, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out' });
            };

            card.addEventListener('mouseenter', handleMouseEnter);
            card.addEventListener('mouseleave', handleMouseLeave);

            return () => {
                card.removeEventListener('mouseenter', handleMouseEnter);
                card.removeEventListener('mouseleave', handleMouseLeave);
            };
        },
        { scope: cardRef }
    );

    const handleSave = async () => {
        if (savingState !== 'idle') return;

        setSavingState('saving');
        onAction('save', concept.id);

        // Optimistic update
        setTimeout(() => {
            setIsSaved(true);
            setSavingState('saved');
            setTimeout(() => setSavingState('idle'), 1500);
        }, 500);
    };

    return (
        <div
            ref={cardRef}
            className={cn(
                "group relative bg-[var(--av-slate)] rounded-lg overflow-hidden border border-[var(--av-silver)]/10 transition-colors shadow-lg",
                "hover:border-[var(--av-gold)]/50"
            )}
        >
            {/* Image Container */}
            <div className="relative aspect-square bg-[var(--av-onyx)] overflow-hidden">
                {concept.imageUrl ? (
                    <Image
                        src={concept.imageUrl}
                        alt={concept.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full">
                        <ImageIcon className="text-[var(--av-silver)] opacity-20" size={48} />
                    </div>
                )}

                {/* Saved Badge */}
                {isSaved && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-[var(--av-gold)] rounded-full flex items-center gap-1 text-xs font-medium text-[var(--av-obsidian)]">
                        <Check size={12} />
                        Saved
                    </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-[var(--av-obsidian)] to-transparent">
                    <div className="flex justify-between items-center gap-2 pt-8">
                        <button
                            onClick={() => onAction('refine', concept.id)}
                            className="p-2 bg-[var(--av-gold)]/90 rounded-full text-[var(--av-obsidian)] hover:scale-110 transition-transform"
                            title="Refine"
                            disabled={isActionLoading}
                        >
                            <Wand2 size={18} />
                        </button>
                        <button
                            onClick={() => onAction('find_similar', concept.id)}
                            className="p-2 bg-[var(--av-pearl)]/20 backdrop-blur-sm rounded-full text-[var(--av-pearl)] hover:bg-[var(--av-pearl)]/30 hover:scale-110 transition-transform"
                            title="Find Similar"
                            disabled={isActionLoading}
                        >
                            <Search size={18} />
                        </button>
                        <button
                            onClick={handleSave}
                            className={cn(
                                "p-2 backdrop-blur-sm rounded-full transition-all hover:scale-110",
                                isSaved
                                    ? "bg-[var(--av-gold)] text-[var(--av-obsidian)]"
                                    : "bg-[var(--av-pearl)]/20 text-[var(--av-pearl)] hover:bg-[var(--av-pearl)]/30"
                            )}
                            title={isSaved ? "Saved" : "Save"}
                            disabled={savingState !== 'idle'}
                        >
                            {savingState === 'saving' ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                        <span className="text-xs text-[var(--av-gold)] font-mono uppercase tracking-wider mb-1 block">
                            {concept.category}
                        </span>
                        <h4 className="font-semibold text-[var(--av-pearl)] line-clamp-1">
                            {concept.title}
                        </h4>
                    </div>
                    {/* Complexity Badge */}
                    {concept.complexity && (
                        <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-medium uppercase",
                            concept.complexity === 'simple' && "bg-green-500/20 text-green-400",
                            concept.complexity === 'moderate' && "bg-yellow-500/20 text-yellow-400",
                            concept.complexity === 'complex' && "bg-orange-500/20 text-orange-400",
                            concept.complexity === 'expert' && "bg-red-500/20 text-red-400",
                        )}>
                            {concept.complexity}
                        </span>
                    )}
                </div>

                <p className="text-sm text-[var(--av-silver)] line-clamp-2 leading-relaxed mb-3">
                    {concept.description}
                </p>

                {/* Price Range & Materials */}
                <div className="flex flex-wrap items-center gap-2">
                    {concept.priceRange && (
                        <span className="text-xs font-mono text-[var(--av-gold)] bg-[var(--av-gold)]/10 px-2 py-1 rounded">
                            {formatPriceRange(concept.priceRange)}
                        </span>
                    )}
                    {concept.materials && concept.materials.slice(0, 2).map((material) => (
                        <span
                            key={material}
                            className="text-xs text-[var(--av-silver)] bg-[var(--av-onyx)] px-2 py-1 rounded"
                        >
                            {material}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
