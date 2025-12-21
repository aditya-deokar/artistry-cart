'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { MessageCircle, Mail, HelpCircle, ArrowRight } from 'lucide-react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface NeedHelpCTAProps {
    title?: string;
    subtitle?: string;
    showLiveChat?: boolean;
    showEmail?: boolean;
    showFAQ?: boolean;
    className?: string;
}

export function NeedHelpCTA({
    title = "Still Need Help?",
    subtitle = "Can't find what you're looking for? Our support team is ready to assist.",
    showLiveChat = true,
    showEmail = true,
    showFAQ = true,
    className = '',
}: NeedHelpCTAProps) {
    const sectionRef = useRef<HTMLElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.cta-element', {
                y: 40,
                opacity: 0,
                duration: 0.7,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 85%',
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className={`py-16 md:py-20 bg-[var(--ac-charcoal)] dark:bg-[var(--ac-onyx)] ${className}`}
        >
            <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
                {/* Title */}
                <h2 className="cta-element font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-[var(--ac-pearl)] mb-3">
                    {title}
                </h2>

                {/* Subtitle */}
                <p className="cta-element text-[var(--ac-silver)] mb-10 max-w-xl mx-auto">
                    {subtitle}
                </p>

                {/* Action Cards */}
                <div className="cta-element grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {showLiveChat && (
                        <Link
                            href="/support/contact"
                            className="group p-6 bg-[var(--ac-slate)] hover:bg-[var(--ac-gold)]/10 border border-[var(--ac-slate)] hover:border-[var(--ac-gold)]/30 transition-all duration-300"
                        >
                            <MessageCircle className="w-8 h-8 text-[var(--ac-gold)] mb-4 mx-auto" />
                            <h3 className="font-medium text-[var(--ac-pearl)] mb-2">
                                Live Chat
                            </h3>
                            <p className="text-sm text-[var(--ac-silver)] mb-4">
                                Chat with our support team in real-time
                            </p>
                            <span className="inline-flex items-center gap-1 text-sm text-[var(--ac-gold)] group-hover:gap-2 transition-all">
                                Start Chat
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        </Link>
                    )}

                    {showEmail && (
                        <Link
                            href="/support/contact"
                            className="group p-6 bg-[var(--ac-slate)] hover:bg-[var(--ac-gold)]/10 border border-[var(--ac-slate)] hover:border-[var(--ac-gold)]/30 transition-all duration-300"
                        >
                            <Mail className="w-8 h-8 text-[var(--ac-gold)] mb-4 mx-auto" />
                            <h3 className="font-medium text-[var(--ac-pearl)] mb-2">
                                Email Support
                            </h3>
                            <p className="text-sm text-[var(--ac-silver)] mb-4">
                                We&apos;ll respond within 24 hours
                            </p>
                            <span className="inline-flex items-center gap-1 text-sm text-[var(--ac-gold)] group-hover:gap-2 transition-all">
                                Send Email
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        </Link>
                    )}

                    {showFAQ && (
                        <Link
                            href="/support/faq"
                            className="group p-6 bg-[var(--ac-slate)] hover:bg-[var(--ac-gold)]/10 border border-[var(--ac-slate)] hover:border-[var(--ac-gold)]/30 transition-all duration-300 sm:col-span-2 lg:col-span-1"
                        >
                            <HelpCircle className="w-8 h-8 text-[var(--ac-gold)] mb-4 mx-auto" />
                            <h3 className="font-medium text-[var(--ac-pearl)] mb-2">
                                Browse FAQs
                            </h3>
                            <p className="text-sm text-[var(--ac-silver)] mb-4">
                                Find quick answers to common questions
                            </p>
                            <span className="inline-flex items-center gap-1 text-sm text-[var(--ac-gold)] group-hover:gap-2 transition-all">
                                View FAQs
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}
