'use client';

import { useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { SectionContainer } from '../ui/SectionContainer';
import { ExampleUploads } from './ExampleUploads';
import { ResultsPreview } from './ResultsPreview';
import { UseCaseExamples } from './UseCaseExamples';
import { Search, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function VisualSearchShowcase() {
    const [selectedExample, setSelectedExample] = useState<string | null>(null);
    const [showResults, setShowResults] = useState(false);

    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const leftRef = useRef<HTMLDivElement>(null);
    const rightRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!sectionRef.current) return;

            // Header animation
            if (headerRef.current) {
                gsap.fromTo(
                    headerRef.current,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: sectionRef.current,
                            start: 'top 80%',
                        },
                    }
                );
            }

            // Parallax split screen effect
            gsap.fromTo(
                leftRef.current,
                { opacity: 0, x: -60 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 70%',
                    },
                }
            );

            gsap.fromTo(
                rightRef.current,
                { opacity: 0, x: 60 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 1,
                    delay: 0.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 70%',
                    },
                }
            );
        },
        { scope: sectionRef }
    );

    const handleExampleSelect = (exampleId: string) => {
        setSelectedExample(exampleId);

        // Simulate search
        setTimeout(() => {
            setShowResults(true);
        }, 100);
    };

    return (
        <SectionContainer
            ref={sectionRef}
            variant="gradient"
            maxWidth="xl"
            className="relative overflow-hidden"
        >
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 -left-40 w-96 h-96 bg-[var(--av-gold)]/10 rounded-full blur-3xl opacity-30" />
                <div className="absolute bottom-20 -right-40 w-96 h-96 bg-[var(--av-gold)]/5 rounded-full blur-3xl opacity-30" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-[var(--av-gold)]/5 to-transparent rounded-full opacity-20" />

                {/* Subtle grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            {/* Header */}
            <div ref={headerRef} className="text-center mb-16 relative z-10">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1F1F1F]/80 backdrop-blur-md rounded-full mb-6 border border-[var(--av-gold)]/20 shadow-[0_0_15px_rgba(212,168,75,0.1)]">
                    <Search className="text-[var(--av-gold)]" size={18} />
                    <span className="text-sm font-semibold text-[var(--av-gold)] uppercase tracking-wide">
                        Visual Search Technology
                    </span>
                    <Zap className="text-[var(--av-gold)]" size={16} />
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-[var(--av-pearl)] mb-5 leading-tight font-serif">
                    Found Something You <span className="text-[var(--av-gold)] italic">Love</span> Elsewhere?
                </h2>
                <p className="text-lg text-[var(--av-silver)] max-w-2xl mx-auto leading-relaxed font-light">
                    Upload a photo of any piece you admire. Our AI will search our artisan catalog
                    for matches or help you create a custom version.
                </p>
            </div>

            {/* Split Screen Demo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16 relative z-10">
                {/* Left: Example Uploads */}
                <div ref={leftRef}>
                    <ExampleUploads
                        onSelect={handleExampleSelect}
                        selectedExample={selectedExample}
                    />
                </div>

                {/* Right: Results Preview */}
                <div ref={rightRef}>
                    <ResultsPreview
                        show={showResults}
                        exampleId={selectedExample}
                    />
                </div>
            </div>

            {/* Connection line between left and right */}
            {showResults && (
                <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
                    <svg className="w-24 h-4" viewBox="0 0 96 16" fill="none">
                        <path
                            d="M0 8 H40 L48 4 L56 12 L64 4 L72 12 L80 8 H96"
                            stroke="url(#gradient)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className="animate-pulse"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="var(--av-gold)" stopOpacity="0.3" />
                                <stop offset="50%" stopColor="var(--av-gold)" stopOpacity="1" />
                                <stop offset="100%" stopColor="var(--av-gold)" stopOpacity="0.3" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            )}

            {/* Use Case Examples */}
            <div className="relative z-10">
                <UseCaseExamples />
            </div>
        </SectionContainer>
    );
}
