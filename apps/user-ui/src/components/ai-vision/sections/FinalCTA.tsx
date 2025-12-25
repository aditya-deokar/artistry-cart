'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { SectionContainer } from '../ui/SectionContainer';
import { PremiumButton } from '../ui/PremiumButton';

export function FinalCTA() {
    const containerRef = useRef<HTMLElement>(null);
    const spotlightRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    // Mock images for the background collage
    // Using colored rectangles for placeholders to simulate "Art"
    const gridItems = Array.from({ length: 40 });

    useGSAP(() => {
        // 1. Interactive Spotlight
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current || !spotlightRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            gsap.to(spotlightRef.current, {
                background: `radial-gradient(600px circle at ${x}px ${y}px, rgba(212,168,75,0.15), transparent 40%)`,
                duration: 0.2
            });

            // Subtle parallax for grid
            const xPercent = (x / rect.width - 0.5) * 2; // -1 to 1
            const yPercent = (y / rect.height - 0.5) * 2;

            gsap.to(gridRef.current, {
                x: -xPercent * 20,
                y: -yPercent * 20,
                duration: 1,
                ease: 'power2.out'
            });
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('mousemove', handleMouseMove);
        }

        // 2. Initial Intro Animation
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 70%',
            }
        });

        tl.from(".cta-title-word", {
            y: 100,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            ease: 'power4.out'
        });

        tl.from(".cta-content", {
            opacity: 0,
            y: 20,
            duration: 0.8
        }, "-=0.5");

        return () => {
            container?.removeEventListener('mousemove', handleMouseMove);
        };
    }, { scope: containerRef });

    return (
        <SectionContainer
            ref={containerRef}
            variant="dark"
            className="relative min-h-[80vh] flex items-center justify-center overflow-hidden border-t border-white/5 bg-black"
        >
            {/* Background Grid (The "Vision") */}
            <div
                ref={gridRef}
                className="absolute inset-[-10%] w-[120%] h-[120%] grid grid-cols-6 md:grid-cols-8 gap-4 opacity-20 transform -rotate-6 scale-105 pointer-events-none"
            >
                {gridItems.map((_, i) => (
                    <div
                        key={i}
                        className="bg-white/5 rounded-lg w-full h-32 backdrop-blur-sm border border-white/5"
                        style={{
                            translate: `${Math.random() * 20}px ${Math.random() * 20}px` // Random offset for organic feel
                        }}
                    >
                        {/* Abstract Shapes inside */}
                        <div className="w-full h-full opacity-30 bg-gradient-to-br from-transparent to-white/10" />
                    </div>
                ))}
            </div>

            {/* Dark Overlay Vignette */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-0 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-0 pointer-events-none" />

            {/* Interactive Spotlight Layer */}
            <div
                ref={spotlightRef}
                className="absolute inset-0 z-0 pointer-events-none transition-colors duration-0"
                style={{
                    background: 'radial-gradient(600px circle at 50% 50%, rgba(212,168,75,0.1), transparent 40%)'
                }}
            />

            {/* Main Content Card */}
            <div className="relative z-10 max-w-5xl px-6 w-full">
                <div className="flex flex-col items-center text-center">

                    {/* Floating Label */}
                    <div className="cta-content mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--av-gold)]/30 bg-[var(--av-gold)]/5 backdrop-blur-md shadow-[0_0_20px_rgba(212,168,75,0.1)]">
                        <Sparkles size={12} className="text-[var(--av-gold)] animate-pulse" />
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--av-gold)] font-bold">The Studio is Open</span>
                    </div>

                    {/* Masked/Clipped Text Effect */}
                    <h2 className="text-6xl md:text-9xl font-bold font-serif leading-[0.85] tracking-tight mb-8 text-white mix-blend-overlay opacity-90 w-full flex flex-col items-center">
                        <span className="cta-title-word block text-center">CREATE</span>
                        <span className="cta-title-word block italic text-transparent bg-clip-text bg-gradient-to-r from-[var(--av-gold)] via-[#fff0b3] to-[var(--av-gold)] opacity-100 mix-blend-normal text-center">
                            WITHOUT
                        </span>
                        <span className="cta-title-word block text-center">LIMITS</span>
                    </h2>

                    <p className="cta-content text-lg md:text-xl text-[var(--av-silver)] max-w-xl mb-12 font-light leading-relaxed text-center">
                        From a fleeting thought to a physical masterpiece. <br />
                        <span className="text-white font-medium">Your journey begins with a single prompt.</span>
                    </p>

                    <div className="cta-content flex flex-col md:flex-row gap-6 w-full max-w-md">
                        <PremiumButton
                            variant="primary"
                            size="lg"
                            glow
                            className="w-full justify-center py-6 text-lg tracking-widest uppercase font-bold group"
                        >
                            Enter Studio <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </PremiumButton>
                        <PremiumButton
                            variant="secondary"
                            size="lg"
                            className="w-full justify-center py-6 text-lg tracking-widest uppercase font-bold hover:bg-white/5"
                        >
                            Explore
                        </PremiumButton>
                    </div>

                    <div className="cta-content mt-16 flex items-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Trust badges / small logos */}
                        <div className="h-8 w-24 bg-white/10 rounded" />
                        <div className="h-8 w-24 bg-white/10 rounded" />
                        <div className="h-8 w-24 bg-white/10 rounded" />
                    </div>
                </div>
            </div>

            {/* Decorative 'corner' lines */}
            <div className="absolute top-10 left-10 w-32 h-32 border-l border-t border-white/10 rounded-tl-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-32 h-32 border-r border-b border-white/10 rounded-br-3xl pointer-events-none" />

        </SectionContainer>
    );
}
