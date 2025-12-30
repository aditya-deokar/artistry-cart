'use client';

import { Loader2, Sparkles, Wand2, Palette, Lightbulb } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LoadingStateProps {
    progress?: number;
}

const loadingStages = [
    { icon: Lightbulb, message: 'Analyzing your request...' },
    { icon: Palette, message: 'Understanding style preferences...' },
    { icon: Wand2, message: 'Generating unique concepts...' },
    { icon: Sparkles, message: 'Adding finishing touches...' },
];

export function LoadingState({ progress = 0 }: LoadingStateProps) {
    const [currentStage, setCurrentStage] = useState(0);

    // Update stage based on progress
    useEffect(() => {
        if (progress < 25) {
            setCurrentStage(0);
        } else if (progress < 50) {
            setCurrentStage(1);
        } else if (progress < 75) {
            setCurrentStage(2);
        } else {
            setCurrentStage(3);
        }
    }, [progress]);

    const CurrentIcon = loadingStages[currentStage].icon;

    return (
        <div className="py-20 flex flex-col items-center justify-center text-center">
            {/* Animated Icon Container */}
            <div className="relative mb-8">
                {/* Outer glow ring */}
                <div className="absolute inset-0 bg-[var(--av-gold)]/20 blur-2xl rounded-full animate-pulse scale-150" />

                {/* Progress ring */}
                <svg className="relative z-10 w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="var(--av-silver)"
                        strokeWidth="4"
                        strokeOpacity="0.2"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="var(--av-gold)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                        className="transition-all duration-500 ease-out"
                    />
                </svg>

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <CurrentIcon
                        className="text-[var(--av-gold)] animate-pulse"
                        size={32}
                    />
                </div>
            </div>

            {/* Progress Text */}
            <div className="mb-4 text-[var(--av-gold)] font-mono text-sm">
                {progress}%
            </div>

            {/* Stage Message */}
            <h3 className="text-xl font-semibold text-[var(--av-pearl)] mb-2 animate-pulse">
                {loadingStages[currentStage].message}
            </h3>

            <p className="text-[var(--av-silver)] max-w-sm">
                Our AI is creating unique concepts just for you. This typically takes 10-15 seconds.
            </p>

            {/* Stage Indicators */}
            <div className="flex gap-2 mt-8">
                {loadingStages.map((stage, index) => (
                    <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index <= currentStage
                                ? 'bg-[var(--av-gold)]'
                                : 'bg-[var(--av-silver)]/30'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
