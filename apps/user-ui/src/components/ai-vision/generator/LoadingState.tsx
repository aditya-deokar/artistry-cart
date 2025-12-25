'use client';

import { Loader2 } from 'lucide-react';

export function LoadingState() {
    return (
        <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-[var(--av-gold)]/20 blur-xl rounded-full animate-pulse" />
                <Loader2 className="relative z-10 text-[var(--av-gold)] animate-spin" size={48} />
            </div>

            <h3 className="text-xl font-semibold text-[var(--av-pearl)] mb-2 animate-pulse">
                Generating Your Vision...
            </h3>
            <p className="text-[var(--av-silver)] max-w-sm">
                Our AI is analyzing your request, understanding the style, and creating unique concepts just for you.
            </p>
        </div>
    );
}
