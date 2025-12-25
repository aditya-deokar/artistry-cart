'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Type, Package, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type GenerationMode = 'text' | 'product-variation' | 'visual-search';

interface ModeSelectorProps {
    activeMode: GenerationMode;
    onChange: (mode: GenerationMode) => void;
}

const modes = [
    {
        id: 'text' as const,
        label: 'Text Generation',
        description: 'Describe from imagination',
        icon: Type,
    },
    {
        id: 'product-variation' as const,
        label: 'Product Variation',
        description: 'Based on existing products',
        icon: Package,
        badge: 'NEW',
    },
    {
        id: 'visual-search' as const,
        label: 'Visual Search',
        description: 'Find with image',
        icon: ImageIcon,
        badge: 'NEW',
    },
];

export function ModeSelector({ activeMode, onChange }: ModeSelectorProps) {
    const selectorRef = useRef<HTMLDivElement>(null);
    const indicatorRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!selectorRef.current || !indicatorRef.current) return;

            const activeButton = selectorRef.current.querySelector(
                `[data-mode="${activeMode}"]`
            );

            if (activeButton) {
                const rect = activeButton.getBoundingClientRect();
                const container = selectorRef.current.getBoundingClientRect();

                gsap.to(indicatorRef.current, {
                    x: rect.left - container.left,
                    width: rect.width,
                    duration: 0.4,
                    ease: 'power3.out',
                });
            }
        },
        { dependencies: [activeMode], scope: selectorRef }
    );

    return (
        <div className="flex justify-center w-full mb-12">
            <div
                ref={selectorRef}
                className="relative bg-[var(--av-slate)] rounded-lg p-2 inline-flex flex-col md:flex-row gap-2"
            >
                {/* Animated Indicator */}
                <div
                    ref={indicatorRef}
                    className="absolute top-2 left-0 h-[calc(100%-16px)] bg-[var(--av-gold)] rounded-md opacity-20 hidden md:block"
                    style={{ pointerEvents: 'none' }}
                />

                {/* Mode Buttons */}
                {modes.map((mode) => {
                    const Icon = mode.icon;
                    const isActive = activeMode === mode.id;

                    return (
                        <button
                            key={mode.id}
                            data-mode={mode.id}
                            onClick={() => onChange(mode.id)}
                            className={cn(
                                'relative z-10 flex items-center gap-3 px-6 py-4 rounded-md transition-all duration-300 w-full md:w-auto text-left',
                                isActive
                                    ? 'text-[var(--av-gold)] bg-[var(--av-onyx)] md:bg-transparent'
                                    : 'text-[var(--av-silver)] hover:text-[var(--av-pearl)]'
                            )}
                        >
                            <Icon size={20} className={cn("transition-colors", isActive ? "text-[var(--av-gold)]" : "text-[var(--av-ash)]")} />
                            <div>
                                <div className="font-semibold text-sm flex items-center gap-2">
                                    {mode.label}
                                    {mode.badge && (
                                        <span className="text-[10px] px-2 py-0.5 bg-[var(--av-gold)] text-[var(--av-obsidian)] rounded-full font-bold">
                                            {mode.badge}
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs opacity-70 hidden sm:block">{mode.description}</div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
