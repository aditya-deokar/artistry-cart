'use client';

import { Image as ImageIcon, Heart, Wand2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

export interface Concept {
    id: string;
    imageUrl: string;
    title: string;
    description: string;
    category: string;
}

interface ConceptCardProps {
    concept: Concept;
    onAction: (action: string, id: string) => void;
    index: number;
}

export function ConceptCard({ concept, onAction, index }: ConceptCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

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
                    <img
                        src={concept.imageUrl}
                        alt={concept.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full">
                        <ImageIcon className="text-[var(--av-silver)] opacity-20" size={48} />
                    </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-[var(--av-obsidian)] to-transparent">
                    <div className="flex justify-between items-center gap-2 pt-8">
                        <button
                            onClick={() => onAction('refine', concept.id)}
                            className="p-2 bg-[var(--av-gold)]/90 rounded-full text-[var(--av-obsidian)] hover:scale-110 transition-transform"
                            title="Refine"
                        >
                            <Wand2 size={18} />
                        </button>
                        <button
                            onClick={() => onAction('find_similar', concept.id)}
                            className="p-2 bg-[var(--av-pearl)]/20 backdrop-blur-sm rounded-full text-[var(--av-pearl)] hover:bg-[var(--av-pearl)]/30 hover:scale-110 transition-transform"
                            title="Find Similar"
                        >
                            <Search size={18} />
                        </button>
                        <button
                            onClick={() => onAction('save', concept.id)}
                            className="p-2 bg-[var(--av-pearl)]/20 backdrop-blur-sm rounded-full text-[var(--av-pearl)] hover:bg-[var(--av-pearl)]/30 hover:scale-110 transition-transform"
                            title="Save"
                        >
                            <Heart size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <span className="text-xs text-[var(--av-gold)] font-mono uppercase tracking-wider mb-1 block">
                            {concept.category}
                        </span>
                        <h4 className="font-semibold text-[var(--av-pearl)] line-clamp-1">
                            {concept.title}
                        </h4>
                    </div>
                </div>

                <p className="text-sm text-[var(--av-silver)] line-clamp-2 leading-relaxed">
                    {concept.description}
                </p>
            </div>
        </div>
    );
}
