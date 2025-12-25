'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Camera, Image, Lightbulb, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

const useCases = [
    {
        id: 'inspiration',
        icon: Image,
        title: 'Found on Pinterest?',
        description: 'Upload that inspiring image and find similar handcrafted pieces in our marketplace.',
        example: 'Spotted a unique lamp in a magazine? Find artisan-made alternatives.',
        color: 'from-pink-500 to-rose-600',
        bgColor: 'bg-pink-50',
    },
    {
        id: 'photo',
        icon: Camera,
        title: 'Snap a Photo',
        description: 'See something at a friend\'s house? Take a picture and discover similar pieces.',
        example: 'Loved their hand-woven rug? Find your own version.',
        color: 'from-blue-500 to-indigo-600',
        bgColor: 'bg-blue-50',
    },
    {
        id: 'imagine',
        icon: Lightbulb,
        title: 'Imagine Something New',
        description: 'Have a sketch or mockup? Upload it and let AI generate realistic concepts.',
        example: 'Sketched a custom shelf design? See it visualized in 3D.',
        color: 'from-amber-500 to-orange-600',
        bgColor: 'bg-amber-50',
    },
];

export function UseCaseExamples() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;

            const cards = containerRef.current.querySelectorAll('.use-case-card');

            gsap.fromTo(
                cards,
                { opacity: 0, y: 40, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.15,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top 85%',
                    },
                }
            );
        },
        { scope: containerRef }
    );

    return (
        <div ref={containerRef} className="mt-16">
            <div className="text-center mb-10">
                <h3 className="text-2xl font-bold text-[var(--av-pearl)] mb-3 font-serif">
                    Real Use Cases
                </h3>
                <p className="text-[var(--av-silver)] max-w-2xl mx-auto font-light">
                    See how others are using Visual Search to discover unique handcrafted pieces
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {useCases.map((useCase) => {
                    const Icon = useCase.icon;

                    return (
                        <div
                            key={useCase.id}
                            className={cn(
                                'use-case-card group relative rounded-2xl p-6 transition-all duration-300',
                                'bg-white/5 border border-white/10 backdrop-blur-sm',
                                'hover:shadow-2xl hover:shadow-[var(--av-gold)]/10 hover:-translate-y-1 hover:border-[var(--av-gold)]/30 cursor-pointer overflow-hidden'
                            )}
                        >
                            {/* Icon */}
                            <div className={cn(
                                'w-14 h-14 rounded-xl flex items-center justify-center mb-5',
                                'bg-gradient-to-br shadow-lg',
                                useCase.color
                            )}>
                                <Icon size={26} className="text-white" />
                            </div>

                            {/* Title */}
                            <h4 className="text-xl font-bold text-[var(--av-pearl)] mb-3 group-hover:text-[var(--av-gold)] transition-colors font-serif">
                                {useCase.title}
                            </h4>

                            {/* Description */}
                            <p className="text-[var(--av-silver)] mb-4 leading-relaxed font-light text-sm">
                                {useCase.description}
                            </p>

                            {/* Example */}
                            <div className="p-3 rounded-lg text-sm bg-black/20 border border-white/5">
                                <span className="font-medium text-[var(--av-gold)]">Example:</span> <span className="text-[var(--av-silver)] italic">{useCase.example}</span>
                            </div>

                            {/* Arrow indicator on hover */}
                            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                <div className="w-10 h-10 rounded-full bg-[var(--av-gold)] flex items-center justify-center shadow-lg shadow-[var(--av-gold)]/20">
                                    <ArrowRight size={20} className="text-white" />
                                </div>
                            </div>

                            {/* Decorative gradient overlay on hover */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--av-gold)]/0 via-transparent to-[var(--av-gold)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
