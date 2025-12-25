'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MoveHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeforeAfterSliderProps {
    beforeImage: string;
    afterImage: string;
    beforeLabel?: string;
    afterLabel?: string;
    className?: string;
}

export function BeforeAfterSlider({
    beforeImage,
    afterImage,
    beforeLabel = 'Before',
    afterLabel = 'After',
    className,
}: BeforeAfterSliderProps) {
    const [isResizing, setIsResizing] = useState(false);
    const [position, setPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = useCallback(
        (clientX: number) => {
            if (!containerRef.current) return;

            const { left, width } = containerRef.current.getBoundingClientRect();
            const x = clientX - left;
            const newPosition = Math.max(0, Math.min(100, (x / width) * 100));

            setPosition(newPosition);
        },
        []
    );

    const onMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isResizing) return;
            handleMove(e.clientX);
        },
        [isResizing, handleMove]
    );

    const onTouchMove = useCallback(
        (e: TouchEvent) => {
            if (!isResizing) return;
            handleMove(e.touches[0].clientX);
        },
        [isResizing, handleMove]
    );

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', stopResizing);
            window.addEventListener('touchmove', onTouchMove);
            window.addEventListener('touchend', stopResizing);
        }

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', stopResizing);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', stopResizing);
        };
    }, [isResizing, onMouseMove, onTouchMove, stopResizing]);

    const handleMouseDown = () => setIsResizing(true);
    const handleTouchStart = () => setIsResizing(true);

    // Mock colors for placeholder images since real images aren't available yet
    // Using gradients to simulate content
    const beforeGradient = 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)';
    const afterGradient = 'linear-gradient(135deg, #2A2A2A 0%, #3D3D3D 100%)';

    return (
        <div
            ref={containerRef}
            className={cn(
                'relative w-full h-full overflow-hidden select-none rounded-2xl shadow-2xl border border-white/10 bg-[#0D0D0D]',
                className
            )}
        >
            {/* After Image (Right side / Background) */}
            <div className="absolute inset-0 w-full h-full">
                <div
                    className="w-full h-full object-cover flex items-center justify-center bg-[#151515]"
                    style={{ background: afterGradient }}
                >
                    {/* Placeholder visual */}
                    <div className="text-8xl opacity-30 select-none pointer-events-none filter blur-sm">✨</div>
                    <div className="absolute bottom-6 right-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-lg text-white font-medium text-sm border border-white/10 shadow-lg">
                        {afterLabel}
                    </div>
                </div>
            </div>

            {/* Before Image (Left side / Clipped) */}
            <div
                className="absolute inset-0 h-full overflow-hidden"
                style={{ width: `${position}%` }}
            >
                <div
                    className="absolute inset-0 w-full h-full object-cover flex items-center justify-center bg-[#0A0A0A]"
                    // We need to set the width of the inner image to 100% of the CONTAINER to prevent squishing
                    // This is tricky with CSS only, usually requires absolute positioning relative to container dimensions
                    // For simplicity in this mock, we use a wide width
                    style={{ width: '100vw', maxWidth: '1280px', background: beforeGradient }}
                >
                    {/* Placeholder visual */}
                    <div className="text-8xl opacity-30 select-none pointer-events-none filter blur-sm grayscale">🤖</div>
                </div>

                <div className="absolute bottom-6 left-6 px-4 py-2 bg-[var(--av-gold)]/90 backdrop-blur-md rounded-lg text-white font-medium text-sm border border-white/10 shadow-lg">
                    {beforeLabel}
                </div>
            </div>

            {/* Slider Handl */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                style={{ left: `${position}%` }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-[var(--av-obsidian)] border-4 border-[var(--av-gold)]">
                    <MoveHorizontal size={20} />
                </div>
            </div>

            {/* Hint overlay - fades out on interaction */}
            <div
                className={cn(
                    "absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-500",
                    isResizing ? "opacity-0" : "opacity-80"
                )}
            >
                <div className="px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs text-white/80 border border-white/10">
                    Drag to compare
                </div>
            </div>
        </div>
    );
}
