'use client';

import { Clock, MessageCircle, Calendar } from 'lucide-react';

interface ResponseInfoProps {
    className?: string;
}

export function ResponseInfo({ className = '' }: ResponseInfoProps) {
    return (
        <div className={`${className}`}>
            <h3 className="font-medium text-lg text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-4">
                Response Time Expectations
            </h3>

            <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[var(--ac-gold)]/10 rounded-full">
                        <MessageCircle className="w-5 h-5 text-[var(--ac-gold)]" />
                    </div>
                    <div>
                        <h4 className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-1">
                            Live Chat
                        </h4>
                        <p className="text-sm text-[var(--ac-stone)]">
                            Average response time: <span className="text-[var(--ac-gold)] font-medium">Under 2 minutes</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-500/10 rounded-full">
                        <Clock className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <h4 className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-1">
                            Email Support
                        </h4>
                        <p className="text-sm text-[var(--ac-stone)]">
                            Average response time: <span className="text-blue-500 font-medium">2-4 hours</span> during business hours
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-purple-500/10 rounded-full">
                        <Calendar className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                        <h4 className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-1">
                            Weekend Inquiries
                        </h4>
                        <p className="text-sm text-[var(--ac-stone)]">
                            Answered by <span className="text-purple-500 font-medium">Monday 10am EST</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
