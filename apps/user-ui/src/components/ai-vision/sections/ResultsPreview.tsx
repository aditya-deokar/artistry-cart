'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Sparkles, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResultsPreviewProps {
    show: boolean;
    exampleId: string | null;
}

// Mock result data based on example selection
const mockResults: Record<string, { match: number; products: Array<{ id: string; name: string; price: number; artisan: string }> }> = {
    vase: {
        match: 94,
        products: [
            { id: '1', name: 'Hand-Thrown Terracotta Vase', price: 185, artisan: 'Maya Ceramics' },
            { id: '2', name: 'Minimalist Clay Vessel', price: 145, artisan: 'Earth & Fire Studio' },
            { id: '3', name: 'Botanical Garden Vase', price: 210, artisan: 'Artisan Collective' },
        ],
    },
    ring: {
        match: 87,
        products: [
            { id: '1', name: 'Sterling Silver Band', price: 245, artisan: 'Silver Moon Jewelers' },
            { id: '2', name: 'Hammered Gold Ring', price: 320, artisan: 'Forge & Flame' },
            { id: '3', name: 'Oxidized Silver Statement Ring', price: 175, artisan: 'Metal Arts Studio' },
        ],
    },
    table: {
        match: 91,
        products: [
            { id: '1', name: 'Live Edge Walnut Table', price: 850, artisan: 'Woodland Crafts' },
            { id: '2', name: 'Mid-Century Coffee Table', price: 620, artisan: 'Modern Makers' },
            { id: '3', name: 'Reclaimed Wood Side Table', price: 445, artisan: 'Rustic Revival' },
        ],
    },
    art: {
        match: 89,
        products: [
            { id: '1', name: 'Abstract Canvas - Blue Dreams', price: 520, artisan: 'Color Theory Studio' },
            { id: '2', name: 'Contemporary Mixed Media', price: 380, artisan: 'Modern Art Collective' },
            { id: '3', name: 'Textured Abstract Original', price: 450, artisan: 'Bold Strokes Gallery' },
        ],
    },
};

export function ResultsPreview({ show, exampleId }: ResultsPreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (show && exampleId) {
            setIsSearching(true);
            setShowResults(false);

            const timer = setTimeout(() => {
                setIsSearching(false);
                setShowResults(true);
            }, 1200);

            return () => clearTimeout(timer);
        } else {
            setShowResults(false);
            setIsSearching(false);
        }
    }, [show, exampleId]);

    useGSAP(
        () => {
            if (!resultsRef.current || !showResults) return;

            const cards = resultsRef.current.querySelectorAll('.result-card');

            gsap.fromTo(
                cards,
                { opacity: 0, y: 30, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: 'back.out(1.2)',
                }
            );
        },
        { dependencies: [showResults], scope: resultsRef }
    );

    const result = exampleId ? mockResults[exampleId] : null;

    return (
        <div
            ref={containerRef}
            className={cn(
                'bg-white/5 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/10 min-h-[480px] transition-all duration-500 relative overflow-hidden',
                show ? 'opacity-100' : 'opacity-60'
            )}
        >
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            {!show && !isSearching && (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 relative z-10">
                    <div className="w-20 h-20 rounded-full bg-[var(--av-gold)]/10 flex items-center justify-center mb-6 border border-[var(--av-gold)]/20 shadow-[0_0_15px_rgba(212,168,75,0.1)]">
                        <Search size={32} className="text-[var(--av-gold)]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--av-pearl)] mb-2 font-serif">
                        Select an Example
                    </h3>
                    <p className="text-[var(--av-silver)] max-w-xs font-light">
                        Click on any example on the left to see instant matches from our artisan catalog
                    </p>
                </div>
            )}

            {isSearching && (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 relative z-10">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--av-gold)] to-[var(--av-gold-dark)] flex items-center justify-center mb-6 animate-pulse shadow-lg shadow-[var(--av-gold)]/20">
                        <Loader2 size={32} className="text-white animate-spin" />
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--av-pearl)] mb-2 font-serif">
                        Searching Catalog...
                    </h3>
                    <p className="text-[var(--av-silver)] font-light">
                        Finding the best matches for you
                    </p>
                </div>
            )}

            {showResults && result && (
                <div ref={resultsRef} className="relative z-10">
                    {/* Match Percentage */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Sparkles size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-[var(--av-pearl)] font-serif">
                                    We Found Matches!
                                </h3>
                                <p className="text-sm text-[var(--av-silver)]">
                                    {result.products.length} products match your image
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-[var(--av-gold)] text-shadow-sm">
                                {result.match}%
                            </div>
                            <div className="text-xs text-[var(--av-silver)] uppercase tracking-wider">
                                Best match
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="space-y-3">
                        {result.products.map((product, index) => (
                            <div
                                key={product.id}
                                className="result-card group relative bg-white/5 rounded-xl p-4 border border-white/10 hover:border-[var(--av-gold)]/40 hover:bg-white/10 hover:shadow-lg transition-all duration-300 cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Placeholder image */}
                                    <div className="w-16 h-16 rounded-lg bg-[#2A2A2A] flex items-center justify-center text-2xl flex-shrink-0 border border-white/5 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                                        <span className="relative z-10 drop-shadow-md">
                                            {exampleId === 'vase' && '🏺'}
                                            {exampleId === 'ring' && '💍'}
                                            {exampleId === 'table' && '🪑'}
                                            {exampleId === 'art' && '🎨'}
                                        </span>
                                    </div>

                                    {/* Product info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-[var(--av-pearl)] truncate mb-1 group-hover:text-white transition-colors">
                                            {product.name}
                                        </h4>
                                        <p className="text-sm text-[var(--av-silver)] group-hover:text-[var(--av-pearl)] transition-colors">
                                            by {product.artisan}
                                        </p>
                                    </div>

                                    {/* Price and action */}
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-lg font-bold text-[var(--av-gold)]">
                                            ${product.price}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-[var(--av-pearl)] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                            View <ArrowRight size={12} />
                                        </div>
                                    </div>
                                </div>

                                {/* Match badge */}
                                {index === 0 && (
                                    <div className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-[var(--av-gold)] to-[var(--av-gold-dark)] text-white text-xs font-bold rounded-full shadow-lg shadow-[var(--av-gold)]/20 border border-white/20">
                                        Best Match
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Generate Custom CTA */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-[var(--av-gold)]/10 via-[var(--av-gold)]/5 to-transparent rounded-xl border border-[var(--av-gold)]/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-[var(--av-pearl)]">
                                    Want something unique?
                                </h4>
                                <p className="text-sm text-[var(--av-silver)]">
                                    Generate a custom version with AI
                                </p>
                            </div>
                            <button className="px-4 py-2 bg-gradient-to-r from-[var(--av-gold)] to-[var(--av-gold-dark)] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-[var(--av-gold)]/20 transition-all hover:-translate-y-0.5 flex items-center gap-2 border border-white/20">
                                <Sparkles size={16} />
                                Generate Custom
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
