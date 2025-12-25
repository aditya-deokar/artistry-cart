'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { CheckCircle, Circle, Package, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProjectTimeline() {
    const containerRef = useRef<HTMLDivElement>(null);
    const lineContainerRef = useRef<HTMLDivElement>(null);
    const fillLineRef = useRef<HTMLDivElement>(null);
    const stepsRef = useRef<HTMLDivElement>(null);

    const timelineSteps = [
        {
            status: 'completed',
            title: 'Concept Approved',
            date: 'Oct 12',
            description: 'Artisan confirmed the design and materials.',
            icon: CheckCircle
        },
        {
            status: 'completed',
            title: 'Deposit Paid',
            date: 'Oct 13',
            description: '50% deposit secured to start work.',
            icon: CheckCircle
        },
        {
            status: 'current',
            title: 'Material Sourcing',
            date: 'In Progress',
            description: 'Sourcing the perfect walnut slab.',
            icon: Package
        },
        {
            status: 'upcoming',
            title: 'Crafting',
            description: 'Woodworking and joinery process.',
            icon: PenTool
        },
        {
            status: 'upcoming',
            title: 'Final Reveal',
            description: 'High-res photos and shipping.',
            icon: Circle
        },
    ];

    useGSAP(
        () => {
            if (!stepsRef.current || !fillLineRef.current) return;

            const steps = stepsRef.current.children; // Get step elements

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 80%', // Start earlier
                    end: 'bottom 60%',
                    scrub: 1.5, // Smooth scrubbing
                }
            });

            // 1. Initial State: Set line to 0
            tl.set(fillLineRef.current, { height: '0%' });

            // 2. Animate Fill Line Drawing Down
            // We want it to fill up to the "current" step (roughly 60%)
            tl.to(
                fillLineRef.current,
                {
                    height: '60%',
                    ease: 'power1.inOut',
                    duration: 2
                },
                0
            );

            // 3. Macro Interaction: Activate steps as the line passes them
            // We iterate through steps and "light them up" sequentially
            Array.from(steps).forEach((step, i) => {
                // Skip upcoming steps for activation logic if we only want up to current
                if (i > 2) return;

                const dot = step.querySelector('.timeline-dot');
                const text = step.querySelector('.timeline-content');

                // Calculate relative start time based on index
                const startTime = i * 0.6;

                tl.to(dot, {
                    scale: 1.3,
                    backgroundColor: 'var(--av-gold)',
                    borderColor: '#111',
                    color: '#000',
                    duration: 0.4,
                    ease: 'back.out(2)'
                }, startTime);

                tl.to(dot, {
                    scale: 1, // Settle back down
                    duration: 0.3
                }, startTime + 0.4);

                tl.fromTo(text,
                    { opacity: 0.5, x: -10 },
                    { opacity: 1, x: 0, duration: 0.5 },
                    startTime
                );
            });

            // Pulse the current step continuously separate from scroll
            gsap.to('.current-step-dot', {
                boxShadow: '0 0 20px rgba(212,168,75,0.6)',
                scale: 1.15,
                duration: 1.5,
                yoyo: true,
                repeat: -1,
                ease: 'sine.inOut'
            });

        },
        { scope: containerRef }
    );

    return (
        <div ref={containerRef} className="relative pl-8 h-full">
            {/* Background Trace Line */}
            <div
                ref={lineContainerRef}
                className="absolute left-4 top-4 bottom-6 w-0.5 bg-white/5 origin-top"
            />

            {/* Animated Fill Line (Golden) */}
            <div
                ref={fillLineRef}
                className="absolute left-4 top-4 w-0.5 bg-gradient-to-b from-[var(--av-gold)] to-[var(--av-gold-dark)] origin-top shadow-[0_0_15px_rgba(212,168,75,0.5)] z-0 rounded-full"
            />

            <div ref={stepsRef} className="space-y-10 relative z-10 pt-2">
                {timelineSteps.map((step, index) => (
                    <div key={index} className="relative group">
                        {/* Dot / Icon */}
                        <div
                            className={cn(
                                "timeline-dot absolute -left-[32px] w-8 h-8 rounded-full border-4 flex items-center justify-center z-10 transition-colors duration-300",
                                step.status === 'completed' ? "bg-[#111] border-[var(--av-gold)] text-[var(--av-gold)]" :
                                    step.status === 'current' ? "current-step-dot bg-[#111] border-[var(--av-gold)] text-[var(--av-gold)] shadow-[0_0_15px_rgba(212,168,75,0.4)]" :
                                        "bg-[#111] border-white/10 text-white/20"
                            )}
                        >
                            <step.icon size={14} className={step.status === 'current' ? 'animate-pulse-slow' : ''} />
                        </div>

                        {/* Content */}
                        <div className={cn(
                            "timeline-content transition-all duration-300",
                            step.status === 'upcoming' ? "opacity-40 blur-[0.5px] group-hover:opacity-80 group-hover:blur-0" : "opacity-100"
                        )}>
                            <div className="flex items-center justify-between mb-1">
                                <h4 className={cn(
                                    "font-bold text-sm",
                                    step.status === 'upcoming' ? "text-[var(--av-silver)]" : "text-[var(--av-pearl)]"
                                )}>
                                    {step.title}
                                </h4>
                                {step.date && <span className="text-[10px] uppercase tracking-wider text-[var(--av-gold)] font-mono bg-[var(--av-gold)]/10 px-1.5 py-0.5 rounded border border-[var(--av-gold)]/10">{step.date}</span>}
                            </div>
                            <p className="text-xs text-[var(--av-silver)] leading-relaxed font-light">
                                {step.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
