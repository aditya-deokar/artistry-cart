'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import Link from 'next/link';
import { Globe, Wallet, Users, Star, ArrowRight } from 'lucide-react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const benefits = [
    {
        icon: Globe,
        title: 'Global Reach',
        description: 'Your creations seen by millions of art lovers worldwide',
    },
    {
        icon: Wallet,
        title: 'Fair Earnings',
        description: 'Keep 85% of every sale. No hidden fees or surprises.',
    },
    {
        icon: Users,
        title: 'Community',
        description: 'Connect with fellow makers and collaborate on projects',
    },
];

const testimonial = {
    quote:
        'Joining Artistry Cart transformed my small workshop into an international business. The platform respects artisans and the AI Vision feature has brought me commissions I never dreamed of.',
    author: 'Kenji Tanaka',
    role: 'Woodworker, Japan',
    rating: 5,
    memberSince: '2021',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop',
};

interface BecomeArtisanCTAProps {
    title?: string;
    subtitle?: string;
}

export function BecomeArtisanCTA({
    title = 'Share Your Craft with the World',
    subtitle = 'Join 5,000+ artisans who\'ve found their audience on Artistry Cart. No listing fees. Fair commissions. A community that celebrates your work.',
}: BecomeArtisanCTAProps) {
    const sectionRef = useRef<HTMLElement>(null);

    // Entrance animation
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Content entrance
            gsap.from('.cta-content', {
                y: 60,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                },
            });

            // Benefits stagger
            gsap.from('.benefit-card', {
                y: 40,
                opacity: 0,
                duration: 0.6,
                stagger: 0.12,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.benefits-grid',
                    start: 'top 85%',
                },
            });

            // Testimonial
            gsap.from('.testimonial-card', {
                x: 40,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.testimonial-card',
                    start: 'top 85%',
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative py-24 bg-[var(--ac-obsidian)] overflow-hidden"
        >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--ac-obsidian)] via-[var(--ac-onyx)] to-[var(--ac-obsidian)]" />

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-5">
                <div className="absolute top-20 right-20 w-96 h-96 border border-[var(--ac-gold)] rounded-full" />
                <div className="absolute top-32 right-32 w-80 h-80 border border-[var(--ac-gold)] rounded-full" />
                <div className="absolute top-44 right-44 w-64 h-64 border border-[var(--ac-gold)] rounded-full" />
            </div>

            {/* Gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--ac-gold)]/30 to-transparent" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Column - Content */}
                    <div className="cta-content">
                        {/* Eyebrow */}
                        <p className="text-xs tracking-[0.3em] uppercase text-[var(--ac-gold-dark)] mb-4 font-medium">
                            Become an Artisan
                        </p>

                        {/* Headline */}
                        <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl lg:text-5xl text-[var(--ac-pearl)] mb-6 leading-tight">
                            {title}
                        </h2>

                        {/* Description */}
                        <p className="text-[var(--ac-silver)] text-lg mb-10 max-w-lg leading-relaxed">
                            {subtitle}
                        </p>

                        {/* Benefits */}
                        <div className="benefits-grid grid sm:grid-cols-3 gap-6 mb-10">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="benefit-card">
                                    <div className="w-12 h-12 mb-4 flex items-center justify-center bg-[var(--ac-gold)]/10 border border-[var(--ac-gold)]/20">
                                        <benefit.icon className="w-6 h-6 text-[var(--ac-gold-dark)]" />
                                    </div>
                                    <h3 className="font-[family-name:var(--font-cormorant)] text-lg text-[var(--ac-pearl)] mb-2">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-sm text-[var(--ac-silver)] leading-relaxed">
                                        {benefit.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/become-seller"
                                className="group inline-flex items-center gap-2 px-8 py-4 bg-[var(--ac-gold)] hover:bg-[var(--ac-gold-light)] text-[var(--ac-obsidian)] text-sm tracking-[0.15em] uppercase font-medium transition-colors"
                            >
                                Apply to Join
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/seller-guide"
                                className="inline-flex items-center gap-2 px-8 py-4 border border-[var(--ac-pearl)]/30 hover:border-[var(--ac-pearl)] text-[var(--ac-pearl)] text-sm tracking-[0.15em] uppercase font-medium transition-colors"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>

                    {/* Right Column - Testimonial */}
                    <div className="testimonial-card relative">
                        <div className="relative p-8 md:p-10 bg-[var(--ac-onyx)] border border-[var(--ac-slate)]">
                            {/* Quote mark */}
                            <div className="absolute -top-4 left-8 text-6xl text-[var(--ac-gold)]/20 font-serif">
                                "
                            </div>

                            {/* Quote */}
                            <blockquote className="relative z-10 mb-8">
                                <p className="font-[family-name:var(--font-cormorant)] text-xl md:text-2xl text-[var(--ac-pearl)] leading-relaxed italic">
                                    "{testimonial.quote}"
                                </p>
                            </blockquote>

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                <div className="relative w-14 h-14 rounded-full overflow-hidden">
                                    <Image
                                        src={testimonial.image}
                                        alt={testimonial.author}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--ac-pearl)]">
                                        {testimonial.author}
                                    </p>
                                    <p className="text-sm text-[var(--ac-silver)]">
                                        {testimonial.role}
                                    </p>
                                </div>
                            </div>

                            {/* Rating & Member Since */}
                            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-[var(--ac-slate)]">
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className="w-4 h-4 fill-[var(--ac-gold-dark)] text-[var(--ac-gold-dark)]"
                                        />
                                    ))}
                                </div>
                                <span className="text-xs text-[var(--ac-silver)]">
                                    Member since {testimonial.memberSince}
                                </span>
                            </div>

                            {/* Decorative corner */}
                            <div className="absolute -bottom-3 -right-3 w-20 h-20 border border-[var(--ac-gold)]/20 -z-10" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--ac-gold)]/30 to-transparent" />
        </section>
    );
}
