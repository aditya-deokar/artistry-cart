'use client';

import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedBadgeProps extends HTMLAttributes<HTMLDivElement> {
    pulse?: boolean;
    glow?: boolean;
}

export function AnimatedBadge({
    pulse = true,
    glow = true,
    className,
    children,
    ...props
}: AnimatedBadgeProps) {
    return (
        <div
            className={cn(
                'inline-flex items-center gap-3 px-5 py-2.5 rounded-full',
                'bg-[var(--av-gold)]/10 border border-[var(--av-gold)]/30',
                'backdrop-blur-sm',
                className
            )}
            {...props}
        >
            {pulse && (
                <div className="relative flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[var(--av-gold)]" />
                    <div className="absolute inset-0 w-2 h-2 rounded-full bg-[var(--av-gold)] animate-ping" />
                </div>
            )}
            <span className="text-xs tracking-[0.2em] uppercase text-[var(--av-gold)] font-semibold">
                {children}
            </span>
        </div>
    );
}
