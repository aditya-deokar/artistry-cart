'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MessageCircle, Mail, Phone, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const contactChannels = [
    {
        id: 'chat',
        icon: MessageCircle,
        title: 'Live Chat',
        description: 'Chat with our support team in real-time for quick answers.',
        availability: 'Mon-Fri 9am-9pm EST',
        action: 'Start Chat',
        href: '#chat',
        highlight: true,
    },
    {
        id: 'email',
        icon: Mail,
        title: 'Email Support',
        description: 'Send us a detailed message and we\'ll respond within 24 hours.',
        availability: '24/7 - Response within 24hrs',
        action: 'Send Email',
        href: '#form',
    },
    {
        id: 'phone',
        icon: Phone,
        title: 'Phone Support',
        description: 'Speak directly with a support specialist for urgent matters.',
        availability: 'Mon-Fri 9am-6pm EST',
        action: 'Call Now',
        href: 'tel:+15551234567',
    },
];

interface ContactOptionsProps {
    className?: string;
}

export function ContactOptions({ className = '' }: ContactOptionsProps) {
    const sectionRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.contact-card', {
                y: 30,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={sectionRef} className={`${className}`}>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-6 text-center">
                Choose How to Reach Us
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
                {contactChannels.map((channel) => {
                    const Icon = channel.icon;
                    return (
                        <Link
                            key={channel.id}
                            href={channel.href}
                            className={`contact-card group relative p-6 text-center transition-all duration-300 hover:shadow-lg ${channel.highlight
                                    ? 'bg-[var(--ac-gold)]/5 border-2 border-[var(--ac-gold)]/30 dark:bg-[var(--ac-gold)]/10'
                                    : 'bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)]'
                                }`}
                        >
                            {channel.highlight && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--ac-gold)] text-[var(--ac-obsidian)] text-xs font-medium tracking-wide uppercase">
                                    Fastest Response
                                </div>
                            )}

                            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 ${channel.highlight
                                    ? 'bg-[var(--ac-gold)]/20 text-[var(--ac-gold)]'
                                    : 'bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]'
                                }`}>
                                <Icon className="w-7 h-7" />
                            </div>

                            <h3 className="font-medium text-lg text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
                                {channel.title}
                            </h3>
                            <p className="text-sm text-[var(--ac-stone)] mb-3">
                                {channel.description}
                            </p>
                            <p className="text-xs text-[var(--ac-gold)] mb-4">
                                {channel.availability}
                            </p>
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--ac-gold)] group-hover:gap-2 transition-all">
                                {channel.action}
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
