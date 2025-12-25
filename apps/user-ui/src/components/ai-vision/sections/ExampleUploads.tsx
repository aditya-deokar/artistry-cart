'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Upload, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const examples = [
    { id: 'vase', label: 'Ceramic Vase', emoji: '🏺', description: 'Hand-thrown pottery' },
    { id: 'ring', label: 'Silver Ring', emoji: '💍', description: 'Artisan jewelry' },
    { id: 'table', label: 'Coffee Table', emoji: '🪑', description: 'Custom furniture' },
    { id: 'art', label: 'Abstract Art', emoji: '🎨', description: 'Original paintings' },
];

interface ExampleUploadsProps {
    onSelect: (id: string) => void;
    selectedExample: string | null;
}

export function ExampleUploads({ onSelect, selectedExample }: ExampleUploadsProps) {
    const gridRef = useRef<HTMLDivElement>(null);
    const uploadRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!gridRef.current) return;

            gsap.fromTo(
                gridRef.current.children,
                { opacity: 0, scale: 0.9, y: 20 },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: 'back.out(1.4)',
                }
            );

            if (uploadRef.current) {
                gsap.fromTo(
                    uploadRef.current,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        delay: 0.5,
                        ease: 'power3.out',
                    }
                );
            }
        },
        { scope: gridRef }
    );

    return (
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/10 relative overflow-hidden">
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--av-gold)] to-[var(--av-gold-dark)] flex items-center justify-center shadow-lg shadow-[var(--av-gold)]/20">
                    <Sparkles size={20} className="text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-[var(--av-pearl)] font-serif tracking-wide">
                        Try These Examples
                    </h3>
                    <p className="text-sm text-[var(--av-silver)] font-light">
                        Click to see instant matches
                    </p>
                </div>
            </div>

            <div ref={gridRef} className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                {examples.map((example) => (
                    <button
                        key={example.id}
                        onClick={() => onSelect(example.id)}
                        className={cn(
                            'relative aspect-square rounded-xl border transition-all duration-300',
                            'flex flex-col items-center justify-center gap-2 group overflow-hidden',
                            'hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--av-gold)]/10',
                            selectedExample === example.id
                                ? 'border-[var(--av-gold)] bg-[var(--av-gold)]/10 ring-1 ring-[var(--av-gold)]/50'
                                : 'border-white/10 bg-white/5 hover:border-[var(--av-gold)]/40 hover:bg-white/10'
                        )}
                    >
                        {/* Background decoration */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--av-gold)]/0 via-transparent to-[var(--av-gold)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Emoji */}
                        <span className={cn(
                            'text-5xl transition-transform duration-300 drop-shadow-lg',
                            selectedExample === example.id ? 'scale-110' : 'group-hover:scale-110'
                        )}>
                            {example.emoji}
                        </span>

                        {/* Label */}
                        <span className={cn(
                            "text-sm font-medium transition-colors duration-300",
                            selectedExample === example.id ? "text-[var(--av-gold)]" : "text-[var(--av-pearl)] group-hover:text-white"
                        )}>
                            {example.label}
                        </span>

                        {/* Description */}
                        <span className="text-xs text-[var(--av-silver)] opacity-60 font-light">
                            {example.description}
                        </span>

                        {/* Selection indicator */}
                        {selectedExample === example.id && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--av-gold)] flex items-center justify-center shadow-md">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Upload Your Own */}
            <div
                ref={uploadRef}
                className={cn(
                    'border border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 relative z-10',
                    'bg-white/5 group hover:bg-white/10',
                    'hover:border-[var(--av-gold)] hover:shadow-lg hover:shadow-[var(--av-gold)]/5',
                    'border-white/20'
                )}
            >
                <div className="w-12 h-12 rounded-full bg-[var(--av-gold)]/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-[var(--av-gold)]/20 transition-colors border border-[var(--av-gold)]/20">
                    <Upload className="text-[var(--av-gold)]" size={24} />
                </div>
                <p className="text-sm font-medium text-[var(--av-pearl)] mb-1 group-hover:text-white transition-colors">
                    Or upload your own image
                </p>
                <p className="text-xs text-[var(--av-silver)]">
                    PNG, JPG, WEBP up to 10MB
                </p>
            </div>
        </div>
    );
}
