'use client';

import { MapPin, Clock, Phone, Mail } from 'lucide-react';

interface OfficeLocationProps {
    className?: string;
}

export function OfficeLocation({ className = '' }: OfficeLocationProps) {
    return (
        <div className={`${className}`}>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-6">
                Visit Our Office
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Map Placeholder */}
                <div className="aspect-video md:aspect-auto md:h-full bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] flex items-center justify-center">
                    <div className="text-center p-8">
                        <MapPin className="w-12 h-12 text-[var(--ac-gold)] mx-auto mb-4" />
                        <p className="text-sm text-[var(--ac-stone)]">
                            Interactive map coming soon
                        </p>
                    </div>
                </div>

                {/* Address & Hours */}
                <div className="p-6 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                    <h3 className="font-medium text-lg text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-4">
                        Artistry Cart Headquarters
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-[var(--ac-gold)] flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                    123 Artisan Way
                                </p>
                                <p className="text-[var(--ac-stone)]">
                                    Creative District, New York, NY 10001
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-[var(--ac-gold)] flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                    Monday - Friday
                                </p>
                                <p className="text-[var(--ac-stone)]">
                                    9:00 AM - 6:00 PM EST
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-[var(--ac-gold)] flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                    +1 (555) 123-4567
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-[var(--ac-gold)] flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                    support@artistrycart.com
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                        <p className="text-sm text-[var(--ac-stone)]">
                            <strong className="text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">Note:</strong> Our showroom is by appointment only.
                            Please contact us to schedule a visit.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
