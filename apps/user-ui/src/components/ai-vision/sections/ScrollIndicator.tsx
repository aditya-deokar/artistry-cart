'use client';

export function ScrollIndicator() {
    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-xs text-[var(--av-silver)] uppercase tracking-wider">
                Scroll to Explore
            </span>
            <svg
                className="w-6 h-6 text-[var(--av-gold)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
            </svg>
        </div>
    );
}
