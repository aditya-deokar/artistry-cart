'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { SectionContainer } from '../ui/SectionContainer';
import { Brain, Search, Users, Sparkles } from 'lucide-react';

export function ArtisanMatchingFlow() {
    const containerRef = useRef<HTMLElement>(null);
    const stepsRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!stepsRef.current || !lineRef.current) return;

            const steps = stepsRef.current.children;
            // Get the connector lines (odd indices in the flex container if we insert them between steps)
            // or simpler: just animate the main progress line.

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 60%',
                    toggleActions: 'play none none reverse'
                },
            });

            // 1. Animate Line growing across
            tl.fromTo(
                lineRef.current,
                { scaleX: 0, transformOrigin: 'left center' },
                { scaleX: 1, duration: 1.5, ease: 'power2.inOut' }
            );

            // 2. Stagger in steps as the line passes them (simulated timing)
            tl.fromTo(
                steps,
                { scale: 0.8, opacity: 0, y: 20 },
                {
                    scale: 1,
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.4, // Sync roughly with line duration
                    ease: 'back.out(1.7)',
                },
                '<0.1' // Start shortly after line starts
            );

            // 3. Pulse the icons after they appear
            tl.to(
                '.step-icon-glow',
                { opacity: 0.5, scale: 1.5, duration: 0.5, yoyo: true, repeat: 1, stagger: 0.4 },
                '<0.5'
            );
        },
        { scope: containerRef }
    );

    const steps = [
        {
            icon: Brain,
            title: 'AI Analysis',
            description: 'Analyzing concept...',
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20',
            glow: 'shadow-purple-500/50'
        },
        {
            icon: Users,
            title: 'Matching',
            description: 'Finding artisans...',
            color: 'text-[var(--av-gold)]',
            bg: 'bg-[var(--av-gold)]/10',
            border: 'border-[var(--av-gold)]/20',
            glow: 'shadow-[var(--av-gold)]/50'
        },
        {
            icon: Sparkles,
            title: 'Collaboration',
            description: 'Connection made!',
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            glow: 'shadow-emerald-500/50'
        },
    ];

    return (
        <SectionContainer
            ref={containerRef}
            variant="dark"
            className="bg-[#0A0A0A] border-t border-white/5 relative overflow-hidden py-24"
        >
            {/* Background Ambience */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[500px] bg-gradient-to-r from-purple-900/10 via-[var(--av-gold)]/5 to-emerald-900/10 blur-[100px] pointer-events-none" />

            <div className="text-center mb-20 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--av-gold)]/10 rounded-full mb-6 border border-[var(--av-gold)]/20 text-[var(--av-gold)]">
                    <Search size={16} />
                    <span className="text-sm font-bold uppercase tracking-widest">
                        Intelligent Matching
                    </span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-[var(--av-pearl)] mb-6 font-serif leading-tight">
                    From Concept to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--av-gold)] to-[#FBF5D4]">Craftsman</span>
                </h2>
                <p className="text-[var(--av-silver)] max-w-2xl mx-auto text-lg">
                    Watch our AI instantly analyze your vision and connect you with the perfect maker.
                </p>
            </div>

            <div className="relative max-w-5xl mx-auto px-4">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-1/2 left-10 right-10 h-0.5 bg-[#222] -translate-y-full z-0">
                    <div ref={lineRef} className="h-full w-full bg-gradient-to-r from-purple-500 via-[var(--av-gold)] to-emerald-500 shadow-[0_0_20px_rgba(212,168,75,0.5)] origin-left scale-x-0" />
                </div>

                <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative z-10">
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center text-center group cursor-default">
                            {/* Icon Circle */}
                            <div className={`
                   relative w-24 h-24 rounded-full flex items-center justify-center mb-6 
                   bg-[#0E0E0E] border-2 ${step.border} z-10
                   group-hover:scale-110 transition-transform duration-500 ease-out
                `}>
                                {/* Inner Glow */}
                                <div className={`step-icon-glow absolute inset-0 rounded-full opacity-0 ${step.bg} blur-md`} />

                                <step.icon className={`${step.color} relative z-10 drop-shadow-lg`} size={40} strokeWidth={1.5} />

                                {/* Orbit Ring */}
                                <div className={`
                      absolute inset-0 rounded-full border border-dashed ${step.border} opacity-30
                      animate-[spin_10s_linear_infinite] group-hover:animate-[spin_3s_linear_infinite]
                   `} />
                            </div>

                            <div className="bg-[#111]/80 backdrop-blur-sm p-6 rounded-2xl border border-white/5 w-full hover:border-[var(--av-gold)]/20 transition-colors duration-300">
                                <h3 className={`text-xl font-bold ${step.color} mb-2`}>{step.title}</h3>
                                <p className="text-[var(--av-silver)] font-light">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </SectionContainer>
    );
}
