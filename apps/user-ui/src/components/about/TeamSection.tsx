'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface TeamMember {
    name: string;
    title: string;
    quote?: string;
    image: string;
    linkedin?: string;
}

interface TeamSectionProps {
    eyebrow?: string;
    headline?: string;
    subheadline?: string;
    members?: TeamMember[];
}

const defaultMembers: TeamMember[] = [
    {
        name: 'Alexandra Chen',
        title: 'Co-Founder & CEO',
        quote: 'Great art deserves a great stage.',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=800&fit=crop&q=80',
        linkedin: '#',
    },
    {
        name: 'Marcus Williams',
        title: 'Co-Founder & Creative Director',
        quote: 'Every detail matters.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&q=80',
        linkedin: '#',
    },
    {
        name: 'Priya Sharma',
        title: 'Head of Artisan Relations',
        quote: 'Our artisans are our family.',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=800&fit=crop&q=80',
        linkedin: '#',
    },
    {
        name: 'David Park',
        title: 'Chief Technology Officer',
        quote: 'Technology should amplify creativity.',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=800&fit=crop&q=80',
        linkedin: '#',
    },
    {
        name: 'Emma Rodriguez',
        title: 'Head of Sustainability',
        quote: 'Craft and planet, in harmony.',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=800&fit=crop&q=80',
        linkedin: '#',
    },
    {
        name: 'James Liu',
        title: 'Community Director',
        quote: 'Every collector has a story.',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop&q=80',
        linkedin: '#',
    },
];

export function TeamSection({
    eyebrow = "Our Team",
    headline = "The People Behind the Vision",
    subheadline = "Meet the passionate team dedicated to connecting artisans with collectors worldwide.",
    members = defaultMembers,
}: TeamSectionProps) {
    const containerRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement[]>([]);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Initial states
            gsap.set(headerRef.current, { opacity: 0, y: 40 });
            cardsRef.current.forEach((card) => {
                if (card) gsap.set(card, { opacity: 0, y: 60, scale: 0.95 });
            });

            // Header animation
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: 'top 80%',
                onEnter: () => {
                    gsap.to(headerRef.current, {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                    });
                },
            });

            // Staggered card animations
            cardsRef.current.forEach((card, index) => {
                if (card) {
                    ScrollTrigger.create({
                        trigger: card,
                        start: 'top 90%',
                        onEnter: () => {
                            gsap.to(card, {
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                duration: 0.8,
                                delay: index * 0.08,
                                ease: 'power3.out',
                            });
                        },
                    });
                }
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative py-24 md:py-32 lg:py-40 px-6 md:px-8 bg-[var(--ac-charcoal)] dark:bg-[var(--ac-obsidian)]"
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div ref={headerRef} className="text-center mb-16 md:mb-20">
                    <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-[var(--ac-gold-dark)] mb-4 font-medium">
                        {eyebrow}
                    </p>
                    <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl text-[var(--ac-pearl)] mb-6 tracking-tight">
                        {headline}
                    </h2>
                    <p className="text-lg text-[var(--ac-silver)] max-w-2xl mx-auto font-light">
                        {subheadline}
                    </p>
                </div>

                {/* Team Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {members.map((member, index) => (
                        <div
                            key={index}
                            ref={(el) => {
                                if (el) cardsRef.current[index] = el;
                            }}
                            className="group relative overflow-hidden"
                        >
                            {/* Image Container */}
                            <div className="relative aspect-[3/4] overflow-hidden bg-[var(--ac-slate)]">
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    fill
                                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:scale-105"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />

                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                                {/* Content - slides up on hover */}
                                <div className="absolute inset-x-0 bottom-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                                    {/* Name & Title */}
                                    <h3 className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl text-white mb-1">
                                        {member.name}
                                    </h3>
                                    <p className="text-sm tracking-[0.1em] uppercase text-[var(--ac-gold-dark)] font-medium mb-4">
                                        {member.title}
                                    </p>

                                    {/* Quote - fades in on hover */}
                                    {member.quote && (
                                        <p className="text-sm text-white/80 italic opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 font-light mb-4">
                                            "{member.quote}"
                                        </p>
                                    )}

                                    {/* LinkedIn */}
                                    {member.linkedin && (
                                        <a
                                            href={member.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300 opacity-0 group-hover:opacity-100 delay-150"
                                            aria-label={`${member.name}'s LinkedIn`}
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                            </svg>
                                            <span className="text-xs tracking-wider uppercase">Connect</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
