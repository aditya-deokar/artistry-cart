'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { SectionContainer } from '../ui/SectionContainer';
import { ArrowLeft, ArrowRight, Quote, Star, User } from 'lucide-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

const stories = [
    {
        id: 1,
        customer: 'Sarah J.',
        role: 'Interior Designer',
        quote: "I had a vision for a specific live-edge coffee table but couldn't explain it to local carpenters. The AI visualization bridged that gap perfectly.",
        artisan: 'Woodland Crafts',
        value: 1200,
        timeline: '3 weeks',
        beforeImage: '/stories/table-concept.jpg',
        afterImage: '/stories/table-real.jpg',
        concept: 'Organic modern coffee table, walnut, live edge, matte black minimalist legs',
    },
    {
        id: 2,
        customer: 'Michael R.',
        role: 'Collector',
        quote: "The ability to iterate on the design with AI before commissioning the piece gave me total confidence. The final ring is exactly what I imagined.",
        artisan: 'Silver Moon Jewelers',
        value: 850,
        timeline: '2 weeks',
        beforeImage: '/stories/ring-concept.jpg',
        afterImage: '/stories/ring-real.jpg',
        concept: 'Oxidized silver signet ring, geometric texture, raw unpolished finish',
    },
    {
        id: 3,
        customer: 'Elena K.',
        role: 'Homeowner',
        quote: "We needed a custom ceramic set for our new kitchen. The AI helped us find the perfect glaze color and shape before the artisan even touched the clay.",
        artisan: 'Happy Earth Ceramics',
        value: 450,
        timeline: '4 weeks',
        beforeImage: '/stories/ceramics-concept.jpg',
        afterImage: '/stories/ceramics-real.jpg',
        concept: 'Speckled cream ceramic dinner set, organic uneven rims, stoneware',
    },
];

export function SuccessStories() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    const nextStory = () => {
        setDirection(1);
        setActiveIndex((prev) => (prev + 1) % stories.length);
    };

    const prevStory = () => {
        setDirection(-1);
        setActiveIndex((prev) => (prev - 1 + stories.length) % stories.length);
    };

    useGSAP(
        () => {
            // Header Animation
            if (headerRef.current) {
                gsap.fromTo(
                    headerRef.current,
                    { opacity: 0, y: 30 },
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

            // Content Transition Animation
            if (contentRef.current && sliderRef.current) {
                const tl = gsap.timeline();

                tl.fromTo(
                    [contentRef.current, sliderRef.current],
                    { opacity: 0, x: direction * 50 },
                    { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', clearProps: 'all' }
                );
            }
        },
        { dependencies: [activeIndex], scope: sectionRef }
    );

    const activeStory = stories[activeIndex];

    return (
        <SectionContainer
            ref={sectionRef}
            variant="gradient"
            maxWidth="xl"
            className="bg-gradient-to-b from-[#0D0D0D] via-[#151515] to-[#111]"
        >
            {/* Header */}
            <div ref={headerRef} className="text-center mb-16 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--av-gold)]/10 rounded-full mb-6 border border-[var(--av-gold)]/20 shadow-[0_0_15px_rgba(212,168,75,0.05)]">
                    <Star className="text-[var(--av-gold)]" size={16} fill="currentColor" />
                    <span className="text-sm font-semibold text-[var(--av-gold)] uppercase tracking-wide">
                        Success Stories
                    </span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-[var(--av-pearl)] mb-6 font-serif">
                    From <span className="text-[var(--av-gold)] italic">Concept</span> to Reality
                </h2>
                <p className="text-lg text-[var(--av-silver)] max-w-2xl mx-auto font-light">
                    See how our community transforms AI visualizations into tangible, handcrafted masterpieces.
                </p>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
                {/* Left: Content & Testimonial */}
                <div ref={contentRef} className="order-2 lg:order-1">
                    <div className="mb-8">
                        <Quote className="text-[var(--av-gold)] opacity-50 mb-6 scale-x-[-1]" size={48} />
                        <h3 className="text-2xl md:text-3xl font-light italic leading-relaxed text-[var(--av-pearl)] mb-8 font-serif">
                            "{activeStory.quote}"
                        </h3>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[var(--av-gold)]/20 flex items-center justify-center border border-[var(--av-gold)]/30 text-[var(--av-gold)]">
                                <User size={24} />
                            </div>
                            <div>
                                <div className="font-bold text-[var(--av-pearl)] text-lg">{activeStory.customer}</div>
                                <div className="text-[var(--av-silver)] text-sm">{activeStory.role}</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <div>
                            <div className="text-[var(--av-silver)] text-sm uppercase tracking-wider mb-1">
                                Artisan
                            </div>
                            <div className="text-[var(--av-gold)] font-semibold text-lg">
                                {activeStory.artisan}
                            </div>
                        </div>
                        <div>
                            <div className="text-[var(--av-silver)] text-sm uppercase tracking-wider mb-1">
                                Project Value
                            </div>
                            <div className="text-[var(--av-pearl)] font-semibold text-lg">
                                ${activeStory.value}
                            </div>
                        </div>
                        <div className="col-span-2 pt-4 border-t border-white/10">
                            <div className="text-[var(--av-silver)] text-sm uppercase tracking-wider mb-1">
                                Original Concept Prompt
                            </div>
                            <div className="text-[var(--av-pearl)] font-light italic text-sm opacity-80">
                                "{activeStory.concept}"
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center gap-4 mt-10">
                        <button
                            onClick={prevStory}
                            className="p-3 rounded-full border border-white/10 text-[var(--av-pearl)] hover:bg-[var(--av-gold)] hover:text-white hover:border-[var(--av-gold)] transition-all duration-300"
                            aria-label="Previous story"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div className="flex gap-2">
                            {stories.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        'w-2 h-2 rounded-full transition-all duration-300',
                                        idx === activeIndex ? 'w-8 bg-[var(--av-gold)]' : 'bg-white/20'
                                    )}
                                />
                            ))}
                        </div>
                        <button
                            onClick={nextStory}
                            className="p-3 rounded-full border border-white/10 text-[var(--av-pearl)] hover:bg-[var(--av-gold)] hover:text-white hover:border-[var(--av-gold)] transition-all duration-300"
                            aria-label="Next story"
                        >
                            <ArrowRight size={24} />
                        </button>
                    </div>
                </div>

                {/* Right: Before/After Slider */}
                <div ref={sliderRef} className="order-1 lg:order-2 h-[500px] w-full">
                    <BeforeAfterSlider
                        beforeImage={activeStory.beforeImage}
                        afterImage={activeStory.afterImage}
                        beforeLabel="AI Concept"
                        afterLabel="Final Product"
                    />
                </div>
            </div>
        </SectionContainer>
    );
}
