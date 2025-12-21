'use client';

import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import {
    MessageCircle,
    Mail,
    Instagram,
    Globe,
    Clock,
    CheckCircle,
    Send,
    Loader2,
} from 'lucide-react';

interface ProfileContactProps {
    artisanId?: string;
    artisanName?: string;
    responseTime?: string;
    acceptsCustom?: boolean;
    socialLinks?: {
        instagram?: string;
        website?: string;
    };
}

export function ProfileContact({
    artisanId,
    artisanName = 'the artisan',
    responseTime = 'Usually responds within 24 hours',
    acceptsCustom = true,
    socialLinks = {
        instagram: 'https://instagram.com',
        website: 'https://example.com',
    },
}: ProfileContactProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        subject: 'general',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Entrance animation
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.contact-element', {
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.out',
            });
        }, formRef);

        return () => ctx.revert();
    }, []);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormState((prev) => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formState.name.trim() || !formState.email.trim() || !formState.message.trim()) {
            setError('Please fill in all required fields.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        // Simulate API call
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setIsSubmitted(true);

            // Reset form after delay
            setTimeout(() => {
                setIsSubmitted(false);
                setFormState({
                    name: '',
                    email: '',
                    subject: 'general',
                    message: '',
                });
            }, 3000);
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Contact Info */}
            <div className="space-y-6">
                <div className="contact-element">
                    <h3 className="font-[family-name:var(--font-cormorant)] text-xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-4">
                        Get in Touch
                    </h3>
                    <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] leading-relaxed">
                        Have a question about a piece, interested in a custom commission, or just
                        want to say hello? I'd love to hear from you.
                    </p>
                </div>

                {/* Response Time */}
                <div className="contact-element flex items-start gap-3 p-4 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                    <Clock className="w-5 h-5 text-[var(--ac-gold)] flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                            {responseTime}
                        </p>
                        <p className="text-xs text-[var(--ac-stone)] mt-1">
                            Response times may vary during busy periods
                        </p>
                    </div>
                </div>

                {/* Custom Orders */}
                {acceptsCustom && (
                    <div className="contact-element flex items-start gap-3 p-4 bg-[var(--ac-gold)]/10 border border-[var(--ac-gold)]/20">
                        <CheckCircle className="w-5 h-5 text-[var(--ac-gold)] flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                Custom Orders Available
                            </p>
                            <p className="text-xs text-[var(--ac-stone)] mt-1">
                                I welcome custom commissions for special occasions and unique requests
                            </p>
                        </div>
                    </div>
                )}

                {/* Social Links */}
                <div className="contact-element">
                    <h4 className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-3">
                        Connect
                    </h4>
                    <div className="flex gap-3">
                        {socialLinks.instagram && (
                            <a
                                href={socialLinks.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] hover:border-[var(--ac-gold)] hover:text-[var(--ac-gold)] transition-colors"
                            >
                                <Instagram className="w-4 h-4" />
                                <span className="text-sm">Instagram</span>
                            </a>
                        )}
                        {socialLinks.website && (
                            <a
                                href={socialLinks.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] hover:border-[var(--ac-gold)] hover:text-[var(--ac-gold)] transition-colors"
                            >
                                <Globe className="w-4 h-4" />
                                <span className="text-sm">Website</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column - Contact Form */}
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                {/* Success Message */}
                {isSubmitted && (
                    <div className="contact-element p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Message sent successfully!</span>
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                            {artisanName} will get back to you soon.
                        </p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="contact-element p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Name */}
                <div className="contact-element">
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2"
                    >
                        Your Name <span className="text-[var(--ac-terracotta)]">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formState.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] placeholder:text-[var(--ac-stone)] focus:outline-none focus:border-[var(--ac-gold)] transition-colors"
                        placeholder="Enter your name"
                    />
                </div>

                {/* Email */}
                <div className="contact-element">
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2"
                    >
                        Email Address <span className="text-[var(--ac-terracotta)]">*</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formState.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] placeholder:text-[var(--ac-stone)] focus:outline-none focus:border-[var(--ac-gold)] transition-colors"
                        placeholder="Enter your email"
                    />
                </div>

                {/* Subject */}
                <div className="contact-element">
                    <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2"
                    >
                        Subject
                    </label>
                    <select
                        id="subject"
                        name="subject"
                        value={formState.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] focus:outline-none focus:border-[var(--ac-gold)] transition-colors"
                    >
                        <option value="general">General Inquiry</option>
                        <option value="custom">Custom Commission</option>
                        <option value="product">Product Question</option>
                        <option value="wholesale">Wholesale Inquiry</option>
                        <option value="collaboration">Collaboration</option>
                    </select>
                </div>

                {/* Message */}
                <div className="contact-element">
                    <label
                        htmlFor="message"
                        className="block text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2"
                    >
                        Message <span className="text-[var(--ac-terracotta)]">*</span>
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        value={formState.message}
                        onChange={handleInputChange}
                        rows={5}
                        className="w-full px-4 py-3 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] placeholder:text-[var(--ac-stone)] focus:outline-none focus:border-[var(--ac-gold)] transition-colors resize-none"
                        placeholder="Tell me about your project or question..."
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || isSubmitted}
                    className="contact-element w-full flex items-center justify-center gap-2 py-4 bg-[var(--ac-gold)] hover:bg-[var(--ac-gold-light)] text-[var(--ac-obsidian)] text-sm tracking-[0.15em] uppercase font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending...
                        </>
                    ) : isSubmitted ? (
                        <>
                            <CheckCircle className="w-4 h-4" />
                            Sent!
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            Send Message
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
