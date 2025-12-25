'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { AnimatedBadge } from '../ui/AnimatedBadge';
import { PremiumButton } from '../ui/PremiumButton';
import { HeroDemo } from './HeroDemo';
import { ScrollIndicator } from './ScrollIndicator';
import { ArrowRight } from 'lucide-react';

export function AIVisionHero() {
    const heroRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const demoRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            // Animate content from left
            tl.fromTo(
                contentRef.current,
                { opacity: 0, x: -60 },
                { opacity: 1, x: 0, duration: 1 },
                0
            );

            // Animate demo from right with delay
            tl.fromTo(
                demoRef.current,
                { opacity: 0, x: 60, scale: 0.95 },
                { opacity: 1, x: 0, scale: 1, duration: 1 },
                0.2
            );

            // Animate stats with count-up effect
            tl.fromTo(
                statsRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.8 },
                0.6
            );

            // Count-up animation for stats
            const statNumbers = statsRef.current?.querySelectorAll('[data-count]');
            statNumbers?.forEach((stat) => {
                const target = parseInt(stat.getAttribute('data-count') || '0');
                gsap.to(stat, {
                    textContent: target,
                    duration: 2,
                    ease: 'power1.out',
                    snap: { textContent: 1 },
                    delay: 0.8,
                });
            });
        },
        { scope: heroRef }
    );

    return (
        <section
            ref={heroRef}
            className="relative min-h-screen flex items-center bg-gradient-to-br from-[var(--av-obsidian)] via-[var(--av-onyx)] to-[var(--av-obsidian)] overflow-hidden"
        >
            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Gradient Glow */}
                <div
                    className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full opacity-20"
                    style={{
                        background:
                            'radial-gradient(circle, rgba(212,168,75,0.4) 0%, rgba(212,168,75,0.1) 40%, transparent 70%)',
                        filter: 'blur(40px)',
                    }}
                />

                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
            `,
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-20 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left Content */}
                    <div ref={contentRef}>
                        <AnimatedBadge className="mb-8">AI-Powered Custom Creation</AnimatedBadge>

                        <h1 className="text-hero text-[var(--av-pearl)] mb-6">
                            Imagine It. <br />
                            We'll Help <br />
                            <span className="text-[var(--av-gold)]">Create It.</span>
                        </h1>

                        <p className="text-body-lg text-[var(--av-silver)] mb-10 max-w-xl">
                            Describe your vision in words. See it visualized by AI. Connect
                            with artisans who bring it to life.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <PremiumButton
                                variant="primary"
                                size="lg"
                                glow
                                icon={<ArrowRight size={20} />}
                                iconPosition="right"
                            >
                                Explore Collection
                            </PremiumButton>

                            <PremiumButton variant="secondary" size="lg">
                                Create Your Vision
                            </PremiumButton>
                        </div>

                        {/* Stats */}
                        <div
                            ref={statsRef}
                            className="flex flex-wrap gap-8 text-[var(--av-silver)]"
                        >
                            <div>
                                <div className="text-2xl font-bold text-[var(--av-gold)]">
                                    <span data-count="10000">0</span>+
                                </div>
                                <div className="text-sm">Concepts Created</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-[var(--av-gold)]">
                                    <span data-count="2500">0</span>+
                                </div>
                                <div className="text-sm">Realized Projects</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-[var(--av-gold)]">
                                    <span data-count="500">0</span>+
                                </div>
                                <div className="text-sm">Artisans Ready</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Demo */}
                    <div ref={demoRef}>
                        <HeroDemo />
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <ScrollIndicator />
        </section>
    );
}
