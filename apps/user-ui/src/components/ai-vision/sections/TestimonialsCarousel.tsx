'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Star, Quote } from 'lucide-react';
import { SectionContainer } from '../ui/SectionContainer';

export function TestimonialsCarousel() {
    const containerRef = useRef<HTMLElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    const testimonials = [
        {
            name: "Sarah Jenkins",
            role: "Interior Designer",
            quote: "I found the perfect artisan to build a custom reclaimed wood table that fit my client's awkward dining space perfectly. The 3D preview made them confident in the purchase.",
            rating: 5,
            image: "👩‍💼"
        },
        {
            name: "Marcus Cole",
            role: "Collector",
            quote: "The ability to visualize a concept before commissioning it is a game changer. I worked with a metalworker in Japan to create a katana stand that matches my collection.",
            rating: 5,
            image: "👨‍⚖️"
        },
        {
            name: "Elena Rodriguez",
            role: "Homeowner",
            quote: "I had a vague idea for a stained glass window. The AI generator solidified it, and the matching system connected me with a local artist who brought it to life.",
            rating: 5,
            image: "👩‍🎨"
        },
        {
            name: "David Chen",
            role: "Architect",
            quote: "We use this tool to mock up bespoke fixtures for our luxury residential projects. It speeds up the client approval process by weeks.",
            rating: 5,
            image: "👷"
        }
    ];

    // Infinite Scroll Animation
    useGSAP(() => {
        if (!trackRef.current) return;

        const track = trackRef.current;

        // Clone items for seamless loop
        // But for a simple marquee, we can just animate x percent

        gsap.to(track, {
            x: '-50%',
            duration: 30,
            ease: 'none',
            repeat: -1
        });

    }, { scope: containerRef });

    return (
        <SectionContainer
            ref={containerRef}
            variant="dark"
            className="bg-[#050505] overflow-hidden py-24 border-t border-white/5"
        >
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--av-gold)]/10 rounded-full mb-6 border border-[var(--av-gold)]/20">
                    <Star size={14} className="text-[var(--av-gold)] fill-[var(--av-gold)]" />
                    <span className="text-xs font-semibold text-[var(--av-gold)] uppercase tracking-wide">
                        Success Stories
                    </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-[var(--av-pearl)] mb-6 font-serif">
                    Trusted by <span className="text-[var(--av-gold)]">Visionaries</span>
                </h2>
            </div>

            {/* Carousel Track */}
            <div className="relative w-full max-w-[100vw] overflow-hidden">
                {/* Gradients to fade edges */}
                <div className="absolute top-0 left-0 h-full w-20 md:w-40 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
                <div className="absolute top-0 right-0 h-full w-20 md:w-40 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />

                <div ref={trackRef} className="flex gap-6 w-max pl-6">
                    {/* Double the list for infinite loop */}
                    {[...testimonials, ...testimonials].map((t, i) => (
                        <div
                            key={i}
                            className="w-[300px] md:w-[400px] bg-[#111] p-8 rounded-2xl border border-white/5 relative flex-shrink-0 group hover:border-[var(--av-gold)]/30 transition-colors"
                        >
                            <Quote size={40} className="absolute top-6 right-6 text-white/5 group-hover:text-[var(--av-gold)]/10 transition-colors" />

                            <div className="flex gap-1 mb-4">
                                {Array.from({ length: t.rating }).map((_, i) => (
                                    <Star key={i} size={14} className="fill-[var(--av-gold)] text-[var(--av-gold)]" />
                                ))}
                            </div>

                            <p className="text-[var(--av-silver)] mb-6 leading-relaxed italic relative z-10">
                                "{t.quote}"
                            </p>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
                                    {t.image}
                                </div>
                                <div>
                                    <h4 className="font-bold text-[var(--av-pearl)] text-sm">{t.name}</h4>
                                    <p className="text-xs text-[var(--av-ash)] uppercase tracking-wide">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </SectionContainer>
    );
}
