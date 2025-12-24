'use client';

import React, { useRef } from 'react';
import { formatPrice } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ChevronRight, Calendar, CreditCard } from 'lucide-react';
import { gsap } from 'gsap';

// Status color mapping
const getStatusStyles = (status: string) => {
    const statusLower = status?.toLowerCase() || '';

    switch (statusLower) {
        case 'delivered':
        case 'completed':
            return {
                bg: 'bg-[var(--ac-success)]/10',
                text: 'text-[var(--ac-success)]',
                border: 'border-[var(--ac-success)]/20'
            };
        case 'processing':
        case 'in_progress':
            return {
                bg: 'bg-[var(--ac-gold)]/10',
                text: 'text-[var(--ac-gold)]',
                border: 'border-[var(--ac-gold)]/20'
            };
        case 'shipped':
        case 'in_transit':
            return {
                bg: 'bg-[var(--ac-info)]/10',
                text: 'text-[var(--ac-info)]',
                border: 'border-[var(--ac-info)]/20'
            };
        case 'cancelled':
        case 'failed':
            return {
                bg: 'bg-[var(--ac-error)]/10',
                text: 'text-[var(--ac-error)]',
                border: 'border-[var(--ac-error)]/20'
            };
        case 'pending':
        default:
            return {
                bg: 'bg-[var(--ac-stone)]/10',
                text: 'text-[var(--ac-stone)]',
                border: 'border-[var(--ac-stone)]/20'
            };
    }
};

export const OrderItemCard = ({ order }: { order: any }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const arrowRef = useRef<HTMLDivElement>(null);
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    const statusStyles = getStatusStyles(order.status);

    const handleMouseEnter = () => {
        if (cardRef.current) {
            gsap.to(cardRef.current, {
                y: -2,
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                borderColor: 'var(--ac-gold)',
                duration: 0.3,
                ease: 'power2.out',
            });
        }
        if (arrowRef.current) {
            gsap.to(arrowRef.current, {
                x: 4,
                color: 'var(--ac-gold)',
                duration: 0.3,
                ease: 'power2.out',
            });
        }
    };

    const handleMouseLeave = () => {
        if (cardRef.current) {
            gsap.to(cardRef.current, {
                y: 0,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                borderColor: 'var(--ac-linen)',
                duration: 0.3,
                ease: 'power2.out',
            });
        }
        if (arrowRef.current) {
            gsap.to(arrowRef.current, {
                x: 0,
                color: 'var(--ac-stone)',
                duration: 0.3,
                ease: 'power2.out',
            });
        }
    };

    return (
        <div
            ref={cardRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative p-5 md:p-6 border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] rounded-xl bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] cursor-pointer transition-colors duration-300 group overflow-hidden"
            style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}
        >
            {/* Main content grid */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left section - Order info */}
                <div className="flex items-start gap-4">
                    {/* Order icon */}
                    <div className="w-12 h-12 rounded-lg bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] flex items-center justify-center flex-shrink-0">
                        <Package size={22} className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]" />
                    </div>

                    {/* Order details */}
                    <div className="space-y-1">
                        <p className="font-[family-name:var(--font-playfair)] font-semibold text-lg text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                            Order #{order.id.slice(-8).toUpperCase()}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-[var(--ac-stone)]" />
                                {orderDate}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-[var(--ac-stone)]" />
                            <span className="flex items-center gap-1.5">
                                <CreditCard size={14} className="text-[var(--ac-stone)]" />
                                {formatPrice(order.totalAmount)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right section - Status and action */}
                <div className="flex items-center gap-4 md:gap-6">
                    {/* Status badge */}
                    <Badge
                        className={`${statusStyles.bg} ${statusStyles.text} ${statusStyles.border} border px-3 py-1 text-xs font-medium tracking-wide uppercase`}
                        variant="outline"
                    >
                        {order.status?.replace(/_/g, ' ') || 'Pending'}
                    </Badge>

                    {/* View details arrow */}
                    <div
                        ref={arrowRef}
                        className="hidden md:flex items-center gap-2 text-[var(--ac-stone)] transition-colors"
                    >
                        <span className="text-sm font-medium">View</span>
                        <ChevronRight size={18} />
                    </div>
                </div>
            </div>

            {/* Mobile view details button */}
            <div className="mt-4 md:hidden">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-lg border-[var(--ac-linen)] dark:border-[var(--ac-slate)] hover:border-[var(--ac-gold)] hover:text-[var(--ac-gold)] transition-all duration-300"
                >
                    View Details
                    <ChevronRight size={16} className="ml-1" />
                </Button>
            </div>

            {/* Subtle hover accent */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-[var(--ac-gold)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
        </div>
    );
};