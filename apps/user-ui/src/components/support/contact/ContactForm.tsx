'use client';

import { useState, useRef } from 'react';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { submitContactForm, ContactFormData } from '@/actions/support.actions';

const contactReasons = [
    'Order Status / Tracking',
    'Returns & Refunds',
    'Product Questions',
    'Custom Order Inquiry',
    'Artisan Partnership',
    'Technical Issue',
    'Billing & Payment',
    'Press / Media',
    'General Feedback',
    'Other',
];

interface ContactFormProps {
    className?: string;
}

export function ContactForm({ className = '' }: ContactFormProps) {
    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        email: '',
        reason: '',
        orderNumber: '',
        message: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);
    const formRef = useRef<HTMLDivElement>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error on change
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});
        setSubmitResult(null);

        const result = await submitContactForm(formData);

        if (result.success) {
            setSubmitResult({ success: true, message: result.message });
            setFormData({
                name: '',
                email: '',
                reason: '',
                orderNumber: '',
                message: '',
            });
        } else {
            if (result.errors) {
                setErrors(result.errors);
            }
            setSubmitResult({ success: false, message: result.message });
        }

        setIsSubmitting(false);
    };

    return (
        <div ref={formRef} id="form" className={`${className}`}>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-6">
                Send Us a Message
            </h2>
            <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mb-8">
                Fill out the form below and we&apos;ll get back to you within 24 hours.
            </p>

            {submitResult?.success ? (
                <div className="p-8 bg-green-500/10 border border-green-500/20 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                        <Check className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-medium text-green-700 dark:text-green-400 mb-2">
                        Message Sent!
                    </h3>
                    <p className="text-green-600 dark:text-green-300">
                        {submitResult.message}
                    </p>
                    <button
                        onClick={() => setSubmitResult(null)}
                        className="mt-6 text-sm text-[var(--ac-gold)] hover:text-[var(--ac-gold-light)] transition-colors"
                    >
                        Send another message
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Reason Select */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
                            Reason for Contact *
                        </label>
                        <select
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] border text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] focus:outline-none transition-colors ${errors.reason
                                ? 'border-red-500 focus:border-red-500'
                                : 'border-[var(--ac-linen)] dark:border-[var(--ac-slate)] focus:border-[var(--ac-gold)]'
                                }`}
                        >
                            <option value="">Select a reason</option>
                            {contactReasons.map((reason) => (
                                <option key={reason} value={reason}>
                                    {reason}
                                </option>
                            ))}
                        </select>
                        {errors.reason && (
                            <p className="mt-1 text-sm text-red-500">{errors.reason}</p>
                        )}
                    </div>

                    {/* Name & Email Row */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
                                Your Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className={`w-full px-4 py-3 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] border text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] placeholder:text-[var(--ac-stone)] focus:outline-none transition-colors ${errors.name
                                    ? 'border-red-500 focus:border-red-500'
                                    : 'border-[var(--ac-linen)] dark:border-[var(--ac-slate)] focus:border-[var(--ac-gold)]'
                                    }`}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className={`w-full px-4 py-3 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] border text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] placeholder:text-[var(--ac-stone)] focus:outline-none transition-colors ${errors.email
                                    ? 'border-red-500 focus:border-red-500'
                                    : 'border-[var(--ac-linen)] dark:border-[var(--ac-slate)] focus:border-[var(--ac-gold)]'
                                    }`}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>
                    </div>

                    {/* Order Number */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
                            Order Number (optional)
                        </label>
                        <input
                            type="text"
                            name="orderNumber"
                            value={formData.orderNumber}
                            onChange={handleChange}
                            placeholder="AC-12345"
                            className="w-full px-4 py-3 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] placeholder:text-[var(--ac-stone)] focus:outline-none focus:border-[var(--ac-gold)] transition-colors"
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
                            Your Message *
                        </label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows={5}
                            placeholder="Please describe your inquiry in detail..."
                            className={`w-full px-4 py-3 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] border text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] placeholder:text-[var(--ac-stone)] focus:outline-none resize-none transition-colors ${errors.message
                                ? 'border-red-500 focus:border-red-500'
                                : 'border-[var(--ac-linen)] dark:border-[var(--ac-slate)] focus:border-[var(--ac-gold)]'
                                }`}
                        />
                        {errors.message && (
                            <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                        )}
                    </div>

                    {/* Submit Error */}
                    {submitResult && !submitResult.success && (
                        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {submitResult.message}
                            </p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-8 py-3 bg-[var(--ac-gold)] hover:bg-[var(--ac-gold-light)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--ac-obsidian)] text-sm font-medium tracking-wider uppercase transition-colors flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            'Send Message'
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}
